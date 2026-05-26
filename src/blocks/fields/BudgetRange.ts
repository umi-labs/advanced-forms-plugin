import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const BudgetRangeBlock: Block = {
  slug: 'budgetRange',
  interfaceName: 'BudgetRangeBlock',
  labels: { singular: 'Budget Range', plural: 'Budget Ranges' },
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
  ],
}
