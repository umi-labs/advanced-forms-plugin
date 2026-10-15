'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { DateBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { toDateInputValue } from '../../../utilities/toDateInputValue.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: DateBlock; form: UseFormReturn<Record<string, unknown>> }

/**
 * `input[type="date"]` rather than a date-picker dependency: every supported
 * browser renders a native calendar, it is keyboard accessible and localised
 * for free, and it honours `min`/`max` natively — including greying out dates
 * outside the range, which a hand-rolled picker would have to reimplement.
 *
 * The block existed and editors could add it, but `Step.tsx` had no `case` for
 * it and fell through to `default: return null` — so a Date Input configured in
 * the CMS rendered nothing at all on the site.
 */
export function DateInputField({ field, form }: Props) {
  const {
    register,
    formState: { errors },
  } = form
  const error = errors[field.name]

  // Bounds are normalised rather than passed through: see toDateInputValue for
  // why a malformed value must become undefined instead of reaching the DOM.
  const min = toDateInputValue(field.min)
  const max = toDateInputValue(field.max)

  return (
    <div className="enquiry-field enquiry-field--date">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required && (
          <span className="enquiry-field__required" aria-hidden="true">
            *
          </span>
        )}
        {field.tooltip?.enabled && field.tooltip.text && <FieldTooltip text={field.tooltip.text} />}
      </label>
      <input
        id={`field-${field.name}`}
        type="date"
        min={min}
        max={max}
        // A date input shows its own placeholder format, so the CMS placeholder
        // is exposed to assistive tech instead of being dropped on the floor.
        aria-describedby={field.placeholder ? `field-${field.name}-hint` : undefined}
        className={['enquiry-field__input', error ? 'enquiry-field__input--error' : '']
          .filter(Boolean)
          .join(' ')}
        {...register(field.name, buildFieldRules(field, isFieldRequired(field, form.getValues())))}
      />
      {field.placeholder && (
        <p className="enquiry-field__hint" id={`field-${field.name}-hint`}>
          {field.placeholder}
        </p>
      )}
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
