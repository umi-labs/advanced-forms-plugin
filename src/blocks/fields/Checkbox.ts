import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const CheckboxBlock: Block = {
  slug: 'checkbox',
  labels: { singular: 'Checkbox', plural: 'Checkboxes' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'appearance',
      type: 'select',
      defaultValue: 'checkbox',
      admin: {
        description:
          'Visual presentation. "Switch" renders a toggle-switch; data shape is unchanged.',
      },
      options: [
        { label: 'Checkbox', value: 'checkbox' },
        { label: 'Switch', value: 'switch' },
      ],
    },
  ],
}
