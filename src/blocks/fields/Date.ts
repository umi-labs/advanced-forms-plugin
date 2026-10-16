import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const DateBlock: Block = {
  slug: 'date',
  labels: { singular: 'Date Input', plural: 'Date Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    // Date pickers, not free text. These were `text` with the format named in
    // the description, which asked an editor to hand-type an ISO string into a
    // box that would accept anything — and a typo here is invisible: the
    // browser ignores a malformed `min`/`max` on a date input, so the bound
    // silently disappears rather than erroring.
    {
      name: 'min',
      type: 'date',
      label: 'Earliest date',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description: 'The earliest date someone can pick. Leave empty for no limit.',
      },
    },
    {
      name: 'max',
      type: 'date',
      label: 'Latest date',
      admin: {
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description: 'The latest date someone can pick. Leave empty for no limit.',
      },
    },
  ],
}
