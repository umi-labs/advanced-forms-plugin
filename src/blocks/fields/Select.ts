import type { Block } from 'payload'
import { baseFieldBlockFields, optionsArrayField } from './shared.js'

export const SelectBlock: Block = {
  slug: 'select',
  labels: { singular: 'Select', plural: 'Selects' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    optionsArrayField,
    {
      name: 'width',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Half width', value: 'half' },
        { label: 'Third width', value: 'third' },
      ],
    },
  ],
}
