/**
 * Shared helpers for the condition-builder admin components. Both the Source
 * picker and the adaptive Value input need to understand the other field blocks
 * on the form, so this module reconstructs each field block's name, blockType,
 * and (where applicable) its option list from Payload's flattened form state.
 *
 * Pure — takes the `useAllFormFields()` state dictionary and returns plain data.
 */

export type SourceOption = { label: string; value: string }

export type SourceFieldMeta = {
  /** blockType of the source field, e.g. 'yesNo', 'number', 'select'. */
  blockType: string
  /** Choice options, for select/radio/checkbox-group style fields. */
  options: SourceOption[]
}

type FormFieldsState = Record<string, { value?: unknown } | undefined>

const NAME_SUFFIX = '.name'

/**
 * Build a map of every addressable source field on the form, keyed by the name
 * a condition would reference. `multiCounter` counters are exposed as
 * `<fieldName>.<counterName>` dot-paths and typed as numeric.
 */
export function collectSourceFields(formFields: FormFieldsState): Map<string, SourceFieldMeta> {
  const map = new Map<string, SourceFieldMeta>()

  for (const [path, state] of Object.entries(formFields)) {
    if (!path.endsWith(NAME_SUFFIX)) continue
    const name = state?.value
    if (typeof name !== 'string' || name.length === 0) continue

    const prefix = path.slice(0, -NAME_SUFFIX.length) // e.g. steps.0.fields.2
    const segments = prefix.split('.')

    // Counter sub-fields (multiCounter) — key as `<parentName>.<counterName>`.
    if (segments.includes('counters')) {
      const parentPrefix = segments.slice(0, segments.indexOf('counters')).join('.')
      const parentName = formFields[`${parentPrefix}${NAME_SUFFIX}`]?.value
      if (typeof parentName === 'string' && parentName) {
        map.set(`${parentName}.${name}`, { blockType: 'number', options: [] })
      }
      continue
    }

    const blockTypeValue = formFields[`${prefix}.blockType`]?.value
    // A multiCounter's runtime value is an object of counters, not a scalar, so
    // only its `<name>.<counter>` dot-paths are valid sources — skip the bare name.
    if (blockTypeValue === 'multiCounter') continue

    map.set(name, {
      blockType: typeof blockTypeValue === 'string' ? blockTypeValue : 'text',
      options: collectOptions(formFields, prefix),
    })
  }

  return map
}

/** Sorted list of the field names/dot-paths usable as a condition source. */
export function collectSourceNames(formFields: FormFieldsState): string[] {
  return Array.from(collectSourceFields(formFields).keys()).sort()
}

function collectOptions(formFields: FormFieldsState, prefix: string): SourceOption[] {
  const optionsPrefix = `${prefix}.options.`
  const valueSuffix = '.value'
  const byIndex = new Map<number, SourceOption>()

  for (const key of Object.keys(formFields)) {
    if (!key.startsWith(optionsPrefix) || !key.endsWith(valueSuffix)) continue
    const middle = key.slice(optionsPrefix.length, -valueSuffix.length)
    if (!/^\d+$/.test(middle)) continue // skip nested keys like options.0.someGroup.value

    const index = Number(middle)
    const value = formFields[key]?.value
    if (typeof value !== 'string' || value.length === 0) continue
    const label = formFields[`${optionsPrefix}${index}.label`]?.value
    byIndex.set(index, {
      value,
      label: typeof label === 'string' && label.length > 0 ? label : value,
    })
  }

  return Array.from(byIndex.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, option]) => option)
}
