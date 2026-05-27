import { expect, test } from '@playwright/test'

// Requires: dev server running + travel-enquiry seed form created
// Run: pnpm dev (in another terminal), then pnpm test:e2e

const FORM_URL = '/test-form'
const ADMIN_URL = '/admin'

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
  // First step title in StepIndicator
  await expect(page.getByText('Trip Details')).toBeVisible()
  // YesNo field label
  await expect(page.getByText('Are your dates flexible?')).toBeVisible()
  // MultiCounter label
  await expect(page.getByText('Number of guests')).toBeVisible()
  // NumberStepper label
  await expect(page.getByText('Trip duration')).toBeVisible()
})

test('renders the Next button on first step and no Back button', async ({ page }) => {
  await page.goto(FORM_URL)
  await expect(page.getByTestId('btn-next')).toBeVisible()
  await expect(page.getByTestId('btn-back')).not.toBeVisible()
})

// ---------------------------------------------------------------------------
// Step navigation
// ---------------------------------------------------------------------------
test('Next button advances to step 2 after filling required fields', async ({ page }) => {
  await page.goto(FORM_URL)

  // Fill required YesNo field
  await page.click('.enquiry-field--yesno .enquiry-field__yesno-btn:first-child') // "Yes"

  await page.getByTestId('btn-next').click()
  await expect(page.getByText('Budget per person')).toBeVisible()
  await expect(page.getByTestId('btn-back')).toBeVisible()
})

test('Next button does NOT advance when required field is empty', async ({ page }) => {
  await page.goto(FORM_URL)
  // Do NOT fill the required YesNo field
  await page.getByTestId('btn-next').click()
  // Should still be on step 1
  await expect(page.getByText('Trip Details')).toBeVisible()
})

test('Back button returns to previous step', async ({ page }) => {
  await page.goto(FORM_URL)
  await page.click('.enquiry-field--yesno .enquiry-field__yesno-btn:first-child')
  await page.getByTestId('btn-next').click()
  await expect(page.getByText('Budget per person')).toBeVisible()

  await page.getByTestId('btn-back').click()
  await expect(page.getByText('Are your dates flexible?')).toBeVisible()
})

// ---------------------------------------------------------------------------
// NumberStepper interaction
// ---------------------------------------------------------------------------
test('NumberStepper increments and decrements', async ({ page }) => {
  await page.goto(FORM_URL)
  const stepper = page.locator('.enquiry-field--stepper').first()
  const value = stepper.locator('.enquiry-field__stepper-value')
  await expect(value).toHaveText('7') // defaultValue from seed

  await stepper.locator('[aria-label*="Increase"]').click()
  await expect(value).toHaveText('8')

  await stepper.locator('[aria-label*="Decrease"]').click()
  await stepper.locator('[aria-label*="Decrease"]').click()
  await expect(value).toHaveText('6')
})

// ---------------------------------------------------------------------------
// MultiCounter interaction
// ---------------------------------------------------------------------------
test('MultiCounter increments adults counter', async ({ page }) => {
  await page.goto(FORM_URL)
  const adultsRow = page
    .locator('.enquiry-field__counter-row')
    .filter({ hasText: 'Adults' })

  const value = adultsRow.locator('.enquiry-field__counter-value')
  await expect(value).toHaveText('2') // defaultValue from seed

  await adultsRow.locator('[aria-label*="Increase"]').click()
  await expect(value).toHaveText('3')
})

// ---------------------------------------------------------------------------
// Full submission flow
// ---------------------------------------------------------------------------
test('completes multi-step form and shows confirmation', async ({ page }) => {
  await page.goto(FORM_URL)

  // Step 1: Trip Details
  await page.click('.enquiry-field--yesno .enquiry-field__yesno-btn:first-child') // Yes
  await page.getByTestId('btn-next').click()

  // Step 2: Budget — select a budget tier
  await expect(page.getByText('Budget per person')).toBeVisible()
  await page.click('.enquiry-field--budget-range .enquiry-field__budget-option:first-child')
  await page.getByTestId('btn-next').click()

  // Step 3: Your Details
  await expect(page.getByText('Full Name')).toBeVisible()
  await page.fill('input[type="text"]', 'Test User')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.getByTestId('btn-submit').click()

  // Confirmation
  await expect(page.getByTestId('enquiry-form-confirmation')).toBeVisible({ timeout: 5000 })
})

test('shows submit button (not Next) on final step', async ({ page }) => {
  await page.goto(FORM_URL)

  // Navigate to final step (step 3 of 3)
  await page.click('.enquiry-field--yesno .enquiry-field__yesno-btn:first-child')
  await page.getByTestId('btn-next').click()
  await page.click('.enquiry-field--budget-range .enquiry-field__budget-option:first-child')
  await page.getByTestId('btn-next').click()

  await expect(page.getByTestId('btn-submit')).toBeVisible()
  await expect(page.getByTestId('btn-next')).not.toBeVisible()
})
