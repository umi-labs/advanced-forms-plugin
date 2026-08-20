import { describe, expect, test } from 'vitest'
import { baseFieldBlockFields } from '../src/blocks/fields/shared.js'

/** Flatten row-type fields one level deep so tests can find named fields regardless of layout. */
function flatFields(fields: any[]): any[] {
  return fields.flatMap((f) => (f.type === 'row' ? f.fields : [f]))
}

describe('baseFieldBlockFields', () => {
  test('exports an array', () => {
    expect(Array.isArray(baseFieldBlockFields)).toBe(true)
  })

  test('includes name, label, required, tooltip, and validation fields', () => {
    const names = flatFields(baseFieldBlockFields).map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('name')
    expect(names).toContain('label')
    expect(names).toContain('required')
    expect(names).toContain('tooltip')
    expect(names).toContain('validation')
  })

  test('validation group exposes admin-configurable rule fields', () => {
    const validation = flatFields(baseFieldBlockFields).find(
      (f) => 'name' in f && f.name === 'validation',
    ) as any
    expect(validation?.type).toBe('group')
    const subNames = validation?.fields?.map((f: any) => f.name)
    for (const name of [
      'requiredMessage',
      'minLength',
      'maxLength',
      'pattern',
      'patternMessage',
      'min',
      'max',
      'minMessage',
      'maxMessage',
    ]) {
      expect(subNames).toContain(name)
    }
  })

  test('name field is required text', () => {
    const field = flatFields(baseFieldBlockFields).find((f) => 'name' in f && f.name === 'name')
    expect(field).toMatchObject({ type: 'text', required: true })
  })

  test('label field is required text', () => {
    const field = flatFields(baseFieldBlockFields).find((f) => 'name' in f && f.name === 'label')
    expect(field).toMatchObject({ type: 'text', required: true })
  })

  test('tooltip group has enabled checkbox and conditional text', () => {
    const tooltip = flatFields(baseFieldBlockFields).find((f) => 'name' in f && f.name === 'tooltip') as any
    expect(tooltip?.type).toBe('group')
    const subNames = tooltip?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('enabled')
    expect(subNames).toContain('text')
  })
})

import { TextBlock } from '../src/blocks/fields/Text.js'
import { EmailBlock } from '../src/blocks/fields/Email.js'
import { PhoneBlock } from '../src/blocks/fields/Phone.js'
import { TextareaBlock } from '../src/blocks/fields/Textarea.js'
import { CheckboxBlock } from '../src/blocks/fields/Checkbox.js'
import { RadioGroupBlock } from '../src/blocks/fields/RadioGroup.js'
import { CheckboxGroupBlock } from '../src/blocks/fields/CheckboxGroup.js'
import { SelectBlock } from '../src/blocks/fields/Select.js'
import { NumberBlock } from '../src/blocks/fields/Number.js'
import { DateBlock } from '../src/blocks/fields/Date.js'
import { FileBlock } from '../src/blocks/fields/File.js'

describe('TextBlock', () => {
  test('has slug text', () => expect(TextBlock.slug).toBe('text'))
  test('has all base fields', () => {
    const names = flatFields(TextBlock.fields).map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('name')
    expect(names).toContain('label')
    expect(names).toContain('required')
    expect(names).toContain('tooltip')
  })
  test('has placeholder and width fields', () => {
    const names = flatFields(TextBlock.fields).map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('width')
  })
  test('width defaults to full', () => {
    const field = flatFields(TextBlock.fields).find((f) => 'name' in f && f.name === 'width') as any
    expect(field?.defaultValue).toBe('full')
  })
  test('width includes third option', () => {
    const field = flatFields(TextBlock.fields).find((f) => 'name' in f && f.name === 'width') as any
    const values = field?.options?.map((o: any) => o.value)
    expect(values).toContain('third')
  })
})

describe('EmailBlock', () => {
  test('has slug email', () => expect(EmailBlock.slug).toBe('email'))
  test('has placeholder field', () => {
    const names = EmailBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
  })
})

describe('PhoneBlock', () => {
  test('has slug phone', () => expect(PhoneBlock.slug).toBe('phone'))
  test('has placeholder, width, defaultCountry, countries fields', () => {
    const names = PhoneBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('width')
    expect(names).toContain('defaultCountry')
    expect(names).toContain('countries')
  })
  test('countries is an array of { label, value }', () => {
    const countries = PhoneBlock.fields.find((f) => 'name' in f && f.name === 'countries') as any
    expect(countries?.type).toBe('array')
    const subNames = countries?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('value')
  })
})

describe('TextareaBlock', () => {
  test('has slug textarea', () => expect(TextareaBlock.slug).toBe('textarea'))
  test('has placeholder and rows fields', () => {
    const names = TextareaBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('rows')
  })
  test('rows defaults to 4', () => {
    const field = TextareaBlock.fields.find((f) => 'name' in f && f.name === 'rows') as any
    expect(field?.defaultValue).toBe(4)
  })
})

describe('CheckboxBlock', () => {
  test('has slug checkbox', () => expect(CheckboxBlock.slug).toBe('checkbox'))
  test('has appearance field with checkbox + switch options', () => {
    const appearance = flatFields(CheckboxBlock.fields).find(
      (f) => 'name' in f && f.name === 'appearance',
    ) as any
    expect(appearance?.type).toBe('select')
    expect(appearance?.defaultValue).toBe('checkbox')
    const values = appearance?.options?.map((o: any) => o.value)
    expect(values).toContain('checkbox')
    expect(values).toContain('switch')
  })
})

describe('RadioGroupBlock', () => {
  test('has slug radioGroup', () => expect(RadioGroupBlock.slug).toBe('radioGroup'))
  test('has options array with label and value sub-fields', () => {
    const options = RadioGroupBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    expect(options?.type).toBe('array')
    const subNames = options?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('value')
  })
  test('options array requires at least 1 row', () => {
    const options = RadioGroupBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    expect(options?.minRows).toBe(1)
  })
  test('has layout select with row and grid options', () => {
    const layout = RadioGroupBlock.fields.find((f) => 'name' in f && f.name === 'layout') as any
    expect(layout?.type).toBe('select')
    const values = layout?.options?.map((o: any) => o.value)
    expect(values).toContain('row')
    expect(values).toContain('grid')
  })
  test('layout defaults to row', () => {
    const layout = RadioGroupBlock.fields.find((f) => 'name' in f && f.name === 'layout') as any
    expect(layout?.defaultValue).toBe('row')
  })
})

