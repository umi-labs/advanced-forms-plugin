import type { Block, CollectionConfig } from 'payload'
import { ConfirmationMessageBlock } from '../blocks/submissionActions/ConfirmationMessage.js'
import { RedirectBlock } from '../blocks/submissionActions/Redirect.js'
import { SendEmailBlock } from '../blocks/submissionActions/SendEmail.js'
import { lockableTextField } from '../fields/lockable/index.js'

export type FormsCollectionOptions = {
  formsSlug: string
  mediaCollection: string
  singularLabel: string
  pluralLabel: string
  fieldBlocks: Block[]
}

export const createFormsCollection = ({
  formsSlug,
  mediaCollection,
  singularLabel,
  pluralLabel,
  fieldBlocks,
}: FormsCollectionOptions): CollectionConfig => {
  const [slugField, slugLockField] = lockableTextField({
    name: 'slug',
    watch: 'title',
    fieldOverrides: {
      required: true,
      unique: true,
      index: true,
      admin: {
        width: '50%',
        description: 'Auto-generated from title. Must be unique, e.g. "contact-form".',
      },
    },
  })

  return {
    slug: formsSlug,
    labels: { singular: singularLabel, plural: pluralLabel },
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'slug', 'updatedAt'],
    },
    access: {
      read: () => true,
      create: ({ req: { user } }) => !!user,
      update: ({ req: { user } }) => !!user,
      delete: ({ req: { user } }) => !!user,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            admin: { width: '50%' },
          },
          slugField,
        ],
      },
      slugLockField,
      {
        name: 'steps',
        type: 'array',
        required: true,
        minRows: 1,
        fields: [
          {
            name: 'title',
            type: 'text',
            required: true,
            admin: { description: 'Shown in the step progress indicator.' },
          },
          {
            name: 'icon',
            type: 'upload',
            relationTo: mediaCollection,
            admin: { description: 'Optional icon shown in the step indicator.' },
          },
          {
            name: 'fields',
            type: 'blocks',
            blocks: fieldBlocks,
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
            defaultValue: 'below',
            options: [
              { label: 'Above form', value: 'above' },
              { label: 'Below form', value: 'below' },
            ],
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enabled),
            },
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
        required: true,
        minRows: 1,
        blocks: [SendEmailBlock, ConfirmationMessageBlock, RedirectBlock],
        admin: {
          description: 'At least one action is required. Actions execute in order.',
        },
      },
    ],
  }
}
