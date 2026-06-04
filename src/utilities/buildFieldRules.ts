import type { RegisterOptions } from 'react-hook-form'
import type { BaseFieldBlock } from '../types.js'

/**
 * Subset of RHF's `RegisterOptions` we populate from admin-configured rules.
 * Picking a subset avoids TypeScript collisions with the discriminated union
 * branches of the full `RegisterOptions` type (e.g. `valueAsNumber` /
 * `valueAsDate` clobber `pattern`).
 */
export type FieldRules = Pick<
  RegisterOptions,
  'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'
>

/**
 * Translate a field block's admin-configured `validation` group into RHF
 * `register(..., rules)` options. Returns an empty object when the field has
 * no rules — safe to spread into `register` unconditionally.
 *
 * Use with text-shaped fields (text, email, phone, textarea, select). Numeric
 * fields receive `min`/`max` rules; multi-counter fields should compose this
 * with a custom `validate` callback for total-based limits.
 */
export function buildFieldRules(
  field: Pick<BaseFieldBlock, 'label' | 'required' | 'validation'>,
): FieldRules {
  const v = field.validation ?? {}
  const rules: FieldRules = {}

  if (field.required) {
    rules.required = v.requiredMessage ?? `${field.label} is required`
  }

  if (typeof v.minLength === 'number') {
    rules.minLength = {
      value: v.minLength,
      message: `${field.label} must be at least ${v.minLength} characters`,
    }
  }

  if (typeof v.maxLength === 'number') {
    rules.maxLength = {
      value: v.maxLength,
      message: `${field.label} must be at most ${v.maxLength} characters`,
    }
  }

  if (typeof v.min === 'number') {
    rules.min = {
      value: v.min,
      message: v.minMessage ?? `${field.label} must be ≥ ${v.min}`,
    }
  }

  if (typeof v.max === 'number') {
    rules.max = {
      value: v.max,
      message: v.maxMessage ?? `${field.label} must be ≤ ${v.max}`,
    }
  }

  if (v.pattern) {
    try {
      rules.pattern = {
        value: new RegExp(v.pattern),
        message: v.patternMessage ?? `${field.label} is not valid`,
      }
    } catch {
      // Silently ignore an invalid regex source coming from the CMS so a
      // bad rule can't break the entire form.
    }
  }

  return rules
}