describe('CheckboxGroupBlock', () => {
  test('has slug checkboxGroup', () => expect(CheckboxGroupBlock.slug).toBe('checkboxGroup'))
  test('has options array with label and value sub-fields', () => {
    const options = CheckboxGroupBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    expect(options?.type).toBe('array')
    const subNames = options?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('value')
  })
  test('has layout select', () => {
    const layout = CheckboxGroupBlock.fields.find((f) => 'name' in f && f.name === 'layout') as any
    expect(layout?.type).toBe('select')
  })
})

describe('SelectBlock', () => {
  test('has slug select', () => expect(SelectBlock.slug).toBe('select'))
  test('has placeholder and options fields', () => {
    const names = SelectBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('options')
  })
  test('options array has label and value sub-fields', () => {
    const options = SelectBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    const subNames = options?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('value')
  })
})

describe('NumberBlock', () => {
  test('has slug number', () => expect(NumberBlock.slug).toBe('number'))
  test('has placeholder, defaultValue, min, max, step fields', () => {
    const names = NumberBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('defaultValue')
    expect(names).toContain('min')
    expect(names).toContain('max')
    expect(names).toContain('step')
  })
  test('step defaults to 1', () => {
    const field = NumberBlock.fields.find((f) => 'name' in f && f.name === 'step') as any
    expect(field?.defaultValue).toBe(1)
  })
})

describe('DateBlock', () => {
  test('has slug date', () => expect(DateBlock.slug).toBe('date'))
  test('has placeholder, min, max fields', () => {
    const names = DateBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('min')
    expect(names).toContain('max')
  })
})

describe('FileBlock', () => {
  test('has slug file', () => expect(FileBlock.slug).toBe('file'))
  test('has accept, maxSizeMB, collection fields', () => {
    const names = FileBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('accept')
    expect(names).toContain('maxSizeMB')
    expect(names).toContain('collection')
  })
})

import { SendEmailBlock } from '../src/blocks/submissionActions/SendEmail.js'
import { createConfirmationMessageBlock } from '../src/blocks/submissionActions/ConfirmationMessage.js'

const ConfirmationMessageBlock = createConfirmationMessageBlock()
import { RedirectBlock } from '../src/blocks/submissionActions/Redirect.js'

describe('SendEmailBlock', () => {
  test('has slug sendEmail', () => expect(SendEmailBlock.slug).toBe('sendEmail'))
  test('has to, replyTo, subject, includeSubmissionData fields', () => {
    const names = flatFields(SendEmailBlock.fields).map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('to')
    expect(names).toContain('replyTo')
    expect(names).toContain('subject')
    expect(names).toContain('includeSubmissionData')
  })
  test('to and subject are required', () => {
    const allFields = flatFields(SendEmailBlock.fields)
    const toField = allFields.find((f) => 'name' in f && f.name === 'to') as any
    const subjectField = allFields.find((f) => 'name' in f && f.name === 'subject') as any
    expect(toField?.required).toBe(true)
    expect(subjectField?.required).toBe(true)
  })
})

describe('ConfirmationMessageBlock', () => {
  test('has slug confirmationMessage', () => expect(ConfirmationMessageBlock.slug).toBe('confirmationMessage'))
  test('has message richText field', () => {
    const msg = ConfirmationMessageBlock.fields.find((f) => 'name' in f && f.name === 'message') as any
    expect(msg?.type).toBe('richText')
    expect(msg?.required).toBe(true)
  })
})

describe('RedirectBlock', () => {
  test('has slug redirect', () => expect(RedirectBlock.slug).toBe('redirect'))
  test('has url and delay fields', () => {
    const names = RedirectBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('url')
    expect(names).toContain('delay')
  })
  test('url is required', () => {
    const url = RedirectBlock.fields.find((f) => 'name' in f && f.name === 'url') as any
    expect(url?.required).toBe(true)
  })
  test('delay defaults to 0', () => {
    const delay = RedirectBlock.fields.find((f) => 'name' in f && f.name === 'delay') as any
    expect(delay?.defaultValue).toBe(0)
  })
})

import { buildFormURL } from '../src/utilities/buildFormURL.js'
import { sanitizeSubmission } from '../src/utilities/sanitizeSubmission.js'
import { buildFieldRules } from '../src/utilities/buildFieldRules.js'

describe('buildFieldRules', () => {
  test('returns empty object when nothing is configured', () => {
    expect(buildFieldRules({ label: 'X' } as any)).toEqual({})
  })

  test('emits default required message when required', () => {
    const rules = buildFieldRules({ label: 'Name', required: true } as any)
    expect(rules.required).toBe('Name is required')
  })

  test('uses validation.requiredMessage override', () => {
    const rules = buildFieldRules({
      label: 'Name',
      required: true,
      validation: { requiredMessage: 'Tell us your name' },
    } as any)
    expect(rules.required).toBe('Tell us your name')
  })

  test('emits minLength / maxLength rules with auto messages', () => {
    const rules = buildFieldRules({
      label: 'Name',
      validation: { minLength: 2, maxLength: 50 },
    } as any)
    expect(rules.minLength).toEqual({ value: 2, message: 'Name must be at least 2 characters' })
    expect(rules.maxLength).toEqual({ value: 50, message: 'Name must be at most 50 characters' })
  })

  test('emits min / max numeric rules with overridable messages', () => {
    const rules = buildFieldRules({
      label: 'Guests',
      validation: { min: 1, max: 8, maxMessage: 'Too many guests' },
    } as any)
    expect(rules.min).toEqual({ value: 1, message: 'Guests must be ≥ 1' })
    expect(rules.max).toEqual({ value: 8, message: 'Too many guests' })
  })

  test('compiles pattern from regex source', () => {
    const rules = buildFieldRules({
      label: 'Code',
      validation: { pattern: '^[A-Z]{2,}$', patternMessage: 'Use capital letters' },
    } as any)
    expect((rules.pattern as any).value.test('AB')).toBe(true)
    expect((rules.pattern as any).value.test('ab')).toBe(false)
    expect((rules.pattern as any).message).toBe('Use capital letters')
  })

  test('silently ignores invalid regex sources', () => {
    const rules = buildFieldRules({
      label: 'Code',
      validation: { pattern: '([' /* unterminated */ },
    } as any)
    expect(rules.pattern).toBeUndefined()
  })
})

