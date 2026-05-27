'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TextInputBlock } from '../../../types.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: TextInputBlock; form: UseFormReturn<Record<string, unknown>> }

export function TextInputField({ field, form }: Props) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]

  return (
    <div className="enquiry-field enquiry-field--text">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </label>
      <input
        id={`field-${field.name}`}
        type={field.inputType ?? 'text'}
        placeholder={field.placeholder ?? undefined}
        className={['enquiry-field__input', error ? 'enquiry-field__input--error' : '']
          .filter(Boolean)
          .join(' ')}
        {...register(field.name, {
          required: field.required ? `${field.label} is required` : false,
        })}
      />
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
