import type { Block } from 'payload'
import { baseFieldBlockFields } from './shared.js'

export const FileBlock: Block = {
  slug: 'file',
  labels: { singular: 'File Upload', plural: 'File Uploads' },
  fields: [
    ...baseFieldBlockFields,
    {
      name: 'accept',
      type: 'text',
      admin: { description: 'Comma-separated MIME types or extensions, e.g. "image/*,.pdf"' },
    },
    {
      name: 'maxSizeMB',
      type: 'number',
      admin: { description: 'Maximum file size in MB.' },
    },
    {
      name: 'collection',
      type: 'text',
      admin: {
        description:
          'Payload media collection slug to upload to. Leave blank for consumer-handled upload.',
      },
    },
  ],
}
