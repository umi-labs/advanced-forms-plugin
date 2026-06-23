import type { FormDocument, FormStep } from '../types.js'

/**
 * Build the list of steps shown in the progress indicator.
 *
 * This is intentionally separate from the navigable steps used by
 * `useEnquiryForm` (which come from `normalizeFormSteps`). When a multi-stage
 * form enables a confirmation stage, a synthetic, non-navigable stage is
 * appended so the indicator can show the post-submit confirmation screen as a
 * final step — without adding an extra empty page or moving the Submit button.
 */
export function buildIndicatorSteps(form: FormDocument): FormStep[] {
  const steps = form.steps ?? []
  const stage = form.confirmationStage

  // Only meaningful when there's more than one stage to indicate.
  if (steps.length > 1 && stage?.enabled) {
    const icon = stage.icon ?? null
    return [
      ...steps,
      {
        completedIcon: icon,
        fields: [],
        icon,
        title: stage.label?.trim() || 'Confirmation',
      },
    ]
  }

  return steps
}
