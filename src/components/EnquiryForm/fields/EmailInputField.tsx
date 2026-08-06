'use client'

import type { RegisterOptions, UseFormReturn } from 'react-hook-form'
import type { EmailInputBlock } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

const DEFAULT_EMAIL_PATTERN: RegisterOptions['pattern'] = {
  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  message: 'Please enter a valid email address',
}

type Props = { field: EmailInputBlock; form: UseFormReturn<Record<string, unknown>> }

export function EmailInputField({ field, form }: Props) {
  const { register, formState: { errors } } = form
  const error = errors[field.name]

  // Built-in email pattern as a fallback — overridden if the editor configures
  // a `validation.pattern` via the admin UI.
  const rules: RegisterOptions = { pattern: DEFAULT_EMAIL_PATTERN, ...buildFieldRules(field, isFieldRequired(field, form.getValues())) }

  return (
    <div className="enquiry-field enquiry-field--email">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </label>
      <input
        id={`field-${field.name}`}
        type="email"
        placeholder={field.placeholder ?? undefined}
        className={['enquiry-field__input', error ? 'enquiry-field__input--error' : '']
          .filter(Boolean)
          .join(' ')}
        {...register(field.name, rules)}
      />
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
