'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { EnquiryForm, SubmitError, SubmitResult, UseEnquiryFormReturn } from '../../types.js'

type Options = {
  form: EnquiryForm
  apiBase?: string
}

function buildDefaultValues(form: EnquiryForm): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}
  for (const step of form.steps) {
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

export function useEnquiryForm({ form, apiBase = '' }: Options): UseEnquiryFormReturn {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [error, setError] = useState<SubmitError | null>(null)

  const rhfForm = useForm<Record<string, unknown>>({
    mode: 'onSubmit',
    defaultValues: buildDefaultValues(form),
  })
  const totalSteps = form.steps.length
  const stepData = form.steps[currentStep]!

  const getCurrentStepFieldNames = () =>
    (stepData.fields ?? []).map((f) => f.name)

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
      const res = await fetch(`${apiBase}/api/enquiry-submit/${form.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: rhfForm.getValues(),
          metadata: { referrer: typeof window !== 'undefined' ? document.referrer : '' },
        }),
      })

      const json = (await res.json()) as SubmitResult | SubmitError

      if (json.success) {
        setIsComplete(true)
        setResult(json as SubmitResult)
        return json as SubmitResult
      } else {
        setError(json as SubmitError)
        throw json
      }
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
