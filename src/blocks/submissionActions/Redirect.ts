import type { Block } from 'payload'

export const RedirectBlock: Block = {
  slug: 'redirect',
  interfaceName: 'RedirectBlock',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'Full URL or relative path, e.g. /thank-you.' },
    },
    {
      name: 'delay',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { description: 'Milliseconds before redirect fires. 0 = immediate.' },
    },
  ],
}
