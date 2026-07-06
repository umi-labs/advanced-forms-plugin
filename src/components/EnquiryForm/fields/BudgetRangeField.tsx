'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { BudgetRangeBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: BudgetRangeBlock; form: UseFormReturn<Record<string, unknown>> }

export function BudgetRangeField({ field, form }: Props) {
  const { register, watch, setValue } = form
  const value = watch(field.name) as string | undefined

  return (
    <div className="enquiry-field enquiry-field--budget-range">
      <div className="enquiry-field__label">
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </div>
      <input
        type="hidden"
        {...register(field.name, buildFieldRules(field, isFieldRequired(field, form.getValues())))}
      />
      <div className="enquiry-field__budget-options">
        {(field.options ?? []).map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={[
              'enquiry-field__budget-option',
              value === opt.value ? 'enquiry-field__budget-option--active' : '',
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
