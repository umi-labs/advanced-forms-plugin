import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const DateBlock: Block = {
  slug: 'date',
  labels: { singular: 'Date Input', plural: 'Date Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    {
      name: 'min',
      type: 'text',
      admin: { description: 'Min date as ISO string, e.g. 2024-01-01' },
    },
    {
      name: 'max',
      type: 'text',
      admin: { description: 'Max date as ISO string, e.g. 2024-12-31' },
    },
  ],
}
