'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { CheckboxInputBlock } from '../../../types.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: CheckboxInputBlock; form: UseFormReturn<Record<string, unknown>> }

export function CheckboxField({ field, form }: Props) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]

  return (
    <div className="enquiry-field enquiry-field--checkbox">
      <label className="enquiry-field__checkbox-label" htmlFor={`field-${field.name}`}>
        <input
          id={`field-${field.name}`}
          type="checkbox"
          className="enquiry-field__checkbox"
          {...register(field.name, {
            required: field.required ? `${field.label} is required` : false,
          })}
        />
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </label>
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
