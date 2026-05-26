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
