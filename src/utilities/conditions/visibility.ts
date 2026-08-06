import type { FormFieldBlock, FormStep } from '../../types.js'
import { ruleMatches } from './evaluateRule.js'

export function isFieldVisible(
  field: FormFieldBlock,
  values: Record<string, unknown>,
): boolean {
  const rule = field.visibility
  if (!rule?.enabled || (rule.action ?? 'show') !== 'show') return true
  return ruleMatches(rule, values)
}

export function isFieldRequired(
  field: FormFieldBlock,
  values: Record<string, unknown>,
): boolean {
  if (field.required) return true
  const rule = field.visibility
  if (rule?.enabled && rule.action === 'require') return ruleMatches(rule, values)
  return false
}

export function isStepVisible(step: FormStep, values: Record<string, unknown>): boolean {
  const rule = step.visibility
  if (!rule?.enabled) return true
  return ruleMatches(rule, values)
}

export function getVisibleFields(
  step: FormStep,
  values: Record<string, unknown>,
): FormFieldBlock[] {
  return (step.fields ?? []).filter((f) => isFieldVisible(f, values))
}

export function getVisibleSteps(
  steps: FormStep[],
  values: Record<string, unknown>,
): FormStep[] {
  return steps.filter((s) => isStepVisible(s, values))
}

/** Return a shallow copy of `values` with keys for currently-hidden fields removed. */
export function stripHiddenValues(
  steps: FormStep[],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...values }
  for (const step of steps) {
    const stepVisible = isStepVisible(step, values)
    for (const f of step.fields ?? []) {
      if (!f?.name) continue
      if (!stepVisible || !isFieldVisible(f, values)) {
        delete out[f.name]
      }
    }
  }
  return out
}
