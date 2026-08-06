'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { NumberStepperBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: NumberStepperBlock; form: UseFormReturn<Record<string, unknown>> }

export function NumberStepperField({ field, form }: Props) {
  const { register, watch, setValue } = form
  const rawValue = watch(field.name)
  const value = typeof rawValue === 'number' ? rawValue : (field.defaultValue ?? 0)
  const step = field.step ?? 1
  const min = field.min ?? 0
  const max = field.max ?? undefined

  const increment = () =>
    setValue(
      field.name,
      max !== undefined ? Math.min(value + step, max) : value + step,
      { shouldValidate: true },
    )

  const decrement = () =>
    setValue(field.name, Math.max(value - step, min), { shouldValidate: true })

  return (
    <div className="enquiry-field enquiry-field--stepper">
      <div className="enquiry-field__label">
        {field.label}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </div>
      {/* Hidden input registers the value with react-hook-form */}
      <input
        type="hidden"
        {...register(field.name, {
          value: field.defaultValue ?? 0,
          ...buildFieldRules(field, isFieldRequired(field, form.getValues())),
        })}
      />
      <div className="enquiry-field__stepper-controls">
        {field.placeholder && (
          <span className="enquiry-field__stepper-placeholder">{field.placeholder}</span>
        )}
        <button
          type="button"
          className="enquiry-field__stepper-btn"
          onClick={decrement}
          disabled={value <= min}
          aria-label={`Decrease ${field.label}`}
        >
          −
        </button>
        <span className="enquiry-field__stepper-value">{value}</span>
        <button
          type="button"
          className="enquiry-field__stepper-btn"
          onClick={increment}
          disabled={max !== undefined && value >= max}
          aria-label={`Increase ${field.label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
