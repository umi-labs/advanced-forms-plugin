'use client'

import { SelectInput, TextInput, useAllFormFields, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import type { ChangeEvent } from 'react'
import { collectSourceFields, type SourceOption } from './collectSourceFields.js'

/** Boolean-ish blocks get a fixed two-option select; the option values match
 *  what those fields emit at runtime (yesNo → 'yes'/'no', checkbox → 'true'/'false'). */
const BOOLEAN_OPTIONS: Record<string, SourceOption[]> = {
  yesNo: [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' },
  ],
  checkbox: [
    { label: 'Checked (true)', value: 'true' },
    { label: 'Unchecked (false)', value: 'false' },
  ],
}

/** Blocks whose configured options should populate the value dropdown. */
const CHOICE_BLOCKS = new Set([
  'select',
  'radioGroup',
  'checkboxGroup',
  'optionCards',
  'budgetRange',
])

/**
 * Value input for a condition. Adapts its control to the type of the selected
 * source field: a Yes/No or true/false select for boolean fields, a select of
 * the field's own options for choice fields, and a plain text input otherwise
 * (numbers, dates, free text). Always writes a string (the rule engine
 * compares by coercion), so no schema change is needed.
 */
export const ConditionValueField: TextFieldClientComponent = ({ field, path }) => {
  const fieldPath = path ?? field.name
  const { setValue, value } = useField<string>({ path: fieldPath })
  const [formFields] = useAllFormFields()

  const label = (typeof field?.label === 'string' && field.label) || 'Value'

  // The sibling `source` shares this field's path prefix (…/value → …/source).
  const sourcePath = fieldPath.replace(/\.value$/, '.source')
  const sourceName = (formFields as Record<string, { value?: unknown }>)[sourcePath]?.value
  const fields = collectSourceFields(formFields as Record<string, { value?: unknown }>)
  const meta = typeof sourceName === 'string' ? fields.get(sourceName) : undefined

  const selectOptions =
    meta && (BOOLEAN_OPTIONS[meta.blockType] ?? (CHOICE_BLOCKS.has(meta.blockType) ? meta.options : null))

  if (selectOptions && selectOptions.length > 0) {
    return (
      <SelectInput
        hasMany={false}
        isClearable
        label={label}
        name={fieldPath}
        onChange={(option) => {
          const next = Array.isArray(option) ? option[0]?.value : option?.value
          setValue(typeof next === 'string' ? next : '')
        }}
        options={selectOptions}
        path={fieldPath}
        placeholder="Select a value…"
        value={value ?? ''}
      />
    )
  }

  return (
    <TextInput
      label={label}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      path={fieldPath}
      value={value ?? ''}
    />
  )
}
