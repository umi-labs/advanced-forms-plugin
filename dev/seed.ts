import type { Payload } from 'payload'

import { devUser } from './helpers/credentials.js'

/** Shorthand for a leaf condition block inside a `visibility.conditions` array. */
const cond = (source: string, operator: string, value?: string) => ({
  blockType: 'condition',
  source,
  operator,
  ...(value === undefined ? {} : { value }),
})

const richText = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text, version: 1 }],
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

/**
 * The form the dev app renders at `/test-form` and the E2E suite drives.
 *
 * Every block type used here is one the plugin actually ships AND that
 * `Step.tsx` has a renderer for (text, email, phone, textarea, select,
 * checkbox) — `radioGroup`/`checkboxGroup` are configurable but render to
 * `null`, so they can't be exercised from the browser.
 *
 * The conditional rules deliberately cover all three shapes the evaluator
 * supports, so E2E can assert each one live:
 *   - `action: 'show'`     → `destination_other`, `guide_language`
 *   - `action: 'require'`  → `travel_month`
 *   - step-level rule      → the whole "Budget" step
 *   - `match: 'any'`       → `guide_language`
 */
const travelEnquiryForm = {
  title: 'Travel Enquiry',
  slug: 'travel-enquiry',
  steps: [
    {
      title: 'Trip Details',
      fields: [
        {
          blockType: 'select',
          name: 'destination',
          label: 'Where would you like to go?',
          required: true,
          // NB: no `placeholder` — SelectField renders it as a *disabled*
          // option, which browsers skip when choosing the default selection, so
          // the first real option would be silently pre-selected. An explicit
          // neutral first option keeps the initial state deterministic.
          options: [
            { label: 'Not sure yet', value: 'undecided' },
            { label: 'Kenya', value: 'kenya' },
            { label: 'Maldives', value: 'maldives' },
            { label: 'Somewhere else', value: 'other' },
          ],
        },
        {
          // show-rule: only appears once "Somewhere else" is picked
          blockType: 'text',
          name: 'destination_other',
          label: 'Tell us where',
          required: true,
          visibility: {
            enabled: true,
            action: 'show',
            match: 'all',
            conditions: [cond('destination', 'equals', 'other')],
          },
        },
        {
          // match:any show-rule — a guide is offered for either safari country
          blockType: 'select',
          name: 'guide_language',
          label: 'Preferred guide language',
          required: false,
          placeholder: 'No preference',
          options: [
            { label: 'English', value: 'en' },
            { label: 'Swahili', value: 'sw' },
          ],
          visibility: {
            enabled: true,
            action: 'show',
            match: 'any',
            conditions: [
              cond('destination', 'equals', 'kenya'),
              cond('destination', 'equals', 'maldives'),
            ],
          },
        },
        {
          blockType: 'checkbox',
          name: 'fixed_dates',
          label: 'I have fixed dates',
        },
        {
          // require-rule: always on screen, mandatory only once dates are fixed
          blockType: 'text',
          name: 'travel_month',
          label: 'Preferred travel month',
          required: false,
          visibility: {
            enabled: true,
            action: 'require',
            match: 'all',
            conditions: [cond('fixed_dates', 'isChecked')],
          },
        },
      ],
    },
    {
      // step-level rule: bespoke destinations are quoted individually, so the
      // whole budget step drops out of the flow when "other" is selected
      title: 'Budget',
      visibility: {
        enabled: true,
        match: 'all',
        conditions: [cond('destination', 'notEquals', 'other')],
      },
      fields: [
        {
          blockType: 'select',
          name: 'budget',
          label: 'Budget per person',
          required: true,
          placeholder: 'Select a budget',
          options: [
            { label: 'Up to £2,000', value: 'low' },
            { label: '£2,000 – £5,000', value: 'mid' },
            { label: '£5,000+', value: 'high' },
          ],
        },
      ],
    },
    {
      title: 'Your Details',
      fields: [
        { blockType: 'text', name: 'full_name', label: 'Full Name', required: true },
        { blockType: 'email', name: 'email', label: 'Email Address', required: true },
        { blockType: 'textarea', name: 'notes', label: 'Additional Notes', rows: 4 },
        {
          blockType: 'address',
          name: 'billing_address',
          label: 'Billing Address',
          lookupLabel: 'Find address',
        },
      ],
    },
  ],
  submissionActions: [
    {
      blockType: 'confirmationMessage',
      message: richText('Thank you for your enquiry!'),
    },
  ],
}

export const seed = async (payload: Payload) => {
  // Seed dev user
  const { totalDocs: userCount } = await payload.count({
    collection: 'users',
    where: { email: { equals: devUser.email } },
  })

  if (!userCount) {
    await payload.create({ collection: 'users', data: devUser })
  }

  // Seed the form the dev app and E2E suite depend on
  const { totalDocs: formCount } = await payload.count({
    collection: 'forms',
    where: { slug: { equals: travelEnquiryForm.slug } },
  })

  if (!formCount) {
    await payload.create({ collection: 'forms', data: travelEnquiryForm as never })
  }
}
