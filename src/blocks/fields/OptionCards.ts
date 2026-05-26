import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const OptionCardsBlock: Block = {
  slug: 'optionCards',
  interfaceName: 'OptionCardsBlock',
  labels: { singular: 'Option Cards', plural: 'Option Cards' },
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
        { label: 'Row (horizontal scroll)', value: 'row' },
        { label: 'Grid', value: 'grid' },
      ],
    },
  ],
}
