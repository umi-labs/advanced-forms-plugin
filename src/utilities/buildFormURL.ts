export function buildFormURL({
  baseUrl,
  slug,
  formsSlug = 'enquiry-forms',
}: {
  baseUrl?: string
  slug: string
  formsSlug?: string
}): string {
  const path = `/api/${formsSlug}/${slug}`
  return baseUrl ? new URL(path, baseUrl).toString() : path
}
