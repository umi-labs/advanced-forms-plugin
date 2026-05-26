import type { CollectionConfig } from 'payload'

export type EnquirySubmissionsCollectionOptions = {
  submissionsSlug: string
  formsSlug: string
}

export const createEnquirySubmissionsCollection = ({
  submissionsSlug,
  formsSlug,
}: EnquirySubmissionsCollectionOptions): CollectionConfig => ({
  slug: submissionsSlug,
  labels: { singular: 'Enquiry Submission', plural: 'Enquiry Submissions' },
  admin: {
    useAsTitle: 'submittedAt',
    defaultColumns: ['form', 'submittedAt'],
  },
  disableDuplicate: true,
  access: {
    // Submissions are created via the API endpoint (local API, bypasses access).
    // Disable admin-UI creation to prevent accidental manual entries.
    create: () => false,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: formsSlug as any,
      required: true,
      index: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'data',
      type: 'array',
      fields: [
        { name: 'fieldName', type: 'text' },
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
