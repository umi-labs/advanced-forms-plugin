import type { Block, CollectionConfig } from 'payload'

import { ConfirmationMessageBlock } from '../blocks/submissionActions/ConfirmationMessage.js'
import { RedirectBlock } from '../blocks/submissionActions/Redirect.js'
import { SendEmailBlock } from '../blocks/submissionActions/SendEmail.js'
import { lockableTextField } from '../fields/lockable/index.js'

export type FormsCollectionOptions = {
  fieldBlocks: Block[]
  formsSlug: string
  mediaCollection: string
  pluralLabel: string
  singularLabel: string
}

export const createFormsCollection = ({
  fieldBlocks,
  formsSlug,
  mediaCollection,
  pluralLabel,
  singularLabel,
}: FormsCollectionOptions): CollectionConfig => {
  const [slugField, slugLockField] = lockableTextField({
    name: 'slug',
    fieldOverrides: {
      admin: {
        description: 'Auto-generated from title. Must be unique, e.g. "contact-form".',
      },
      index: true,
      required: true,
      unique: true,
    },
    watch: 'title',
  })

  return {
    slug: formsSlug,
    access: {
      create: ({ req: { user } }) => !!user,
      delete: ({ req: { user } }) => !!user,
      read: () => true,
      update: ({ req: { user } }) => !!user,
    },
    admin: {
      defaultColumns: ['title', 'slug', 'updatedAt'],
      useAsTitle: 'title',
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      slugField,
      slugLockField,
      {
        name: 'steps',
        type: 'array',
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'title',
                type: 'text',
                admin: {
                  description: 'Shown in the step progress indicator.',
                  width: '50%',
                },
                required: true,
              },
              {
                name: 'icon',
                type: 'upload',
                admin: {
                  description: 'Optional icon shown in the step indicator.',
                  width: '50%',
                },
                relationTo: mediaCollection,
              },
            ],
          },
          {
            name: 'completedIcon',
            type: 'upload',
            admin: {
              description:
                'Optional icon shown in the step indicator when this step is complete. Falls back to a built-in tick icon.',
            },
            relationTo: mediaCollection,
          },
          {
            name: 'introContent',
            type: 'richText',
            admin: { description: 'Optional content shown above the form fields for this step.' },
          },
          {
            name: 'fields',
            type: 'blocks',
            blocks: fieldBlocks,
          },
          {
            type: 'row',
            fields: [
              {
                name: 'backLabel',
                type: 'text',
                admin: {
                  description: 'Optional override for the "Back" button label on this step.',
                  width: '50%',
                },
              },
              {
                name: 'nextLabel',
                type: 'text',
                admin: {
                  description:
                    'Optional override for the "Next" (or "Submit" on the final step) button label on this step.',
                  width: '50%',
                },
              },
            ],
          },
        ],
        minRows: 1,
        required: true,
      },
      {
        name: 'buttonLabels',
        type: 'group',
        admin: {
          description:
            'Document-level overrides for navigation button labels. Per-step labels take precedence.',
        },
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'back', type: 'text', admin: { width: '50%' } },
              { name: 'next', type: 'text', admin: { width: '50%' } },
            ],
          },
          {
            type: 'row',
            fields: [
              { name: 'submit', type: 'text', admin: { width: '50%' } },
              {
                name: 'backLast',
                type: 'text',
                admin: {
                  description: 'Label for the "Back" button on the final step. Falls back to `back`.',
                  width: '50%',
                },
              },
            ],
          },
        ],
      },
      {
        name: 'additionalContent',
        type: 'group',
        fields: [
          {
            name: 'enabled',
            type: 'checkbox',
            defaultValue: false,
          },
          {
            name: 'position',
            type: 'select',
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enabled),
            },
            defaultValue: 'below',
            options: [
              { label: 'Above form', value: 'above' },
              { label: 'Below form', value: 'below' },
            ],
          },
          {
            name: 'content',
            type: 'richText',
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enabled),
            },
          },
        ],
      },
      {
        name: 'submissionActions',
        type: 'blocks',
        admin: {
          description: 'At least one action is required. Actions execute in order.',
        },
        blocks: [SendEmailBlock, ConfirmationMessageBlock, RedirectBlock],
        minRows: 1,
        required: true,
      },
    ],
    labels: { plural: pluralLabel, singular: singularLabel },
  }
}
