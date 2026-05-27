import type { Config } from 'payload'
import { createEnquiryFormsCollection } from './collections/EnquiryForms.js'
import { createEnquirySubmissionsCollection } from './collections/EnquirySubmissions.js'
import { createFetchFormHandler } from './endpoints/fetchFormHandler.js'
import { createSubmitFormHandler } from './endpoints/submitFormHandler.js'
import type { FormPluginConfig } from './types.js'

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

    config.endpoints = [
      ...(config.endpoints ?? []),
      {
        handler: createFetchFormHandler(pluginOptions),
        method: 'get',
        path: `/api/${formsSlug}/:slug`,
      },
      {
        handler: createSubmitFormHandler(pluginOptions),
        method: 'post',
        path: '/api/enquiry-submit/:formSlug',
      },
    ]

    return config
  }
