type Row = { fieldName?: null | string; value?: null | string }

type FieldLike = {
  blockType?: string
  counters?: { label?: null | string; name?: null | string }[] | null
  fields?: FieldLike[] | null
  label?: null | string
  name?: null | string
  options?: { label?: null | string; value?: null | string }[] | null
}

type FormLike = {
  fields?: FieldLike[] | null
  steps?: { fields?: FieldLike[] | null; title?: null | string }[] | null
} | null

export type PanelItem = {
  /** Set when the value can be changed in the admin: the form path and how to edit it. */
  edit?: { multiline?: boolean; options?: { label: string; value: string }[]; path: string }
  /** `mailto:`, `tel:` or web link for the value, when it is one. */
  href?: string
  label: string
  tone?: 'bad' | 'good'
  value: string
  /** Takes the full row: long text. */
  wide?: boolean
}

export type PanelGroup = { items: PanelItem[]; title?: string }

export type Answer = { name: string } & PanelItem

export type AnswerGroup = { answers: Answer[]; title?: string }

const key = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '')

const humanise = (name: string) =>
  name
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())

function parse(value: string): unknown {
  if (!/^[[{]/.test(value)) {
    return value
  }
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function format(raw: string, field?: FieldLike): Pick<Answer, 'href' | 'value'> {
  const value = parse(raw.trim())
  const optionLabel = (v: unknown) =>
    field?.options?.find((o) => o.value === String(v))?.label?.trim() || String(v)

  if (Array.isArray(value)) {
    return { value: value.map(optionLabel).join(', ') }
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    // Phone fields store { country, number, e164 }
    if (typeof record.e164 === 'string' && record.e164) {
      return {
        href: `tel:${record.e164}`,
        value: [record.country, record.number].filter(Boolean).join(' '),
      }
    }
    return {
      value: Object.entries(record)
        .filter(([, v]) => v !== '' && v !== null && v !== undefined)
        .map(([k, v]) => {
          const counter = field?.counters?.find((c) => c.name === k)
          return `${counter?.label?.trim() || humanise(k)}: ${String(v)}`
        })
        .join(' · '),
    }
  }

  const text = String(value)
  if (!text) {
    return { value: '' }
  }
  if (field?.blockType === 'checkbox' || field?.blockType === 'yesNo') {
    if (text === 'true') {
      return { value: 'Yes' }
    }
    if (text === 'false') {
      return { value: 'No' }
    }
  }
  if (!/\s/.test(text) && /^[^@]+@[^@]+$/.test(text)) {
    return { href: `mailto:${text}`, value: text }
  }
  return { value: optionLabel(text) }
}

/**
 * How an answer is corrected in the admin: a choice from the form's options, Yes/No, or text.
 * Structured answers (phone, counters, address) are stored as JSON and are left alone.
 */
function editFor(raw: string, index: number, field?: FieldLike): PanelItem['edit'] {
  if (typeof parse(raw.trim()) === 'object') {
    return undefined
  }
  const path = `data.${index}.value`
  if (field?.blockType === 'checkbox' || field?.blockType === 'yesNo') {
    return {
      options: [
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ],
      path,
    }
  }
  const options = field?.options
    ?.filter((o) => o.value)
    .map((o) => ({ label: o.label?.trim() || o.value!, value: o.value! }))
  if (options?.length) {
    // Keep an answer the form no longer offers, so opening the editor doesn't change it.
    if (raw && !options.some((o) => o.value === raw)) {
      options.push({ label: raw, value: raw })
    }
    return { options, path }
  }
  return { multiline: field?.blockType === 'textarea' || raw.length > 80, path }
}

function collect(fields: FieldLike[] | null | undefined, into: Map<string, FieldLike>) {
  for (const field of fields ?? []) {
    if (field.name) {
      into.set(field.name, field)
    }
    collect(field.fields, into)
  }
}

/**
 * Pairs each stored answer with its question on the form: labelled, option values shown as their
 * labels, JSON answers (phone, counters, address) spelled out. Grouped by step on multi-step forms;
 * answers the form no longer has (or never had, e.g. added by the site) come last.
 */
export function describeSubmission(form: FormLike, rows: null | Row[] | undefined): AnswerGroup[] {
  const byName = new Map<string, { index: number; value: string }>()
  for (const [index, row] of (rows ?? []).entries()) {
    if (row.fieldName) {
      byName.set(row.fieldName, { index, value: row.value ?? '' })
    }
  }

  const answer = (name: string, field?: FieldLike): Answer => {
    const { index, value: raw } = byName.get(name)!
    const shown = format(raw, field)
    return {
      name,
      label: field?.label?.trim() || humanise(name),
      ...shown,
      edit: editFor(raw, index, field),
      wide: shown.value.length > 80 || field?.blockType === 'textarea',
    }
  }

  const sections = form?.steps?.length
    ? form.steps.map((step) => ({ fields: step.fields, title: step.title?.trim() || undefined }))
    : [{ fields: form?.fields, title: undefined }]

  const groups: AnswerGroup[] = []
  const used = new Set<string>()
  for (const section of sections) {
    const fields = new Map<string, FieldLike>()
    collect(section.fields, fields)
    const answers: Answer[] = []
    for (const [name, field] of fields) {
      if (!byName.has(name) || used.has(name)) {
        continue
      }
      used.add(name)
      answers.push(answer(name, field))
    }
    if (answers.length) {
      groups.push({ answers, title: section.title })
    }
  }

  const rest = [...byName.keys()].filter((name) => !used.has(name)).map((name) => answer(name))
  if (rest.length) {
    groups.push({ answers: rest, title: groups.length ? 'Other answers' : undefined })
  }
  return groups
}

/**
 * A readable title for a submission: the person's name, else their email, else the date.
 * Looks for answers named like "name", "full-name" or "first-name" + "last-name", and "email".
 */
export function submissionTitle(doc: {
  createdAt?: null | string
  data?: null | Row[]
  submittedAt?: null | string
}): string {
  const answers = new Map<string, string>()
  for (const row of doc.data ?? []) {
    const value = row.value?.trim()
    if (row.fieldName && value) {
      answers.set(key(row.fieldName), value)
    }
  }

  const name =
    answers.get('name') ||
    answers.get('fullname') ||
    answers.get('yourname') ||
    [answers.get('firstname'), answers.get('lastname') || answers.get('surname')]
      .filter(Boolean)
      .join(' ')
  if (name) {
    return name
  }

  const email = [...answers.entries()].find(([k, v]) => k.includes('email') && v.includes('@'))
  if (email) {
    return email[1]
  }

  const date = doc.submittedAt || doc.createdAt
  return date
    ? new Date(date).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Europe/London',
      })
    : 'Submission'
}

const CONTEXT_LABELS: Record<string, string> = {
  fbclid: 'Facebook click ID',
  gclid: 'Google click ID',
  msclkid: 'Microsoft click ID',
}

const contextLabel = (key: string) => CONTEXT_LABELS[key] || humanise(key).replace(/^Utm /, 'UTM ')

const asLink = (value: string) => (/^https?:\/\//.test(value) ? value : undefined)

/**
 * The request a submission came with (page, IP, browser) and its context, flattened: each object
 * in the context becomes its own group, e.g. the `hidden` tracking values.
 */
export function describeDetails(doc: {
  context?: null | Record<string, unknown>
  metadata?: { ip?: null | string; referrer?: null | string; userAgent?: null | string } | null
}): PanelGroup[] {
  const meta = doc.metadata ?? {}
  const visit: PanelItem[] = [
    { href: asLink(meta.referrer ?? ''), label: 'Came from', value: meta.referrer ?? '' },
    { label: 'IP address', value: meta.ip ?? '' },
    { label: 'Browser', value: meta.userAgent ?? '', wide: true },
  ]
  const groups: PanelGroup[] = [{ items: visit }]

  const toItem = ([key, value]: [string, unknown]): PanelItem => {
    const text =
      typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '')
    return { href: asLink(text), label: contextLabel(key), value: text, wide: text.length > 80 }
  }
  const top: PanelItem[] = []
  for (const [key, value] of Object.entries(doc.context ?? {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const items = Object.entries(value).map(toItem)
      if (items.length) {
        groups.push({ items, title: key === 'hidden' ? 'Tracking' : humanise(key) })
      }
    } else {
      top.push(toItem([key, value]))
    }
  }
  if (top.length) {
    groups.splice(1, 0, { items: top, title: 'Context' })
  }
  return groups
}
