import type { EnquiryForm } from '../types.js'
import { buildFormURL } from './buildFormURL.js'

export async function fetchEnquiryForm({
  slug,
  baseUrl,
  formsSlug,
}: {
  slug: string
  baseUrl?: string
  formsSlug?: string
}): Promise<EnquiryForm> {
  const url = buildFormURL({ slug, baseUrl, formsSlug })

  const res = await fetch(url, {
    // Allow consuming Next.js apps to control caching via their own fetch options.
    next: { revalidate: 0 },
  } as RequestInit)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as any).error ?? `Failed to fetch form '${slug}': ${res.status}`)
  }

  return res.json() as Promise<EnquiryForm>
}
