import type { Payload } from 'payload'
import config from '@payload-config'
import { createPayloadRequest, getPayload } from 'payload'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createFetchFormHandler } from '../src/endpoints/fetchFormHandler.js'
import { createSubmitFormHandler } from '../src/endpoints/submitFormHandler.js'
import { capturedEmails } from './helpers/testEmailAdapter.js'

let payload: Payload

afterAll(async () => {
  await payload.destroy()
})

beforeAll(async () => {
  payload = await getPayload({ config })
})

describe('Collections registered by formPlugin', () => {
  test('forms collection exists', () => {
    expect(payload.collections['forms']).toBeDefined()
  })

  test('form-submissions collection exists', () => {
    expect(payload.collections['form-submissions']).toBeDefined()
  })

  test('can create a forms document with a step and a radioGroup field', async () => {
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Test Form',
        slug: 'test-form-' + Date.now(),
        steps: [
          {
            title: 'Step 1',
            fields: [
              {
                blockType: 'radioGroup',
                name: 'preference',
                label: 'What is your preference?',
                required: true,
                options: [
                  { label: 'Yes', value: 'yes' },
                  { label: 'No', value: 'no' },
                ],
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

  test('can create a forms document with all 11 generic field block types', async () => {
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'All Fields Form',
        slug: 'all-fields-' + Date.now(),
        steps: [
          {
            title: 'Step 1',
            fields: [
              { blockType: 'text', name: 'q1', label: 'Name' },
              { blockType: 'email', name: 'q2', label: 'Email' },
              { blockType: 'phone', name: 'q3', label: 'Phone' },
              { blockType: 'textarea', name: 'q4', label: 'Notes', rows: 3 },
              { blockType: 'checkbox', name: 'q5', label: 'Agree?' },
              {
                blockType: 'radioGroup',
                name: 'q6',
                label: 'Pick one',
                options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }],
                layout: 'row',
              },
              {
                blockType: 'checkboxGroup',
                name: 'q7',
                label: 'Pick many',
                options: [{ label: 'X', value: 'x' }, { label: 'Y', value: 'y' }],
              },
              {
                blockType: 'select',
                name: 'q8',
                label: 'Country',
                options: [{ label: 'UK', value: 'uk' }],
              },
              { blockType: 'number', name: 'q9', label: 'Age', min: 0, max: 120, step: 1 },
              { blockType: 'date', name: 'q10', label: 'Date of birth' },
              { blockType: 'file', name: 'q11', label: 'CV', accept: '.pdf', maxSizeMB: 5 },
            ],
          },
        ],
        submissionActions: [{ blockType: 'redirect', url: '/thank-you', delay: 0 }],
      },
    })

    expect(form.steps[0].fields).toHaveLength(11)
  })

  test('form-submissions access.create is false (admin UI cannot create)', async () => {
    const collection = payload.collections['form-submissions']
    expect(collection).toBeDefined()
    const accessResult = (collection.config.access?.create as any)?.({ req: { user: null } })
    expect(accessResult).toBe(false)
  })
})

describe('fetchFormHandler', () => {
  let seededSlug: string

  beforeAll(async () => {
    seededSlug = 'fetch-test-' + Date.now()
    await payload.create({
      collection: 'forms',
      data: {
        title: 'Fetch Test Form',
        slug: seededSlug,
        steps: [
          {
            title: 'Step 1',
            fields: [
              {
                blockType: 'radioGroup',
                name: 'q',
                label: 'Q?',
                options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }],
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
  })

  test('returns 200 with form data for a known slug', async () => {
    const handler = createFetchFormHandler({ collections: { forms: 'forms' } })
    const request = new Request(`http://localhost:3000/api/forms/${seededSlug}`)
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
    const handler = createFetchFormHandler({ collections: { forms: 'forms' } })
    const request = new Request('http://localhost:3000/api/forms/does-not-exist')
    const payloadRequest = await createPayloadRequest({
      config: await config,
      request,
      params: { slug: 'does-not-exist' },
    })
    const response = await handler(payloadRequest)
    expect(response.status).toBe(404)
  })

  test('returns the configured confirmationStage', async () => {
    const slug = 'confirmation-stage-' + Date.now()
    await payload.create({
      collection: 'forms',
      data: {
        title: 'Confirmation Stage Form',
        slug,
        multiStep: true,
        steps: [
          { title: 'Your Trip', fields: [] },
          { title: 'Your Details', fields: [] },
        ],
        confirmationStage: { enabled: true, label: 'All Done' },
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

    const handler = createFetchFormHandler({ collections: { forms: 'forms' } })
    const request = new Request(`http://localhost:3000/api/forms/${slug}`)
    const payloadRequest = await createPayloadRequest({
      config: await config,
      request,
      params: { slug },
    })
    const response = await handler(payloadRequest)
    const body = await response.json()
    expect(body.confirmationStage?.enabled).toBe(true)
    expect(body.confirmationStage?.label).toBe('All Done')
  })

  test('returns 400 when slug param is missing', async () => {
    const handler = createFetchFormHandler({ collections: { forms: 'forms' } })
    const request = new Request('http://localhost:3000/api/forms/')
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

  beforeAll(async () => {
    capturedEmails.length = 0
    formSlug = 'submit-test-' + Date.now()
    await payload.create({
      collection: 'forms',
      data: {
        title: 'Submit Test Form',
        slug: formSlug,
        steps: [
          {
            title: 'Step 1',
            fields: [
              { blockType: 'text', name: 'full_name', label: 'Full Name', required: true },
              { blockType: 'email', name: 'email', label: 'Email', required: true },
              {
                blockType: 'radioGroup',
                name: 'newsletter',
                label: 'Subscribe?',
                required: false,
                options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }],
              },
            ],
          },
        ],
        submissionActions: [
          {
            blockType: 'sendEmail',
            to: 'admin@example.com',
            subject: 'New submission from {{full_name}}',
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
      collections: { forms: 'forms', submissions: 'form-submissions' },
    })
    const request = new Request(`http://localhost:3000/api/form-submit/${slug}`, {
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

    const formResult = await payload.find({
      collection: 'forms',
      where: { slug: { equals: formSlug } },
      limit: 1,
    })
    const formId = formResult.docs[0]?.id

    const { docs } = await payload.find({
      collection: 'form-submissions',
      where: { form: { equals: formId } },
      limit: 10,
    })
    const entry = docs.find((d: any) =>
      d.data?.some((item: any) => item.fieldName === 'full_name' && item.value === 'Alice'),
    )
    expect(entry).toBeDefined()
  })

  test('persists a plain-object context and returns submissionId', async () => {
    const ctx = { collection: 'hotels', id: 42, slug: 'the-grand', title: 'The Grand' }
    const response = await makeRequest(formSlug, {
      data: { full_name: 'Eve', email: 'eve@example.com' },
      context: ctx,
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.submissionId).toBeDefined()

    const submission = await payload.findByID({
      collection: 'form-submissions',
      id: body.submissionId,
    })
    expect(submission.context).toEqual(ctx)
  })

  test('ignores non-object context and still stores the submission', async () => {
    const response = await makeRequest(formSlug, {
      data: { full_name: 'Frank', email: 'frank@example.com' },
      context: 'not-an-object',
    })
    expect(response.status).toBe(200)
    const body = await response.json()

    const submission = await payload.findByID({
      collection: 'form-submissions',
      id: body.submissionId,
    })
    expect(submission.context ?? null).toBeNull()
  })

  test('sendEmail action interpolates subject and fires callback', async () => {
    capturedEmails.length = 0
    await makeRequest(formSlug, {
      data: { full_name: 'Bob', email: 'bob@example.com' },
    })
    expect(capturedEmails).toHaveLength(1)
    expect(capturedEmails[0].subject).toBe('New submission from Bob')
    expect(capturedEmails[0].to).toBe('admin@example.com')
  })

  test('sendEmail uses email field as replyTo when replyTo is blank', async () => {
    capturedEmails.length = 0
    await makeRequest(formSlug, {
      data: { full_name: 'Carol', email: 'carol@example.com' },
    })
    expect(capturedEmails).toHaveLength(1)
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
      data: { newsletter: 'yes' },
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
      collection: 'forms',
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

// ---------------------------------------------------------------------------
// Conditional logic — server-side enforcement via validateVisibleSubmission
//
// A client can post anything, so the handler must re-evaluate every visibility
// rule against the submitted values: hidden fields must not be required, hidden
// values must not be stored, and `action: 'require'` rules must be enforced.
// ---------------------------------------------------------------------------
describe('submitFormHandler conditional logic', () => {
  let formSlug: string
  let formId: string | number

  type ConditionOperator =
    | 'equals'
    | 'notEquals'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'isChecked'
    | 'isNotChecked'
    | 'contains'
    | 'isEmpty'
    | 'isNotEmpty'

  const cond = (source: string, operator: ConditionOperator, value?: string) => ({
    blockType: 'condition' as const,
    source,
    operator,
    ...(value === undefined ? {} : { value }),
  })

  beforeAll(async () => {
    formSlug = 'conditional-test-' + Date.now()
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Conditional Test Form',
        slug: formSlug,
        steps: [
          {
            title: 'Contact',
            fields: [
              {
                blockType: 'select',
                name: 'contact_method',
                label: 'How should we reach you?',
                required: true,
                options: [
                  { label: 'Email', value: 'email' },
                  { label: 'Phone', value: 'phone' },
                ],
              },
              // show-rule: only required when it is actually on screen
              {
                blockType: 'email',
                name: 'email',
                label: 'Email',
                required: true,
                visibility: {
                  enabled: true,
                  action: 'show',
                  match: 'all',
                  conditions: [cond('contact_method', 'equals', 'email')],
                },
              },
              {
                blockType: 'phone',
                name: 'phone',
                label: 'Phone',
                required: true,
                visibility: {
                  enabled: true,
                  action: 'show',
                  match: 'all',
                  conditions: [cond('contact_method', 'equals', 'phone')],
                },
              },
              {
                blockType: 'select',
                name: 'reason',
                label: 'Reason',
                required: true,
                options: [
                  { label: 'New booking', value: 'booking' },
                  { label: 'Other', value: 'other' },
                ],
              },
              // require-rule: always visible, required only when reason = other
              {
                blockType: 'text',
                name: 'reason_other',
                label: 'Please explain',
                required: false,
                visibility: {
                  enabled: true,
                  action: 'require',
                  match: 'all',
                  conditions: [cond('reason', 'equals', 'other')],
                },
              },
              // OR group: shown for either branch
              {
                blockType: 'checkbox',
                name: 'marketing_optin',
                label: 'Keep me posted',
                required: true,
                visibility: {
                  enabled: true,
                  action: 'show',
                  match: 'any',
                  conditions: [
                    cond('contact_method', 'equals', 'email'),
                    cond('reason', 'equals', 'booking'),
                  ],
                },
              },
            ],
          },
          {
            // whole-step rule: step (and its required field) only applies to bookings
            title: 'Booking',
            visibility: {
              enabled: true,
              match: 'all',
              conditions: [cond('reason', 'equals', 'booking')],
            },
            fields: [
              {
                blockType: 'text',
                name: 'booking_ref',
                label: 'Booking reference',
                required: true,
              },
            ],
          },
        ],
        submissionActions: [{ blockType: 'redirect', url: '/thanks', delay: 0 }],
      },
    })
    formId = form.id
  })

  const makeRequest = async (slug: string, body: object) => {
    const handler = createSubmitFormHandler({
      collections: { forms: 'forms', submissions: 'form-submissions' },
    })
    const request = new Request(`http://localhost:3000/api/form-submit/${slug}`, {
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

  const submissionFor = async (submissionId: string | number) =>
    payload.findByID({ collection: 'form-submissions', id: submissionId })

  const storedFields = (submission: { data?: unknown }) =>
    Object.fromEntries(
      ((submission.data ?? []) as Array<{ fieldName: string; value: unknown }>).map((d) => [
        d.fieldName,
        d.value,
      ]),
    )

  // -- show rules ----------------------------------------------------------
  test('a required field hidden by its show rule is not enforced', async () => {
    // contact_method=phone hides `email`, so omitting it must still pass
    const response = await makeRequest(formSlug, {
      data: {
        contact_method: 'phone',
        phone: '01234 567890',
        reason: 'booking',
        booking_ref: 'ABC123',
        marketing_optin: true,
      },
    })
    expect(response.status).toBe(200)
  })

  test('a required field revealed by its show rule IS enforced', async () => {
    const response = await makeRequest(formSlug, {
      data: { contact_method: 'email', reason: 'booking', booking_ref: 'ABC123', marketing_optin: true },
    })
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
    )
    // the hidden counterpart must NOT be reported
    expect(body.errors.map((e: { field: string }) => e.field)).not.toContain('phone')
  })

  test('values posted for hidden fields are stripped before storage', async () => {
    // client posts a stale `phone` even though contact_method=email hides it
    const response = await makeRequest(formSlug, {
      data: {
        contact_method: 'email',
        email: 'alice@example.com',
        phone: '07999 000000',
        reason: 'booking',
        booking_ref: 'ABC123',
        marketing_optin: true,
      },
    })
    expect(response.status).toBe(200)
    const { submissionId } = await response.json()
    const stored = storedFields(await submissionFor(submissionId))
    expect(stored.email).toBe('alice@example.com')
    expect(stored).not.toHaveProperty('phone')
  })

  // -- require rules -------------------------------------------------------
  test('action:require makes an optional field required when the rule matches', async () => {
    const response = await makeRequest(formSlug, {
      data: { contact_method: 'email', email: 'a@b.com', reason: 'other' },
    })
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'reason_other' })]),
    )
  })

  test('action:require leaves the field optional when the rule does not match', async () => {
    const response = await makeRequest(formSlug, {
      data: {
        contact_method: 'email',
        email: 'a@b.com',
        reason: 'booking',
        booking_ref: 'ABC123',
        marketing_optin: true,
      },
    })
    expect(response.status).toBe(200)
  })

  test('a require-rule field stays visible and is stored, not stripped', async () => {
    const response = await makeRequest(formSlug, {
      data: {
        contact_method: 'email',
        email: 'a@b.com',
        reason: 'other',
        reason_other: 'Just a question',
        marketing_optin: true,
      },
    })
    expect(response.status).toBe(200)
    const { submissionId } = await response.json()
    expect(storedFields(await submissionFor(submissionId)).reason_other).toBe('Just a question')
  })

  // -- match: any ----------------------------------------------------------
  test('match:any shows the field when only the second condition holds', async () => {
    // contact_method=phone fails condition 1, reason=booking satisfies condition 2
    const response = await makeRequest(formSlug, {
      data: { contact_method: 'phone', phone: '01234', reason: 'booking', booking_ref: 'X' },
    })
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'marketing_optin' })]),
    )
  })

  test('match:any hides the field when neither condition holds', async () => {
    const response = await makeRequest(formSlug, {
      data: { contact_method: 'phone', phone: '01234', reason: 'other', reason_other: 'hi' },
    })
    expect(response.status).toBe(200)
  })

  // -- step rules ----------------------------------------------------------
  test('a required field on a hidden step is not enforced', async () => {
    const response = await makeRequest(formSlug, {
      data: {
        contact_method: 'email',
        email: 'a@b.com',
        reason: 'other',
        reason_other: 'Just asking',
        marketing_optin: true,
        // booking_ref omitted — step 2 is hidden because reason !== booking
      },
    })
    expect(response.status).toBe(200)
  })

  test('a required field on a visible step IS enforced', async () => {
    const response = await makeRequest(formSlug, {
      data: { contact_method: 'email', email: 'a@b.com', reason: 'booking', marketing_optin: true },
    })
    expect(response.status).toBe(422)
    const body = await response.json()
    expect(body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'booking_ref' })]),
    )
  })

  test('values posted for fields on a hidden step are stripped', async () => {
    const response = await makeRequest(formSlug, {
      data: {
        contact_method: 'email',
        email: 'a@b.com',
        reason: 'other',
        reason_other: 'Just asking',
        marketing_optin: true,
        booking_ref: 'SHOULD-NOT-PERSIST',
      },
    })
    expect(response.status).toBe(200)
    const { submissionId } = await response.json()
    expect(storedFields(await submissionFor(submissionId))).not.toHaveProperty('booking_ref')
  })

  test('the conditional form is reachable through fetchFormHandler with rules intact', async () => {
    const doc = await payload.findByID({ collection: 'forms', id: formId })
    const emailField = (doc.steps as any)[0].fields.find((f: any) => f.name === 'email')
    expect(emailField.visibility.enabled).toBe(true)
    expect(emailField.visibility.action).toBe('show')
    expect(emailField.visibility.conditions[0].source).toBe('contact_method')
    expect(emailField.visibility.conditions[0].blockType).toBe('condition')
  })
})
