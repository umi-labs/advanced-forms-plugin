import type { Payload } from 'payload'
import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createFetchFormHandler } from '../src/endpoints/fetchFormHandler.js'
import { createSubmitFormHandler } from '../src/endpoints/submitFormHandler.js'

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

describe('fetchFormHandler', () => {
  let seededSlug: string

  beforeAll(async () => {
    // Create a form to fetch
    seededSlug = 'fetch-test-' + Date.now()
    await payload.create({
      collection: 'enquiry-forms',
      data: {
        title: 'Fetch Test Form',
        slug: seededSlug,
        steps: [{ title: 'Step 1', fields: [{ blockType: 'yesNo', name: 'q', label: 'Q?' }] }],
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
  })

  test('returns 200 with form data for a known slug', async () => {
    const handler = createFetchFormHandler({ collections: { forms: 'enquiry-forms' }, sendEmail: async () => {} })
    const request = new Request(`http://localhost:3000/api/enquiry-forms/${seededSlug}`)
    const payloadRequest = await createPayloadRequest({
      config: await config,
      request,
      params: { slug: seededSlug },
    })
    const response = await handler(payloadRequest)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.slug).toBe(seededSlug)
    expect(body.steps).toHaveLength(1)
  })

  test('returns 404 for an unknown slug', async () => {
    const handler = createFetchFormHandler({ collections: { forms: 'enquiry-forms' }, sendEmail: async () => {} })
    const request = new Request('http://localhost:3000/api/enquiry-forms/does-not-exist')
    const payloadRequest = await createPayloadRequest({
      config: await config,
      request,
      params: { slug: 'does-not-exist' },
    })
    const response = await handler(payloadRequest)
    expect(response.status).toBe(404)
  })

  test('returns 400 when slug param is missing', async () => {
    const handler = createFetchFormHandler({ collections: { forms: 'enquiry-forms' }, sendEmail: async () => {} })
    const request = new Request('http://localhost:3000/api/enquiry-forms/')
    const payloadRequest = await createPayloadRequest({
      config: await config,
      request,
      params: {},
    })
    const response = await handler(payloadRequest)
    expect(response.status).toBe(400)
  })
})

describe('submitFormHandler', () => {
  let formSlug: string
  const capturedEmails: any[] = []

  beforeAll(async () => {
    capturedEmails.length = 0
    formSlug = 'submit-test-' + Date.now()
    await payload.create({
      collection: 'enquiry-forms',
      data: {
        title: 'Submit Test Form',
        slug: formSlug,
        steps: [
          {
            title: 'Step 1',
            fields: [
              { blockType: 'textInput', name: 'full_name', label: 'Full Name', required: true, inputType: 'text' },
              { blockType: 'emailInput', name: 'email', label: 'Email', required: true },
              { blockType: 'yesNo', name: 'newsletter', label: 'Subscribe?', required: false },
            ],
          },
        ],
        submissionActions: [
          {
            blockType: 'sendEmail',
            to: 'admin@example.com',
            from: 'noreply@example.com',
            subject: 'New enquiry from {{full_name}}',
            includeSubmissionData: true,
          },
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
  })

  const makeRequest = async (slug: string, body: object) => {
    const handler = createSubmitFormHandler({
      collections: { forms: 'enquiry-forms', submissions: 'enquiry-submissions' },
      sendEmail: async (opts) => { capturedEmails.push(opts) },
    })
    const request = new Request(`http://localhost:3000/api/enquiry-submit/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payloadRequest = await createPayloadRequest({
      config: await config,
      request,
      params: { formSlug: slug },
    })
    return handler(payloadRequest)
  }

  test('returns 200 and stores submission for valid data', async () => {
    const response = await makeRequest(formSlug, {
      data: { full_name: 'Alice', email: 'alice@example.com', newsletter: 'yes' },
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)

    // Verify stored in DB
    const { docs } = await payload.find({
      collection: 'enquiry-submissions',
      where: { form: { exists: true } },
    })
    const entry = docs.find((d: any) =>
      d.data?.some((item: any) => item.fieldName === 'full_name' && item.value === 'Alice'),
    )
    expect(entry).toBeDefined()
  })

  test('sendEmail action interpolates subject and fires callback', async () => {
    capturedEmails.length = 0
    await makeRequest(formSlug, {
      data: { full_name: 'Bob', email: 'bob@example.com' },
    })
    expect(capturedEmails).toHaveLength(1)
    expect(capturedEmails[0].subject).toBe('New enquiry from Bob')
    expect(capturedEmails[0].to).toBe('admin@example.com')
  })

  test('sendEmail uses email field as replyTo when replyTo is blank', async () => {
    capturedEmails.length = 0
    await makeRequest(formSlug, {
      data: { full_name: 'Carol', email: 'carol@example.com' },
    })
    expect(capturedEmails[0].replyTo).toBe('carol@example.com')
  })

  test('confirmationMessage is returned in response actions', async () => {
    const response = await makeRequest(formSlug, {
      data: { full_name: 'Dave', email: 'dave@example.com' },
    })
    const body = await response.json()
    expect(body.actions.confirmationMessage).toBeDefined()
  })

  test('returns 422 when required field is missing', async () => {
    const response = await makeRequest(formSlug, {
      data: { newsletter: 'yes' }, // missing full_name and email
    })
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.success).toBe(false)
    expect(body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'full_name' }),
        expect.objectContaining({ field: 'email' }),
      ]),
    )
  })

  test('returns 404 for unknown form slug', async () => {
    const response = await makeRequest('no-such-form', { data: {} })
    expect(response.status).toBe(404)
  })

  test('redirect action url is returned in response actions', async () => {
    const redirectSlug = 'redirect-test-' + Date.now()
    await payload.create({
      collection: 'enquiry-forms',
      data: {
        title: 'Redirect Form',
        slug: redirectSlug,
        steps: [{ title: 'S1', fields: [] }],
        submissionActions: [{ blockType: 'redirect', url: '/thank-you', delay: 0 }],
      },
    })
    const response = await makeRequest(redirectSlug, { data: {} })
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.actions.redirectUrl).toBe('/thank-you')
  })
})
