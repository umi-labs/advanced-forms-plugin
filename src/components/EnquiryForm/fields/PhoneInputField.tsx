'use client'

import { useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import type { PhoneBlock, SelectOption } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: PhoneBlock; form: UseFormReturn<Record<string, unknown>> }

/**
 * Built-in fallback list. The `value` is the dial code so the field can
 * trivially build an E.164 number (`dialCode + sanitised digits`).
 */
const DEFAULT_COUNTRIES: SelectOption[] = [
  { label: '🇬🇧 UK (+44)', value: '+44' },
  { label: '🇺🇸 US (+1)', value: '+1' },
  { label: '🇮🇪 Ireland (+353)', value: '+353' },
  { label: '🇦🇺 Australia (+61)', value: '+61' },
  { label: '🇨🇦 Canada (+1)', value: '+1' },
  { label: '🇫🇷 France (+33)', value: '+33' },
  { label: '🇩🇪 Germany (+49)', value: '+49' },
  { label: '🇪🇸 Spain (+34)', value: '+34' },
  { label: '🇮🇹 Italy (+39)', value: '+39' },
  { label: '🇳🇱 Netherlands (+31)', value: '+31' },
]

type PhoneValue = { country: string; number: string; e164: string }

function isPhoneValue(v: unknown): v is PhoneValue {
  return (
    !!v &&
    typeof v === 'object' &&
    'country' in v &&
    'number' in v &&
    'e164' in v
  )
}

function buildPhoneValue(country: string, number: string): PhoneValue {
  // Strip everything except digits when assembling E.164; keep raw input in `number`.
  const digits = number.replace(/\D+/g, '')
  const dial = country.replace(/[^\d+]/g, '')
  const e164 = digits ? `${dial}${digits}` : ''
  return { country, number, e164 }
}

export function PhoneInputField({ field, form }: Props) {
  const { control, formState: { errors } } = form

  const countries = useMemo<SelectOption[]>(
    () => (field.countries && field.countries.length > 0 ? field.countries : DEFAULT_COUNTRIES),
    [field.countries],
  )

  const defaultCountry = field.defaultCountry ?? countries[0]?.value ?? ''
  const error = errors[field.name]

  // Build admin-configured rules (minLength/maxLength/pattern apply to the
  // typed number). The `required` rule is replaced with a custom `validate`
  // that understands the composite { country, number, e164 } value shape.
  const adminRules = buildFieldRules(field, isFieldRequired(field, form.getValues()))
  const { required: requiredMessage, ...textRules } = adminRules
  const patternRule =
    textRules.pattern && typeof textRules.pattern === 'object'
      ? (textRules.pattern as { value: RegExp; message: string })
      : null
  const minLengthRule =
    textRules.minLength && typeof textRules.minLength === 'object'
      ? (textRules.minLength as { value: number; message: string })
      : null
  const maxLengthRule =
    textRules.maxLength && typeof textRules.maxLength === 'object'
      ? (textRules.maxLength as { value: number; message: string })
      : null

  return (
    <div className="enquiry-field enquiry-field--phone">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}`}>
        {field.label}
        {field.required && <span className="enquiry-field__required" aria-hidden="true">*</span>}
        {field.tooltip?.enabled && field.tooltip.text && (
          <FieldTooltip text={field.tooltip.text} />
        )}
      </label>
      <Controller
        control={control}
        name={field.name}
        defaultValue={buildPhoneValue(defaultCountry, '')}
        rules={{
          validate: (value) => {
            const number = isPhoneValue(value) ? value.number.trim() : ''
            if (isFieldRequired(field, form.getValues()) && number.length === 0) {
              return (
                (typeof requiredMessage === 'string' ? requiredMessage : null) ??
                `${field.label} is required`
              )
            }
            // Skip the rest of the checks for empty optional values
            if (number.length === 0) return true
            if (minLengthRule && number.length < minLengthRule.value) {
              return minLengthRule.message
            }
            if (maxLengthRule && number.length > maxLengthRule.value) {
              return maxLengthRule.message
            }
            if (patternRule && !patternRule.value.test(number)) {
              return patternRule.message
            }
            return true
          },
        }}
        render={({ field: ctrl }) => {
          const current: PhoneValue = isPhoneValue(ctrl.value)
            ? ctrl.value
            : buildPhoneValue(defaultCountry, '')
          return (
            <div
              className={[
                'enquiry-field__input-group',
                error ? 'enquiry-field__input-group--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <select
                aria-label={`${field.label} country`}
                className="enquiry-field__phone-country"
                value={current.country}
                onChange={(e) =>
                  ctrl.onChange(buildPhoneValue(e.target.value, current.number))
                }
                onBlur={ctrl.onBlur}
              >
                {countries.map((c) => (
                  <option key={`${c.value}-${c.label}`} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id={`field-${field.name}`}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder={field.placeholder ?? undefined}
                className="enquiry-field__input enquiry-field__phone-number"
                value={current.number}
                onChange={(e) =>
                  ctrl.onChange(buildPhoneValue(current.country, e.target.value))
                }
                onBlur={ctrl.onBlur}
              />
            </div>
          )
        }}
      />
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
