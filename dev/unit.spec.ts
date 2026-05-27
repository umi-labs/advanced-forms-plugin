import { describe, expect, test } from 'vitest'
import { baseFieldBlockFields } from '../src/blocks/fields/shared.js'

describe('baseFieldBlockFields', () => {
  test('exports an array', () => {
    expect(Array.isArray(baseFieldBlockFields)).toBe(true)
  })

  test('includes name, label, required, and tooltip fields', () => {
    const names = baseFieldBlockFields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('name')
    expect(names).toContain('label')
    expect(names).toContain('required')
    expect(names).toContain('tooltip')
  })

  test('name field is required text', () => {
    const field = baseFieldBlockFields.find((f) => 'name' in f && f.name === 'name')
    expect(field).toMatchObject({ type: 'text', required: true })
  })

  test('label field is required text', () => {
    const field = baseFieldBlockFields.find((f) => 'name' in f && f.name === 'label')
    expect(field).toMatchObject({ type: 'text', required: true })
  })

  test('tooltip group has enabled checkbox and conditional text', () => {
    const tooltip = baseFieldBlockFields.find((f) => 'name' in f && f.name === 'tooltip') as any
    expect(tooltip?.type).toBe('group')
    const subNames = tooltip?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('enabled')
    expect(subNames).toContain('text')
  })
})

import { YesNoBlock } from '../src/blocks/fields/YesNo.js'
import { TextInputBlock } from '../src/blocks/fields/TextInput.js'
import { EmailInputBlock } from '../src/blocks/fields/EmailInput.js'
import { TextareaInputBlock } from '../src/blocks/fields/TextareaInput.js'
import { CheckboxInputBlock } from '../src/blocks/fields/CheckboxInput.js'

describe('YesNoBlock', () => {
  test('has slug yesNo', () => expect(YesNoBlock.slug).toBe('yesNo'))
  test('has all base fields', () => {
    const names = YesNoBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('name')
    expect(names).toContain('label')
    expect(names).toContain('required')
    expect(names).toContain('tooltip')
  })
})

describe('TextInputBlock', () => {
  test('has slug textInput', () => expect(TextInputBlock.slug).toBe('textInput'))
  test('has placeholder and inputType fields', () => {
    const names = TextInputBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('inputType')
  })
  test('inputType select has text and tel options', () => {
    const inputType = TextInputBlock.fields.find((f) => 'name' in f && f.name === 'inputType') as any
    expect(inputType?.type).toBe('select')
    const values = inputType?.options?.map((o: any) => o.value)
    expect(values).toContain('text')
    expect(values).toContain('tel')
  })
})

describe('EmailInputBlock', () => {
  test('has slug emailInput', () => expect(EmailInputBlock.slug).toBe('emailInput'))
  test('has placeholder field', () => {
    const names = EmailInputBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
  })
})

describe('TextareaInputBlock', () => {
  test('has slug textareaInput', () => expect(TextareaInputBlock.slug).toBe('textareaInput'))
  test('has placeholder and rows fields', () => {
    const names = TextareaInputBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('rows')
  })
})

describe('CheckboxInputBlock', () => {
  test('has slug checkboxInput', () => expect(CheckboxInputBlock.slug).toBe('checkboxInput'))
  test('has only base fields (no extras)', () => {
    const extraNames = CheckboxInputBlock.fields
      .map((f) => ('name' in f ? f.name : null))
      .filter((n) => !['name', 'label', 'required', 'tooltip'].includes(n as string))
    expect(extraNames).toHaveLength(0)
  })
})

import { OptionCardsBlock } from '../src/blocks/fields/OptionCards.js'
import { BudgetRangeBlock } from '../src/blocks/fields/BudgetRange.js'
import { NumberStepperBlock } from '../src/blocks/fields/NumberStepper.js'
import { MultiCounterBlock } from '../src/blocks/fields/MultiCounter.js'
import { SelectInputBlock } from '../src/blocks/fields/SelectInput.js'

describe('OptionCardsBlock', () => {
  test('has slug optionCards', () => expect(OptionCardsBlock.slug).toBe('optionCards'))
  test('has options array field', () => {
    const options = OptionCardsBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    expect(options?.type).toBe('array')
    const subNames = options?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('value')
  })
  test('has layout select with row and grid', () => {
    const layout = OptionCardsBlock.fields.find((f) => 'name' in f && f.name === 'layout') as any
    expect(layout?.type).toBe('select')
    const values = layout?.options?.map((o: any) => o.value)
    expect(values).toContain('row')
    expect(values).toContain('grid')
  })
})

