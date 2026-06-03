'use client'

import type { TextFieldClientProps } from 'payload'
import type React from 'react'

import { Button, FieldLabel, TextInput, useField, useForm, useFormFields } from '@payloadcms/ui'
import { useCallback, useEffect } from 'react'

import { formatSlug } from './formatSlug.js'
import './index.scss'

type LockableTextFieldProps = {
  /** Sibling checkbox field name controlling whether the value is locked to the source. */
  checkboxFieldPath: string
  /** Sibling field name to derive the slugified value from (e.g. `title` or `label`). */
  watch: string
} & TextFieldClientProps

/**
 * Given a field path like `steps.0.fields.2.name`, returns `steps.0.fields.2`.
 * Returns an empty string for top-level paths.
 */
function getParentPath(path?: string): string {
  if (!path || !path.includes('.')) {return ''}
  return path.slice(0, path.lastIndexOf('.'))
}

export const LockableTextField: React.FC<LockableTextFieldProps> = ({
  checkboxFieldPath: checkboxFieldName,
  field,
  path,
  readOnly: readOnlyFromProps,
  watch,
}) => {
  const { label, required } = field

  const fieldPath = path || field.name
  const parentPath = getParentPath(fieldPath)
  const checkboxFieldPath = parentPath ? `${parentPath}.${checkboxFieldName}` : checkboxFieldName
  const watchFieldPath = parentPath ? `${parentPath}.${watch}` : watch

  const { setValue, value } = useField<string>({ path: fieldPath })

  const { dispatchFields } = useForm()

  // Lock state (checkbox) — separate selector to minimise re-renders.
  const checkboxValue = useFormFields(([fields]) => {
    return fields[checkboxFieldPath]?.value as boolean | undefined
  })

  // Source field value.
  const watchValue = useFormFields(([fields]) => {
    return fields[watchFieldPath]?.value as string | undefined
  })

  useEffect(() => {
    if (!checkboxValue) {return}

    if (watchValue) {
      const formatted = formatSlug(watchValue)
      if (value !== formatted) {setValue(formatted)}
    } else if (value !== '') {
      setValue('')
    }
  }, [watchValue, checkboxValue, setValue, value])

  const handleLock = useCallback(
    (e: React.MouseEvent<Element>) => {
      e.preventDefault()
      dispatchFields({
        type: 'UPDATE',
        path: checkboxFieldPath,
        value: !checkboxValue,
      })
    },
    [checkboxValue, checkboxFieldPath, dispatchFields],
  )

  const readOnly = readOnlyFromProps || checkboxValue

  return (
    <div className="field-type lockable-text-field">
      <div className="lockable-text-field__label-wrapper">
        <FieldLabel htmlFor={`field-${fieldPath}`} label={label} required={required} />

        <Button
          buttonStyle="none"
          className="lockable-text-field__lock-button"
          onClick={handleLock}
        >
          {checkboxValue ? 'Unlock' : 'Lock'}
        </Button>
      </div>

      <TextInput
        onChange={setValue}
        path={fieldPath}
        readOnly={Boolean(readOnly)}
        value={value}
      />
    </div>
  )
}
