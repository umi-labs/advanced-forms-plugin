'use client'

import type { EnquiryFormStep } from '../../types.js'

type Props = {
  steps: EnquiryFormStep[]
  /**
   * Index of the active step. Steps with index < currentStep are rendered as
   * "complete"; the step at `currentStep` is "active"; later steps are
   * "upcoming".
   */
  currentStep: number
  /**
   * When true, every step is rendered as "complete" — used after a successful
   * submission to communicate that the flow has finished.
   */
  allComplete?: boolean
}

/** Inline tick icon used as the default `completedIcon`. */
function DefaultCompletedIcon() {
  return (
    <svg
      className="enquiry-form__step-completed-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function StepIndicator({ steps, currentStep, allComplete = false }: Props) {
  return (
    <nav className="enquiry-form__step-indicator" aria-label="Form progress">
      <ol className="enquiry-form__step-list">
        {steps.map((step, i) => {
          const state = allComplete
            ? 'complete'
            : i < currentStep
              ? 'complete'
              : i === currentStep
                ? 'active'
                : 'upcoming'

          const isComplete = state === 'complete'
          // When complete: prefer the step's custom `completedIcon`, then fall
          // back to a built-in tick icon. Don't show the regular step icon.
          const showCustomCompletedIcon = isComplete && step.completedIcon?.url
          const showStepIcon = !isComplete && step.icon?.url

          return (
            <li
              key={step.id ?? i}
              className={`enquiry-form__step-item enquiry-form__step-item--${state}`}
              aria-current={!allComplete && i === currentStep ? 'step' : undefined}
            >
              {showCustomCompletedIcon ? (
                <img
                  src={step.completedIcon!.url!}
                  alt=""
                  className="enquiry-form__step-icon enquiry-form__step-icon--completed"
                  aria-hidden="true"
                />
              ) : isComplete ? (
                <DefaultCompletedIcon />
              ) : showStepIcon ? (
                <img
                  src={step.icon!.url!}
                  alt=""
                  className="enquiry-form__step-icon"
                  aria-hidden="true"
                />
              ) : null}
              <span className="enquiry-form__step-title">{step.title}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