describe('BudgetRangeBlock', () => {
  test('has slug budgetRange', () => expect(BudgetRangeBlock.slug).toBe('budgetRange'))
  test('has options array field', () => {
    const options = BudgetRangeBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    expect(options?.type).toBe('array')
  })
})

describe('NumberStepperBlock', () => {
  test('has slug numberStepper', () => expect(NumberStepperBlock.slug).toBe('numberStepper'))
  test('has defaultValue, min, max, step, placeholder fields', () => {
    const names = NumberStepperBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('defaultValue')
    expect(names).toContain('min')
    expect(names).toContain('max')
    expect(names).toContain('step')
    expect(names).toContain('placeholder')
  })
  test('defaultValue defaults to 0', () => {
    const field = NumberStepperBlock.fields.find((f) => 'name' in f && f.name === 'defaultValue') as any
    expect(field?.defaultValue).toBe(0)
  })
  test('step defaults to 1', () => {
    const field = NumberStepperBlock.fields.find((f) => 'name' in f && f.name === 'step') as any
    expect(field?.defaultValue).toBe(1)
  })
})

describe('MultiCounterBlock', () => {
  test('has slug multiCounter', () => expect(MultiCounterBlock.slug).toBe('multiCounter'))
  test('has counters array with required label and name sub-fields', () => {
    const counters = MultiCounterBlock.fields.find((f) => 'name' in f && f.name === 'counters') as any
    expect(counters?.type).toBe('array')
    expect(counters?.minRows).toBe(1)
    const subNames = counters?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('name')
    expect(subNames).toContain('defaultValue')
    expect(subNames).toContain('min')
    expect(subNames).toContain('max')
  })
})

describe('SelectInputBlock', () => {
  test('has slug selectInput', () => expect(SelectInputBlock.slug).toBe('selectInput'))
  test('has placeholder and options fields', () => {
    const names = SelectInputBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('placeholder')
    expect(names).toContain('options')
  })
  test('options array has label and value sub-fields', () => {
    const options = SelectInputBlock.fields.find((f) => 'name' in f && f.name === 'options') as any
    const subNames = options?.fields?.map((f: any) => f.name)
    expect(subNames).toContain('label')
    expect(subNames).toContain('value')
  })
})

import { SendEmailBlock } from '../src/blocks/submissionActions/SendEmail.js'
import { ConfirmationMessageBlock } from '../src/blocks/submissionActions/ConfirmationMessage.js'
import { RedirectBlock } from '../src/blocks/submissionActions/Redirect.js'

describe('SendEmailBlock', () => {
  test('has slug sendEmail', () => expect(SendEmailBlock.slug).toBe('sendEmail'))
  test('has to, from, replyTo, subject, includeSubmissionData fields', () => {
    const names = SendEmailBlock.fields.map((f) => ('name' in f ? f.name : null))
    expect(names).toContain('to')
    expect(names).toContain('from')
    expect(names).toContain('replyTo')
    expect(names).toContain('subject')
    expect(names).toContain('includeSubmissionData')
  })
  test('to, from, and subject are required', () => {
    const toField = SendEmailBlock.fields.find((f) => 'name' in f && f.name === 'to') as any
    const fromField = SendEmailBlock.fields.find((f) => 'name' in f && f.name === 'from') as any
    const subjectField = SendEmailBlock.fields.find((f) => 'name' in f && f.name === 'subject') as any
    expect(toField?.required).toBe(true)
    expect(fromField?.required).toBe(true)
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
    expect(buildFormURL({ slug: 'my-form' })).toBe('/api/enquiry-form-data/my-form')
  })

  test('returns absolute URL when baseUrl given', () => {
    expect(buildFormURL({ slug: 'my-form', baseUrl: 'https://example.com' }))
      .toBe('https://example.com/api/enquiry-form-data/my-form')
  })

  test('respects custom formsSlug', () => {
    expect(buildFormURL({ slug: 'my-form', formsSlug: 'forms' }))
      .toBe('/api/forms/my-form')
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

  test('JSON-stringifies object values (e.g. multiCounter)', () => {
    const result = sanitizeSubmission({ guests: { adults: 2, children: 0 } })
    expect(result).toEqual([
      { fieldName: 'guests', value: '{"adults":2,"children":0}' },
    ])
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
