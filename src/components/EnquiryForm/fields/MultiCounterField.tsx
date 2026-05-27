'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { MultiCounterBlock, MultiCounterItem } from '../../../types.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: MultiCounterBlock; form: UseFormReturn<Record<string, unknown>> }

export function MultiCounterField({ field, form }: Props) {
  const { register, watch, setValue } = form
  const rawValues = watch(field.name) as Record<string, number> | undefined

  const getVal = (counter: MultiCounterItem) =>
    rawValues?.[counter.name] ?? (counter.defaultValue ?? 0)

  const setVal = (counter: MultiCounterItem, next: number) =>
    setValue(field.name, { ...rawValues, [counter.name]: next }, { shouldValidate: true })

  return (
    <div className="enquiry-field enquiry-field--multi-counter">
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
      {(field.counters ?? []).map((counter) => {
        const val = getVal(counter)
        const min = counter.min ?? 0
        const max = counter.max ?? undefined
        return (
          <div key={counter.name} className="enquiry-field__counter-row">
            <span className="enquiry-field__counter-label">{counter.label}</span>
            <button
              type="button"
              className="enquiry-field__stepper-btn"
              onClick={() => setVal(counter, Math.max(val - 1, min))}
              disabled={val <= min}
              aria-label={`Decrease ${counter.label}`}
            >
              −
            </button>
            <span className="enquiry-field__counter-value">{val}</span>
            <button
              type="button"
              className="enquiry-field__stepper-btn"
              onClick={() => setVal(counter, max !== undefined ? Math.min(val + 1, max) : val + 1)}
              disabled={max !== undefined && val >= max}
              aria-label={`Increase ${counter.label}`}
            >
              +
            </button>
          </div>
        )
      })}
    </div>
  )
}
