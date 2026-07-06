import type { FormFieldBlock } from '../types.js'
import { normalizeFormSteps } from './normalizeFormSteps.js'
import {
  isFieldRequired,
  isFieldVisible,
  stripHiddenValues,
} from './conditions/index.js'

type ValidatableForm = Parameters<typeof normalizeFormSteps>[0]

export function validateVisibleSubmission(
  form: ValidatableForm,
  data: Record<string, unknown>,
): { errors: Array<{ field: string; message: string }>; data: Record<string, unknown> } {
  const steps = normalizeFormSteps(form)
  const errors: Array<{ field: string; message: string }> = []

  for (const step of steps) {
    for (const field of step.fields as FormFieldBlock[]) {
      if (!field?.name) continue
      if (!isFieldVisible(field, data)) continue
      if (!isFieldRequired(field, data)) continue
      const value = data[field.name]
      const empty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      if (empty) {
        errors.push({ field: field.name, message: `${field.label} is required` })
      }
    }
  }

  return { errors, data: stripHiddenValues(steps, data) }
}
