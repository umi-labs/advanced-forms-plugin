'use client'

/**
 * Convenience re-export of Payload's Lexical RichText renderer. Use this in
 * `<EnquiryForm renderConfirmation={...}/>` to render the confirmation
 * message stored as Lexical JSON.
 *
 * Requires `@payloadcms/richtext-lexical` to be installed (it already is for
 * any Payload project using rich-text fields).
 *
 * @example
 * import { EnquiryForm } from '@foundrykit/advanced-forms-plugin/client'
 * import { RichText } from '@foundrykit/advanced-forms-plugin/rich-text'
 *
 * <EnquiryForm
 *   form={form}
 *   renderConfirmation={(message) => <RichText data={message as any} />}
 * />
 */
export { RichText } from '@payloadcms/richtext-lexical/react'
