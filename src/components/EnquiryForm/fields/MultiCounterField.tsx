'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { MultiCounterBlock, MultiCounterItem } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: MultiCounterBlock; form: UseFormReturn<Record<string, unknown>> }

export function MultiCounterField({ field, form }: Props) {
  const { register, watch, setValue } = form
  const rawValues = watch(field.name) as Record<string, number> | undefined

  const getVal = (counter: MultiCounterItem) =>
    rawValues?.[counter.name] ?? (counter.defaultValue ?? 0)

  const setVal = (counter: MultiCounterItem, next: number) =>
    setValue(field.name, { ...rawValues, [counter.name]: next }, { shouldValidate: true })

  // `min`/`max` from the admin validation group apply to the **total** of all
  // counters. We strip those numeric rules out of the shared helper output and
  // re-implement them via a `validate` callback that sums the counter values.
  const { min: _ignoreMin, max: _ignoreMax, ...baseRules } = buildFieldRules(field, isFieldRequired(field, form.getValues()))
  const v = field.validation ?? {}
  const totalMin = typeof v.min === 'number' ? v.min : null
  const totalMax = typeof v.max === 'number' ? v.max : null

  const validateTotal = (value: unknown) => {
    if (totalMin === null && totalMax === null) return true
    const values = (value ?? {}) as Record<string, number>
    const total = Object.values(values).reduce(
      (sum, n) => sum + (typeof n === 'number' ? n : 0),
      0,
    )
    if (totalMin !== null && total < totalMin) {
      return v.minMessage ?? `${field.label} must total at least ${totalMin}`
    }
    if (totalMax !== null && total > totalMax) {
      return v.maxMessage ?? `${field.label} must total at most ${totalMax}`
    }
    return true
  }

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
        {...register(field.name, { ...baseRules, validate: validateTotal })}
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
