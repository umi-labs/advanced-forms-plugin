// Frontend-only entry: everything a site needs to render and validate forms,
// without the admin field components. Those import `@payloadcms/ui`, and
// because `./client` re-exports them, importing anything from `./client` ships
// the whole admin UI (~1 MB) to every page that renders a form.
export { EnquiryForm } from '../components/EnquiryForm/index.js'
export { useEnquiryForm } from '../components/EnquiryForm/useEnquiryForm.js'
export type { EnquirySubmissionContext } from '../types.js'
export type {
  Condition,
  ConditionGroup,
  ConditionNode,
  ConditionOperator,
  VisibilityAction,
  VisibilityRule,
} from '../types.js'
export { buildFieldRules, type FieldRules } from '../utilities/buildFieldRules.js'
export {
  buildZodSchemaFromForm,
  type BuildZodSchemaOptions,
  type FieldSchemaBuilder,
} from '../utilities/buildZodSchemaFromForm.js'
export {
  evaluateCondition,
  evaluateNodes,
  getVisibleFields,
  getVisibleSteps,
  isFieldRequired,
  isFieldVisible,
  isStepVisible,
  resolveValue,
  ruleMatches,
  stripHiddenValues,
} from '../utilities/conditions/index.js'
// Where the bundled flag SVGs are served from. The 257 files ship in this
// package under `dist/assets/flags`; copy them somewhere public and call this
// once if that is not `/flags`.
export { setFlagBasePath } from '../utilities/flagAssets.js'
export {
  lookupPostcode,
  type PostcodeAddress,
  type PostcodeLookup,
} from '../utilities/lookupPostcode.js'
export { normalizeFormSteps } from '../utilities/normalizeFormSteps.js'

export { getCaptchaToken, resetRecaptchaLoader } from '../utilities/recaptchaClient.js'
