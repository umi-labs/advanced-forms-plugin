import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const CheckboxInputBlock: Block = {
  slug: 'checkboxInput',
  interfaceName: 'CheckboxInputBlock',
  labels: { singular: 'Checkbox', plural: 'Checkboxes' },
  fields: [...baseFieldBlockFields],
}
