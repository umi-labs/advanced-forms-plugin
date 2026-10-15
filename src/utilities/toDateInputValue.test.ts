import { describe, expect, it } from 'vitest'
import { toDateInputValue } from './toDateInputValue.js'

describe('toDateInputValue', () => {
  it('passes through a bare calendar date', () => {
    // How records written while min/max were text fields are stored.
    expect(toDateInputValue('2026-11-01')).toBe('2026-11-01')
  })

  it('takes the date part of a Payload ISO timestamp', () => {
    // How a `type: 'date'` field serialises once the block is migrated.
    expect(toDateInputValue('2026-11-01T00:00:00.000Z')).toBe('2026-11-01')
    expect(toDateInputValue('2027-11-01T23:59:59.999Z')).toBe('2027-11-01')
  })

  it('treats absent and empty as no bound', () => {
    expect(toDateInputValue(undefined)).toBeUndefined()
    expect(toDateInputValue(null)).toBeUndefined()
    expect(toDateInputValue('')).toBeUndefined()
    expect(toDateInputValue('   ')).toBeUndefined()
  })

  it('rejects anything that is not YYYY-MM-DD', () => {
    // The old field was free text with the format only in a description, so
    // these are the realistic typos rather than hypotheticals.
    expect(toDateInputValue('01/11/2026')).toBeUndefined()
    expect(toDateInputValue('1 Nov 2026')).toBeUndefined()
    expect(toDateInputValue('2026-11')).toBeUndefined()
    expect(toDateInputValue('next year')).toBeUndefined()
  })

  it('rejects a well-shaped date that does not exist', () => {
    // Date.parse accepts the shape and rolls over to 3 March, which would
    // silently apply the wrong bound.
    expect(toDateInputValue('2026-02-31')).toBeUndefined()
    expect(toDateInputValue('2026-13-01')).toBeUndefined()
  })

  it('keeps a real leap day', () => {
    expect(toDateInputValue('2028-02-29')).toBe('2028-02-29')
    expect(toDateInputValue('2027-02-29')).toBeUndefined()
  })
})
