'use client'

import type { UseFormReturn } from 'react-hook-form'

import { useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { enGB } from 'react-day-picker/locale'

import type { TravelDateBlock } from '../../../types.js'

import { buildFieldRules } from '../../../utilities/buildFieldRules.js'
import { isFieldRequired } from '../../../utilities/conditions/index.js'
import { MONTHS, parseTravelDate } from '../../../utilities/travelDate.js'
import { FieldTooltip } from '../FieldTooltip.js'

type Props = { field: TravelDateBlock; form: UseFormReturn<Record<string, unknown>> }

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
// Noon, so a timezone never slips the day
const fromISO = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : undefined

/**
 * "When would you like to travel?": a button that opens a calendar in the site's colours, with a
 * choice of picking a whole month (a year of month buttons) or an exact day. Our own panel rather
 * than native selects and `input[type="date"]`, whose menus can't be styled in most browsers.
 *
 * The value is `YYYY-MM` or `YYYY-MM-DD` (see parseTravelDate). Nothing before this month (or
 * today) can be picked, nor anything past `yearsAhead` years from now.
 */
export function TravelDateField({ field, form }: Props) {
  const {
    formState: { errors },
    register,
    setValue,
    watch,
  } = form
  const error = errors[field.name]
  const value = (watch(field.name) as string | undefined) ?? ''
  const parsed = parseTravelDate(value)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 12)
  const lastYear = now.getFullYear() + (field.yearsAhead ?? 3)
  const lastMonth = new Date(lastYear, 11, 1, 12)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'date' | 'month'>(parsed?.kind ?? 'month')
  // The year shown in month mode, and the month shown in date mode
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(thisMonth)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const set = (next: string) =>
    setValue(field.name, next, { shouldDirty: true, shouldValidate: true })
  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) {triggerRef.current?.focus()}
  }

  const openPanel = () => {
    // Start where the answer is, or at this month
    const from = parsed ? new Date(`${parsed.from}T12:00:00`) : thisMonth
    setMode(parsed?.kind ?? mode)
    setYear(from.getFullYear())
    setMonth(new Date(from.getFullYear(), from.getMonth(), 1, 12))
    setOpen(true)
  }

  // On open, scroll just enough to show the whole panel, keeping the field on screen
  useEffect(() => {
    if (!open) {return}
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current?.getBoundingClientRect()
      const trigger = triggerRef.current?.getBoundingClientRect()
      if (!panel || !trigger) {return}
      const overflow = panel.bottom + 16 - window.innerHeight
      if (overflow <= 0) {return}
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollBy({
        behavior: reduce ? 'auto' : 'smooth',
        top: Math.min(overflow, trigger.top - 16),
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Escape and clicks outside close it
  useEffect(() => {
    if (!open) {return}
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {return}
      e.preventDefault()
      e.stopPropagation()
      close()
    }
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {close(false)}
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const id = `field-${field.name}`
  const required = isFieldRequired(field, form.getValues())
  const shown =
    parsed?.kind === 'date'
      ? new Date(`${parsed.from}T12:00:00`).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          weekday: 'short',
          year: 'numeric',
        })
      : parsed?.label

  // Previous / next: a year at a time for months, a month at a time for days
  const step = (dir: -1 | 1) =>
    mode === 'month'
      ? setYear(year + dir)
      : setMonth(new Date(month.getFullYear(), month.getMonth() + dir, 1, 12))
  const atStart = mode === 'month' ? year <= now.getFullYear() : month <= thisMonth
  const atEnd = mode === 'month' ? year >= lastYear : month >= lastMonth

  return (
    <div className="enquiry-field enquiry-field--travel-date" ref={rootRef}>
      <div className="enquiry-field__label" id={`${id}-label`}>
        {field.label}
        {required && (
          <span aria-hidden="true" className="enquiry-field__required">
            *
          </span>
        )}
        {field.tooltip?.enabled && field.tooltip.text && <FieldTooltip text={field.tooltip.text} />}
      </div>
      <input type="hidden" {...register(field.name, buildFieldRules(field, required))} />
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-labelledby={`${id}-label ${id}`}
        className={[
          'enquiry-field__input',
          'enquiry-field__calendar-trigger',
          error ? 'enquiry-field__input--error' : '',
          shown ? '' : 'enquiry-field__calendar-trigger--empty',
        ]
          .filter(Boolean)
          .join(' ')}
        id={id}
        onClick={() => (open ? close(false) : openPanel())}
        ref={triggerRef}
        type="button"
      >
        <span>{shown ?? 'Choose a month or a date'}</span>
        <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
          <rect
            height="13.5"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
            width="15"
            x="2.5"
            y="4"
          />
          <path
            d="M2.5 8.5h15M6.5 2v3.5M13.5 2v3.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>

      {open && (
        <div
          aria-label={field.label}
          className="enquiry-field__calendar"
          ref={panelRef}
          role="dialog"
        >
          <div aria-label="Pick a" className="enquiry-field__calendar-modes" role="group">
            {(['month', 'date'] as const).map((option) => (
              <button
                aria-pressed={mode === option}
                className={[
                  'enquiry-field__calendar-mode',
                  mode === option ? 'enquiry-field__calendar-mode--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={option}
                onClick={() => setMode(option)}
                type="button"
              >
                {option === 'month' ? 'A month' : 'An exact date'}
              </button>
            ))}
          </div>

          <div className="enquiry-field__calendar-head">
            <span aria-live="polite" className="enquiry-field__calendar-title">
              {mode === 'month'
                ? year
                : month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </span>
            <span className="enquiry-field__calendar-nav">
              {(
                [
                  ['Previous', -1, 'M7.5 2.5 4 6l3.5 3.5', atStart],
                  ['Next', 1, 'M4.5 2.5 8 6l-3.5 3.5', atEnd],
                ] as const
              ).map(([label, dir, d, disabled]) => (
                <button
                  aria-label={`${label} ${mode === 'month' ? 'year' : 'month'}`}
                  disabled={disabled}
                  key={label}
                  onClick={() => step(dir)}
                  type="button"
                >
                  <svg aria-hidden="true" height="12" viewBox="0 0 12 12" width="12">
                    <path
                      d={d}
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </button>
              ))}
            </span>
          </div>

          {mode === 'month' ? (
            <div className="enquiry-field__calendar-months">
              {MONTHS.map((name, i) => {
                const iso = `${year}-${pad(i + 1)}`
                return (
                  <button
                    aria-pressed={value === iso}
                    // Opening the panel moves focus to the chosen month, as the day view does
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={value === iso}
                    className={[
                      'enquiry-field__calendar-month',
                      value === iso ? 'enquiry-field__calendar-month--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    disabled={new Date(year, i, 1, 12) < thisMonth}
                    key={name}
                    onClick={() => {
                      set(iso)
                      close()
                    }}
                    type="button"
                  >
                    {name.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          ) : (
            <DayPicker
              autoFocus
              classNames={{
                month: 'enquiry-field__calendar-days-month',
                months: 'enquiry-field__calendar-days-months',
                root: 'enquiry-field__calendar-days',
                // Our own heading above replaces the caption; kept for screen readers
                day: 'enquiry-field__calendar-day',
                day_button: 'enquiry-field__calendar-day-button',
                disabled: 'enquiry-field__calendar-day--disabled',
                month_caption: 'enquiry-field__sr-only',
                month_grid: 'enquiry-field__calendar-grid',
                outside: 'enquiry-field__calendar-day--outside',
                selected: 'enquiry-field__calendar-day--selected',
                today: 'enquiry-field__calendar-day--today',
                week: 'enquiry-field__calendar-week',
                weekday: 'enquiry-field__calendar-weekday',
                weekdays: 'enquiry-field__calendar-weekdays',
              }}
              disabled={{ before: today }}
              endMonth={lastMonth}
              hideNavigation
              locale={enGB}
              mode="single"
              month={month}
              onMonthChange={(m) => setMonth(new Date(m.getFullYear(), m.getMonth(), 1, 12))}
              onSelect={(d) => {
                if (!d) {return}
                set(toISO(d))
                close()
              }}
              selected={fromISO(value)}
              showOutsideDays
              startMonth={thisMonth}
              weekStartsOn={1}
            />
          )}

          <div className="enquiry-field__calendar-foot">
            <button
              onClick={() => {
                set('')
                close()
              }}
              type="button"
            >
              Clear
            </button>
            <button onClick={() => close()} type="button">
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="enquiry-field__error" role="alert">
          {String(error.message)}
        </p>
      )}
    </div>
  )
}
