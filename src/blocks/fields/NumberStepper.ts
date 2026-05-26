import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const NumberStepperBlock: Block = {
  slug: 'numberStepper',
  interfaceName: 'NumberStepperBlock',
  labels: { singular: 'Number Stepper', plural: 'Number Steppers' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'defaultValue',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'min',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'max',
      type: 'number',
      admin: { description: 'Leave blank for no maximum.' },
    },
    {
      name: 'step',
      type: 'number',
      defaultValue: 1,
      min: 1,
    },
    {
      name: 'placeholder',
      type: 'text',
      admin: { description: 'Label shown next to the value, e.g. "nights".' },
    },
  ],
}
