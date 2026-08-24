import type { CaptchaConfig } from '../types.js'

const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

/** Default score below which a submission is treated as automated. Google's
 *  own suggested starting point; tune per site from the reCAPTCHA console. */
export const DEFAULT_MIN_SCORE = 0.5

/** Action name sent with the token, asserted on verify so a token minted for
 *  some other action on the site can't be replayed against a form submit. */
export const DEFAULT_ACTION = 'form_submit'

export type CaptchaVerification =
  /** No captcha configured — nothing to check. */
  | { status: 'skipped' }
  /** Verified as human. */
  | { status: 'ok'; score?: number }
  /** Configured, but the request carried no token. */
  | { status: 'missing-token' }
  /** Google answered, and the answer was no. */
  | { status: 'rejected'; reason: string; score?: number }
  /** Google could not be reached, or answered unintelligibly. */
  | { status: 'unavailable'; reason: string }

type SiteverifyResponse = {
  success?: boolean
  score?: number
  action?: string
  'error-codes'?: string[]
}

/** A captcha config with both keys present — the only shape that can be enforced. */
export type EnabledCaptchaConfig = CaptchaConfig & { siteKey: string; secretKey: string }

/** Whether a captcha config is complete enough to enforce. */
export function isCaptchaEnabled(
  config: CaptchaConfig | undefined,
): config is EnabledCaptchaConfig {
  return Boolean(config?.siteKey && config?.secretKey)
}

/**
 * Verify a reCAPTCHA v3 token against Google's siteverify endpoint.
 *
 * Never throws. The four failure states are kept distinct because the caller
 * treats them differently: a missing or rejected token is the visitor's
 * problem, whereas `unavailable` means *our* dependency is down and blocking
 * on it would throw away genuine enquiries.
 *
 * `fetchImpl` exists so tests can drive this without a network.
 */
export async function verifyCaptcha({
  config,
  token,
  remoteIp,
  fetchImpl = globalThis.fetch,
}: {
  config: CaptchaConfig | undefined
  token: unknown
  remoteIp?: string
  fetchImpl?: typeof globalThis.fetch
}): Promise<CaptchaVerification> {
  if (!isCaptchaEnabled(config)) return { status: 'skipped' }
  const captcha = config

  if (typeof token !== 'string' || token.trim().length === 0) {
    return { status: 'missing-token' }
  }

  const body = new URLSearchParams({ secret: captcha.secretKey, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  let result: SiteverifyResponse
  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    result = (await res.json()) as SiteverifyResponse
  } catch (err) {
    return { status: 'unavailable', reason: err instanceof Error ? err.message : 'request failed' }
  }

  if (!result || typeof result !== 'object') {
    return { status: 'unavailable', reason: 'malformed siteverify response' }
  }

  if (!result.success) {
    const codes = result['error-codes'] ?? []
    // These mean the *integration* is misconfigured, not that the visitor is a
    // bot — surfacing them as a rejection would silently block every real
    // submission, so they are reported as unavailable instead.
    const configErrors = ['invalid-input-secret', 'missing-input-secret', 'bad-request']
    if (codes.some((code) => configErrors.includes(code))) {
      return { status: 'unavailable', reason: codes.join(', ') }
    }
    return { status: 'rejected', reason: codes.length > 0 ? codes.join(', ') : 'not successful' }
  }

  const expectedAction = captcha.action ?? DEFAULT_ACTION
  if (result.action && result.action !== expectedAction) {
    return {
      status: 'rejected',
      reason: `action mismatch: expected ${expectedAction}, got ${result.action}`,
      score: result.score,
    }
  }

  const minScore = captcha.minScore ?? DEFAULT_MIN_SCORE
  if (typeof result.score === 'number' && result.score < minScore) {
    return {
      status: 'rejected',
      reason: `score ${result.score} below minimum ${minScore}`,
      score: result.score,
    }
  }

  return { status: 'ok', score: result.score }
}
