import type { CheckboxField, TextField } from 'payload'

import { formatSlugHook } from './formatSlug.js'

export type LockableTextFieldOptions = {
  /** Name of the text field (e.g. `slug`, `name`). */
  name: string
  /** Name of the sibling field to derive the value from (e.g. `title`, `label`). */
  watch: string
  /**
   * Name of the lock checkbox field. Defaults to `${name}Lock`.
   * Must be unique among siblings.
   */
  lockName?: string
  /** Partial overrides merged into the generated text field. */
  fieldOverrides?: Partial<TextField>
  /** Partial overrides merged into the generated checkbox field. */
  checkboxOverrides?: Partial<CheckboxField>
}

/**
 * Returns a `[textField, lockCheckboxField]` tuple that implements an
 * auto-generated, lockable text input. The text input is rendered with a
 * custom React component that mirrors the value of `watch` (slugified) while
 * the checkbox is `true`. Toggling the lock allows manual edits.
 *
 * The lock checkbox is hidden in the admin UI and defaults to `true` so new
 * documents start in auto-mode.
 */
export const lockableTextField = ({
  name,
  watch,
  lockName,
  fieldOverrides,
  checkboxOverrides,
}: LockableTextFieldOptions): [TextField, CheckboxField] => {
  const resolvedLockName = lockName ?? `${name}Lock`

  const checkboxField: CheckboxField = {
    name: resolvedLockName,
    type: 'checkbox',
    defaultValue: true,
    admin: {
      hidden: true,
    },
    ...checkboxOverrides,
  }

  // The TextField type is a discriminated union (hasMany true/false) which
  // makes a fully-typed spread of `Partial<TextField>` painful — the original
  // slug-field reference uses the same `@ts-expect-error` escape hatch.
  // @ts-expect-error - ts mismatch Partial<TextField> with TextField
  const textField: TextField = {
    name,
    type: 'text',
    ...(fieldOverrides ?? {}),
    hooks: {
      ...(fieldOverrides?.hooks ?? {}),
      beforeValidate: [
        ...(fieldOverrides?.hooks?.beforeValidate ?? []),
        formatSlugHook(watch, name),
      ],
    },
    admin: {
      ...(fieldOverrides?.admin ?? {}),
      components: {
        ...(fieldOverrides?.admin?.components ?? {}),
        Field: {
          path: '@foundrykit/advanced-forms-plugin/client#LockableTextField',
          clientProps: {
            watch,
            checkboxFieldPath: resolvedLockName,
          },
        },
      },
    },
  }

  return [textField, checkboxField]
}

export { formatSlug, formatSlugHook } from './formatSlug.js'
