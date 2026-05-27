import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const CheckboxBlock: Block = {
  slug: 'checkbox',
  labels: { singular: 'Checkbox', plural: 'Checkboxes' },
  fields: [...baseFieldBlockFields],
}
