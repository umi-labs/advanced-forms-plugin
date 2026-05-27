import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const TextareaBlock: Block = {
  slug: 'textarea',
  labels: { singular: 'Textarea', plural: 'Textareas' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    { name: 'rows', type: 'number', defaultValue: 4 },
  ],
}
