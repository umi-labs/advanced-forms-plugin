import type { PublicCaptchaConfig } from '../types.js'

/**
 * Browser side of reCAPTCHA v3: load Google's script once, then mint a token
 * per submit.
 *
 * Deliberately dependency-free and idempotent — a form block can appear more
 * than once on a page, and every instance would otherwise inject its own copy
 * of the script.
 */

type Grecaptcha = {
  ready: (cb: () => void) => void
  execute: (siteKey: string, opts: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

const SCRIPT_ID = 'foundrykit-recaptcha-v3'

/** In-flight/settled loads, keyed by site key, so concurrent forms share one. */
const loaders = new Map<string, Promise<Grecaptcha>>()

/** Reset memoised loaders. Exported for tests. */
export function resetRecaptchaLoader(): void {
  loaders.clear()
}

function loadScript(siteKey: string): Promise<Grecaptcha> {
  const existing = loaders.get(siteKey)
  if (existing) return existing

  const promise = new Promise<Grecaptcha>((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('reCAPTCHA can only be loaded in a browser'))
      return
    }

    const ready = () => {
      const api = window.grecaptcha
      if (!api) {
        reject(new Error('reCAPTCHA script loaded without exposing grecaptcha'))
        return
      }
      api.ready(() => resolve(api))
    }

    // Another form instance (or the host app) may already have injected it.
    if (window.grecaptcha) {
      ready()
      return
    }

    const existingTag = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    const script = existingTag ?? document.createElement('script')
    if (!existingTag) {
      script.id = SCRIPT_ID
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
      script.async = true
      script.defer = true
    }
    script.addEventListener('load', ready, { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('reCAPTCHA script failed to load')),
      { once: true },
    )
    if (!existingTag) document.head.appendChild(script)
  })

  // A failed load must not be cached, or a transient network blip would poison
  // every later submit on the page.
  loaders.set(
    siteKey,
    promise.catch((err) => {
      loaders.delete(siteKey)
      throw err
    }),
  )
  return loaders.get(siteKey) as Promise<Grecaptcha>
}

/**
 * Mint a token for one submission. Resolves to `null` when captcha is off, or
 * when the script cannot load — the server decides what to do about a missing
 * token, so a blocked or offline Google never silently strands the visitor
 * with an unsubmittable form.
 */
export async function getCaptchaToken(
  captcha: PublicCaptchaConfig | null | undefined,
): Promise<string | null> {
  if (!captcha?.siteKey) return null
  try {
    const api = await loadScript(captcha.siteKey)
    return await api.execute(captcha.siteKey, { action: captcha.action })
  } catch {
    return null
  }
}
