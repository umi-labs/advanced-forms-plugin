'use client'

import { useState } from 'react'
import { type Resolver, useForm } from 'react-hook-form'
import type {
  EnquiryForm,
  EnquirySubmissionContext,
  FormStep,
  SubmitError,
  SubmitResult,
  UseEnquiryFormReturn,
} from '../../types.js'
import { buildSubmitURL } from '../../utilities/buildSubmitURL.js'
import { getVisibleSteps, isFieldVisible, stripHiddenValues } from '../../utilities/conditions/index.js'
import { normalizeFormSteps } from '../../utilities/normalizeFormSteps.js'
import { normalizeSubmitError } from '../../utilities/normalizeSubmitError.js'

type Options = {
  form: EnquiryForm
  apiBase?: string
  /**
   * Optional react-hook-form `Resolver` (e.g. `zodResolver(schema)`). Runs in
   * addition to per-field rules registered via `buildFieldRules`.
   */
  resolver?: Resolver<Record<string, unknown>>
  /**
   * Arbitrary, JSON-serialisable context recorded against the submission.
   * Sent as a top-level `context` key on the submit request when provided.
   */
  context?: EnquirySubmissionContext
}

function buildDefaultValues(steps: EnquiryForm['steps']): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}
  for (const step of steps) {
    for (const field of step.fields) {
      if (field.blockType === 'numberStepper' && field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue
      } else if (field.blockType === 'multiCounter' && field.counters) {
        const counterDefaults: Record<string, number> = {}
        for (const counter of field.counters) {
          counterDefaults[counter.name] = counter.defaultValue ?? 0
        }
        defaults[field.name] = counterDefaults
      }
    }
  }
  return defaults
}

export function useEnquiryForm({
  form,
  apiBase = '',
  resolver,
  context,
}: Options): UseEnquiryFormReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<SubmitError | null>(null)

  const allSteps = normalizeFormSteps(form)

  const rhfForm = useForm<Record<string, unknown>>({
    mode: 'onSubmit',
    defaultValues: buildDefaultValues(allSteps),
    resolver,
  })

  const watchedValues = rhfForm.watch()
  const steps = getVisibleSteps(allSteps, watchedValues)
  const totalSteps = steps.length
  const safeStep = steps.length > 0 ? Math.min(currentStep, steps.length - 1) : 0
  const stepData: FormStep = steps[safeStep] ?? { title: '', fields: [] }

  const getCurrentStepFieldNames = () =>
    (stepData.fields ?? [])
      .filter((f) => isFieldVisible(f, rhfForm.getValues()))
      .map((f) => f.name)

  const goNext = async (): Promise<boolean> => {
    const valid = await rhfForm.trigger(getCurrentStepFieldNames())
    if (valid) setCurrentStep((s) => s + 1)
    return valid
  }

  const goBack = () => setCurrentStep((s) => s - 1)

  const submit = async (): Promise<SubmitResult> => {
    const valid = await rhfForm.trigger(getCurrentStepFieldNames())
    if (!valid) throw new Error('Validation failed on final step')

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(buildSubmitURL({ apiBase, formSlug: form.slug }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: stripHiddenValues(allSteps, rhfForm.getValues()),
          metadata: { referrer: typeof window !== 'undefined' ? document.referrer : '' },
          ...(context ? { context } : {}),
        }),
      })

      // The body may not be the expected JSON shape (e.g. a 404/500 returns
      // `{ message }` with no `errors`). Parse defensively so the UI never
      // renders against a malformed error object.
      const json = (await res.json().catch(() => null)) as SubmitResult | SubmitError | null

      if (res.ok && json && (json as SubmitResult).success) {
        setIsComplete(true)
        setResult(json as SubmitResult)
        return json as SubmitResult
      }

      const err = normalizeSubmitError(json)
      setError(err)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    currentStep,
    totalSteps,
    stepData,
    form: rhfForm,
    goNext,
    goBack,
    submit,
    isSubmitting,
    isComplete,
    result,
    error,
  }
}
