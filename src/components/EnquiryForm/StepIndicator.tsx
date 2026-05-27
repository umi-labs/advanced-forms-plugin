'use client'

import type { EnquiryFormStep } from '../../types.js'

type Props = {
  steps: EnquiryFormStep[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: Props) {
  return (
    <nav className="enquiry-form__step-indicator" aria-label="Form progress">
      <ol className="enquiry-form__step-list">
        {steps.map((step, i) => {
          const state =
            i < currentStep ? 'complete' : i === currentStep ? 'active' : 'upcoming'
          return (
            <li
              key={i}
              className={`enquiry-form__step-item enquiry-form__step-item--${state}`}
              aria-current={i === currentStep ? 'step' : undefined}
            >
              {step.icon?.url && (
                <img
                  src={step.icon.url}
                  alt=""
                  className="enquiry-form__step-icon"
                  aria-hidden="true"
                />
              )}
              <span className="enquiry-form__step-title">{step.title}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
