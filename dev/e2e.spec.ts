import { expect, test } from '@playwright/test'

// Drives the `travel-enquiry` form seeded by dev/seed.ts and rendered at
// /test-form. Playwright starts the dev server itself (see playwright.config.js);
// the in-memory Mongo instance is re-seeded on every boot.
//
// Every field renders an input with `id="field-<name>"`, so selectors below use
// that rather than brittle nth-child/class paths.

const FORM_URL = '/test-form'
const ADMIN_URL = '/admin'

const field = (name: string) => `#field-${name}`

// Scoped to the plugin's own error element — a bare getByRole('alert') also
// matches Next.js's route announcer.
const fieldError = '.enquiry-field__error'

// ---------------------------------------------------------------------------
// Admin smoke test
// ---------------------------------------------------------------------------
test('admin panel loads', async ({ page }) => {
  await page.goto(ADMIN_URL)
  await expect(page.locator('#field-email')).toBeVisible({ timeout: 10000 })
  await page.fill('#field-email', 'dev@payloadcms.com')
  await page.fill('#field-password', 'test')
  await page.click('.form-submit button')
  await expect(page).toHaveTitle(/Dashboard/, { timeout: 15000 })
})

// ---------------------------------------------------------------------------
// Form rendering
// ---------------------------------------------------------------------------
test('renders the first step with expected fields', async ({ page }) => {
  await page.goto(FORM_URL)
  await expect(page.getByTestId('enquiry-form')).toBeVisible()
  await expect(page.getByText('Trip Details')).toBeVisible()
  await expect(page.locator(field('destination'))).toBeVisible()
  await expect(page.locator(field('fixed_dates'))).toBeVisible()
  await expect(page.locator(field('travel_month'))).toBeVisible()
})

test('renders the Next button on first step and no Back button', async ({ page }) => {
  await page.goto(FORM_URL)
  await expect(page.getByTestId('btn-next')).toBeVisible()
  await expect(page.getByTestId('btn-back')).not.toBeVisible()
})

// ---------------------------------------------------------------------------
// Step navigation
// ---------------------------------------------------------------------------
test('Next advances to the Budget step once required fields are filled', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'kenya')
  await page.getByTestId('btn-next').click()

  await expect(page.locator(field('budget'))).toBeVisible()
  await expect(page.getByTestId('btn-back')).toBeVisible()
})

test('cannot advance past a step while a required field is empty', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'kenya')
  await page.getByTestId('btn-next').click()
  await page.selectOption(field('budget'), 'mid')
  await page.getByTestId('btn-next').click()

  // Step 3: submit with full_name empty
  await expect(page.locator(field('full_name'))).toBeVisible()
  await page.getByTestId('btn-submit').click()
  await expect(page.locator(fieldError, { hasText: 'Full Name is required' })).toBeVisible()
  await expect(page.getByTestId('enquiry-form-confirmation')).toHaveCount(0)
})

test('Back returns to the previous step', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'kenya')
  await page.getByTestId('btn-next').click()
  await expect(page.locator(field('budget'))).toBeVisible()

  await page.getByTestId('btn-back').click()
  await expect(page.locator(field('destination'))).toBeVisible()
})

// ---------------------------------------------------------------------------
// Conditional logic — action: 'show'
// ---------------------------------------------------------------------------
test('a show-rule field is hidden until its condition is met', async ({ page }) => {
  await page.goto(FORM_URL)
  await expect(page.locator(field('destination_other'))).toHaveCount(0)

  await page.selectOption(field('destination'), 'other')
  await expect(page.locator(field('destination_other'))).toBeVisible()
})

test('a show-rule field disappears again when the condition stops matching', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'other')
  await expect(page.locator(field('destination_other'))).toBeVisible()

  await page.selectOption(field('destination'), 'kenya')
  await expect(page.locator(field('destination_other'))).toHaveCount(0)
})

test('a required field hidden by its show rule does not block Next', async ({ page }) => {
  await page.goto(FORM_URL)
  // destination_other is required:true but hidden while destination = kenya
  await page.selectOption(field('destination'), 'kenya')
  await page.getByTestId('btn-next').click()
  await expect(page.locator(field('budget'))).toBeVisible()
})

test('a required field revealed by its show rule DOES block Next', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'other')
  await expect(page.locator(field('destination_other'))).toBeVisible()

  await page.getByTestId('btn-next').click()
  // still on step 1, with a validation error on the revealed field
  await expect(page.locator(field('destination_other'))).toBeVisible()
  await expect(page.locator(fieldError)).toContainText('Tell us where is required')
})

