import type { ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'

// ---------------------------------------------------------------------------
// Shared sub-types
// ---------------------------------------------------------------------------

export type FieldTooltip = {
  enabled?: boolean | null
  text?: string | null
}

export type MediaObject = {
  id: string
  url?: string | null
  alt?: string | null
}

export type SelectOption = {
  id?: string
  label: string
  value: string
}

// ---------------------------------------------------------------------------
// Base — all field blocks extend this
// ---------------------------------------------------------------------------

export type BaseFieldBlock = {
  id?: string
  name: string
  label: string
  required?: boolean | null
  tooltip?: FieldTooltip | null
}

// ---------------------------------------------------------------------------
// Field block types (discriminated union on blockType)
// ---------------------------------------------------------------------------

export type YesNoBlock = BaseFieldBlock & {
  blockType: 'yesNo'
}

export type OptionCardsBlock = BaseFieldBlock & {
  blockType: 'optionCards'
  options?: SelectOption[] | null
  layout?: 'row' | 'grid' | null
}

export type NumberStepperBlock = BaseFieldBlock & {
  blockType: 'numberStepper'
  defaultValue?: number | null
  min?: number | null
  max?: number | null
  step?: number | null
  placeholder?: string | null
}

export type MultiCounterItem = {
  id?: string
  label: string
  name: string
  defaultValue?: number | null
  min?: number | null
  max?: number | null
}

export type MultiCounterBlock = BaseFieldBlock & {
  blockType: 'multiCounter'
  counters?: MultiCounterItem[] | null
}

export type BudgetRangeBlock = BaseFieldBlock & {
  blockType: 'budgetRange'
  options?: SelectOption[] | null
}

export type TextInputBlock = BaseFieldBlock & {
  blockType: 'textInput'
  placeholder?: string | null
  inputType?: 'text' | 'tel' | null
}

export type EmailInputBlock = BaseFieldBlock & {
  blockType: 'emailInput'
  placeholder?: string | null
}

export type TextareaInputBlock = BaseFieldBlock & {
  blockType: 'textareaInput'
  placeholder?: string | null
  rows?: number | null
}

export type SelectInputBlock = BaseFieldBlock & {
  blockType: 'selectInput'
  placeholder?: string | null
  options?: SelectOption[] | null
}

export type CheckboxInputBlock = BaseFieldBlock & {
  blockType: 'checkboxInput'
}

export type FormFieldBlock =
  | YesNoBlock
  | OptionCardsBlock
  | NumberStepperBlock
  | MultiCounterBlock
  | BudgetRangeBlock
  | TextInputBlock
  | EmailInputBlock
  | TextareaInputBlock
  | SelectInputBlock
  | CheckboxInputBlock

// ---------------------------------------------------------------------------
// Submission action block types
// ---------------------------------------------------------------------------

export type SendEmailActionBlock = {
  id?: string
  blockType: 'sendEmail'
  to: string
  from: string
  replyTo?: string | null
  subject: string
  includeSubmissionData?: boolean | null
}

export type ConfirmationMessageActionBlock = {
  id?: string
  blockType: 'confirmationMessage'
  message?: unknown
}

export type RedirectActionBlock = {
  id?: string
  blockType: 'redirect'
  url: string
  delay?: number | null
}

export type SubmissionActionBlock =
  | SendEmailActionBlock
  | ConfirmationMessageActionBlock
  | RedirectActionBlock

// ---------------------------------------------------------------------------
// EnquiryForm aggregate
// ---------------------------------------------------------------------------

export type EnquiryFormStep = {
  id?: string
  title: string
  icon?: MediaObject | null
  fields: FormFieldBlock[]
}

export type AdditionalContent = {
  enabled?: boolean | null
  position?: 'above' | 'below' | null
  content?: unknown
}

export type EnquiryForm = {
  id: string
  title: string
  slug: string
  steps: EnquiryFormStep[]
  additionalContent?: AdditionalContent | null
  submissionActions: SubmissionActionBlock[]
  updatedAt: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export type SubmitResult = {
  success: true
  actions: {
    confirmationMessage?: unknown
    redirectUrl?: string
  }
}

export type SubmitError = {
  success: false
  errors: Array<{ field: string; message: string }>
}

// ---------------------------------------------------------------------------
// Plugin config (also re-exported from index.ts)
// ---------------------------------------------------------------------------

export type SendEmailOptions = {
  to: string
  from: string
  replyTo?: string
  subject: string
  html: string
  submissionData: Record<string, unknown>
  formTitle: string
}

export type FormPluginConfig = {
  disabled?: boolean
  baseUrl?: string
  sendEmail?: (opts: SendEmailOptions) => Promise<void>
  /** Slug of the media collection used for step icons. Defaults to 'media'. */
  mediaCollection?: string
  collections?: {
    forms?: string
    submissions?: string
  }
}

// ---------------------------------------------------------------------------
// Frontend component props (used in Plans 4 & 5)
// ---------------------------------------------------------------------------

export type EnquiryFormProps = {
  form: EnquiryForm
  apiBase?: string
  className?: string
  onSuccess?: (result: SubmitResult) => void
  onError?: (error: SubmitError) => void
  additionalContent?: ReactNode
}

export type UseEnquiryFormReturn = {
  currentStep: number
  totalSteps: number
  stepData: EnquiryFormStep
  form: UseFormReturn<Record<string, unknown>>
  goNext: () => Promise<boolean>
  goBack: () => void
  submit: () => Promise<SubmitResult>
  isSubmitting: boolean
  isComplete: boolean
  result: SubmitResult | null
  error: SubmitError | null
}
