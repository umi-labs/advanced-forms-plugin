/**
 * Pulls the ISO 3166-1 alpha-2 code out of a country option's label.
 *
 * The picker's options are configured in the CMS as `{ label, value }`, where
 * the label has always carried a flag emoji — `"🇬🇧 UK (+44)"`. A flag emoji is
 * two Regional Indicator Symbols, and those *are* the country's two letters
 * offset into a private range, so the code can be read straight back out of
 * the label.
 *
 * That matters because it means real flag artwork needs no new field, no
 * migration, and no editor re-entering a list they have already built: every
 * option configured before this keeps working and gains a flag.
 *
 * Labels with no emoji return `null` and simply render without one.
 */
const INDICATOR_START = 0x1f1e6 // 🇦
const INDICATOR_END = 0x1f1ff // 🇿

export type ParsedCountryLabel = {
  /** Uppercase alpha-2, or null when the label carries no flag emoji. */
  code: string | null
  /** The label with the flag emoji removed, for display beside real artwork. */
  text: string
}

export const countryFromLabel = (label: string): ParsedCountryLabel => {
  const points = [...label]
  const first = points[0]?.codePointAt(0)
  const second = points[1]?.codePointAt(0)

  const isIndicator = (cp?: number) =>
    cp !== undefined && cp >= INDICATOR_START && cp <= INDICATOR_END

  if (!isIndicator(first) || !isIndicator(second)) {
    return { code: null, text: label.trim() }
  }

  const code =
    String.fromCharCode((first as number) - INDICATOR_START + 65) +
    String.fromCharCode((second as number) - INDICATOR_START + 65)

  return { code, text: points.slice(2).join('').trim() }
}
