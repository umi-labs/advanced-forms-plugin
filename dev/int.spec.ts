import type { Payload } from 'payload'
import config from '@payload-config'
import { getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

let payload: Payload

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Collections registered by formPlugin', () => {
  test('enquiry-forms collection exists', () => {
    expect(payload.collections['enquiry-forms']).toBeDefined()
  })

  test('enquiry-submissions collection exists', () => {
    expect(payload.collections['enquiry-submissions']).toBeDefined()
  })

  test('can create an enquiry-forms document with a step and a yesNo field', async () => {
    const form = await payload.create({
      collection: 'enquiry-forms',
      data: {
        title: 'Test Form',
        slug: 'test-form-' + Date.now(),
        steps: [
          {
            title: 'Step 1',
            fields: [
              {
                blockType: 'yesNo',
                name: 'flexible_dates',
                label: 'Are your dates flexible?',
                required: true,
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
                    children: [{ type: 'text', text: 'Thank you!', version: 1 }],
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

    expect(form.id).toBeDefined()
    expect(form.title).toBe('Test Form')
    expect(form.steps).toHaveLength(1)
    expect(form.steps[0].fields).toHaveLength(1)
  })

  test('can create an enquiry-forms document with all field block types', async () => {
    const form = await payload.create({
      collection: 'enquiry-forms',
      data: {
        title: 'All Fields Form',
        slug: 'all-fields-' + Date.now(),
        steps: [
          {
            title: 'Step 1',
            fields: [
              { blockType: 'yesNo', name: 'q1', label: 'Yes or No?' },
              { blockType: 'textInput', name: 'q2', label: 'Name', inputType: 'text' },
              { blockType: 'emailInput', name: 'q3', label: 'Email' },
              { blockType: 'textareaInput', name: 'q4', label: 'Notes', rows: 3 },
              { blockType: 'checkboxInput', name: 'q5', label: 'Agree?' },
              {
                blockType: 'optionCards',
                name: 'q6',
                label: 'Pick one',
                options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }],
                layout: 'row',
              },
              {
                blockType: 'budgetRange',
                name: 'q7',
                label: 'Budget',
                options: [{ label: 'Low', value: 'low' }, { label: 'High', value: 'high' }],
              },
              {
                blockType: 'numberStepper',
                name: 'q8',
                label: 'Days',
                defaultValue: 3,
                min: 1,
                max: 30,
                step: 1,
              },
              {
                blockType: 'multiCounter',
                name: 'q9',
                label: 'Guests',
                counters: [
                  { label: 'Adults', name: 'adults', defaultValue: 1, min: 1 },
                  { label: 'Children', name: 'children', defaultValue: 0, min: 0 },
                ],
              },
              {
                blockType: 'selectInput',
                name: 'q10',
                label: 'Destination',
                options: [{ label: 'Paris', value: 'paris' }],
              },
            ],
          },
        ],
        submissionActions: [{ blockType: 'redirect', url: '/thank-you', delay: 0 }],
      },
    })

    expect(form.steps[0].fields).toHaveLength(10)
  })

  test('enquiry-submissions access.create is false via REST (admin UI cannot create)', async () => {
    // The access rule returns false for create. Verify by checking the collection config.
    const collection = payload.collections['enquiry-submissions']
    expect(collection).toBeDefined()
    // Access function returns false for unauthenticated create (admin UI would be blocked).
    const accessResult = (collection.config.access?.create as any)?.({ req: { user: null } })
    expect(accessResult).toBe(false)
  })
})
