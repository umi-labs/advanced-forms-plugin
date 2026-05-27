'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { TextareaInputBlock } from '../../../types.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: TextareaInputBlock; form: UseFormReturn<Record<string, unknown>> }

export function TextareaField({ field, form }: Props) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]

  return (
    <div className="enquiry-field enquiry-field--textarea">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </label>
      <textarea
        id={`field-${field.name}`}
        rows={field.rows ?? 4}
        placeholder={field.placeholder ?? undefined}
        className={['enquiry-field__textarea', error ? 'enquiry-field__textarea--error' : '']
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
