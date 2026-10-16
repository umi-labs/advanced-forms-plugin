import { describe, expect, it } from 'vitest'
import { countryFromLabel } from './countryFromLabel.js'

describe('countryFromLabel', () => {
  it('reads the country code out of a flag emoji', () => {
    // The two Regional Indicators in 🇬🇧 are G and B.
    expect(countryFromLabel('🇬🇧 UK (+44)')).toEqual({ code: 'GB', text: 'UK (+44)' })
    expect(countryFromLabel('🇮🇪 Ireland (+353)')).toEqual({ code: 'IE', text: 'Ireland (+353)' })
  })

  it('strips the emoji from the text, so it is not drawn twice', () => {
    expect(countryFromLabel('🇫🇷 France (+33)').text).toBe('France (+33)')
  })

  it('returns no code for a label without a flag', () => {
    // An editor can type anything into the label field; this renders with no
    // flag rather than breaking.
    expect(countryFromLabel('United Kingdom (+44)')).toEqual({
      code: null,
      text: 'United Kingdom (+44)',
    })
  })

  it('ignores a single regional indicator, which is not a flag', () => {
    expect(countryFromLabel('🇬 Partial').code).toBeNull()
  })

  it('ignores an unrelated leading emoji', () => {
    expect(countryFromLabel('📞 Phone (+44)').code).toBeNull()
  })

  it('handles an empty label', () => {
    expect(countryFromLabel('')).toEqual({ code: null, text: '' })
  })
})
