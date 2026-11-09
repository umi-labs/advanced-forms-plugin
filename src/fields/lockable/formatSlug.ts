import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

/**
 * Whether the lockable field should copy its watched source (e.g. title → slug).
 * Only until the value has been saved: a slug or field name is referenced by
 * pages, submissions and analytics, so renaming the source must not move it.
 * `savedValue` is the field's persisted value (form-state `initialValue`), which
 * is empty on create and on rows added since the last save.
 */
export const shouldMirrorSource = (locked: boolean | undefined, savedValue: unknown): boolean =>
  Boolean(locked) && (savedValue === undefined || savedValue === null || savedValue === '')

/**
 * Creates a `beforeValidate` hook that:
 *  - If the user provided a value, normalises it to slug format.
 *  - Otherwise on create (or when the current value is empty), derives it from
 *    the sibling `fallback` field.
 */
export const formatSlugHook =
  (fallback: string, ownName: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string' && value.length > 0) {
      return formatSlug(value)
    }

    if (operation === 'create' || !data?.[ownName]) {
      const fallbackData = data?.[fallback]

      if (fallbackData && typeof fallbackData === 'string') {
        return formatSlug(fallbackData)
      }
    }

    return value
  }
