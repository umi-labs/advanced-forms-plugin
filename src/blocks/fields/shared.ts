import type { Field } from 'payload'
import { lockableTextField } from '../../fields/lockable/index.js'

const [nameField, nameLockField] = lockableTextField({
  name: 'name',
  watch: 'label',
  fieldOverrides: {
    required: true,
    admin: {
      width: '50%',
      description: 'Unique key for this field. Used as the submission data key.',
    },
  },
})

export const baseFieldBlockFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: { width: '50%' },
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
