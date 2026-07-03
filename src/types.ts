import type { Block, RichTextField } from 'payload'
import type { Resolver, UseFormReturn } from 'react-hook-form'
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

/**
 * Optional, admin-configurable validation rules. Applied via `buildFieldRules`
 * to RHF's `register(..., rules)` and merged with the form-level resolver if
 * one is provided.
 */
export type FieldValidation = {
  requiredMessage?: string | null
  // Text-shaped (text, email, phone, textarea, select)
  minLength?: number | null
  maxLength?: number | null
  pattern?: string | null
  patternMessage?: string | null
  // Numeric-shaped (number, numberStepper, multiCounter total)
  min?: number | null
  max?: number | null
  minMessage?: string | null
  maxMessage?: string | null
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
  validation?: FieldValidation | null
}

// ---------------------------------------------------------------------------
// Field block types (discriminated union on blockType)
// ---------------------------------------------------------------------------

/** Width of an input within a step. Consecutive non-`'full'` fields in `Step`
 *  are grouped into the same row. */
export type FieldWidth = 'full' | 'half' | 'third'

export type TextBlock = BaseFieldBlock & {
  blockType: 'text'
  placeholder?: string | null
  width?: FieldWidth | null
}

export type EmailBlock = BaseFieldBlock & {
  blockType: 'email'
  placeholder?: string | null
  width?: FieldWidth | null
}

export type PhoneBlock = BaseFieldBlock & {
  blockType: 'phone'
  placeholder?: string | null
  width?: FieldWidth | null
  /** ISO/dial value of the default selected country (e.g. `"+44"`). */
  defaultCountry?: string | null
  /** Country options for the picker. `value` should be the dial code so the
   *  field can build an E.164 number. Defaults to a small built-in list. */
  countries?: SelectOption[] | null
}

export type TextareaBlock = BaseFieldBlock & {
  blockType: 'textarea'
  placeholder?: string | null
  rows?: number | null
}

export type CheckboxBlock = BaseFieldBlock & {
  blockType: 'checkbox'
  /** Visual presentation. Defaults to `'checkbox'`. Data shape is unchanged. */
  appearance?: 'checkbox' | 'switch' | null
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
  width?: FieldWidth | null
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
  /** Optional icon shown in the StepIndicator when this step is complete.
   *  Falls back to a built-in tick icon. */
  completedIcon?: MediaObject | null
  introContent?: unknown
  fields: FormFieldBlock[]
  /** Per-step override for the "Back" button label. */
  backLabel?: string | null
  /** Per-step override for the "Next" (or "Submit" on the final step) button label. */
  nextLabel?: string | null
}

export type FormButtonLabels = {
  back?: string | null
  next?: string | null
  submit?: string | null
  /** Label for the "Back" button on the final step. Falls back to `back`. */
  backLast?: string | null
}

export type AdditionalContent = {
  enabled?: boolean | null
  position?: 'above' | 'below' | null
  content?: unknown
}

/** Optional synthetic final stage shown in the step indicator (only) of a
 *  multi-stage form, representing the post-submit confirmation screen. It is
 *  never a navigable field step. */
export type ConfirmationStage = {
  enabled?: boolean | null
  /** Label shown under the stage dot. Falls back to "Confirmation". */
  label?: string | null
  /** Icon shown in the indicator for the confirmation stage. */
  icon?: MediaObject | null
}

export type FormDocument = {
  id: string
  title: string
  slug: string
  /** Whether this form is authored as multiple stages. When false (the
   *  default), fields live on the top-level `fields` array instead of `steps`. */
  multiStep?: boolean | null
  /** Flat field list used by single-stage forms (`multiStep` falsy). The API
   *  response always also exposes a normalized `steps` array. */
  fields?: FormFieldBlock[] | null
  steps: FormStep[]
  /** Optional confirmation stage appended to the step indicator only (does not
   *  add a navigable step). Only meaningful for multi-stage forms. */
  confirmationStage?: ConfirmationStage | null
  additionalContent?: AdditionalContent | null
  /** Document-level overrides for navigation button labels. Per-step `backLabel`
   *  / `nextLabel` take precedence over these. */
  buttonLabels?: FormButtonLabels | null
  submissionActions: SubmissionActionBlock[]
  updatedAt: string
  createdAt: string
}

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

/** Arbitrary, JSON-serialisable context recorded against the submission.
 *  Not rendered; not part of `data`. Stored verbatim on the submission. */
export type EnquirySubmissionContext = Record<string, unknown>

export type SubmitResult = {
  success: true
  actions: {
    confirmationMessage?: unknown
    redirectUrl?: string
  }
  /** ID of the created submission, when the endpoint returns it. */
  submissionId?: string
}

export type SubmitError = {
  success: false
  errors: Array<{ field: string; message: string }>
}

// ---------------------------------------------------------------------------
// Plugin config
// ---------------------------------------------------------------------------

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
  /**
   * Editor applied to the consumer-facing rich-text fields — the confirmation
   * message and the additional content. Pass a configured `lexicalEditor(...)`
   * to enable custom Lexical blocks/features in those fields. When omitted, the
   * fields fall back to the Payload root editor. Does not affect a step's intro
   * content (which keeps its own headings-enabled editor).
   */
  richTextEditor?: RichTextField['editor']
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
  /**
   * Optional render function for the per-step `introContent` rich text.
   * Called for each step; return `null`/`undefined` to render nothing.
   */
  renderStepIntro?: (step: FormStep, index: number) => ReactNode
  /**
   * Optional render function for the confirmation message after a successful
   * submission. Receives the raw `confirmationMessage` payload (typically
   * Lexical JSON) plus the full `SubmitResult`. If omitted, a default
   * "Form submitted successfully." message is shown.
   */
  renderConfirmation?: (message: unknown, result: SubmitResult) => ReactNode
  /**
   * Optional react-hook-form `Resolver` (e.g. `zodResolver(schema)`). Runs
   * alongside the per-field admin rules — RHF natively merges both, so either
   * source can flag a field as invalid.
   */
  resolver?: Resolver<Record<string, unknown>>
  /**
   * Arbitrary, JSON-serialisable context recorded against the submission
   * (e.g. hotel/itinerary/offer reference). Not rendered and not part of
   * `data` — stored verbatim on the submission.
   */
  context?: EnquirySubmissionContext
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
