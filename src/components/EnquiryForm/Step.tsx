'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { EnquiryFormStep } from '../../types.js'
import { BudgetRangeField } from './fields/BudgetRangeField.js'
import { CheckboxField } from './fields/CheckboxField.js'
import { EmailInputField } from './fields/EmailInputField.js'
import { MultiCounterField } from './fields/MultiCounterField.js'
import { NumberStepperField } from './fields/NumberStepperField.js'
import { OptionCardsField } from './fields/OptionCardsField.js'
import { SelectField } from './fields/SelectField.js'
import { TextInputField } from './fields/TextInputField.js'
import { TextareaField } from './fields/TextareaField.js'
import { YesNoField } from './fields/YesNoField.js'

type Props = {
  step: EnquiryFormStep
  form: UseFormReturn<Record<string, unknown>>
}

export function Step({ step, form }: Props) {
  return (
    <div className="enquiry-form__step">
      {step.fields.map((field) => {
        switch (field.blockType) {
          case 'yesNo':
            return <YesNoField key={field.id ?? field.name} field={field} form={form} />
          case 'optionCards':
            return <OptionCardsField key={field.id ?? field.name} field={field} form={form} />
          case 'numberStepper':
            return <NumberStepperField key={field.id ?? field.name} field={field} form={form} />
          case 'multiCounter':
            return <MultiCounterField key={field.id ?? field.name} field={field} form={form} />
          case 'budgetRange':
            return <BudgetRangeField key={field.id ?? field.name} field={field} form={form} />
          case 'text':
            return <TextInputField key={field.id ?? field.name} field={field} form={form} />
          case 'email':
            return <EmailInputField key={field.id ?? field.name} field={field} form={form} />
          case 'textarea':
            return <TextareaField key={field.id ?? field.name} field={field} form={form} />
          case 'select':
            return <SelectField key={field.id ?? field.name} field={field} form={form} />
          case 'checkbox':
            return <CheckboxField key={field.id ?? field.name} field={field} form={form} />
          default:
            return null
        }
      })}
    </div>
  )
}
