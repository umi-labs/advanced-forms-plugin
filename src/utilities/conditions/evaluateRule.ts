import type {
  Condition,
  ConditionMatch,
  ConditionNode,
  VisibilityRule,
} from '../../types.js'

/** Resolve a possibly dot-pathed source key against the values object. */
export function resolveValue(source: string, values: Record<string, unknown>): unknown {
  if (!source) return undefined
  return source.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, values)
}

function isChecked(actual: unknown): boolean {
  return actual === true || actual === 'true'
}

function isEmpty(actual: unknown): boolean {
  if (actual === undefined || actual === null || actual === '') return true
  if (Array.isArray(actual)) return actual.length === 0
  return false
}

/** Evaluate a single leaf condition. Never throws — bad input yields false. */
export function evaluateCondition(
  cond: Condition,
  values: Record<string, unknown>,
): boolean {
  const actual = resolveValue(cond.source, values)
  const expected = cond.value ?? ''

  switch (cond.operator) {
    case 'equals':
      return String(actual) === String(expected)
    case 'notEquals':
      return String(actual) !== String(expected)
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const a = Number(actual)
      const b = Number(expected)
      if (Number.isNaN(a) || Number.isNaN(b)) return false
      if (cond.operator === 'gt') return a > b
      if (cond.operator === 'gte') return a >= b
      if (cond.operator === 'lt') return a < b
      return a <= b
    }
    case 'isChecked':
      return isChecked(actual)
    case 'isNotChecked':
      return !isChecked(actual)
    case 'contains':
      if (Array.isArray(actual)) return actual.map(String).includes(String(expected))
      if (typeof actual === 'string') return actual.includes(String(expected))
      return false
    case 'isEmpty':
      return isEmpty(actual)
    case 'isNotEmpty':
      return !isEmpty(actual)
    default:
      return false
  }
}

function isGroup(node: ConditionNode): node is Extract<ConditionNode, { blockType: 'group' }> {
  return (node as { blockType?: string }).blockType === 'group'
}

/** Evaluate an array of nodes (conditions or one-level groups) with a combinator. */
export function evaluateNodes(
  match: ConditionMatch,
  nodes: ConditionNode[],
  values: Record<string, unknown>,
): boolean {
  if (!nodes || nodes.length === 0) return true
  const results = nodes.map((node) => {
    if (isGroup(node)) {
      return evaluateNodes(node.match ?? 'all', node.conditions ?? [], values)
    }
    return evaluateCondition(node, values)
  })
  return match === 'any' ? results.some(Boolean) : results.every(Boolean)
}

/** Whether a visibility rule's conditions are satisfied. Empty/disabled → true. */
export function ruleMatches(
  rule: VisibilityRule | null | undefined,
  values: Record<string, unknown>,
): boolean {
  if (!rule) return true
  const nodes = rule.conditions ?? []
  if (nodes.length === 0) return true
  return evaluateNodes(rule.match ?? 'all', nodes, values)
}