describe('buildFormURL', () => {
  test('returns relative path when no baseUrl given', () => {
    expect(buildFormURL({ slug: 'my-form' })).toBe('/api/form-data/my-form')
  })

  test('returns absolute URL when baseUrl given', () => {
    expect(buildFormURL({ slug: 'my-form', baseUrl: 'https://example.com' }))
      .toBe('https://example.com/api/form-data/my-form')
  })

  test('respects custom formsSlug', () => {
    expect(buildFormURL({ slug: 'my-form', formsSlug: 'my-forms' }))
      .toBe('/api/my-forms/my-form')
  })
})

import { z } from 'zod'
import { buildZodSchemaFromForm } from '../src/utilities/buildZodSchemaFromForm.js'

describe('buildZodSchemaFromForm', () => {
  const wrap = (fields: any[]) => ({ steps: [{ title: 's', fields }] }) as any

  test('builds an object schema keyed by field.name', () => {
    const schema = buildZodSchemaFromForm(
      wrap([
        { name: 'first', label: 'First', blockType: 'text', required: true },
        { name: 'note', label: 'Note', blockType: 'textarea' },
      ]),
    )
    expect(schema.safeParse({ first: 'A', note: '' }).success).toBe(true)
    const bad = schema.safeParse({ first: '', note: '' })
    expect(bad.success).toBe(false)
    expect(bad.error!.issues[0]!.message).toBe('First is required')
  })

  test('accepts a bare FormFieldBlock[] in place of a form document', () => {
    const schema = buildZodSchemaFromForm([
      { name: 'first', label: 'First', blockType: 'text', required: true },
    ] as any)
    expect(schema.safeParse({ first: 'A' }).success).toBe(true)
    expect(schema.safeParse({ first: '' }).success).toBe(false)
  })

  test('email field rejects malformed values', () => {
    const schema = buildZodSchemaFromForm(
      wrap([{ name: 'email', label: 'Email', blockType: 'email', required: true }]),
    )
    expect(schema.safeParse({ email: 'a@b.co' }).success).toBe(true)
    expect(schema.safeParse({ email: 'nope' }).success).toBe(false)
  })

  test('optional text accepts undefined and empty string', () => {
    const schema = buildZodSchemaFromForm(
      wrap([{ name: 'nick', label: 'Nick', blockType: 'text' }]),
    )
    expect(schema.safeParse({ nick: '' }).success).toBe(true)
    expect(schema.safeParse({}).success).toBe(true)
  })

  test('applies minLength / maxLength / pattern with override messages', () => {
    const schema = buildZodSchemaFromForm(
      wrap([
        {
          name: 'code',
          label: 'Code',
          blockType: 'text',
          required: true,
          validation: {
            minLength: 2,
            maxLength: 4,
            pattern: '^[A-Z]+$',
            patternMessage: 'capitals only',
          },
        },
      ]),
    )
    expect(schema.safeParse({ code: 'AB' }).success).toBe(true)
    expect(schema.safeParse({ code: 'A' }).success).toBe(false)
    expect(schema.safeParse({ code: 'ABCDE' }).success).toBe(false)
    const r = schema.safeParse({ code: 'ab' })
    expect(r.success).toBe(false)
    expect(r.error!.issues.some((i) => i.message === 'capitals only')).toBe(true)
  })

  test('required checkbox must be true', () => {
    const schema = buildZodSchemaFromForm(
      wrap([{ name: 'agree', label: 'Agree', blockType: 'checkbox', required: true }]),
    )
    expect(schema.safeParse({ agree: true }).success).toBe(true)
    const r = schema.safeParse({ agree: false })
    expect(r.success).toBe(false)
    expect(r.error!.issues[0]!.message).toBe('Agree is required')
  })

  test('required checkboxGroup needs at least one entry', () => {
    const schema = buildZodSchemaFromForm(
      wrap([
        { name: 'topics', label: 'Topics', blockType: 'checkboxGroup', required: true },
      ]),
    )
    expect(schema.safeParse({ topics: ['a'] }).success).toBe(true)
    expect(schema.safeParse({ topics: [] }).success).toBe(false)
  })

  test('number applies min / max with overridable messages', () => {
    const schema = buildZodSchemaFromForm(
      wrap([
        {
          name: 'guests',
          label: 'Guests',
          blockType: 'number',
          required: true,
          validation: { min: 1, max: 8, maxMessage: 'too many' },
        },
      ]),
    )
    expect(schema.safeParse({ guests: 4 }).success).toBe(true)
    expect(schema.safeParse({ guests: 0 }).success).toBe(false)
    const r = schema.safeParse({ guests: 9 })
    expect(r.success).toBe(false)
    expect(r.error!.issues[0]!.message).toBe('too many')
  })

  test('multiCounter enforces per-counter and total constraints', () => {
    const schema = buildZodSchemaFromForm(
      wrap([
        {
          name: 'rooms',
          label: 'Rooms',
          blockType: 'multiCounter',
          counters: [
            { name: 'adults', label: 'Adults', min: 1, max: 4 },
            { name: 'kids', label: 'Kids', min: 0, max: 4 },
          ],
          validation: { min: 2, max: 5 },
        },
      ]),
    )
    expect(schema.safeParse({ rooms: { adults: 2, kids: 1 } }).success).toBe(true)
    expect(schema.safeParse({ rooms: { adults: 0, kids: 1 } }).success).toBe(false)
    const tooMany = schema.safeParse({ rooms: { adults: 4, kids: 4 } })
    expect(tooMany.success).toBe(false)
    expect(tooMany.error!.issues.some((i) => /total/.test(i.message))).toBe(true)
  })

  test('honours fieldSchemas override for custom blockTypes', () => {
    const schema = buildZodSchemaFromForm(
      wrap([{ name: 'custom', label: 'Custom', blockType: 'mySpecial', required: true }]),
      { fieldSchemas: { mySpecial: () => z.literal('ok') } },
    )
    expect(schema.safeParse({ custom: 'ok' }).success).toBe(true)
    expect(schema.safeParse({ custom: 'no' }).success).toBe(false)
  })
})

