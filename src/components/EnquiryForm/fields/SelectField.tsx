'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { SelectInputBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: SelectInputBlock; form: UseFormReturn<Record<string, unknown>> }

export function SelectField({ field, form }: Props) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]

  return (
    <div className="enquiry-field enquiry-field--select">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </label>
      <select
        id={`field-${field.name}`}
        className={['enquiry-field__select', error ? 'enquiry-field__select--error' : '']
          .filter(Boolean)
          .join(' ')}
        {...register(field.name, buildFieldRules(field))}
      >
        {field.placeholder && (
          <option value="" disabled>
            {field.placeholder}
          </option>
        )}
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
