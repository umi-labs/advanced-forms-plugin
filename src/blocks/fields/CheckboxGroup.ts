import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const CheckboxGroupBlock: Block = {
  slug: 'checkboxGroup',
  labels: { singular: 'Checkbox Group', plural: 'Checkbox Groups' },
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
