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

  test('includes name, label, required, and tooltip fields', () => {
    const names = flatFields(baseFieldBlockFields).map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('name')
    expect(names).toContain('label')
    expect(names).toContain('required')
    expect(names).toContain('tooltip')
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
  test('has placeholder field', () => {
    const names = PhoneBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
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
  test('has only base fields', () => {
    const extraNames = flatFields(CheckboxBlock.fields)
      .map((f) => ('name' in f ? f.name : null))
      .filter((n) => !['name', 'label', 'required', 'tooltip'].includes(n as string))
    expect(extraNames).toHaveLength(0)
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
