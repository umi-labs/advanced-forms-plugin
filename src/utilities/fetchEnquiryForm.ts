import type { FormDocument } from '../types.js'
import { buildFormURL } from './buildFormURL.js'

export async function fetchForm({
  slug,
  baseUrl,
  formsSlug,
}: {
  slug: string
  baseUrl?: string
  formsSlug?: string
}): Promise<FormDocument> {
  const url = buildFormURL({ slug, baseUrl, formsSlug })
  const res = await fetch(url, { next: { revalidate: 0 } } as RequestInit)
  if (!res.ok) {
    throw new Error(`Failed to fetch form "${slug}": ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<FormDocument>
}
