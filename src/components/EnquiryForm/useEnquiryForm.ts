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
import { getCaptchaToken } from '../../utilities/recaptchaClient.js'

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
  // Values as they stood at the moment of a successful submit. The live form is
  // reset on success (see `submit`), but the confirmation screen still has to
  // reflect the step path the visitor actually took — and that path is derived
  // from their answers, which by then are gone. Snapshot, don't re-read.
  const [submittedValues, setSubmittedValues] = useState<null | Record<string, unknown>>(null)

  const allSteps = normalizeFormSteps(form)

  const rhfForm = useForm<Record<string, unknown>>({
    mode: 'onSubmit',
    defaultValues: buildDefaultValues(allSteps),
    resolver,
  })

  const watchedValues = rhfForm.watch()
  const steps = getVisibleSteps(allSteps, submittedValues ?? watchedValues)
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
      // Minted per submission — v3 tokens are single-use and short-lived, so
      // this cannot be hoisted to mount time. Resolves to null when captcha is
      // off or unreachable; the server decides how to treat a missing token.
      const captchaToken = await getCaptchaToken(form.captcha)

      const res = await fetch(buildSubmitURL({ apiBase, formSlug: form.slug }), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: stripHiddenValues(allSteps, rhfForm.getValues()),
          metadata: { referrer: typeof window !== 'undefined' ? document.referrer : '' },
          ...(captchaToken ? { captchaToken } : {}),
          ...(context ? { context } : {}),
        }),
      })

      // The body may not be the expected JSON shape (e.g. a 404/500 returns
      // `{ message }` with no `errors`). Parse defensively so the UI never
      // renders against a malformed error object.
      const json = (await res.json().catch(() => null)) as SubmitResult | SubmitError | null

      if (res.ok && json && (json as SubmitResult).success) {
        // Snapshot before the reset below, or the confirmation screen loses the
        // step path it needs to render.
        setSubmittedValues(rhfForm.getValues())
        setIsComplete(true)
        setResult(json as SubmitResult)
        // Without this the submitted answers stay in form state for as long as
        // the page lives — and are restored wholesale by the browser's back
        // button when a redirect action takes the visitor away and they return.
        // On a shared or in-office machine that shows the next person the
        // previous enquirer's name, email, phone and travel plans.
        rhfForm.reset()
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
    submittedValues,
  }
}
