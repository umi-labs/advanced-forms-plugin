/** Path segment (under Payload's `/api`) for the form-submit endpoint.
 *  Shared by the endpoint registration (see `formPlugin`) and the client so the
 *  two can never drift. */
export const FORM_SUBMIT_PATH = 'form-submit'

/** Build the URL the client POSTs a submission to. Mirrors the registered
 *  endpoint at `/api/${FORM_SUBMIT_PATH}/:formSlug`. */
export function buildSubmitURL({
  apiBase = '',
  formSlug,
  submitPath = FORM_SUBMIT_PATH,
}: {
  apiBase?: string
  formSlug: string
  submitPath?: string
}): string {
  return `${apiBase}/api/${submitPath}/${formSlug}`
}