describe('sanitizeSubmission', () => {
  test('converts string values as-is', () => {
    const result = sanitizeSubmission({ name: 'Alice', city: 'London' })
    expect(result).toEqual([
      { fieldName: 'name', value: 'Alice' },
      { fieldName: 'city', value: 'London' },
    ])
  })

  test('JSON-stringifies object values', () => {
    const result = sanitizeSubmission({ data: { a: 1 } })
    expect(result).toEqual([{ fieldName: 'data', value: '{"a":1}' }])
  })

  test('converts numbers to strings', () => {
    const result = sanitizeSubmission({ duration: 7 })
    expect(result).toEqual([{ fieldName: 'duration', value: '7' }])
  })

  test('converts null/undefined to empty string', () => {
    const result = sanitizeSubmission({ notes: null, extra: undefined })
    expect(result).toEqual([
      { fieldName: 'notes', value: '' },
      { fieldName: 'extra', value: '' },
    ])
  })
})

import { createFormsCollection } from '../src/collections/Forms.js'
import { buildIndicatorSteps } from '../src/utilities/buildIndicatorSteps.js'
import type { FormDocument } from '../src/types.js'

const formsCollection = createFormsCollection({
  fieldBlocks: [TextBlock],
  formsSlug: 'forms',
  mediaCollection: 'media',
  pluralLabel: 'Forms',
  singularLabel: 'Form',
})

describe('Forms collection confirmationStage config', () => {
  const group = flatFields(formsCollection.fields).find(
    (f) => 'name' in f && f.name === 'confirmationStage',
  ) as any

  test('exposes a confirmationStage group', () => {
    expect(group?.type).toBe('group')
  })

  test('group has enabled, label and icon fields', () => {
    const subNames = flatFields(group?.fields ?? []).map((f: any) => f.name)
    expect(subNames).toContain('enabled')
    expect(subNames).toContain('label')
    expect(subNames).toContain('icon')
  })

  test('icon relates to the media collection', () => {
    const icon = flatFields(group?.fields ?? []).find((f: any) => f.name === 'icon')
    expect(icon).toMatchObject({ type: 'upload', relationTo: 'media' })
  })
})

function makeForm(overrides: Partial<FormDocument> = {}): FormDocument {
  return {
    id: '1',
    title: 'Enquiry',
    slug: 'enquiry',
    multiStep: true,
    steps: [
      { title: 'Your Trip', fields: [] },
      { title: 'Your Details', fields: [] },
    ],
    submissionActions: [],
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }
}

describe('buildIndicatorSteps', () => {
  test('returns the field steps unchanged when no confirmation stage', () => {
    const steps = buildIndicatorSteps(makeForm())
    expect(steps.map((s) => s.title)).toEqual(['Your Trip', 'Your Details'])
  })

  test('returns field steps unchanged when confirmation stage disabled', () => {
    const steps = buildIndicatorSteps(
      makeForm({ confirmationStage: { enabled: false, label: 'Confirmation' } }),
    )
    expect(steps).toHaveLength(2)
  })

  test('appends a single confirmation stage when enabled on a multi-step form', () => {
    const steps = buildIndicatorSteps(
      makeForm({ confirmationStage: { enabled: true, label: 'All Done' } }),
    )
    expect(steps).toHaveLength(3)
    expect(steps[2].title).toBe('All Done')
  })

  test('defaults the title to "Confirmation" when no label set', () => {
    const steps = buildIndicatorSteps(makeForm({ confirmationStage: { enabled: true } }))
    expect(steps[2].title).toBe('Confirmation')
  })

  test('uses the configured icon for both icon and completedIcon', () => {
    const icon = { url: '/clipboard.svg' } as any
    const steps = buildIndicatorSteps(
      makeForm({ confirmationStage: { enabled: true, icon } }),
    )
    expect(steps[2].icon).toBe(icon)
    expect(steps[2].completedIcon).toBe(icon)
  })

  test('does not append when the form has only one stage', () => {
    const steps = buildIndicatorSteps(
      makeForm({ steps: [{ title: 'Only', fields: [] }], confirmationStage: { enabled: true } }),
    )
    expect(steps).toHaveLength(1)
  })
})

import { buildSubmitURL, FORM_SUBMIT_PATH } from '../src/utilities/buildSubmitURL.js'
import { formPlugin } from '../src/index.js'

describe('buildSubmitURL', () => {
  test('targets the /api/form-submit/:slug endpoint', () => {
    expect(buildSubmitURL({ formSlug: 'enquiry' })).toBe('/api/form-submit/enquiry')
  })

  test('prefixes with apiBase when provided', () => {
    expect(buildSubmitURL({ apiBase: 'https://x.test', formSlug: 'enquiry' })).toBe(
      'https://x.test/api/form-submit/enquiry',
    )
  })
})

describe('plugin endpoint registration matches the client submit path', () => {
  test('registers a POST endpoint at the path the client posts to', () => {
    const config = formPlugin({})({ collections: [] } as any)
    const submit = (config.endpoints ?? []).find((e: any) => e.method === 'post')
    expect(submit?.path).toBe(`/${FORM_SUBMIT_PATH}/:formSlug`)
    // The client builds its URL from the same constant, so they cannot drift.
    expect(buildSubmitURL({ formSlug: ':formSlug' })).toBe(`/api${submit?.path}`)
  })
})

import { normalizeSubmitError } from '../src/utilities/normalizeSubmitError.js'

describe('normalizeSubmitError', () => {
  test('passes through a well-formed SubmitError unchanged', () => {
    const err = { success: false as const, errors: [{ field: 'email', message: 'Required' }] }
    expect(normalizeSubmitError(err)).toBe(err)
  })

  test('wraps a payload-style { message } 404 into an errors array', () => {
    const out = normalizeSubmitError({ message: 'Route not found "/api/x"' })
    expect(out.success).toBe(false)
    expect(out.errors).toEqual([{ field: '', message: 'Route not found "/api/x"' }])
  })

  test('falls back to a generic message for null / non-JSON bodies', () => {
    const out = normalizeSubmitError(null)
    expect(out.success).toBe(false)
    expect(out.errors).toHaveLength(1)
    expect(out.errors[0].message).toMatch(/try again/i)
  })
})

