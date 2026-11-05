import type { CollectionConfig } from 'payload'

import { submissionTitle } from '../utilities/describeSubmission.js'

export type SubmissionsCollectionOptions = {
  formsSlug: string
  pluralLabel: string
  singularLabel: string
  submissionsSlug: string
}

export const createSubmissionsCollection = ({
  formsSlug,
  pluralLabel,
  singularLabel,
  submissionsSlug,
}: SubmissionsCollectionOptions): CollectionConfig => ({
  slug: submissionsSlug,
  access: {
    create: () => false,
    delete: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
  },
  admin: {
    defaultColumns: ['title', 'form', 'submittedAt'],
    useAsTitle: 'title',
  },
  disableDuplicate: true,
  fields: [
    {
      // Who sent it (name, else email, else the date), for the page title and the list.
      name: 'title',
      type: 'text',
      admin: { hidden: true },
      hooks: {
        // Merged with the saved doc: a partial update (e.g. a bulk edit) carries no answers.
        beforeChange: [({ data, originalDoc }) => submissionTitle({ ...originalDoc, ...data })],
        // Submissions saved before this field existed have no stored title.
        afterRead: [({ data, value }) => value || (data ? submissionTitle(data) : value)],
      },
    },
    {
      name: 'form',
      type: 'relationship',
      admin: { readOnly: true },
      relationTo: formsSlug,
      required: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
      required: true,
    },
    {
      // What the visitor sent. Shown, and corrected, through SubmissionAnswers.
      name: 'data',
      type: 'array',
      admin: {
        components: {
          Field: {
            path: '@foundrykit/advanced-forms-plugin/rsc#SubmissionAnswers',
            serverProps: { formsSlug },
          },
        },
      },
      fields: [
        { name: 'fieldName', type: 'text', required: true },
        { name: 'value', type: 'text' },
      ],
    },
    {
      name: 'details',
      type: 'ui',
      admin: {
        components: { Field: '@foundrykit/advanced-forms-plugin/rsc#SubmissionDetails' },
      },
    },
    {
      // Shown by SubmissionDetails.
      name: 'metadata',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'userAgent', type: 'text' },
        { name: 'ip', type: 'text', label: 'IP' },
        { name: 'referrer', type: 'text' },
      ],
    },
    {
      // Context the enquiry was submitted with (e.g. hotel/itinerary/offer reference). Shown by
      // SubmissionDetails.
      name: 'context',
      type: 'json',
      admin: { hidden: true },
    },
  ],
  labels: { plural: pluralLabel, singular: singularLabel },
})
