import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const TextInputBlock: Block = {
  slug: 'textInput',
  interfaceName: 'TextInputBlock',
  labels: { singular: 'Text Input', plural: 'Text Inputs' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'placeholder',
      type: 'text',
    },
    {
      name: 'inputType',
      type: 'select',
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Phone (tel)', value: 'tel' },
      ],
    },
  ],
}