describe('Forms collection richTextEditor option', () => {
  const sentinel = { sentinel: 'editor' } as any
  const coll = createFormsCollection({
    fieldBlocks: [TextBlock],
    formsSlug: 'forms',
    mediaCollection: 'media',
    pluralLabel: 'Forms',
    singularLabel: 'Form',
    richTextEditor: sentinel,
  })

  const getConfirmationMessageField = (c: any) => {
    const actions = c.fields.find((f: any) => f.name === 'submissionActions')
    const block = actions.blocks.find((b: any) => b.slug === 'confirmationMessage')
    return block.fields.find((f: any) => f.name === 'message')
  }
  const getAdditionalContentField = (c: any) => {
    const group = flatFields(c.fields).find((f: any) => f.name === 'additionalContent')
    return group.fields.find((f: any) => f.name === 'content')
  }
  const getIntroContentField = (c: any) => {
    const steps = c.fields.find((f: any) => f.name === 'steps')
    return steps.fields.find((f: any) => f.name === 'introContent')
  }

  test('applies the editor to the confirmation message field', () => {
    expect(getConfirmationMessageField(coll).editor).toBe(sentinel)
  })

  test('applies the editor to the additional content field', () => {
    expect(getAdditionalContentField(coll).editor).toBe(sentinel)
  })

  test('does NOT apply the editor to step intro content', () => {
    const intro = getIntroContentField(coll)
    expect(intro.editor).not.toBe(sentinel)
    expect(intro.editor).toBeDefined()
  })

  test('omits the editor (root fallback) when not provided', () => {
    expect(getConfirmationMessageField(formsCollection).editor).toBeUndefined()
    expect(getAdditionalContentField(formsCollection).editor).toBeUndefined()
  })
})

import {
  resolveValue,
  evaluateCondition,
  evaluateNodes,
  ruleMatches,
} from '../src/utilities/conditions/evaluateRule.js'
import type { Condition, VisibilityRule } from '../src/types.js'

const c = (source: string, operator: any, value?: string): Condition => ({
  source,
  operator,
  value,
})

describe('conditions/evaluateRule', () => {
  test('resolveValue reads top-level and dot-path values', () => {
    const values = { country: 'UK', guests: { adults: 3 } }
    expect(resolveValue('country', values)).toBe('UK')
    expect(resolveValue('guests.adults', values)).toBe(3)
    expect(resolveValue('missing', values)).toBeUndefined()
    expect(resolveValue('guests.kids', values)).toBeUndefined()
  })

  test('equals / notEquals coerce to string', () => {
    expect(evaluateCondition(c('n', 'equals', '5'), { n: 5 })).toBe(true)
    expect(evaluateCondition(c('n', 'equals', '5'), { n: '5' })).toBe(true)
    expect(evaluateCondition(c('n', 'notEquals', '5'), { n: 6 })).toBe(true)
  })

  test('numeric comparisons', () => {
    expect(evaluateCondition(c('n', 'gt', '10'), { n: 12 })).toBe(true)
    expect(evaluateCondition(c('n', 'gte', '10'), { n: 10 })).toBe(true)
    expect(evaluateCondition(c('n', 'lt', '10'), { n: 3 })).toBe(true)
    expect(evaluateCondition(c('n', 'lte', '10'), { n: 10 })).toBe(true)
    expect(evaluateCondition(c('n', 'gt', '10'), { n: 'abc' })).toBe(false)
  })

  test('isChecked / isNotChecked treat true and "true" as checked', () => {
    expect(evaluateCondition(c('agree', 'isChecked'), { agree: true })).toBe(true)
    expect(evaluateCondition(c('agree', 'isChecked'), { agree: 'true' })).toBe(true)
    expect(evaluateCondition(c('agree', 'isChecked'), { agree: false })).toBe(false)
    expect(evaluateCondition(c('agree', 'isNotChecked'), { agree: false })).toBe(true)
  })

  test('contains works on arrays and strings', () => {
    expect(evaluateCondition(c('tags', 'contains', 'a'), { tags: ['a', 'b'] })).toBe(true)
    expect(evaluateCondition(c('tags', 'contains', 'x'), { tags: ['a', 'b'] })).toBe(false)
    expect(evaluateCondition(c('name', 'contains', 'oh'), { name: 'John' })).toBe(true)
  })

  test('isEmpty / isNotEmpty', () => {
    expect(evaluateCondition(c('x', 'isEmpty'), { x: '' })).toBe(true)
    expect(evaluateCondition(c('x', 'isEmpty'), { x: [] })).toBe(true)
    expect(evaluateCondition(c('x', 'isEmpty'), {})).toBe(true)
    expect(evaluateCondition(c('x', 'isNotEmpty'), { x: 'hi' })).toBe(true)
  })

  test('unknown source fails closed (false), never throws', () => {
    expect(evaluateCondition(c('nope', 'equals', '1'), {})).toBe(false)
  })

  test('evaluateNodes ALL vs ANY', () => {
    const values = { a: 1, b: 2 }
    const nodes = [c('a', 'equals', '1'), c('b', 'equals', '99')]
    expect(evaluateNodes('all', nodes, values)).toBe(false)
    expect(evaluateNodes('any', nodes, values)).toBe(true)
  })

  test('evaluateNodes supports one level of grouping (A AND (B OR C))', () => {
    const values = { a: 1, b: 5, cc: 9 }
    const nodes = [
      c('a', 'equals', '1'),
      {
        blockType: 'group' as const,
        match: 'any' as const,
        conditions: [c('b', 'equals', '999'), c('cc', 'equals', '9')],
      },
    ]
    expect(evaluateNodes('all', nodes, values)).toBe(true)
  })

  test('ruleMatches: empty/undefined rule matches (true)', () => {
    expect(ruleMatches(undefined, {})).toBe(true)
    expect(ruleMatches({ enabled: true, conditions: [] }, {})).toBe(true)
  })

  test('ruleMatches evaluates conditions with default match=all', () => {
    const rule: VisibilityRule = {
      enabled: true,
      conditions: [c('country', 'equals', 'UK')],
    }
    expect(ruleMatches(rule, { country: 'UK' })).toBe(true)
    expect(ruleMatches(rule, { country: 'FR' })).toBe(false)
  })

  test('ruleMatches: disabled rule always returns true', () => {
    const rule: VisibilityRule = {
      enabled: false,
      conditions: [c('country', 'equals', 'UK')],
    }
    expect(ruleMatches(rule, { country: 'FR' })).toBe(true)
  })

  test('equals on a missing source fails closed, not "undefined"-matches', () => {
    expect(evaluateCondition(c('ghost', 'equals', 'undefined'), {})).toBe(false)
    expect(evaluateCondition(c('ghost', 'notEquals', 'undefined'), {})).toBe(false)
  })
})

