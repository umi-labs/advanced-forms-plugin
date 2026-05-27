export function buildFormURL({
  baseUrl,
  slug,
  formsSlug = 'form-data',
}: {
  baseUrl?: string
  slug: string
  formsSlug?: string
}): string {
  const path = `/api/${formsSlug}/${slug}`
  return baseUrl ? new URL(path, baseUrl).toString() : path
}
