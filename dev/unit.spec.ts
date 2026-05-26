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
