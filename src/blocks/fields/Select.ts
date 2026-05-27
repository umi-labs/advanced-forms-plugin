import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const SelectBlock: Block = {
  slug: 'select',
  labels: { singular: 'Select', plural: 'Selects' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    {
      name: 'options',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
  ],
}
