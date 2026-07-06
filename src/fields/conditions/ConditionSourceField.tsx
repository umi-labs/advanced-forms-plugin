'use client'

import { SelectInput, useAllFormFields, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { collectSourceNames } from './collectSourceFields.js'

/**
 * Source picker for a condition. Renders Payload's own `SelectInput` (so it
 * matches the surrounding field styling) populated with the names of the form's
 * other field blocks, gathered live from form state.
 */
export const ConditionSourceField: TextFieldClientComponent = ({ field, path }) => {
  const fieldPath = path ?? field.name
  const { setValue, value } = useField<string>({ path: fieldPath })
  const [formFields] = useAllFormFields()

  const names = collectSourceNames(formFields as Record<string, { value?: unknown }>)
  const label = (typeof field?.label === 'string' && field.label) || 'Source'

  return (
    <SelectInput
      hasMany={false}
      isClearable={false}
      label={label}
      name={fieldPath}
      onChange={(option) => {
        const next = Array.isArray(option) ? option[0]?.value : option?.value
        setValue(typeof next === 'string' ? next : '')
      }}
      options={names.map((name) => ({ label: name, value: name }))}
      path={fieldPath}
      placeholder="Select a field…"
      value={value ?? ''}
    />
  )
}
