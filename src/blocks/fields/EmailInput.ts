import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const EmailInputBlock: Block = {
  slug: 'emailInput',
  interfaceName: 'EmailInputBlock',
  labels: { singular: 'Email Input', plural: 'Email Inputs' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'placeholder',
      type: 'text',
    },
  ],
}
