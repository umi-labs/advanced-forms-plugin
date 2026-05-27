import type { CollectionConfig } from 'payload'

export type SubmissionsCollectionOptions = {
  submissionsSlug: string
  formsSlug: string
  singularLabel: string
  pluralLabel: string
}

export const createSubmissionsCollection = ({
  submissionsSlug,
  formsSlug,
  singularLabel,
  pluralLabel,
}: SubmissionsCollectionOptions): CollectionConfig => ({
  slug: submissionsSlug,
  labels: { singular: singularLabel, plural: pluralLabel },
  disableDuplicate: true,
  admin: {
    useAsTitle: 'submittedAt',
    defaultColumns: ['form', 'submittedAt', 'metadata'],
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => false,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: formsSlug as any,
      required: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'data',
      type: 'array',
      fields: [
        { name: 'fieldName', type: 'text', required: true },
        { name: 'value', type: 'text' },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        { name: 'userAgent', type: 'text' },
        { name: 'ip', type: 'text' },
        { name: 'referrer', type: 'text' },
      ],
    },
  ],
})