import { buildVisibilityField } from '../src/blocks/fields/visibility.js'

describe('buildVisibilityField', () => {
  const vis = buildVisibilityField({ includeAction: true }) as any

  test('is a group named visibility', () => {
    expect(vis.type).toBe('group')
    expect(vis.name).toBe('visibility')
  })

  test('has enabled, action, match, conditions', () => {
    const names = vis.fields.map((f: any) => f.name)
    expect(names).toContain('enabled')
    expect(names).toContain('action')
    expect(names).toContain('match')
    expect(names).toContain('conditions')
  })

  test('action select offers show and require', () => {
    const action = vis.fields.find((f: any) => f.name === 'action')
    const values = action.options.map((o: any) => o.value)
    expect(values).toContain('show')
    expect(values).toContain('require')
  })

  test('conditions is a blocks field with condition and group blocks', () => {
    const conditions = vis.fields.find((f: any) => f.name === 'conditions')
    expect(conditions.type).toBe('blocks')
    const slugs = conditions.blocks.map((b: any) => b.slug)
    expect(slugs).toContain('condition')
    expect(slugs).toContain('group')
  })

  test('the group block nests only plain conditions (one level)', () => {
    const conditions = vis.fields.find((f: any) => f.name === 'conditions')
    const groupBlock = conditions.blocks.find((b: any) => b.slug === 'group')
    const nested = groupBlock.fields.find((f: any) => f.name === 'conditions')
    expect(nested.type).toBe('blocks')
    expect(nested.blocks.map((b: any) => b.slug)).toEqual(['condition'])
  })

  test('condition source uses the custom picker component', () => {
    const conditions = vis.fields.find((f: any) => f.name === 'conditions')
    const cond = conditions.blocks.find((b: any) => b.slug === 'condition')
    const source = cond.fields.find((f: any) => f.name === 'source')
    expect(source.admin.components.Field.path).toContain('ConditionSourceField')
  })

  test('omits action when includeAction is false (steps)', () => {
    const stepVis = buildVisibilityField({ includeAction: false }) as any
    const names = stepVis.fields.map((f: any) => f.name)
    expect(names).not.toContain('action')
  })
})

describe('visibility wiring', () => {
  test('baseFieldBlockFields includes a visibility group', () => {
    const names = flatFields(baseFieldBlockFields).map((f: any) =>
      'name' in f ? f.name : null,
    )
    expect(names).toContain('visibility')
    const vis = flatFields(baseFieldBlockFields).find(
      (f: any) => f.name === 'visibility',
    ) as any
    expect(vis.type).toBe('group')
  })

  test('every field block exposes visibility (via base fields)', () => {
    const names = flatFields(TextBlock.fields).map((f: any) =>
      'name' in f ? f.name : null,
    )
    expect(names).toContain('visibility')
  })

  test('step config includes a visibility group without an action select', () => {
    const steps = formsCollection.fields.find(
      (f: any) => 'name' in f && f.name === 'steps',
    ) as any
    const vis = steps.fields.find((f: any) => f.name === 'visibility')
    expect(vis?.type).toBe('group')
    const subNames = vis.fields.map((f: any) => f.name)
    expect(subNames).not.toContain('action')
    expect(subNames).toContain('conditions')
  })
})

import {
  isFieldVisible,
  isFieldRequired,
  isStepVisible,
  getVisibleFields,
  getVisibleSteps,
  stripHiddenValues,
} from '../src/utilities/conditions/index.js'
import type { FormFieldBlock, FormStep } from '../src/types.js'

const field = (over: Partial<FormFieldBlock>): FormFieldBlock =>
  ({ name: 'f', label: 'F', blockType: 'text', ...over }) as FormFieldBlock

describe('buildFieldRules requiredOverride', () => {
  test('requiredOverride=true forces required even if field.required is false', () => {
    const rules = buildFieldRules({ label: 'Explain', required: false } as any, true)
    expect(rules.required).toBe('Explain is required')
  })

  test('requiredOverride=false suppresses required even if field.required is true', () => {
    const rules = buildFieldRules({ label: 'X', required: true } as any, false)
    expect(rules.required).toBeUndefined()
  })

  test('omitting requiredOverride keeps existing behavior', () => {
    expect(buildFieldRules({ label: 'X', required: true } as any).required).toBe('X is required')
  })
})

