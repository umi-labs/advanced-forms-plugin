import type { SubmitError } from '../types.js'

/**
 * Coerce whatever the submit endpoint returned into a well-formed `SubmitError`.
 *
 * The handler's intended error responses are already `{ success: false, errors }`,
 * but unexpected responses (a Payload `{ message }` 404, a 500, or a non-JSON
 * body parsed as `null`) lack an `errors` array. Normalising here means the UI
 * always has `errors` to render and never crashes on `error.errors.map`.
 */
export function normalizeSubmitError(payload: unknown): SubmitError {
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { errors?: unknown }).errors)
  ) {
    return payload as SubmitError
  }

  const message =
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { message?: unknown }).message === 'string'
      ? (payload as { message: string }).message
      : 'Submission failed. Please try again.'

  return { errors: [{ field: '', message }], success: false }
}
