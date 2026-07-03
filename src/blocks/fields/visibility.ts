import type { Block, Field, SelectField } from 'payload'

/** Client export path for the custom source dropdown (created in Task 4). */
export const SOURCE_PICKER_PATH =
  '@foundrykit/advanced-forms-plugin/client#ConditionSourceField'

const operatorField: SelectField = {
  name: 'operator',
  type: 'select',
  defaultValue: 'equals',
  required: true,
  options: [
    { label: 'Equals', value: 'equals' },
    { label: 'Does not equal', value: 'notEquals' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Greater than or equal', value: 'gte' },
    { label: 'Less than', value: 'lt' },
    { label: 'Less than or equal', value: 'lte' },
    { label: 'Is checked', value: 'isChecked' },
    { label: 'Is not checked', value: 'isNotChecked' },
    { label: 'Contains', value: 'contains' },
    { label: 'Is empty', value: 'isEmpty' },
    { label: 'Is not empty', value: 'isNotEmpty' },
  ],
}

/** Operators that don't compare against a value — hide the value input for them. */
const UNARY_OPERATORS = ['isChecked', 'isNotChecked', 'isEmpty', 'isNotEmpty']

const conditionBlock: Block = {
  slug: 'condition',
  labels: { plural: 'Conditions', singular: 'Condition' },
  fields: [
    {
      name: 'source',
      type: 'text',
      required: true,
      admin: {
        description: 'The field whose answer this condition tests.',
        width: '50%',
        components: {
          Field: { path: SOURCE_PICKER_PATH },
        },
      },
    },
    { ...operatorField, admin: { width: '50%' } },
    {
      name: 'value',
      type: 'text',
      admin: {
        description: 'The value to compare against.',
        condition: (_, siblingData) => !UNARY_OPERATORS.includes(siblingData?.operator),
      },
    },
  ],
}

const matchField: SelectField = {
  name: 'match',
  type: 'select',
  defaultValue: 'all',
  options: [
    { label: 'Match ALL conditions (AND)', value: 'all' },
    { label: 'Match ANY condition (OR)', value: 'any' },
  ],
}

const groupBlock: Block = {
  slug: 'group',
  labels: { plural: 'Groups', singular: 'Condition group' },
  fields: [
    matchField,
    {
      name: 'conditions',
      type: 'blocks',
      blocks: [conditionBlock],
      minRows: 1,
      labels: { plural: 'Conditions', singular: 'Condition' },
    },
  ],
}

export function buildVisibilityField(
  options: { includeAction?: boolean } = {},
): Field {
  const { includeAction = true } = options
  const showWhenEnabled = (_: unknown, siblingData: Record<string, unknown>) =>
    Boolean(siblingData?.enabled)

  const fields: Field[] = [
    {
      name: 'enabled',
      type: 'checkbox',
      admin: { description: 'Only show this based on answers to other fields.' },
    },
  ]

  if (includeAction) {
    fields.push({
      name: 'action',
      type: 'select',
      defaultValue: 'show',
      admin: { condition: showWhenEnabled },
      options: [
        { label: 'Show this field when rules match', value: 'show' },
        { label: 'Require this field when rules match', value: 'require' },
      ],
    })
  }

  fields.push(
    { ...matchField, admin: { condition: showWhenEnabled } },
    {
      name: 'conditions',
      type: 'blocks',
      admin: { condition: showWhenEnabled },
      blocks: [conditionBlock, groupBlock],
      labels: { plural: 'Conditions', singular: 'Condition' },
    },
  )

  return {
    name: 'visibility',
    type: 'group',
    admin: {
      description: 'Conditionally show or require this based on other fields.',
    },
    fields,
  }
}
