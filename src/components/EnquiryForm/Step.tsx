'use client'

import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { EnquiryFormStep, FormFieldBlock } from '../../types.js'
import { getVisibleFields } from '../../utilities/conditions/index.js'
import { AddressField } from './fields/AddressField.js'
import { BudgetRangeField } from './fields/BudgetRangeField.js'
import { CheckboxField } from './fields/CheckboxField.js'
import { EmailInputField } from './fields/EmailInputField.js'
import { MultiCounterField } from './fields/MultiCounterField.js'
import { NumberStepperField } from './fields/NumberStepperField.js'
import { OptionCardsField } from './fields/OptionCardsField.js'
import { PhoneInputField } from './fields/PhoneInputField.js'
import { SelectField } from './fields/SelectField.js'
import { TextInputField } from './fields/TextInputField.js'
import { TextareaField } from './fields/TextareaField.js'
import { YesNoField } from './fields/YesNoField.js'

type Props = {
  step: EnquiryFormStep
  form: UseFormReturn<Record<string, unknown>>
}

/** Width getter — only some field blocks expose a `width` property. */
function getFieldWidth(field: FormFieldBlock): 'full' | 'half' | 'third' {
  if ('width' in field && field.width === 'half') return 'half'
  if ('width' in field && field.width === 'third') return 'third'
  return 'full'
}

function renderField(
  field: FormFieldBlock,
  form: UseFormReturn<Record<string, unknown>>,
): ReactNode {
  switch (field.blockType) {
    case 'yesNo':
      return <YesNoField field={field} form={form} />
    case 'optionCards':
      return <OptionCardsField field={field} form={form} />
    case 'numberStepper':
      return <NumberStepperField field={field} form={form} />
    case 'multiCounter':
      return <MultiCounterField field={field} form={form} />
    case 'budgetRange':
      return <BudgetRangeField field={field} form={form} />
    case 'text':
      return <TextInputField field={field} form={form} />
    case 'email':
      return <EmailInputField field={field} form={form} />
    case 'phone':
      return <PhoneInputField field={field} form={form} />
    case 'textarea':
      return <TextareaField field={field} form={form} />
    case 'select':
      return <SelectField field={field} form={form} />
    case 'checkbox':
      return <CheckboxField field={field} form={form} />
    case 'address':
      return <AddressField field={field} form={form} />
    default:
      return null
  }
}

/**
 * Group consecutive fields whose `width` is `'half'` or `'third'` into a single
 * `<div class="enquiry-form__row">`. Full-width fields (or fields without a
 * `width`) render on their own row.
 */
function groupRows(fields: FormFieldBlock[]): FormFieldBlock[][] {
  const rows: FormFieldBlock[][] = []
  let current: FormFieldBlock[] = []
  let currentWidth: 'half' | 'third' | null = null

  for (const field of fields) {
    const width = getFieldWidth(field)
    if (width === 'full') {
      if (current.length) {
        rows.push(current)
        current = []
        currentWidth = null
      }
      rows.push([field])
      continue
    }

    if (currentWidth && currentWidth !== width) {
      rows.push(current)
      current = []
    }
    currentWidth = width
    current.push(field)
  }
  if (current.length) rows.push(current)
  return rows
}

export function Step({ step, form }: Props) {
  const values = form.watch()
  const visibleFields = getVisibleFields(step, values)
  const rows = groupRows(visibleFields)
  return (
    <div className="enquiry-form__step">
      {rows.map((rowFields, i) => {
        const width = getFieldWidth(rowFields[0]!)
        if (rowFields.length === 1 && width === 'full') {
          const field = rowFields[0]!
          return (
            <div key={field.id ?? field.name ?? i} className="enquiry-form__field-wrapper">
              {renderField(field, form)}
            </div>
          )
        }
        return (
          <div
            key={i}
            className={`enquiry-form__row enquiry-form__row--${width}`}
            data-width={width}
          >
            {rowFields.map((field) => (
              <div
                key={field.id ?? field.name}
                className={`enquiry-form__field-wrapper enquiry-form__field-wrapper--${width}`}
              >
                {renderField(field, form)}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
