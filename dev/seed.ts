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

  // Seed sample form for dev/E2E use
  const { totalDocs: formCount } = await payload.count({
    collection: 'forms',
    where: { slug: { equals: 'contact' } },
  })

  if (!formCount) {
    await payload.create({
      collection: 'forms',
      data: {
        title: 'Contact Form',
        slug: 'contact',
        steps: [
          {
            title: 'Your Details',
            fields: [
              {
                blockType: 'text',
                name: 'full_name',
                label: 'Full Name',
                required: true,
              },
              {
                blockType: 'email',
                name: 'email',
                label: 'Email Address',
                required: true,
              },
              {
                blockType: 'textarea',
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
                    children: [{ type: 'text', text: 'Thank you for your message!', version: 1 }],
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
