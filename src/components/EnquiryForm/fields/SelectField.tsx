'use client'

import type { UseFormReturn } from 'react-hook-form'

import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

import type { SelectInputBlock } from '../../../types.js'

import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: SelectInputBlock; form: UseFormReturn<Record<string, unknown>> }

/** A mouse or trackpad: where a styled list beats the native menu. Phones keep their picker wheel. */
const useFinePointer = () => {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    setFine(query.matches)
    const onChange = () => setFine(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return fine
}

/**
 * The native `<select>` is always the form's input, so validation and form state are unchanged.
 * On desktop a styled list sits over it (most browsers can't style the native menu); on touch
 * screens the native picker stays, which is the better control there.
 */
export function SelectField({ field, form }: Props) {
  const {
    formState: { errors },
    register,
    setValue,
    watch,
  } = form
  const error = errors[field.name]
  const fine = useFinePointer()
  const id = `field-${field.name}`
  const options = field.options ?? []
  const registration = register(
    field.name,
    buildFieldRules(field, isFieldRequired(field, form.getValues())),
  )

  return (
    <div className="enquiry-field enquiry-field--select">
      <label className="enquiry-field__label" htmlFor={id} id={`${id}-label`}>
        {field.label}
        {field.required && (
          <span aria-hidden="true" className="enquiry-field__required">
            *
          </span>
        )}
        {field.tooltip?.enabled && field.tooltip.text && <FieldTooltip text={field.tooltip.text} />}
      </label>
      <select
        aria-hidden={fine || undefined}
        className={[
          'enquiry-field__select',
          error ? 'enquiry-field__select--error' : '',
          fine ? 'enquiry-field__select--behind' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        // Server HTML too: start on the placeholder before hydration.
        defaultValue={field.placeholder ? '' : undefined}
        id={fine ? undefined : id}
        tabIndex={fine ? -1 : undefined}
        {...registration}
        // Validation focuses the first invalid field: pass that on to the list's button.
        onFocus={fine ? () => document.getElementById(id)?.focus() : undefined}
      >
        {field.placeholder && (
          <option disabled value="">
            {field.placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {fine && (
        <Listbox
          error={Boolean(error)}
          id={id}
          onChange={(value) =>
            setValue(field.name, value, { shouldDirty: true, shouldValidate: true })
          }
          options={options}
          placeholder={field.placeholder ?? undefined}
          // Unset until the visitor picks, the native select shows its first option
          value={
            (watch(field.name) as string | undefined) ??
            (field.placeholder ? '' : options[0]?.value) ??
            ''
          }
        />
      )}
      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}

type Option = { label: string; value: string }

function Listbox({
  id,
  error,
  onChange,
  options,
  placeholder,
  value,
}: {
  error: boolean
  id: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  value: string
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typed = useRef({ at: 0, text: '' })
  const selected = options.findIndex((o) => o.value === value)

  const show = () => {
    setActive(Math.max(0, selected))
    setOpen(true)
  }
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) {buttonRef.current?.focus()}
  }
  const choose = (i: number) => {
    const option = options[i]
    if (option) {onChange(option.value)}
    close()
  }

  // Clicks outside close it
  useEffect(() => {
    if (!open) {return}
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {close(false)}
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // Keep the highlighted option in view, and the list focused while open
  useEffect(() => {
    if (!open) {return}
    listRef.current?.focus()
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  const onKeyDown = (e: KeyboardEvent) => {
    const last = options.length - 1
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(last, active + 1),
      ArrowUp: () => Math.max(0, active - 1),
      End: () => last,
      Home: () => 0,
    }
    if (!open) {
      if ([' ', 'ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        e.preventDefault()
        show()
      }
      return
    }
    if (moves[e.key]) {
      e.preventDefault()
      setActive(moves[e.key]())
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(active)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    } else if (e.key === 'Tab') {
      close(false)
    } else if (e.key.length === 1) {
      // Type-ahead: letters typed within a second jump to the first match
      const now = Date.now()
      typed.current = {
        at: now,
        text: (now - typed.current.at < 1000 ? typed.current.text : '') + e.key.toLowerCase(),
      }
      const match = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text))
      if (match !== -1) {setActive(match)}
    }
  }

  return (
    <div className="enquiry-field__listbox" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${id}-label ${id}`}
        className={[
          'enquiry-field__select',
          'enquiry-field__listbox-button',
          error ? 'enquiry-field__select--error' : '',
          selected === -1 ? 'enquiry-field__listbox-button--empty' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        id={id}
        onClick={() => (open ? close() : show())}
        onKeyDown={onKeyDown}
        ref={buttonRef}
        type="button"
      >
        {options[selected]?.label ?? placeholder ?? 'Choose…'}
      </button>
      {open && (
        <ul
          aria-activedescendant={`${id}-option-${active}`}
          aria-labelledby={`${id}-label`}
          className="enquiry-field__listbox-list"
          onKeyDown={onKeyDown}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option, i) => (
            // Keys are handled on the list (aria-activedescendant), as a listbox should
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              aria-selected={i === selected}
              className={[
                'enquiry-field__listbox-option',
                i === active ? 'enquiry-field__listbox-option--active' : '',
                i === selected ? 'enquiry-field__listbox-option--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-index={i}
              id={`${id}-option-${i}`}
              key={option.value}
              onClick={() => choose(i)}
              onPointerMove={() => setActive(i)}
              role="option"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
