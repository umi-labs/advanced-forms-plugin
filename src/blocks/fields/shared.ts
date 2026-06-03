import type { Field } from 'payload'

import { lockableTextField } from '../../fields/lockable/index.js'

const [nameField, nameLockField] = lockableTextField({
  name: 'name',
  fieldOverrides: {
    admin: {
      description: 'Unique key for this field. Used as the submission data key.',
      width: '50%',
    },
    required: true,
  },
  watch: 'label',
})

export const baseFieldBlockFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'label',
        type: 'text',
        admin: { width: '50%' },
        required: true,
      },
      nameField,
    ],
  },
  nameLockField,
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
