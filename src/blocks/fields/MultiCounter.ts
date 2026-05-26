import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const MultiCounterBlock: Block = {
  slug: 'multiCounter',
  interfaceName: 'MultiCounterBlock',
  labels: { singular: 'Multi Counter', plural: 'Multi Counters' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'counters',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Unique key used in submission data, e.g. "adults".' },
        },
        { name: 'defaultValue', type: 'number', defaultValue: 0 },
        { name: 'min', type: 'number', defaultValue: 0 },
        {
          name: 'max',
          type: 'number',
          admin: { description: 'Leave blank for no maximum.' },
        },
      ],
    },
  ],
}