describe('conditions/visibility', () => {
  test('non-conditional field is always visible', () => {
    expect(isFieldVisible(field({ name: 'a' }), {})).toBe(true)
  })

  test('show-action field is hidden until its rule matches', () => {
    const f = field({
      name: 'why',
      visibility: {
        enabled: true,
        action: 'show',
        conditions: [{ source: 'other', operator: 'equals', value: 'yes' }],
      },
    })
    expect(isFieldVisible(f, { other: 'no' })).toBe(false)
    expect(isFieldVisible(f, { other: 'yes' })).toBe(true)
  })

  test('require-action field stays visible but toggles required', () => {
    const f = field({
      name: 'explain',
      required: false,
      visibility: {
        enabled: true,
        action: 'require',
        conditions: [{ source: 'reason', operator: 'equals', value: 'other' }],
      },
    })
    expect(isFieldVisible(f, { reason: 'x' })).toBe(true)
    expect(isFieldRequired(f, { reason: 'x' })).toBe(false)
    expect(isFieldRequired(f, { reason: 'other' })).toBe(true)
  })

  test('base required is respected when no rule', () => {
    expect(isFieldRequired(field({ required: true }), {})).toBe(true)
  })

  test('step visibility + getVisibleSteps skips hidden steps', () => {
    const steps: FormStep[] = [
      { title: 'One', fields: [] },
      {
        title: 'Two',
        fields: [],
        visibility: {
          enabled: true,
          conditions: [{ source: 'wantsTwo', operator: 'isChecked' }],
        },
      },
    ]
    expect(isStepVisible(steps[1]!, { wantsTwo: false })).toBe(false)
    expect(getVisibleSteps(steps, { wantsTwo: false }).map((s) => s.title)).toEqual(['One'])
    expect(getVisibleSteps(steps, { wantsTwo: true }).map((s) => s.title)).toEqual(['One', 'Two'])
  })

  test('getVisibleFields filters hidden fields', () => {
    const step: FormStep = {
      title: 'S',
      fields: [
        field({ name: 'always' }),
        field({
          name: 'maybe',
          visibility: {
            enabled: true,
            action: 'show',
            conditions: [{ source: 'always', operator: 'equals', value: 'go' }],
          },
        }),
      ],
    }
    expect(getVisibleFields(step, { always: 'no' }).map((f) => f.name)).toEqual(['always'])
    expect(getVisibleFields(step, { always: 'go' }).map((f) => f.name)).toEqual(['always', 'maybe'])
  })

  test('stripHiddenValues removes values for hidden fields only', () => {
    const steps: FormStep[] = [
      {
        title: 'S',
        fields: [
          field({ name: 'always' }),
          field({
            name: 'maybe',
            visibility: {
              enabled: true,
              action: 'show',
              conditions: [{ source: 'always', operator: 'equals', value: 'go' }],
            },
          }),
        ],
      },
    ]
    const out = stripHiddenValues(steps, { always: 'no', maybe: 'leaked' })
    expect(out).toEqual({ always: 'no' })
  })
})

describe('buildIndicatorSteps with conditional steps', () => {
  test('drops steps hidden by their visibility rule', () => {
    const form = makeForm({
      steps: [
        { title: 'One', fields: [] },
        {
          title: 'Two',
          fields: [],
          visibility: {
            enabled: true,
            conditions: [{ source: 'go', operator: 'isChecked' }],
          },
        },
      ],
    })
    expect(buildIndicatorSteps(form, { go: false }).map((s) => s.title)).toEqual(['One'])
    expect(buildIndicatorSteps(form, { go: true }).map((s) => s.title)).toEqual(['One', 'Two'])
  })

  test('defaults to all steps visible when no values passed', () => {
    expect(buildIndicatorSteps(makeForm()).map((s) => s.title)).toEqual([
      'Your Trip',
      'Your Details',
    ])
  })
})

import { validateVisibleSubmission } from '../src/utilities/validateVisibleSubmission.js'

describe('validateVisibleSubmission', () => {
  const form = {
    multiStep: false,
    title: 'T',
    fields: [
      { name: 'reason', label: 'Reason', blockType: 'text', required: true },
      {
        name: 'detail',
        label: 'Detail',
        blockType: 'text',
        required: true,
        visibility: {
          enabled: true,
          action: 'show',
          conditions: [{ source: 'reason', operator: 'equals', value: 'other' }],
        },
      },
    ],
  } as any

  test('hidden required field does not error and is stripped', () => {
    const res = validateVisibleSubmission(form, { reason: 'simple', detail: 'sneaky' })
    expect(res.errors).toEqual([])
    expect(res.data).toEqual({ reason: 'simple' })
  })

  test('visible required field left blank errors', () => {
    const res = validateVisibleSubmission(form, { reason: 'other', detail: '' })
    expect(res.errors).toEqual([{ field: 'detail', message: 'Detail is required' }])
  })

  test('require-action field enforced only when rule matches', () => {
    const f = {
      multiStep: false,
      title: 'T',
      fields: [
        { name: 'kind', label: 'Kind', blockType: 'text' },
        {
          name: 'note',
          label: 'Note',
          blockType: 'text',
          visibility: {
            enabled: true,
            action: 'require',
            conditions: [{ source: 'kind', operator: 'equals', value: 'x' }],
          },
        },
      ],
    } as any
    expect(validateVisibleSubmission(f, { kind: 'y', note: '' }).errors).toEqual([])
    expect(validateVisibleSubmission(f, { kind: 'x', note: '' }).errors).toEqual([
      { field: 'note', message: 'Note is required' },
    ])
  })

  test('required field inside a hidden step is not enforced and is stripped', () => {
    const form = {
      multiStep: true,
      title: 'T',
      steps: [
        { title: 'One', fields: [{ name: 'wantsMore', label: 'More?', blockType: 'checkbox' }] },
        {
          title: 'Two',
          visibility: {
            enabled: true,
            conditions: [{ source: 'wantsMore', operator: 'isChecked' }],
          },
          fields: [{ name: 'detail', label: 'Detail', blockType: 'text', required: true }],
        },
      ],
    } as any
    // step two hidden (wantsMore not checked): no error, detail stripped
    const hidden = validateVisibleSubmission(form, { wantsMore: false, detail: '' })
    expect(hidden.errors).toEqual([])
    expect(hidden.data).toEqual({ wantsMore: false })
    // step two visible (wantsMore checked) with blank required: errors
    const shown = validateVisibleSubmission(form, { wantsMore: true, detail: '' })
    expect(shown.errors).toEqual([{ field: 'detail', message: 'Detail is required' }])
  })
})

import {
  collectSourceFields,
  collectSourceNames,
} from '../src/fields/conditions/collectSourceFields.js'

