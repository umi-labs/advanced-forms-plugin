import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const YesNoBlock: Block = {
  slug: 'yesNo',
  interfaceName: 'YesNoBlock',
  labels: { singular: 'Yes / No', plural: 'Yes / No' },
  fields: [...baseFieldBlockFields],
}
