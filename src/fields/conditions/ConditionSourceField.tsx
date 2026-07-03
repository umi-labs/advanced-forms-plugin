'use client'

import { useAllFormFields, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/** Collect candidate source field names from the entire form's state. */
function collectFieldNames(formFields: Record<string, { value?: unknown }>): string[] {
  const names = new Set<string>()
  // Payload flattens array/block rows into dot/index paths in form state, e.g.
  // `fields.0.name`, `steps.0.fields.2.name`, `steps.0.fields.2.counters.0.name`.
  for (const [path, state] of Object.entries(formFields)) {
    const segments = path.split('.')
    const last = segments[segments.length - 1]
    if (last !== 'name') continue
    const value = state?.value
    if (typeof value !== 'string' || value.length === 0) continue
    // Nested counter names become `<fieldName>.<counterName>`.
    const isCounter = segments.includes('counters')
    if (isCounter) {
      // Find the owning field block's name value if present.
      const parentPath = segments.slice(0, segments.indexOf('counters')).join('.') + '.name'
      const parentName = formFields[parentPath]?.value
      if (typeof parentName === 'string' && parentName) {
        names.add(`${parentName}.${value}`)
        continue
      }
    }
    names.add(value)
  }
  return Array.from(names).sort()
}

export const ConditionSourceField: TextFieldClientComponent = ({ field, path }) => {
  const { setValue, value } = useField<string>({ path: path ?? field.name })
  const [formFields] = useAllFormFields()

  const options = collectFieldNames(formFields as Record<string, { value?: unknown }>)
  const label = (typeof field?.label === 'string' && field.label) || 'Source field'

  return (
    <div className="field-type">
      <label className="field-label" htmlFor={`cond-source-${path}`}>
        {label}
      </label>
      {options.length > 0 ? (
        <select
          id={`cond-source-${path}`}
          className="field-type__wrap"
          value={value ?? ''}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value="">Select a field…</option>
          {options.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={`cond-source-${path}`}
          type="text"
          value={value ?? ''}
          placeholder="field name"
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </div>
  )
}
