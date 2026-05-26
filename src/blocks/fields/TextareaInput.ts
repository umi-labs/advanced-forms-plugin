import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const TextareaInputBlock: Block = {
  slug: 'textareaInput',
  interfaceName: 'TextareaInputBlock',
  labels: { singular: 'Textarea', plural: 'Textareas' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'placeholder',
      type: 'text',
    },
    {
      name: 'rows',
      type: 'number',
      defaultValue: 4,
      min: 1,
    },
  ],
}
