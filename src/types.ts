import type { Block } from 'payload'
import type { UseFormReturn } from 'react-hook-form'
import type { ReactNode } from 'react'

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

export type TextBlock = BaseFieldBlock & {
  blockType: 'text'
  placeholder?: string | null
  width?: 'full' | 'half' | null
}

export type EmailBlock = BaseFieldBlock & {
  blockType: 'email'
  placeholder?: string | null
}

export type PhoneBlock = BaseFieldBlock & {
  blockType: 'phone'
  placeholder?: string | null
}

export type TextareaBlock = BaseFieldBlock & {
  blockType: 'textarea'
  placeholder?: string | null
  rows?: number | null
}

export type CheckboxBlock = BaseFieldBlock & {
  blockType: 'checkbox'
}

export type RadioGroupBlock = BaseFieldBlock & {
  blockType: 'radioGroup'
  options?: SelectOption[] | null
  layout?: 'row' | 'grid' | null
}

export type CheckboxGroupBlock = BaseFieldBlock & {
  blockType: 'checkboxGroup'
  options?: SelectOption[] | null
  layout?: 'row' | 'grid' | null
}

export type SelectBlock = BaseFieldBlock & {
  blockType: 'select'
  placeholder?: string | null
  options?: SelectOption[] | null
}

export type NumberBlock = BaseFieldBlock & {
  blockType: 'number'
  placeholder?: string | null
  defaultValue?: number | null
  min?: number | null
  max?: number | null
  step?: number | null
}

export type DateBlock = BaseFieldBlock & {
  blockType: 'date'
  placeholder?: string | null
  min?: string | null
  max?: string | null
}

export type FileBlock = BaseFieldBlock & {
  blockType: 'file'
  accept?: string | null
  maxSizeMB?: number | null
  collection?: string | null
}

// Custom / extension field block types (can be used via the `fields` config option)

export type YesNoBlock = BaseFieldBlock & { blockType: 'yesNo' }

export type OptionCardsBlock = BaseFieldBlock & {
  blockType: 'optionCards'
  options?: SelectOption[] | null
  layout?: 'row' | 'grid' | null
}

export type NumberStepperBlock = BaseFieldBlock & {
  blockType: 'numberStepper'
  placeholder?: string | null
  defaultValue?: number | null
  min?: number | null
  max?: number | null
  step?: number | null
}

export type MultiCounterItem = {
  name: string
  label: string
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

export type FormFieldBlock =
  | TextBlock
  | EmailBlock
  | PhoneBlock
  | TextareaBlock
  | CheckboxBlock
  | RadioGroupBlock
  | CheckboxGroupBlock
  | SelectBlock
  | NumberBlock
  | DateBlock
  | FileBlock
  | YesNoBlock
  | OptionCardsBlock
  | NumberStepperBlock
  | MultiCounterBlock
  | BudgetRangeBlock

// ---------------------------------------------------------------------------
// Submission action block types
// ---------------------------------------------------------------------------

export type SendEmailActionBlock = {
  id?: string
  blockType: 'sendEmail'
  to: string
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
// FormDocument aggregate (formerly EnquiryForm)
// ---------------------------------------------------------------------------

export type FormStep = {
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

export type FormDocument = {
  id: string
  title: string
  slug: string
  steps: FormStep[]
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
// Plugin config
// ---------------------------------------------------------------------------

export type SendEmailOptions = {
  to: string
  replyTo?: string
  subject: string
  html: string
  submissionData: Record<string, unknown>
  formTitle: string
}

export type BuiltInFieldSlug =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'checkbox'
  | 'radioGroup'
  | 'checkboxGroup'
  | 'select'
  | 'number'
  | 'date'
  | 'file'

export type FieldsConfig = Record<string, boolean | { block: Block } | undefined>

export type FormPluginConfig = {
  disabled?: boolean
  baseUrl?: string
  sendEmail?: (opts: SendEmailOptions) => Promise<void>
  /** Slug of the Payload media collection used for step icons. Defaults to 'media'. */
  mediaCollection?: string
  collections?: {
    /** Slug for the forms collection. Defaults to 'forms'. */
    forms?: string
    /** Slug for the submissions collection. Defaults to 'form-submissions'. */
    submissions?: string
  }
  /** Override admin labels for the plugin's collections. */
  labels?: {
    /** Singular label for the forms collection. Defaults to 'Form'. */
    forms?: string
    /** Singular label for the submissions collection. Defaults to 'Form Submission'. */
    submissions?: string
  }
  /**
   * Configure which field blocks are available in the form builder.
   * - Omit key or set to `true`: include default block
   * - Set to `false`: exclude block
   * - Set to `{ block: MyBlock }`: replace default block with custom
   * - Add a new key with `{ block: MyBlock }`: add custom block type
   */
  fields?: FieldsConfig
}

// ---------------------------------------------------------------------------
// Frontend component props
// ---------------------------------------------------------------------------

export type FormProps = {
  form: FormDocument
  apiBase?: string
  className?: string
  onSuccess?: (result: SubmitResult) => void
  onError?: (error: SubmitError) => void
  additionalContent?: ReactNode
}

// ---------------------------------------------------------------------------
// Frontend component hook return type
// ---------------------------------------------------------------------------

export type UseEnquiryFormReturn = {
  currentStep: number
  totalSteps: number
  stepData: FormStep
  form: UseFormReturn<Record<string, unknown>>
  goNext: () => Promise<boolean>
  goBack: () => void
  submit: () => Promise<SubmitResult>
  isSubmitting: boolean
  isComplete: boolean
  result: SubmitResult | null
  error: SubmitError | null
}

// ---------------------------------------------------------------------------
// Legacy type aliases (renamed from earlier versions)
// ---------------------------------------------------------------------------

export type TextInputBlock = TextBlock
export type EmailInputBlock = EmailBlock
export type CheckboxInputBlock = CheckboxBlock
export type SelectInputBlock = SelectBlock
export type TextareaInputBlock = TextareaBlock
export type EnquiryFormProps = FormProps
export type EnquiryFormStep = FormStep
export type EnquiryForm = FormDocument
