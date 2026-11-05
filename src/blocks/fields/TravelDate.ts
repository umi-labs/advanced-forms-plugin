import type { Block } from 'payload'

import { baseFieldBlockFields } from './shared.js'

/**
 * "When would you like to travel?": the visitor picks a whole month or an exact date. Not in the
 * default set, so adding it doesn't change any site's schema; register it with
 * `formPlugin({ fields: { travelDate: { block: TravelDateBlock } } })`.
 *
 * Pair it with a Yes / No "Are you flexible?" and a visibility rule ("Require this field when
 * rules match", flexible equals no) to make the date compulsory only for people who aren't.
 */
export const TravelDateBlock: Block = {
  slug: 'travelDate',
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'yearsAhead',
      type: 'number',
      admin: { description: 'How many years after this one the month picker offers.' },
      defaultValue: 3,
      max: 10,
      min: 0,
    },
  ],
  labels: { plural: 'Travel Dates', singular: 'Travel Date (month or date)' },
}
