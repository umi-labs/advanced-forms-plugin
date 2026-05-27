import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const EmailBlock: Block = {
  slug: 'email',
  labels: { singular: 'Email Input', plural: 'Email Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
  ],
}
