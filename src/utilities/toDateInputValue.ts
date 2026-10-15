/**
 * Normalises a stored date bound into the `YYYY-MM-DD` that
 * `input[type="date"]`'s `min`/`max` attributes accept.
 *
 * Three shapes reach this:
 *  - a Payload date field, serialised as a full ISO timestamp
 *  - a bare `YYYY-MM-DD`, from records written while these were text fields
 *  - whatever an editor typed into that free-text box, which was never validated
 *
 * Anything that is not a real calendar date returns `undefined` rather than a
 * string. That matters: a browser ignores a malformed `min`/`max` silently, so
 * passing a typo straight through would quietly drop the limit with nothing to
 * show for it. Undefined at least makes "no bound" the explicit state.
 */
export const toDateInputValue = (value?: string | null): string | undefined => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return undefined

  const day = raw.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined

  // Rejects 2026-02-31 and friends: Date.parse accepts the shape, so compare
  // the round-trip back to the input.
  const parsed = new Date(`${day}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return undefined
  if (parsed.toISOString().slice(0, 10) !== day) return undefined

  return day
}
