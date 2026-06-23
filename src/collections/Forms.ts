import type { Block, CollectionConfig } from 'payload'

import { ConfirmationMessageBlock } from '../blocks/submissionActions/ConfirmationMessage.js'
import { RedirectBlock } from '../blocks/submissionActions/Redirect.js'
import { SendEmailBlock } from '../blocks/submissionActions/SendEmail.js'
import { lockableTextField } from '../fields/lockable/index.js'
import { HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

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
        width: '50%',
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
        type: 'row',
        fields: [
          {
            name: 'title',
            type: 'text',
            admin: {
              description:
                'The name of this form, shown in the admin list and used as the document title.',
              width: '50%',
            },
            required: true,
          },
          slugField,
        ],
      },
      slugLockField,
      {
        name: 'multiStep',
        type: 'checkbox',
        admin: {
          description:
            'Split this form into multiple stages with their own progress indicator and Back/Next navigation. Leave off for a simple single-page form.',
        },
        defaultValue: false,
        label: 'Multi-stage form',
      },
      {
        name: 'fields',
        type: 'blocks',
        admin: {
          condition: (_, siblingData) => !siblingData?.multiStep,
          description: 'The fields shown on this form, in order.',
        },
        blocks: fieldBlocks,
        labels: { plural: 'Fields', singular: 'Field' },
      },
      {
        name: 'steps',
        type: 'array',
        admin: {
          condition: (_, siblingData) => Boolean(siblingData?.multiStep),
          description:
            'Each stage is shown on its own page with Back/Next navigation between them.',
        },
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
            editor: lexicalEditor({
              features: ({ defaultFeatures, rootFeatures }) => [
                ...defaultFeatures,
                HeadingFeature(),
              ],
            }),
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
            'Override the text on the form navigation buttons. Leave blank to use the defaults ("Back", "Next", "Submit").',
        },
        fields: [
          {
            name: 'submit',
            type: 'text',
            admin: {
              description: 'Label for the button that submits the form. Defaults to "Submit".',
              placeholder: 'Submit',
            },
          },
          {
            type: 'row',
            admin: {
              condition: (data) => Boolean(data?.multiStep),
            },
            fields: [
              {
                name: 'back',
                type: 'text',
                admin: {
                  description: 'Label for the "Back" button. Defaults to "Back".',
                  placeholder: 'Back',
                  width: '50%',
                },
              },
              {
                name: 'next',
                type: 'text',
                admin: {
                  description: 'Label for the "Next" button between stages. Defaults to "Next".',
                  placeholder: 'Next',
                  width: '50%',
                },
              },
            ],
          },
          {
            name: 'backLast',
            type: 'text',
            admin: {
              condition: (data) => Boolean(data?.multiStep),
              description: 'Label for the "Back" button on the final stage. Falls back to "Back".',
            },
          },
        ],
      },
      {
        name: 'additionalContent',
        type: 'group',
        admin: {
          description:
            'Optional rich-text content rendered above or below the form (e.g. intro copy or a privacy notice).',
        },
        fields: [
          {
            name: 'enabled',
            type: 'checkbox',
            admin: {
              description: 'Show the additional content alongside this form.',
            },
            defaultValue: false,
          },
          {
            name: 'position',
            type: 'select',
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.enabled),
              description: 'Where the content appears relative to the form.',
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