describe('collectSourceFields', () => {
  const state = {
    'fields.0.name': { value: 'travel' },
    'fields.0.blockType': { value: 'yesNo' },
    'fields.1.name': { value: 'colour' },
    'fields.1.blockType': { value: 'select' },
    'fields.1.options.0.label': { value: 'Red' },
    'fields.1.options.0.value': { value: 'red' },
    'fields.1.options.1.label': { value: 'Blue' },
    'fields.1.options.1.value': { value: 'blue' },
    'fields.2.name': { value: 'guests' },
    'fields.2.blockType': { value: 'multiCounter' },
    'fields.2.counters.0.name': { value: 'adults' },
    'fields.3.name': { value: '' }, // unnamed / stub block — excluded
  } as any

  test('collectSourceNames returns sorted names including counter dot-paths', () => {
    expect(collectSourceNames(state)).toEqual(['colour', 'guests.adults', 'travel'])
  })

  test('captures blockType per field', () => {
    const map = collectSourceFields(state)
    expect(map.get('travel')?.blockType).toBe('yesNo')
    expect(map.get('colour')?.blockType).toBe('select')
  })

  test('captures a choice field’s options in order with label fallback', () => {
    const map = collectSourceFields(state)
    expect(map.get('colour')?.options).toEqual([
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
    ])
  })

  test('exposes multiCounter counters as numeric dot-path sources', () => {
    const map = collectSourceFields(state)
    expect(map.get('guests.adults')).toEqual({ blockType: 'number', options: [] })
  })

  test('defaults blockType to text when none is present', () => {
    const map = collectSourceFields({ 'fields.0.name': { value: 'note' } } as any)
    expect(map.get('note')?.blockType).toBe('text')
  })
})

import { AddressBlock } from '../src/blocks/fields/Address.js'
import { isAddressAnswered } from '../src/components/EnquiryForm/fields/AddressField.js'
import { lookupPostcode, toTitleCase } from '../src/utilities/lookupPostcode.js'

/** Stand-in for `fetch` returning a canned postcodes.io body. */
const fakeFetch = (body: unknown): typeof globalThis.fetch =>
  (async () => ({ json: async () => body })) as any

describe('lookupPostcode', () => {
  test('maps a hit to a title-cased address', async () => {
    const result = await lookupPostcode('sw1a1aa', {
      fetchImpl: fakeFetch({
        status: 200,
        result: {
          postcode: 'SW1A 1AA',
          postal_town: 'LONDON',
          admin_county: null,
          admin_district: 'WESTMINSTER',
          country: 'England',
        },
      }),
    })
    expect(result).toEqual({
      status: 'ok',
      address: {
        postcode: 'SW1A 1AA',
        city: 'London',
        county: 'Westminster',
        country: 'England',
      },
    })
  })

  test('falls back to admin_district when there is no postal town', async () => {
    const result = await lookupPostcode('LL55 4UL', {
      fetchImpl: fakeFetch({
        status: 200,
        result: { postcode: 'LL55 4UL', postal_town: null, admin_district: 'GWYNEDD' },
      }),
    })
    expect(result).toMatchObject({ status: 'ok', address: { city: 'Gwynedd' } })
  })

  test('defaults country to United Kingdom when the API omits it', async () => {
    const result = await lookupPostcode('SW1A 1AA', {
      fetchImpl: fakeFetch({ status: 200, result: { postcode: 'SW1A 1AA' } }),
    })
    expect(result).toMatchObject({ address: { country: 'United Kingdom' } })
  })

  test('reports notFound for an unknown postcode', async () => {
    const result = await lookupPostcode('ZZ1 1ZZ', {
      fetchImpl: fakeFetch({ status: 404, result: null }),
    })
    expect(result).toEqual({ status: 'notFound' })
  })

  test('reports notFound for blank input without calling the API', async () => {
    let called = false
    const result = await lookupPostcode('   ', {
      fetchImpl: (async () => {
        called = true
        return { json: async () => ({}) }
      }) as any,
    })
    expect(result).toEqual({ status: 'notFound' })
    expect(called).toBe(false)
  })

  test('reports error rather than throwing when the request fails', async () => {
    const result = await lookupPostcode('SW1A 1AA', {
      fetchImpl: (async () => {
        throw new Error('offline')
      }) as any,
    })
    expect(result).toEqual({ status: 'error' })
  })

  test('toTitleCase normalises shouty place names', () => {
    expect(toTitleCase('NEWCASTLE UPON TYNE')).toBe('Newcastle Upon Tyne')
  })
})

describe('AddressBlock', () => {
  test('carries the shared base field fields, including visibility', () => {
    const names = flatFields(AddressBlock.fields as any[]).map((f) =>
      'name' in f ? f.name : null,
    )
    expect(names).toContain('name')
    expect(names).toContain('label')
    expect(names).toContain('visibility')
  })

  test('exposes its own lookup options', () => {
    const names = flatFields(AddressBlock.fields as any[]).map((f) =>
      'name' in f ? f.name : null,
    )
    expect(names).toContain('defaultCountry')
    expect(names).toContain('showLine2')
    expect(names).toContain('lookupLabel')
  })
})

describe('isAddressAnswered', () => {
  test('an undefined or all-blank address counts as unanswered', () => {
    expect(isAddressAnswered(undefined)).toBe(false)
    expect(
      isAddressAnswered({
        line1: '',
        line2: '',
        city: '  ',
        county: '',
        postcode: '',
        country: '',
      }),
    ).toBe(false)
  })

  test('any filled part counts as answered', () => {
    expect(
      isAddressAnswered({
        line1: '',
        line2: '',
        city: '',
        county: '',
        postcode: 'SW1A 1AA',
        country: '',
      }),
    ).toBe(true)
  })
})

describe('buildZodSchemaFromForm — address', () => {
  const addressField = (required: boolean) =>
    ({
      blockType: 'address',
      name: 'delivery',
      label: 'Delivery address',
      required,
    }) as any

  test('an optional address accepts being left out entirely', () => {
    const schema = buildZodSchemaFromForm([addressField(false)])
    expect(schema.safeParse({}).success).toBe(true)
  })

  test('a required address needs a street line and a postcode', () => {
    const schema = buildZodSchemaFromForm([addressField(true)])
    expect(schema.safeParse({ delivery: { postcode: 'SW1A 1AA' } }).success).toBe(false)
    expect(schema.safeParse({ delivery: { line1: '10 Downing St' } }).success).toBe(false)
    expect(
      schema.safeParse({ delivery: { line1: '10 Downing St', postcode: 'SW1A 1AA' } }).success,
    ).toBe(true)
  })

  test('a required address reports the admin-configured message', () => {
    const schema = buildZodSchemaFromForm([
      { ...addressField(true), validation: { requiredMessage: 'We need a delivery address' } },
    ])
    const result = schema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('We need a delivery address')
    }
  })
})
