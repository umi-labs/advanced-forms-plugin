import type { Block } from 'payload'

export const SendEmailBlock: Block = {
  slug: 'sendEmail',
  interfaceName: 'SendEmailBlock',
  labels: { singular: 'Send Email', plural: 'Send Emails' },
  fields: [
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: { description: 'Recipient email address.' },
    },
    {
      name: 'from',
      type: 'text',
      required: true,
      admin: { description: 'Sender address (must be authorised by your email provider).' },
    },
    {
      name: 'replyTo',
      type: 'text',
      admin: {
        description: "Reply-to address. Defaults to the submitter's email field if left blank.",
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: { description: 'Supports {{field_name}} interpolation, e.g. "Enquiry from {{full_name}}".' },
    },
    {
      name: 'includeSubmissionData',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Append all submitted field values to the email body.' },
    },
  ],
}
