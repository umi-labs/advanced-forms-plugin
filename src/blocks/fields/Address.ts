import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

/**
 * Address field with a postcode lookup. Stores a composite value
 * (`{ line1, line2, city, county, postcode, country }`), like the phone field
 * stores `{ country, number, e164 }`.
 *
 * The lookup fills town/county/country from the postcode; the street and
 * building are always typed. Manual entry is never blocked, so the field still
 * works for non-UK addresses and when the lookup is unavailable.
 */
export const AddressBlock: Block = {
  slug: 'address',
  labels: { singular: 'Address (postcode lookup)', plural: 'Addresses' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'defaultCountry',
      type: 'text',
      defaultValue: 'United Kingdom',
      admin: {
        description: 'Pre-filled country, used until a lookup overwrites it.',
      },
    },
    {
      name: 'showLine2',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the second address line',
      admin: {
        description: 'Turn off for a shorter form when a single street line is enough.',
      },
    },
    {
      name: 'lookupLabel',
      type: 'text',
      defaultValue: 'Find address',
      admin: { description: 'Label on the lookup button.' },
    },
  ],
}
