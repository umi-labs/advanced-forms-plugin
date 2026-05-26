import type { Config } from 'payload'
import { createEnquiryFormsCollection } from './collections/EnquiryForms.js'
import { createEnquirySubmissionsCollection } from './collections/EnquirySubmissions.js'
import type { FormPluginConfig } from './types.js'

// Re-export config types so consumers can import them from '@foundrykit/form-plugin'
export type { FormPluginConfig, SendEmailOptions } from './types.js'

export const formPlugin =
  (pluginOptions: FormPluginConfig) =>
  (config: Config): Config => {
    const formsSlug = pluginOptions.collections?.forms ?? 'enquiry-forms'
    const submissionsSlug = pluginOptions.collections?.submissions ?? 'enquiry-submissions'
    const mediaCollection = pluginOptions.mediaCollection ?? 'media'

    // Always add collections so DB schema stays consistent even when disabled.
    config.collections = [
      ...(config.collections ?? []),
      createEnquiryFormsCollection({ formsSlug, mediaCollection }),
      createEnquirySubmissionsCollection({ formsSlug, submissionsSlug }),
    ]

    if (pluginOptions.disabled) {
      return config
    }

    // Endpoints are registered in Plan 3 after handlers are implemented.

    return config
  }
