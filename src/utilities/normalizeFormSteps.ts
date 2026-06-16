import type { FormDocument, FormFieldBlock, FormStep } from '../types.js'

/**
 * Shape accepted by {@link normalizeFormSteps}. A form can store its fields in
 * one of two ways:
 *
 * - **Single-stage** (default): a flat `fields` array on the document, with
 *   `multiStep` falsy.
 * - **Multi-stage**: a `steps` array, each step carrying its own `fields`,
 *   with `multiStep` truthy.
 */
type NormalizableForm = Partial<Pick<FormDocument, 'multiStep' | 'steps' | 'title'>> & {
  fields?: FormFieldBlock[] | null
}

/**
 * Collapse a form document into the canonical `FormStep[]` shape the runtime
 * (and public API response) always expects, regardless of how it was authored
 * in the admin.
 *
 * Multi-stage forms pass their `steps` through unchanged. Single-stage forms
 * are wrapped into a single synthetic step using their top-level `fields`. For
 * backwards-compatibility with forms authored before the single-stage option
 * existed, a form with no top-level `fields` falls back to any `steps` present.
 */
export function normalizeFormSteps(form: NormalizableForm): FormStep[] {
  if (form.multiStep) {
    return form.steps ?? []
  }

  const fields = form.fields ?? []
  if (fields.length === 0 && (form.steps?.length ?? 0) > 0) {
    // Legacy document authored as steps before single-stage existed.
    return form.steps as FormStep[]
  }

  return [
    {
      title: form.title ?? '',
      fields,
    },
  ]
}
