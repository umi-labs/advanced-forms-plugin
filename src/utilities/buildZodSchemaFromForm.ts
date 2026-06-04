import { z, type ZodTypeAny } from 'zod'

import type {
  BaseFieldBlock,
  FieldValidation,
  FormDocument,
  FormFieldBlock,
} from '../types.js'

/**
 * Function that returns a Zod schema for a single field block. Use via
 * {@link BuildZodSchemaOptions.fieldSchemas} to add schemas for custom field
 * blocks (registered through the plugin's `fields` config) or to override a
 * built-in field's schema entirely.
 *
 * The returned schema is used as the value type at `field.name` on the
 * top-level form object.
 */
export type FieldSchemaBuilder = (field: FormFieldBlock) => ZodTypeAny

export type BuildZodSchemaOptions = {
  /**
   * Per-`blockType` overrides. If a builder returns a schema, it is used
   * instead of the built-in for that field's `blockType`. Unknown blockTypes
   * resolve to `z.unknown()` unless an override is supplied.
   */
  fieldSchemas?: Partial<Record<string, FieldSchemaBuilder>>
}

type AnyFieldBlock = FormFieldBlock & {
  validation?: FieldValidation | null
}

/**
 * Build a Zod object schema mirroring a form's runtime data shape. Walks every
 * step's fields and creates a top-level property per field keyed by
 * `field.name`. Designed to be passed straight to `zodResolver` from
 * `@hookform/resolvers/zod` (or any equivalent), e.g.:
 *
 * ```ts
 * const schema = buildZodSchemaFromForm(form)
 * <EnquiryForm form={form} resolver={zodResolver(schema)} />
 * ```
 *
 * Numeric inputs (`number`, `numberStepper`, `multiCounter`) are typed as
 * `z.number()` with no coercion — register them with
 * `{ valueAsNumber: true }` (or supply your own coercion via `fieldSchemas`)
 * so RHF passes numbers to the resolver.
 *
 * Accepts either a full `FormDocument` (or anything with a `steps` array) or
 * a raw `FormFieldBlock[]` for ad-hoc use.
 */
export function buildZodSchemaFromForm(
  form: Pick<FormDocument, 'steps'> | FormFieldBlock[],
  options: BuildZodSchemaOptions = {},
): z.ZodObject<Record<string, ZodTypeAny>> {
  const fields: FormFieldBlock[] = Array.isArray(form)
    ? form
    : (form.steps ?? []).flatMap((step) => step.fields ?? [])

  const shape: Record<string, ZodTypeAny> = {}
  for (const field of fields) {
    if (!field?.name) continue
    const override = options.fieldSchemas?.[field.blockType]
    shape[field.name] = override
      ? override(field)
      : buildFieldSchema(field as AnyFieldBlock)
  }
  return z.object(shape)
}

function buildFieldSchema(field: AnyFieldBlock): ZodTypeAny {
  switch (field.blockType) {
    case 'text':
    case 'textarea':
    case 'phone':
      return stringSchema(field)
    case 'email':
      return stringSchema(field, { email: true })
    case 'date':
      return stringSchema(field)
    case 'select':
    case 'radioGroup':
    case 'yesNo':
    case 'optionCards':
    case 'budgetRange':
      return enumSchema(field)
    case 'checkbox':
      return checkboxSchema(field)
    case 'checkboxGroup':
      return checkboxGroupSchema(field)
    case 'number':
    case 'numberStepper':
      return numberSchema(field)
    case 'multiCounter':
      return multiCounterSchema(field)
    case 'file':
      return fileSchema(field)
    default:
      return z.unknown()
  }
}

function requiredMessage(field: BaseFieldBlock): string {
  return field.validation?.requiredMessage ?? `${field.label} is required`
}

