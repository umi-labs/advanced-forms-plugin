import type { Payload } from 'payload'

import { devUser } from './helpers/credentials.js'

export const seed = async (payload: Payload) => {
  // Seed dev user
  const { totalDocs: userCount } = await payload.count({
    collection: 'users',
    where: { email: { equals: devUser.email } },
  })

  if (!userCount) {
    await payload.create({ collection: 'users', data: devUser })
  }

  // Seed sample enquiry form for dev/E2E use
  const { totalDocs: formCount } = await payload.count({
    collection: 'enquiry-forms',
    where: { slug: { equals: 'travel-enquiry' } },
  })

  if (!formCount) {
    await payload.create({
      collection: 'enquiry-forms',
      data: {
        title: 'Travel Enquiry',
        slug: 'travel-enquiry',
        steps: [
          {
            title: 'Trip Details',
            fields: [
              {
                blockType: 'yesNo',
                name: 'flexible_dates',
                label: 'Are your dates flexible?',
                required: true,
              },
              {
                blockType: 'multiCounter',
                name: 'guests',
                label: 'Number of guests',
                required: true,
                counters: [
                  { label: 'Adults', name: 'adults', defaultValue: 2, min: 1 },
                  { label: 'Children (2–12)', name: 'children', defaultValue: 0, min: 0 },
                ],
              },
              {
                blockType: 'numberStepper',
                name: 'duration',
                label: 'Trip duration',
                placeholder: 'nights',
                defaultValue: 7,
                min: 1,
                max: 90,
                step: 1,
              },
            ],
          },
          {
            title: 'Budget',
            fields: [
              {
                blockType: 'budgetRange',
                name: 'budget',
                label: 'Budget per person',
                required: true,
                options: [
                  { label: 'Under £1,000', value: 'under-1000' },
                  { label: '£1,000 – £2,499', value: '1000-2499' },
                  { label: '£2,500 – £4,999', value: '2500-4999' },
                  { label: '£5,000+', value: '5000-plus' },
                ],
              },
            ],
          },
          {
            title: 'Your Details',
            fields: [
              {
                blockType: 'textInput',
                name: 'full_name',
                label: 'Full Name',
                required: true,
                inputType: 'text',
              },
              {
                blockType: 'emailInput',
                name: 'email',
                label: 'Email Address',
                required: true,
              },
              {
                blockType: 'textareaInput',
                name: 'notes',
                label: 'Additional Notes',
                rows: 4,
              },
            ],
          },
        ],
        submissionActions: [
          {
            blockType: 'confirmationMessage',
            message: {
              root: {
                type: 'root',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', text: 'Thank you for your enquiry!', version: 1 }],
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            },
          },
        ],
      },
    })
  }
}
