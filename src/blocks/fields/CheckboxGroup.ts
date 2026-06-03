import type { Block } from 'payload'
import { baseFieldBlockFields, optionsArrayField } from './shared.js'

export const CheckboxGroupBlock: Block = {
  slug: 'checkboxGroup',
  labels: { singular: 'Checkbox Group', plural: 'Checkbox Groups' },
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
