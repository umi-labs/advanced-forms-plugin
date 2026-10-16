'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { SelectOption } from '../../../types.js'
import { countryFromLabel } from '../../../utilities/countryFromLabel.js'
import { flagSrc } from '../../../utilities/flagAssets.js'

type Props = {
  countries: SelectOption[]
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  ariaLabel: string
  id?: string
}

/**
 * The dial-code picker, as a listbox rather than a `<select>`.
 *
 * It was a native select with a flag emoji inside each `<option>` label, which
 * rendered differently on every platform — Windows shows letter pairs rather
 * than flags at all. Real artwork cannot go in an `<option>`, so showing it
 * means owning the dropdown.
 *
 * That buys accessibility back by hand, which the native control gave for
 * free, so: the trigger is a button with `aria-haspopup="listbox"`, the list
 * is a `listbox` of `option`s with `aria-selected` and `aria-activedescendant`,
 * arrow keys and Home/End move the active option, typing jumps to a country by
 * name, Enter or Space selects, Escape closes and returns focus to the trigger,
 * and a click outside closes it. Everything the select did, deliberately
 * re-stated.
 */
export function CountrySelect({
  countries,
  value,
  onChange,
  onBlur,
  ariaLabel,
  id,
}: Props) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef<{ query: string; at: number }>({ query: '', at: 0 })
  const listboxId = useId()

  const parsed = useMemo(
    () => countries.map((c) => ({ ...c, ...countryFromLabel(c.label) })),
    [countries],
  )

  const selectedIndex = Math.max(
    0,
    parsed.findIndex((c) => c.value === value),
  )
  const selected = parsed[selectedIndex]

  // Opening lands on the current selection rather than the top of the list.
  useEffect(() => {
    if (open) setActiveIndex(selectedIndex)
  }, [open, selectedIndex])

  // Keep the active option in view when the list is longer than its box.
  useEffect(() => {
    if (!open) return
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        onBlur()
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, onBlur])

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const commit = (index: number) => {
    const next = parsed[index]
    if (next) onChange(next.value)
    close()
  }

  /** Jump to the first country whose name starts with what has been typed. */
  const onTypeahead = (key: string) => {
    const now = Date.now()
    const query = now - typeahead.current.at > 700 ? key : typeahead.current.query + key
    typeahead.current = { query, at: now }

    const found = parsed.findIndex((c) => c.text.toLowerCase().startsWith(query.toLowerCase()))
    if (found >= 0) {
      setActiveIndex(found)
      if (!open) commit(found)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!open) return setOpen(true)
        return setActiveIndex((i) => Math.min(i + 1, parsed.length - 1))
      case 'ArrowUp':
        event.preventDefault()
        if (!open) return setOpen(true)
        return setActiveIndex((i) => Math.max(i - 1, 0))
      case 'Home':
        if (!open) return
        event.preventDefault()
        return setActiveIndex(0)
      case 'End':
        if (!open) return
        event.preventDefault()
        return setActiveIndex(parsed.length - 1)
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!open) return setOpen(true)
        return commit(activeIndex)
      case 'Escape':
        if (!open) return
        event.preventDefault()
        return close()
      case 'Tab':
        if (open) close(false)
        return
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          onTypeahead(event.key)
        }
    }
  }

  return (
    <div className="enquiry-field__country" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className="enquiry-field__country-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (!open) onBlur()
        }}
      >
        <Flag code={selected?.code ?? null} />
        <span className="enquiry-field__country-text">{selected?.text ?? value}</span>
      </button>

      {open && (
        <ul
          id={listboxId}
          ref={listRef}
          className="enquiry-field__country-list"
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={`${listboxId}-${activeIndex}`}
        >
          {parsed.map((country, index) => (
            <li
              // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard is handled on the trigger, which keeps focus
              key={`${country.value}-${country.label}`}
              id={`${listboxId}-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={[
                'enquiry-field__country-option',
                index === activeIndex ? 'enquiry-field__country-option--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
            >
              <Flag code={country.code} />
              <span className="enquiry-field__country-text">{country.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Decorative: the country name sits next to it, so a screen reader announcing
 * the flag as well would just say everything twice.
 */
function Flag({ code }: { code: string | null }) {
  if (!code) return <span className="enquiry-field__country-flag" aria-hidden="true" />
  return (
    <img
      className="enquiry-field__country-flag"
      src={flagSrc(code)}
      alt=""
      aria-hidden="true"
      loading="lazy"
      width={20}
      height={14}
    />
  )
}
