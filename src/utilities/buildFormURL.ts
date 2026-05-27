export function buildFormURL({
  baseUrl,
  slug,
}: {
  baseUrl?: string
  slug: string
  formsSlug?: string
}): string {
  const path = `/api/enquiry-form-data/${slug}`
  return baseUrl ? new URL(path, baseUrl).toString() : path
}
