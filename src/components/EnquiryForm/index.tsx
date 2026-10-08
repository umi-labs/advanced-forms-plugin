'use client'

import { useEffect, useRef } from 'react'

import type { EnquiryFormProps } from '../../types.js'
import { buildIndicatorSteps } from '../../utilities/buildIndicatorSteps.js'
import { Step } from './Step.js'
import { StepIndicator } from './StepIndicator.js'
import { useEnquiryForm } from './useEnquiryForm.js'

export function EnquiryForm({
  form,
  apiBase = '',
  className,
  onSuccess,
  onError,
  additionalContent,
  renderStepIntro,
  renderConfirmation,
  resolver,
  context,
}: EnquiryFormProps) {
  const {
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
  } = useEnquiryForm({ form, apiBase, resolver, context })

  const containerRef = useRef<HTMLDivElement>(null)

  // Moving between stages swaps the body content without moving the viewport.
  // On a phone that leaves the visitor looking at the middle or the bottom of
  // the stage they just opened, so it reads as though the button did nothing.
  // Re-anchor to the top of the form on every stage change — forwards, back,
  // and onto the confirmation screen, which has the same problem.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    containerRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    })
  }, [currentStep, isComplete])

  // Redirect action — fire when complete and redirectUrl is set
  if (
    isComplete &&
    result?.actions.redirectUrl &&
    typeof window !== 'undefined'
  ) {
    const delay = 0 // delay from form config could be threaded here in a future enhancement
    setTimeout(() => {
      window.location.href = result.actions.redirectUrl!
    }, delay)
  }

  const handleNext = async () => {
    await goNext()
  }

  const handleSubmit = async () => {
    try {
      const res = await submit()
      onSuccess?.(res)
    } catch (err) {
      if (err && typeof err === 'object' && 'success' in err) {
        onError?.(err as any)
      }
    }
  }

  // Single-stage forms render as one step — there's nothing to indicate, so
  // the progress indicator is hidden.
  const showStepIndicator = totalSteps > 1

  // The indicator may include a synthetic, non-navigable "Confirmation" stage
  // appended after the field steps. It is indicator-only — navigation, the
  // Submit button and `totalSteps` are unaffected (they come from
  // `useEnquiryForm` / `normalizeFormSteps`).
  const indicatorSteps = buildIndicatorSteps(form, submittedValues ?? rhfForm.watch())
  const hasConfirmationStage = indicatorSteps.length > form.steps.length

  const showAbove =
    form.additionalContent?.enabled && form.additionalContent.position === 'above'
  const showBelow =
    form.additionalContent?.enabled &&
    (form.additionalContent.position === 'below' || !form.additionalContent.position)

  // ---------------------------------------------------------------------------
  // Confirmation state
  // ---------------------------------------------------------------------------
  if (isComplete) {
    const message = result?.actions.confirmationMessage
    return (
      <div
        className={['enquiry-form enquiry-form--complete', className]
          .filter(Boolean)
          .join(' ')}
        data-testid="enquiry-form-confirmation"
        ref={containerRef}
      >
        {showAbove && additionalContent}

        {showStepIndicator &&
          (hasConfirmationStage ? (
            // Field steps complete (ticked); the confirmation stage is the
            // active step on the confirmation screen.
            <StepIndicator steps={indicatorSteps} currentStep={totalSteps} />
          ) : (
            <StepIndicator steps={form.steps} currentStep={totalSteps} allComplete />
          ))}

        <div className="enquiry-form__confirmation-message">
          {renderConfirmation && result
            ? renderConfirmation(message, result)
            : message !== undefined && message !== null
              ? // No bundled rich-text renderer — pass raw payload through as
                // pre-formatted JSON so consumers can see something while they
                // wire up their own renderer.
                typeof message === 'string'
                ? message
                : 'Form submitted successfully.'
              : 'Form submitted successfully.'}
        </div>

        {showBelow && additionalContent}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Button labels — per-step overrides win over document-level overrides which
  // win over the built-in defaults.
  // ---------------------------------------------------------------------------
  const isLastStep = currentStep === totalSteps - 1
  const docLabels = form.buttonLabels ?? {}
  const backLabel = stepData.backLabel ?? (isLastStep ? docLabels.backLast : null) ?? docLabels.back ?? 'Back'
  const nextLabel = stepData.nextLabel ?? docLabels.next ?? 'Next'
  const submitLabel = stepData.nextLabel ?? docLabels.submit ?? 'Submit'

  return (
    <div
      className={['enquiry-form', className].filter(Boolean).join(' ')}
      data-testid="enquiry-form"
      ref={containerRef}
    >
      {showAbove && additionalContent}

      {showStepIndicator && <StepIndicator steps={indicatorSteps} currentStep={currentStep} />}

      <div className="enquiry-form__body">
        {renderStepIntro && stepData.introContent ? (
          <div className="enquiry-form__step-intro" data-testid="step-intro">
            {renderStepIntro(stepData, currentStep)}
          </div>
        ) : null}
        <Step step={stepData} form={rhfForm} />
      </div>

      {error && (
        <div className="enquiry-form__submit-error" role="alert" data-testid="submit-error">
          {error.errors.map((e) => e.message).join(', ')}
        </div>
      )}

      <div className="enquiry-form__nav">
        {currentStep > 0 && (
          <button
            type="button"
            className="enquiry-form__btn enquiry-form__btn--back"
            onClick={goBack}
            data-testid="btn-back"
          >
            {backLabel}
          </button>
        )}

        {!isLastStep ? (
          <button
            type="button"
            className="enquiry-form__btn enquiry-form__btn--next"
            onClick={handleNext}
            data-testid="btn-next"
          >
            {nextLabel}
          </button>
        ) : (
          <button
            type="button"
            className="enquiry-form__btn enquiry-form__btn--submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="btn-submit"
          >
            {isSubmitting ? 'Submitting…' : submitLabel}
          </button>
        )}
      </div>

      {showBelow && additionalContent}
    </div>
  )
}
