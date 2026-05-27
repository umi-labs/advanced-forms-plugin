'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { YesNoBlock } from '../../../types.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: YesNoBlock; form: UseFormReturn<Record<string, unknown>> }

export function YesNoField({ field, form }: Props) {
  const { register, watch, setValue } = form
  const value = watch(field.name) as string | undefined

  return (
    <div className="enquiry-field enquiry-field--yesno">
      <div className="enquiry-field__label">
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </div>
      <input
        type="hidden"
        {...register(field.name, {
          required: field.required ? `${field.label} is required` : false,
        })}
      />
      <div className="enquiry-field__yesno-buttons">
        {(['yes', 'no'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            className={[
              'enquiry-field__yesno-btn',
              value === opt ? 'enquiry-field__yesno-btn--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setValue(field.name, opt, { shouldValidate: true })}
          >
            {opt === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}
