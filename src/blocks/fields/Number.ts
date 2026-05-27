import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const NumberBlock: Block = {
  slug: 'number',
  labels: { singular: 'Number Input', plural: 'Number Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    { name: 'defaultValue', type: 'number' },
    { name: 'min', type: 'number' },
    { name: 'max', type: 'number' },
    { name: 'step', type: 'number', defaultValue: 1 },
  ],
}