function stringSchema(
  field: AnyFieldBlock,
  opts: { email?: boolean } = {},
): ZodTypeAny {
  const v = field.validation ?? {}
  let schema: z.ZodString = z.string()
  if (opts.email) {
    schema = schema.email(`${field.label} must be a valid email`)
  }
  if (typeof v.minLength === 'number') {
    schema = schema.min(
      v.minLength,
      `${field.label} must be at least ${v.minLength} characters`,
    )
  }
  if (typeof v.maxLength === 'number') {
    schema = schema.max(
      v.maxLength,
      `${field.label} must be at most ${v.maxLength} characters`,
    )
  }
  if (v.pattern) {
    try {
      schema = schema.regex(
        new RegExp(v.pattern),
        v.patternMessage ?? `${field.label} is not valid`,
      )
    } catch {
      // ignore malformed regex from the CMS
    }
  }
  if (field.required) {
    return schema.min(1, requiredMessage(field))
  }
  // Allow empty string (RHF returns '' for cleared inputs) and undefined.
  return z.union([z.literal(''), schema]).optional()
}

function enumSchema(field: AnyFieldBlock): ZodTypeAny {
  const schema = z.string()
  if (field.required) {
    return schema.min(1, requiredMessage(field))
  }
  return z.union([z.literal(''), schema]).optional()
}

function checkboxSchema(field: AnyFieldBlock): ZodTypeAny {
  if (field.required) {
    return z.boolean().refine((v) => v === true, {
      message: requiredMessage(field),
    })
  }
  return z.boolean().optional()
}

function checkboxGroupSchema(field: AnyFieldBlock): ZodTypeAny {
  const arr = z.array(z.string())
  if (field.required) {
    return arr.min(1, requiredMessage(field))
  }
  return arr.optional()
}

function numberSchema(field: AnyFieldBlock): ZodTypeAny {
  const v = field.validation ?? {}
  let schema: z.ZodNumber = z.number()
  if (typeof v.min === 'number') {
    schema = schema.min(v.min, v.minMessage ?? `${field.label} must be ≥ ${v.min}`)
  }
  if (typeof v.max === 'number') {
    schema = schema.max(v.max, v.maxMessage ?? `${field.label} must be ≤ ${v.max}`)
  }
  return field.required ? schema : schema.optional()
}

function multiCounterSchema(field: AnyFieldBlock): ZodTypeAny {
  if (field.blockType !== 'multiCounter') return z.unknown()
  const counters = field.counters ?? []
  const shape: Record<string, ZodTypeAny> = {}
  for (const c of counters) {
    let s: z.ZodNumber = z.number()
    if (typeof c.min === 'number') {
      s = s.min(c.min, `${c.label} must be ≥ ${c.min}`)
    }
    if (typeof c.max === 'number') {
      s = s.max(c.max, `${c.label} must be ≤ ${c.max}`)
    }
    shape[c.name] = s
  }
  let object: ZodTypeAny = z.object(shape)
  const v = field.validation ?? {}
  if (typeof v.min === 'number' || typeof v.max === 'number') {
    object = object.superRefine((value, ctx) => {
      const total = Object.values(value as Record<string, number>).reduce(
        (sum, n) => sum + (typeof n === 'number' ? n : 0),
        0,
      )
      if (typeof v.min === 'number' && total < v.min) {
        ctx.addIssue({
          code: 'custom',
          message: v.minMessage ?? `${field.label} total must be ≥ ${v.min}`,
        })
      }
      if (typeof v.max === 'number' && total > v.max) {
        ctx.addIssue({
          code: 'custom',
          message: v.maxMessage ?? `${field.label} total must be ≤ ${v.max}`,
        })
      }
    })
  }
  return object
}

function fileSchema(field: AnyFieldBlock): ZodTypeAny {
  // File inputs vary wildly across consumers (File, FileList, URL string,
  // Payload upload ID). Keep validation to presence-only and let consumers
  // override via `fieldSchemas` for stricter rules.
  if (field.required) {
    return z.unknown().refine(
      (value) => {
        if (value == null) return false
        if (typeof value === 'string') return value.length > 0
        if (Array.isArray(value) || value instanceof FileList) {
          return value.length > 0
        }
        return true
      },
      { message: requiredMessage(field) },
    )
  }
  return z.unknown().optional()
}
