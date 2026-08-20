# @foundrykit/advanced-forms-plugin

A multi-step form plugin for [Payload CMS 3](https://payloadcms.com). Adds a form builder to your admin panel with 11 built-in field types, configurable submission actions, and a ready-to-use React component for the frontend.

## Features

- **Multi-step forms** — organise fields into named steps with optional icons and a progress indicator
- **12 field types** — text, email, phone, textarea, checkbox, radio group, checkbox group, select, number, date, file upload, address (with postcode lookup)
- **Submission actions** — send email, show a confirmation message, or redirect after submission (multiple actions per form, executed in order)
- **Two collections** — `forms` and `form-submissions` added to your Payload config automatically
- **REST API** — fetch form data and submit forms via Payload custom endpoints
- **Frontend component** — `<EnquiryForm>` React client component with built-in step navigation and validation
- **Fully customisable** — disable, replace, or add field block types; rename collection slugs

---

## Installation

```sh
pnpm add @foundrykit/advanced-forms-plugin
```

**Peer dependencies** (install if not already present):

```sh
pnpm add payload react react-hook-form @radix-ui/react-popover
```

---

## Quick start

```ts
// payload.config.ts
import { formPlugin } from '@foundrykit/advanced-forms-plugin'
import { buildConfig } from 'payload'

export default buildConfig({
  // Configure your email adapter here — the plugin uses payload.sendEmail
  // for the `sendEmail` submission action.
  // email: nodemailerAdapter({ ... }) or resendAdapter({ ... }), etc.
  plugins: [formPlugin({})],
  // ...rest of your config
})
```

The `sendEmail` submission action uses Payload's built-in `payload.sendEmail`, which
delegates to the [email adapter](https://payloadcms.com/docs/email/overview) you
configure on the Payload config. No plugin-level email handler is required.

---

## Plugin options

```ts
formPlugin(options: FormPluginConfig)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Register collections but skip adding endpoints |
| `baseUrl` | `string` | `''` | Base URL prepended when building form API URLs (e.g. `https://example.com`) |
| `mediaCollection` | `string` | `'media'` | Slug of your media collection, used for step icon uploads |
| `collections.forms` | `string` | `'forms'` | Slug for the forms collection |
| `collections.submissions` | `string` | `'form-submissions'` | Slug for the submissions collection |
| `labels.forms` | `string` | `'Form'` | Singular admin label for forms |
| `labels.submissions` | `string` | `'Form Submission'` | Singular admin label for submissions |
| `fields` | `FieldsConfig` | all built-ins | Control which field block types are available in the form builder — see [Customising field blocks](#customising-field-blocks) |

---

## Collections

### Forms (`forms`)

Stores form definitions. Publicly readable; create/update/delete require authentication.

Each form document has:

- **title** — display name
- **slug** — unique identifier used in the API (e.g. `contact-form`)
- **steps** — one or more steps, each with a title, optional icon, and a list of field blocks
- **additionalContent** — optional rich text positioned above or below the form
- **submissionActions** — one or more actions executed on successful submission

### Form Submissions (`form-submissions`)

One document per submission. Stores:

- **form** — relationship to the parent form
- **submittedAt** — ISO timestamp
- **data** — key/value pairs of submitted field values
- **metadata** — `userAgent`, `ip`, `referrer` captured from the request

---

## Field types

| Block slug | Description |
|---|---|
| `text` | Single-line text input (supports `half` width) |
| `email` | Email address input |
| `phone` | Phone number input |
| `textarea` | Multi-line text (configurable `rows`) |
| `checkbox` | Single boolean checkbox |
| `radioGroup` | Single choice from a list (`row` or `grid` layout) |
| `checkboxGroup` | Multiple choices from a list (`row` or `grid` layout) |
| `select` | Dropdown select |
| `number` | Numeric input with optional `min`, `max`, `step` |
| `date` | Date picker with optional `min`/`max` |
| `file` | File upload to a Payload collection (configurable `accept`, `maxSizeMB`) |
| `address` | Address with UK postcode lookup (configurable `defaultCountry`, `showLine2`, `lookupLabel`) |

All field blocks share these base properties: `name`, `label`, `required`, `tooltip`.

### Address field

Stores a composite value — `{ line1, line2, city, county, postcode, country }` —
serialised to JSON in the submission, the same way `phone` stores
`{ country, number, e164 }`.

The lookup is backed by [postcodes.io](https://postcodes.io): free, no API key,
nobody billed per call, so the field can go on any public form without watching
a quota. It resolves a postcode to its town, county and country only — it does
not return a premises list, so the street line is always typed. Manual entry is
never blocked, which keeps the field usable for non-UK addresses and when the
lookup is unreachable.

A **required** address needs a street line and a postcode: a postcode alone is
not deliverable, and the lookup can never supply the street. Reuse the lookup
outside a form with the exported helper:

```ts
import { lookupPostcode } from '@foundrykit/advanced-forms-plugin/client'

const result = await lookupPostcode('SW1A 1AA')
// { status: 'ok', address: { postcode, city, county, country } }
// | { status: 'notFound' } | { status: 'error' }
```

---

## Submission actions

Configure one or more actions per form. They execute in the order they appear.

| Block | Description |
|---|---|
| `sendEmail` | Sends an email via `payload.sendEmail` (uses your Payload [email adapter](https://payloadcms.com/docs/email/overview)). Subject supports `{{fieldName}}` interpolation. |
| `confirmationMessage` | Returns a Lexical rich-text message in the API response for the frontend to display. |
| `redirect` | Returns a `redirectUrl` in the API response. The frontend component handles the navigation. |

---

## REST API

Both endpoints are registered at the Payload API root (`/api` by default).

### `GET /api/form-data/:slug`

Fetches a form document by its slug.

**Response:** the full `FormDocument` JSON.

### `POST /api/form-submit/:formSlug`

Submits field data for a form.

**Request body:**

```json
{
  "data": { "name": "Alice", "email": "alice@example.com" },
  "metadata": { "referrer": "https://example.com/about" }
}
```

**Success response (`200`):**

```json
{
  "success": true,
  "actions": {
    "confirmationMessage": { /* Lexical rich-text node */ },
    "redirectUrl": "/thank-you"
  }
}
```

**Validation error response (`422`):**

```json
{
  "success": false,
  "errors": [{ "field": "email", "message": "Email is required" }]
}
```

---

## Frontend usage

### Server component — fetch form data

Import from `@foundrykit/advanced-forms-plugin/rsc`:

```tsx
import { fetchForm } from '@foundrykit/advanced-forms-plugin/rsc'

export default async function ContactPage() {
  const form = await fetchForm({ slug: 'contact-form' })
  return <ContactForm form={form} />
}
```

`fetchForm` options:

| Option | Type | Default | Description |
|---|---|---|---|
| `slug` | `string` | required | The form slug to fetch |
| `baseUrl` | `string` | `''` | Override the API base URL |
| `formsSlug` | `string` | `'forms'` | Override the forms collection slug used in the URL path |

### Client component — render the form

Import from `@foundrykit/advanced-forms-plugin/client`:

```tsx
'use client'

import { EnquiryForm } from '@foundrykit/advanced-forms-plugin/client'
import type { FormDocument } from '@foundrykit/advanced-forms-plugin'

export function ContactForm({ form }: { form: FormDocument }) {
  return (
    <EnquiryForm
      form={form}
      onSuccess={(result) => console.log('submitted', result)}
      onError={(err) => console.error(err)}
    />
  )
}
```

`EnquiryForm` props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `form` | `FormDocument` | required | Form data returned by `fetchForm` |
| `apiBase` | `string` | `''` | Base URL for the submit endpoint |
| `className` | `string` | — | CSS class applied to the root element |
| `onSuccess` | `(result: SubmitResult) => void` | — | Called after successful submission |
| `onError` | `(error: SubmitError) => void` | — | Called when the server returns validation errors |
| `additionalContent` | `ReactNode` | — | Extra content rendered above or below the form (respects the `additionalContent.position` setting) |
| `resolver` | `Resolver<Record<string, unknown>>` | — | Optional react-hook-form resolver (e.g. `zodResolver(schema)`). Merged with the per-field admin rules. |

### Validation

Every field block exposes an admin **Validation** group: `requiredMessage`,
`minLength` / `maxLength` / `pattern` / `patternMessage` (for text-shaped
fields), and `min` / `max` / `minMessage` / `maxMessage` (for numeric fields
and the multi-counter total). These rules are wired into RHF via the
`buildFieldRules` helper and are also exported from `/client` for use in
custom field components.

For richer cross-field logic, pass a form-level resolver. The plugin does
**not** bundle `zod` or `@hookform/resolvers` — install them in your app:

```sh
pnpm add zod @hookform/resolvers
```

```tsx
'use client'

import { EnquiryForm } from '@foundrykit/advanced-forms-plugin/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z
  .object({
    travelKnown: z.enum(['yes', 'no']).optional(),
    travelPlans: z.string().optional(),
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.travelKnown === 'no' && !data.travelPlans) {
      ctx.addIssue({
        path: ['travelPlans'],
        code: 'custom',
        message: 'Tell us a bit about what you’re looking for',
      })
    }
  })

export function ContactForm({ form }) {
  return <EnquiryForm form={form} resolver={zodResolver(schema)} />
}
```

Per-field admin rules and the resolver run together — either source can flag
a field invalid, and step-by-step validation (`goNext`) respects both.

### Hook — custom form UI

If you need full control over the form UI, use `useEnquiryForm` directly:

```tsx
'use client'

import { useEnquiryForm } from '@foundrykit/advanced-forms-plugin/client'

export function MyCustomForm({ form }) {
  const { currentStep, totalSteps, stepData, form: rhf, goNext, goBack, submit, isSubmitting } =
    useEnquiryForm({ form, apiBase: '' })

  // render whatever you like
}
```

---

## Customising field blocks

The `fields` option in the plugin config controls which block types appear in the form builder:

```ts
formPlugin({
  fields: {
    // disable a built-in type
    file: false,

    // replace a built-in type with your own block
    text: { block: myCustomTextBlock },

    // add a new type
    budgetRange: { block: BudgetRangeBlock },
  },
})
```

Built-in slugs: `text`, `email`, `phone`, `textarea`, `checkbox`, `radioGroup`, `checkboxGroup`, `select`, `number`, `date`, `file`, `address`.

---

## Architecture overview

```
src/
├── index.ts                  # Plugin entry — merges collections and endpoints into Payload config
├── types.ts                  # All shared TypeScript types (field blocks, FormDocument, plugin config)
├── collections/
│   ├── Forms.ts              # createFormsCollection factory
│   └── Submissions.ts        # createSubmissionsCollection factory
├── blocks/
│   ├── fields/               # One file per built-in field block type
│   └── submissionActions/    # SendEmail, ConfirmationMessage, Redirect blocks
├── endpoints/
│   ├── fetchFormHandler.ts   # GET /api/form-data/:slug
│   └── submitFormHandler.ts  # POST /api/form-submit/:formSlug — validates, stores, fires actions
├── components/
│   └── EnquiryForm/          # React client component and useEnquiryForm hook
├── utilities/
│   ├── fetchEnquiryForm.ts   # fetchForm — RSC utility wrapping the fetch endpoint
│   ├── buildFormURL.ts       # URL builder for the form-data endpoint
│   └── sanitizeSubmission.ts # Sanitises raw form data before storage
└── exports/
    ├── client.ts             # @foundrykit/advanced-forms-plugin/client exports
    └── rsc.ts                # @foundrykit/advanced-forms-plugin/rsc exports
```

The plugin follows the standard Payload plugin pattern: `formPlugin(options)` returns a function that receives and returns the Payload `Config` object. Collections and endpoints are added using spread syntax to avoid overwriting existing config.

---

## Development

```sh
pnpm dev        # Start the dev app at http://localhost:3000
pnpm test       # Run unit + integration + e2e tests
pnpm build      # Compile to dist/
```

Copy `dev/.env.example` to `dev/.env` and set `DATABASE_URL` and `PAYLOAD_SECRET` before running `dev`.
