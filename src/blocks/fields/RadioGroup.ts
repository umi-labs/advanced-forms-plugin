import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const RadioGroupBlock: Block = {
  slug: 'radioGroup',
  labels: { singular: 'Radio Group', plural: 'Radio Groups' },
  fields: [
    ...baseFieldBlockFields,
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
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'row',
      options: [
        { label: 'Row', value: 'row' },
        { label: 'Grid', value: 'grid' },
      ],
    },
  ],
}
