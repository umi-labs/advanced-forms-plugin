import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

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
