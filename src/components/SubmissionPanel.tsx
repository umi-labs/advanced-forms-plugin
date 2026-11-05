'use client'

import type React from 'react'

import { useField } from '@payloadcms/ui'
import { useState } from 'react'

import type { PanelGroup, PanelItem } from '../utilities/describeSubmission.js'

import styles from './SubmissionPanel.module.css'

type Cell = { tone?: PanelItem['tone']; value: string } | string

export type SubmissionPanelProps = {
  /** Shows an Edit button; items with `edit` then become inputs saved with the document. */
  editable?: boolean
  /** Shown when there are no groups and no table rows. */
  empty?: string
  groups?: PanelGroup[]
  heading: string
  id: string
  intro?: string
  table?: { columns: string[]; rows: Cell[][] }
}

/**
 * The read-only card used across the submission page: labelled values in a grid, optionally
 * grouped, optionally a table. With `editable`, answers can be corrected in place.
 */
export const SubmissionPanel = ({
  id,
  editable,
  empty = 'Nothing here yet.',
  groups = [],
  heading,
  intro,
  table,
}: SubmissionPanelProps) => {
  const [editing, setEditing] = useState(false)
  const isEmpty = !groups.some((g) => g.items.length) && !table?.rows.length

  return (
    <section aria-labelledby={id} className={styles.panel}>
      <header className={styles.header}>
        <h3 className={styles.heading} id={id}>
          {heading}
        </h3>
        {editable && !isEmpty && (
          <button className={styles.toggle} onClick={() => setEditing(!editing)} type="button">
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </header>
      {intro && <p className={styles.intro}>{intro}</p>}
      {editing && (
        <p className={styles.intro}>
          Changes are kept when you save. Fix a typo here, then resend.
        </p>
      )}
      {isEmpty && <p className={styles.muted}>{empty}</p>}
      {groups.map(
        (group, i) =>
          group.items.length > 0 && (
            <div className={styles.group} key={i}>
              {group.title && <h4 className={styles.groupTitle}>{group.title}</h4>}
              <dl className={styles.list}>
                {group.items.map((item, j) => (
                  <div className={item.wide ? styles.wide : undefined} key={j}>
                    <dt>{item.label}</dt>
                    <dd>
                      {item.edit ? (
                        <EditableValue edit={item.edit} editing={editing} item={item} />
                      ) : (
                        <Value item={item} />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ),
      )}
      {table && table.rows.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => {
                    const { tone, value } =
                      typeof cell === 'string' ? { tone: undefined, value: cell } : cell
                    return (
                      <td key={j}>
                        {tone ? <span className={styles[tone]}>{value}</span> : value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

const Value = ({ item }: { item: Pick<PanelItem, 'href' | 'tone' | 'value'> }) => {
  if (!item.value) {
    return <span className={styles.muted}>Not given</span>
  }
  if (item.href) {
    return (
      <a
        href={item.href}
        rel="noreferrer"
        target={item.href.startsWith('http') ? '_blank' : undefined}
      >
        {item.value}
      </a>
    )
  }
  return item.tone ? <span className={styles[item.tone]}>{item.value}</span> : <>{item.value}</>
}

/** Bound to the answer's row in the document form, so Save stores the correction. */
const EditableValue = ({
  edit,
  editing,
  item,
}: {
  edit: NonNullable<PanelItem['edit']>
  editing: boolean
  item: PanelItem
}) => {
  const { initialValue, setValue, value } = useField<string>({ path: edit.path })
  const current = value ?? ''

  if (!editing) {
    // Until saved, show what was typed rather than the stored answer.
    if (current === (initialValue ?? '')) {
      return <Value item={item} />
    }
    const label = edit.options?.find((o) => o.value === current)?.label ?? current
    return (
      <>
        <Value item={{ value: label }} /> <span className={styles.changed}>(changed)</span>
      </>
    )
  }

  const props = {
    'aria-label': item.label,
    className: styles.input,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValue(e.target.value),
    value: current,
  }
  if (edit.options) {
    return (
      <select {...props}>
        <option value="">Not given</option>
        {edit.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  return edit.multiline ? <textarea rows={5} {...props} /> : <input type="text" {...props} />
}
