import type { FormDocument, FormStep } from '../types.js'
import { getVisibleSteps } from './conditions/index.js'

/**
 * Build the list of steps shown in the progress indicator.
 *
 * This is intentionally separate from the navigable steps used by
 * `useEnquiryForm` (which come from `normalizeFormSteps`). When a multi-stage
 * form enables a confirmation stage, a synthetic, non-navigable stage is
 * appended so the indicator can show the post-submit confirmation screen as a
 * final step — without adding an extra empty page or moving the Submit button.
 *
 * Pass the current form `values` so that steps hidden by a visibility rule are
 * excluded from the indicator, keeping it in sync with the actual navigation
 * path.
 */
export function buildIndicatorSteps(
  form: FormDocument,
  values: Record<string, unknown> = {},
): FormStep[] {
  const steps = getVisibleSteps(form.steps ?? [], values)
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