// ---------------------------------------------------------------------------
// Conditional logic — match: 'any'
// ---------------------------------------------------------------------------
test('match:any shows the field for either matching option', async ({ page }) => {
  await page.goto(FORM_URL)
  await expect(page.locator(field('guide_language'))).toHaveCount(0)

  await page.selectOption(field('destination'), 'kenya')
  await expect(page.locator(field('guide_language'))).toBeVisible()

  await page.selectOption(field('destination'), 'maldives')
  await expect(page.locator(field('guide_language'))).toBeVisible()
})

test('match:any hides the field when no condition matches', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'other')
  await expect(page.locator(field('guide_language'))).toHaveCount(0)
})

// ---------------------------------------------------------------------------
// Conditional logic — action: 'require'
// ---------------------------------------------------------------------------
test('a require-rule field stays visible but optional until its rule matches', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'kenya')

  // travel_month is on screen and empty, but fixed_dates is unchecked
  await expect(page.locator(field('travel_month'))).toBeVisible()
  await page.getByTestId('btn-next').click()
  await expect(page.locator(field('budget'))).toBeVisible()
})

test('a require-rule field becomes mandatory once its rule matches', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'kenya')
  await page.check(field('fixed_dates'))

  await page.getByTestId('btn-next').click()
  // blocked on step 1 by the now-required field
  await expect(page.locator(field('travel_month'))).toBeVisible()
  await expect(page.locator(fieldError)).toContainText('Preferred travel month is required')

  await page.fill(field('travel_month'), 'September')
  await page.getByTestId('btn-next').click()
  await expect(page.locator(field('budget'))).toBeVisible()
})

// ---------------------------------------------------------------------------
// Conditional logic — step-level rules
// ---------------------------------------------------------------------------
test('a step hidden by its rule is skipped entirely', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'other')
  await page.fill(field('destination_other'), 'Patagonia')

  await page.getByTestId('btn-next').click()
  // Budget step is dropped — next visible step is Your Details
  await expect(page.locator(field('budget'))).toHaveCount(0)
  await expect(page.locator(field('full_name'))).toBeVisible()
})

test('the hidden step reappears when the rule stops matching', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'other')
  await expect(page.getByText('Budget')).toHaveCount(0)

  await page.selectOption(field('destination'), 'kenya')
  await expect(page.getByText('Budget')).toBeVisible()
})

test('skipping a hidden step means its required field never blocks submission', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'other')
  await page.fill(field('destination_other'), 'Patagonia')
  await page.getByTestId('btn-next').click()

  // budget is required:true but its step was skipped
  await expect(page.locator(field('full_name'))).toBeVisible()
  await page.fill(field('full_name'), 'Test User')
  await page.fill(field('email'), 'test@example.com')
  await page.getByTestId('btn-submit').click()

  await expect(page.getByTestId('enquiry-form-confirmation')).toBeVisible({ timeout: 5000 })
})

// ---------------------------------------------------------------------------
// Full submission flow
// ---------------------------------------------------------------------------
test('completes the full multi-step form and shows confirmation', async ({ page }) => {
  await page.goto(FORM_URL)

  // Step 1
  await page.selectOption(field('destination'), 'kenya')
  await page.selectOption(field('guide_language'), 'sw')
  await page.check(field('fixed_dates'))
  await page.fill(field('travel_month'), 'September')
  await page.getByTestId('btn-next').click()

  // Step 2
  await expect(page.locator(field('budget'))).toBeVisible()
  await page.selectOption(field('budget'), 'mid')
  await page.getByTestId('btn-next').click()

  // Step 3
  await expect(page.locator(field('full_name'))).toBeVisible()
  await page.fill(field('full_name'), 'Test User')
  await page.fill(field('email'), 'test@example.com')
  await page.fill(field('notes'), 'Looking forward to it.')
  await page.getByTestId('btn-submit').click()

  await expect(page.getByTestId('enquiry-form-confirmation')).toBeVisible({ timeout: 5000 })
})

test('shows submit button (not Next) on the final step', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.selectOption(field('destination'), 'kenya')
  await page.getByTestId('btn-next').click()
  await page.selectOption(field('budget'), 'mid')
  await page.getByTestId('btn-next').click()

  await expect(page.getByTestId('btn-submit')).toBeVisible()
  await expect(page.getByTestId('btn-next')).not.toBeVisible()
})
