/** A travel date answer: a whole month (`2027-08`) or an exact day (`2027-08-14`). */
export type TravelDate = { from: string; kind: 'date' | 'month'; label: string; to: string }

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Reads a travel date answer. `from`/`to` are the first and last day it covers (the same day for
 * an exact date), as `YYYY-MM-DD`, so a CRM can take a range either way. Null for anything else.
 */
export function parseTravelDate(value: unknown): null | TravelDate {
  if (typeof value !== 'string') {
    return null
  }
  const match = value.trim().match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/)
  if (!match) {
    return null
  }
  const year = Number(match[1])
  const month = Number(match[2])
  if (month < 1 || month > 12) {
    return null
  }

  if (!match[3]) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    return {
      from: `${year}-${pad(month)}-01`,
      kind: 'month',
      label: `${MONTHS[month - 1]} ${year}`,
      to: `${year}-${pad(month)}-${pad(lastDay)}`,
    }
  }

  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCMonth() !== month - 1) {
    return null
  }
  const iso = `${year}-${pad(month)}-${pad(day)}`
  return {
    from: iso,
    kind: 'date',
    label: `${day} ${MONTHS[month - 1].slice(0, 3)} ${year}`,
    to: iso,
  }
}

export { MONTHS }
