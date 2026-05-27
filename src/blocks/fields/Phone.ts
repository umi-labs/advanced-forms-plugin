import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const PhoneBlock: Block = {
  slug: 'phone',
  labels: { singular: 'Phone Input', plural: 'Phone Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
  ],
}
