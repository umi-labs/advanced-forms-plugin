import type { Block, RichTextField } from 'payload'

/** Build the confirmation-message submission action block. An optional `editor`
 *  customises the message rich-text field (e.g. to add custom Lexical blocks);
 *  when omitted the field falls back to the Payload root editor. */
export const createConfirmationMessageBlock = ({
  editor,
}: { editor?: RichTextField['editor'] } = {}): Block => ({
  slug: 'confirmationMessage',
  interfaceName: 'ConfirmationMessageBlock',
  labels: { singular: 'Confirmation Message', plural: 'Confirmation Messages' },
  fields: [
    {
      name: 'message',
      type: 'richText',
      required: true,
      ...(editor ? { editor } : {}),
      admin: { description: 'Shown to the user after a successful submission.' },
    },
  ],
})
