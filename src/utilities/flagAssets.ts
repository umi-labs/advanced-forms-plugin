/**
 * Where the flag SVGs are served from.
 *
 * The 257 files ship in this package under `dist/assets/flags`, but a package
 * cannot serve static files — the consuming app has to. Copy them somewhere
 * public (Turquoise puts them in `public/flags`) and, if that is not `/flags`,
 * call `setFlagBasePath` once at startup.
 *
 * They are files rather than inlined data URIs on purpose: all 257 come to
 * 286KB, which is far too much to put in a form's JavaScript when a visitor
 * sees at most a few dozen. As files the browser fetches only the flags it
 * draws, and caches them.
 */
let basePath = '/flags'

export const setFlagBasePath = (path: string): void => {
  basePath = path.replace(/\/+$/, '')
}

export const flagSrc = (code: string): string => `${basePath}/${code.toUpperCase()}.svg`
