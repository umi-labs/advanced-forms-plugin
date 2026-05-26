import type { Block } from 'payload'

export const ConfirmationMessageBlock: Block = {
  slug: 'confirmationMessage',
  interfaceName: 'ConfirmationMessageBlock',
  labels: { singular: 'Confirmation Message', plural: 'Confirmation Messages' },
  fields: [
    {
      name: 'message',
      type: 'richText',
      required: true,
      admin: { description: 'Shown to the user after a successful submission.' },
    },
  ],
}
