import type { Field } from 'payload'

export const baseFieldBlockFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        admin: {
          width: '50%',
          description: 'Unique key for this field. Used as the submission data key.',
        },
      },
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: { width: '50%' },
      },
    ],
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
