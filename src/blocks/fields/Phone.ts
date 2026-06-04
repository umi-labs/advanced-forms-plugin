import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const PhoneBlock: Block = {
  slug: 'phone',
  labels: { singular: 'Phone Input', plural: 'Phone Inputs' },
  fields: [
    ...baseFieldBlockFields,
    { name: 'placeholder', type: 'text' },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'full',
      options: [
        { label: 'Full width', value: 'full' },
        { label: 'Half width', value: 'half' },
        { label: 'Third width', value: 'third' },
      ],
    },
    {
      name: 'defaultCountry',
      type: 'text',
      admin: {
        description:
          'Dial code of the default country, e.g. "+44". Must match one of the `countries` values.',
      },
    },
    {
      name: 'countries',
      type: 'array',
      admin: {
        description:
          'Country options for the picker. `value` is the dial code (e.g. "+44") used to build E.164. Leave empty to use the built-in default list.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
  ],
}
