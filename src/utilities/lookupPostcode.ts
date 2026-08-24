/**
 * UK postcode lookup, backed by postcodes.io.
 *
 * postcodes.io is a free, open service over Royal Mail's PAF-derived ONS data.
 * It needs no API key and bills nobody per call, which is why it is used here
 * rather than a metered provider: an address field can be dropped onto any
 * public form without anyone having to watch a lookup quota.
 *
 * It resolves a postcode to its town/county/country only — it does not return
 * a list of premises, so the street and building still have to be typed. The
 * field is always usable manually.
 */

const ENDPOINT = 'https://api.postcodes.io/postcodes'

export type PostcodeAddress = {
  postcode: string
  city: string
  county: string
  country: string
}

export type PostcodeLookup =
  | { status: 'ok'; address: PostcodeAddress }
  | { status: 'notFound' }
  | { status: 'error' }

type PostcodesIOResponse = {
  status: number
  result: {
    postcode?: string | null
    postal_town?: string | null
    admin_district?: string | null
    admin_county?: string | null
    country?: string | null
  } | null
}

/** postcodes.io returns place names upper-cased; forms want them readable. */
export function toTitleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Look up a postcode. Never throws — a network failure, a non-JSON body or an
 * unknown postcode all resolve to a status the caller can render.
 *
 * `fetchImpl` exists so tests can drive it without a network.
 */
export async function lookupPostcode(
  postcode: string,
  { fetchImpl = globalThis.fetch }: { fetchImpl?: typeof globalThis.fetch } = {},
): Promise<PostcodeLookup> {
  const cleaned = postcode.trim()
  if (!cleaned) return { status: 'notFound' }

  try {
    const res = await fetchImpl(`${ENDPOINT}/${encodeURIComponent(cleaned)}`)
    const body = (await res.json()) as PostcodesIOResponse

    if (body?.status !== 200 || !body.result) return { status: 'notFound' }

    const { postcode: formatted, postal_town, admin_district, admin_county, country } = body.result

    return {
      status: 'ok',
      address: {
        postcode: formatted || cleaned.toUpperCase(),
        city: toTitleCase(postal_town || admin_district || ''),
        county: toTitleCase(admin_county || admin_district || ''),
        country: country || 'United Kingdom',
      },
    }
  } catch {
    return { status: 'error' }
  }
}
