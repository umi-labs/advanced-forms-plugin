import type { CollectionConfig } from 'payload'
import { BudgetRangeBlock } from '../blocks/fields/BudgetRange.js'
import { CheckboxInputBlock } from '../blocks/fields/CheckboxInput.js'
import { EmailInputBlock } from '../blocks/fields/EmailInput.js'
import { MultiCounterBlock } from '../blocks/fields/MultiCounter.js'
import { NumberStepperBlock } from '../blocks/fields/NumberStepper.js'
import { OptionCardsBlock } from '../blocks/fields/OptionCards.js'
import { SelectInputBlock } from '../blocks/fields/SelectInput.js'
import { TextInputBlock } from '../blocks/fields/TextInput.js'
import { TextareaInputBlock } from '../blocks/fields/TextareaInput.js'
import { YesNoBlock } from '../blocks/fields/YesNo.js'
import { ConfirmationMessageBlock } from '../blocks/submissionActions/ConfirmationMessage.js'
import { RedirectBlock } from '../blocks/submissionActions/Redirect.js'
import { SendEmailBlock } from '../blocks/submissionActions/SendEmail.js'

export type EnquiryFormsCollectionOptions = {
  formsSlug: string
  mediaCollection: string
}

export const createEnquiryFormsCollection = ({
  formsSlug,
  mediaCollection,
}: EnquiryFormsCollectionOptions): CollectionConfig => ({
  slug: formsSlug,
  labels: { singular: 'Enquiry Form', plural: 'Enquiry Forms' },
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
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Used in the API and frontend. Must be unique. E.g. "travel-enquiry".',
      },
    },
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
          relationTo: mediaCollection as any,
          admin: { description: 'Optional icon shown in the step indicator.' },
        },
        {
          name: 'fields',
          type: 'blocks',
          blocks: [
            YesNoBlock,
            OptionCardsBlock,
            NumberStepperBlock,
            MultiCounterBlock,
            BudgetRangeBlock,
            TextInputBlock,
            EmailInputBlock,
            TextareaInputBlock,
            SelectInputBlock,
            CheckboxInputBlock,
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
})
