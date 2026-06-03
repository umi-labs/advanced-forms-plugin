import type { Block } from 'payload'
import { baseFieldBlockFields, optionsArrayField } from './shared.js'

export const RadioGroupBlock: Block = {
  slug: 'radioGroup',
  labels: { singular: 'Radio Group', plural: 'Radio Groups' },
  fields: [
    ...baseFieldBlockFields,
    optionsArrayField,
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
