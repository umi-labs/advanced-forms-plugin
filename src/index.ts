import type { Block, Config } from 'payload'
import { CheckboxBlock } from './blocks/fields/Checkbox.js'
import { CheckboxGroupBlock } from './blocks/fields/CheckboxGroup.js'
import { DateBlock } from './blocks/fields/Date.js'
import { EmailBlock } from './blocks/fields/Email.js'
import { FileBlock } from './blocks/fields/File.js'
import { NumberBlock } from './blocks/fields/Number.js'
import { PhoneBlock } from './blocks/fields/Phone.js'
import { RadioGroupBlock } from './blocks/fields/RadioGroup.js'
import { SelectBlock } from './blocks/fields/Select.js'
import { TextBlock } from './blocks/fields/Text.js'
import { TextareaBlock } from './blocks/fields/Textarea.js'
import { createFormsCollection } from './collections/Forms.js'
import { createSubmissionsCollection } from './collections/Submissions.js'
import { createFetchFormHandler } from './endpoints/fetchFormHandler.js'
import { createSubmitFormHandler } from './endpoints/submitFormHandler.js'
import type { FieldsConfig, FormPluginConfig } from './types.js'
import { FORM_SUBMIT_PATH } from './utilities/buildSubmitURL.js'

export type { FormPluginConfig } from './types.js'
export { baseFieldBlockFields, optionsArrayField } from './blocks/fields/shared.js'
export { lockableTextField } from './fields/lockable/index.js'

const DEFAULT_FIELD_BLOCKS: Block[] = [
  TextBlock,
  EmailBlock,
  PhoneBlock,
  TextareaBlock,
  CheckboxBlock,
  RadioGroupBlock,
  CheckboxGroupBlock,
  SelectBlock,
  NumberBlock,
  DateBlock,
  FileBlock,
]

function buildFieldBlocks(fieldsConfig: FieldsConfig | undefined): Block[] {
  if (!fieldsConfig) return DEFAULT_FIELD_BLOCKS
  const result: Block[] = []
  for (const block of DEFAULT_FIELD_BLOCKS) {
    const entry = fieldsConfig[block.slug]
    if (entry === false) continue
    if (entry && typeof entry === 'object' && 'block' in entry) {
      result.push(entry.block)
      continue
    }
    result.push(block)
  }
  const defaultSlugs = new Set(DEFAULT_FIELD_BLOCKS.map((b) => b.slug))
  for (const [slug, entry] of Object.entries(fieldsConfig)) {
    if (!defaultSlugs.has(slug) && entry && typeof entry === 'object' && 'block' in entry) {
      result.push(entry.block)
    }
  }
  return result
}

export const formPlugin =
  (pluginOptions: FormPluginConfig) =>
  (config: Config): Config => {
    const formsSlug = pluginOptions.collections?.forms ?? 'forms'
    const submissionsSlug = pluginOptions.collections?.submissions ?? 'form-submissions'
    const mediaCollection = pluginOptions.mediaCollection ?? 'media'
    const singularFormsLabel = pluginOptions.labels?.forms ?? 'Form'
    const singularSubmissionsLabel = pluginOptions.labels?.submissions ?? 'Form Submission'
    const fieldBlocks = buildFieldBlocks(pluginOptions.fields)

    config.collections = [
      ...(config.collections ?? []),
      createFormsCollection({
        formsSlug,
        mediaCollection,
        singularLabel: singularFormsLabel,
        pluralLabel: singularFormsLabel + 's',
        fieldBlocks,
        richTextEditor: pluginOptions.richTextEditor,
      }),
      createSubmissionsCollection({
        submissionsSlug,
        formsSlug,
        singularLabel: singularSubmissionsLabel,
        pluralLabel: singularSubmissionsLabel + 's',
      }),
    ]

    if (pluginOptions.disabled) {
      return config
    }

    config.endpoints = [
      ...(config.endpoints ?? []),
      {
        handler: createFetchFormHandler(pluginOptions),
        method: 'get',
        path: `/form-data/:slug`,
      },
      {
        handler: createSubmitFormHandler(pluginOptions),
        method: 'post',
        path: `/${FORM_SUBMIT_PATH}/:formSlug`,
      },
    ]

    return config
  }
