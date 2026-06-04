'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { OptionCardsBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: OptionCardsBlock; form: UseFormReturn<Record<string, unknown>> }

export function OptionCardsField({ field, form }: Props) {
  const { register, watch, setValue } = form
  const value = watch(field.name) as string | undefined

  return (
    <div className="enquiry-field enquiry-field--option-cards">
      <div className="enquiry-field__label">
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </div>
      <input
        type="hidden"
        {...register(field.name, buildFieldRules(field))}
      />
      <div
        className={[
          'enquiry-field__option-cards',
          `enquiry-field__option-cards--${field.layout ?? 'row'}`,
        ].join(' ')}
      >
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={[
              'enquiry-field__option-card',
              value === opt.value ? 'enquiry-field__option-card--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setValue(field.name, opt.value, { shouldValidate: true })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
