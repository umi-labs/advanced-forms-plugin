import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const TextBlock: Block = {
  slug: 'text',
  labels: { singular: 'Text Input', plural: 'Text Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Half width', value: 'half' },
      ],
    },
  ],
}
