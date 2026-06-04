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
import { ConfirmationMessageBlock } from '../src/blocks/submissionActions/ConfirmationMessage.js'
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
