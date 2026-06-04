import type { ArrayField, Field } from 'payload'

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
  {
    name: 'validation',
    type: 'group',
    admin: {
      description:
        'Optional validation rules. Combine with the form-level Zod resolver for richer logic.',
    },
    fields: [
      {
        name: 'requiredMessage',
        type: 'text',
        admin: { description: 'Override "<Label> is required".' },
      },
      // Text-shaped fields (text, email, phone, textarea, select)
      { name: 'minLength', type: 'number', min: 0 },
      { name: 'maxLength', type: 'number', min: 0 },
      {
        name: 'pattern',
        type: 'text',
        admin: { description: 'JS regex source, e.g. ^[A-Z]{2,}$' },
      },
      { name: 'patternMessage', type: 'text' },
      // Numeric-shaped fields (number, numberStepper, multiCounter total)
      { name: 'min', type: 'number' },
      { name: 'max', type: 'number' },
      { name: 'minMessage', type: 'text' },
      { name: 'maxMessage', type: 'text' },
    ],
  },
]

const [optionValueField, optionValueLockField] = lockableTextField({
  name: 'value',
  fieldOverrides: {
    admin: {
      description: 'Auto-generated from the option label. Used as the submission value.',
    },
    required: true,
  },
  watch: 'label',
})

/**
 * Shared `options` array field for blocks that present a list of choices
 * (Radio Group, Checkbox Group, Select). Each option has a free-text `label`
 * and a lockable, auto-slugged `value` that mirrors the label until unlocked.
 */
export const optionsArrayField: ArrayField = {
  name: 'options',
  type: 'array',
  fields: [
    { name: 'label', type: 'text', required: true },
    optionValueField,
    optionValueLockField,
  ],
  minRows: 1,
  required: true,
}
