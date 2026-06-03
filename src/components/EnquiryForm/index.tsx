'use client'

import type { EnquiryFormProps } from '../../types.js'
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
  } = useEnquiryForm({ form, apiBase })

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

  const showAbove =
    form.additionalContent?.enabled && form.additionalContent.position === 'above'
  const showBelow =
    form.additionalContent?.enabled &&
    (form.additionalContent.position === 'below' || !form.additionalContent.position)

  if (isComplete && result?.actions.confirmationMessage) {
    return (
      <div
        className={['enquiry-form enquiry-form--complete', className]
          .filter(Boolean)
          .join(' ')}
        data-testid="enquiry-form-confirmation"
      >
        {/* Consuming project renders the rich text; we expose the raw data */}
        <div className="enquiry-form__confirmation-message">
          Form submitted successfully.
        </div>
      </div>
    )
  }

  return (
    <div
      className={['enquiry-form', className].filter(Boolean).join(' ')}
      data-testid="enquiry-form"
    >
      {showAbove && additionalContent}

      <StepIndicator steps={form.steps} currentStep={currentStep} />

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
            Back
          </button>
        )}

        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            className="enquiry-form__btn enquiry-form__btn--next"
            onClick={handleNext}
            data-testid="btn-next"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="enquiry-form__btn enquiry-form__btn--submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-testid="btn-submit"
          >
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>

      {showBelow && additionalContent}
    </div>
  )
}
