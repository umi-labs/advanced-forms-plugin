'use client'

import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import type { AddressBlock, AddressValue } from '../../../types.js'
import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { lookupPostcode } from '../../../utilities/lookupPostcode.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: AddressBlock; form: UseFormReturn<Record<string, unknown>> }

const EMPTY: AddressValue = {
  line1: '',
  line2: '',
  city: '',
  county: '',
  postcode: '',
  country: '',
}

/**
 * An address with nothing typed into it is stored as `undefined`, not as an
 * object of empty strings, so "answered?" checks — here, in the resolver and on
 * the server — all agree.
 *
 * `country` is deliberately excluded: it is pre-filled from `defaultCountry`
 * before the visitor touches anything, so counting it would make every
 * untouched address look answered — which kept the address parts permanently
 * expanded and would have stored `{ country: 'United Kingdom' }` for an address
 * that was filled in and then cleared. A country on its own is not an address.
 */
export function isAddressAnswered(value: AddressValue | undefined): boolean {
  if (!value) return false
  const { country: _country, ...rest } = value
  return Object.values(rest).some((part) => (part ?? '').trim().length > 0)
}

function asAddress(value: unknown, defaultCountry: string): AddressValue {
  if (!value || typeof value !== 'object') return { ...EMPTY, country: defaultCountry }
  const v = value as Partial<AddressValue>
  return {
    line1: v.line1 ?? '',
    line2: v.line2 ?? '',
    city: v.city ?? '',
    county: v.county ?? '',
    postcode: v.postcode ?? '',
    country: v.country ?? defaultCountry,
  }
}

export function AddressField({ field, form }: Props) {
  const {
    control,
    formState: { errors },
  } = form
  const error = errors[field.name]

  const defaultCountry = field.defaultCountry ?? 'United Kingdom'
  const showLine2 = field.showLine2 !== false

  const [postcodeQuery, setPostcodeQuery] = useState('')
  const [looking, setLooking] = useState(false)
  const [lookupMessage, setLookupMessage] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const requiredMessage = buildFieldRules(field, isFieldRequired(field, form.getValues())).required

  return (
    <div className="enquiry-field enquiry-field--address">
      <label className="enquiry-field__label" htmlFor={`field-${field.name}-lookup`}>
        {field.label}
        {field.required && (
          <span className="enquiry-field__required" aria-hidden="true">
            *
          </span>
        )}
        {field.tooltip?.enabled && field.tooltip.text && <FieldTooltip text={field.tooltip.text} />}
      </label>

      <Controller
        control={control}
        name={field.name}
        rules={{
          validate: (value) => {
            const address = (value ?? undefined) as AddressValue | undefined
            if (!isFieldRequired(field, form.getValues())) return true
            // A postcode alone is not an address — the street line is what
            // makes it deliverable, and the lookup can never supply it.
            const complete =
              (address?.line1 ?? '').trim().length > 0 &&
              (address?.postcode ?? '').trim().length > 0
            if (complete) return true
            return (
              (typeof requiredMessage === 'string' ? requiredMessage : null) ??
              `${field.label} is required`
            )
          },
        }}
        render={({ field: ctrl }) => {
          const current = asAddress(ctrl.value, defaultCountry)

          /** Write one part back, collapsing an emptied address to `undefined`. */
          const setPart = (part: keyof AddressValue, partValue: string) => {
            const next = { ...current, [part]: partValue }
            ctrl.onChange(isAddressAnswered(next) ? next : undefined)
          }

          const runLookup = async () => {
            if (!postcodeQuery.trim()) return
            setLooking(true)
            setLookupMessage(null)

            const result = await lookupPostcode(postcodeQuery)

            if (result.status === 'ok') {
              ctrl.onChange({ ...current, ...result.address })
              setPostcodeQuery('')
              setExpanded(true)
            } else if (result.status === 'notFound') {
              setLookupMessage('Postcode not found — please check it, or enter the address below.')
              setExpanded(true)
            } else {
              setLookupMessage('Lookup unavailable — please enter the address below.')
              setExpanded(true)
            }

            setLooking(false)
          }

          const showParts = expanded || isAddressAnswered(current)

          return (
            <div
              className={[
                'enquiry-field__address',
                error ? 'enquiry-field__address--error' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="enquiry-field__address-lookup">
                <input
                  id={`field-${field.name}-lookup`}
                  type="text"
                  className="enquiry-field__input"
                  placeholder="Enter a postcode, e.g. SW1A 1AA"
                  value={postcodeQuery}
                  disabled={looking}
                  onChange={(e) => setPostcodeQuery(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter must not submit the step while the visitor is
                    // still looking up an address.
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void runLookup()
                    }
                  }}
                />
                <button
                  type="button"
                  className="enquiry-field__address-lookup-button"
                  disabled={looking}
                  onClick={() => void runLookup()}
                >
                  {looking ? 'Searching…' : (field.lookupLabel ?? 'Find address')}
                </button>
                {!showParts && (
                  <button
                    type="button"
                    className="enquiry-field__address-manual-button"
                    onClick={() => setExpanded(true)}
                  >
                    Enter manually
                  </button>
                )}
              </div>

              {lookupMessage && (
                <p className="enquiry-field__address-message" role="status">
                  {lookupMessage}
                </p>
              )}

              {showParts && (
                <div className="enquiry-field__address-parts">
                  <AddressPart
                    fieldName={field.name}
                    part="line1"
                    label="Address line 1"
                    value={current.line1}
                    onChange={setPart}
                    onBlur={ctrl.onBlur}
                  />
                  {showLine2 && (
                    <AddressPart
                      fieldName={field.name}
                      part="line2"
                      label="Address line 2"
                      value={current.line2}
                      onChange={setPart}
                      onBlur={ctrl.onBlur}
                    />
                  )}
                  <AddressPart
                    fieldName={field.name}
                    part="city"
                    label="Town / city"
                    value={current.city}
                    onChange={setPart}
                    onBlur={ctrl.onBlur}
                  />
                  <AddressPart
                    fieldName={field.name}
                    part="county"
                    label="County"
                    value={current.county}
                    onChange={setPart}
                    onBlur={ctrl.onBlur}
                  />
                  <AddressPart
                    fieldName={field.name}
                    part="postcode"
                    label="Postcode"
                    value={current.postcode}
                    onChange={setPart}
                    onBlur={ctrl.onBlur}
                  />
                  <AddressPart
                    fieldName={field.name}
                    part="country"
                    label="Country"
                    value={current.country}
                    onChange={setPart}
                    onBlur={ctrl.onBlur}
                  />
                </div>
              )}
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

type PartProps = {
  fieldName: string
  part: keyof AddressValue
  label: string
  value: string
  onChange: (part: keyof AddressValue, value: string) => void
  onBlur: () => void
}

function AddressPart({ fieldName, part, label, value, onChange, onBlur }: PartProps) {
  const id = `field-${fieldName}-${part}`
  return (
    <div className={`enquiry-field__address-part enquiry-field__address-part--${part}`}>
      <label className="enquiry-field__address-part-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="enquiry-field__input"
        value={value}
        onChange={(e) => onChange(part, e.target.value)}
        onBlur={onBlur}
      />
    </div>
  )
}
