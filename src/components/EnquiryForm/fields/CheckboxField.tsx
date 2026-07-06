'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { CheckboxInputBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: CheckboxInputBlock; form: UseFormReturn<Record<string, unknown>> }

export function CheckboxField({ field, form }: Props) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]
  const appearance = field.appearance ?? 'checkbox'
  const isSwitch = appearance === 'switch'

  const inputProps = register(field.name, buildFieldRules(field, isFieldRequired(field, form.getValues())))

  return (
    <div
      className={`enquiry-field enquiry-field--checkbox enquiry-field--${appearance}`}
    >
      <label
        className={
          isSwitch ? 'enquiry-field__switch-label' : 'enquiry-field__checkbox-label'
        }
        htmlFor={`field-${field.name}`}
      >
        {isSwitch ? (
          <span className="enquiry-field__switch">
            <input
              id={`field-${field.name}`}
              type="checkbox"
              role="switch"
              className="enquiry-field__switch-input"
              {...inputProps}
            />
            <span className="enquiry-field__switch-track" aria-hidden="true">
              <span className="enquiry-field__switch-thumb" />
            </span>
          </span>
        ) : (
          <input
            id={`field-${field.name}`}
            type="checkbox"
            className="enquiry-field__checkbox"
            {...inputProps}
          />
        )}
        <span className="enquiry-field__checkbox-text">
          {field.label}
          {field.required && (
            <span className="enquiry-field__required" aria-hidden="true">*</span>
          )}
          {field.tooltip?.enabled && field.tooltip.text && (
            <FieldTooltip text={field.tooltip.text} />
          )}
        </span>
      </label>
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
