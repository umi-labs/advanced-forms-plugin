import type { Field } from 'payload'

export const baseFieldBlockFields: Field[] = [
  {
    name: 'name',
    type: 'text',
    required: true,
    admin: {
      description: 'Unique key for this field. Used as the submission data key.',
    },
  },
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'required',
    type: 'checkbox',
  },
  {
    name: 'tooltip',
    type: 'group',
    fields: [
      {
        name: 'enabled',
        type: 'checkbox',
      },
      {
        name: 'text',
        type: 'textarea',
        admin: {
          condition: (_, siblingData) => Boolean(siblingData?.enabled),
        },
      },
    ],
  },
]
