/**
 * Copy shown under a condition's value input. Kept apart from the field
 * component so it carries no `@payloadcms/ui` (and therefore no CSS) import,
 * which lets the wording be asserted in the plain node test suite.
 */

/** Case/whitespace leniency is a property of the rule engine, so it is stated
 *  wherever a value is typed rather than only in the docs. */
export const MATCHING_NOTE = 'Matching ignores capitals and surrounding spaces.'

/**
 * Plain-English note about what the chosen source field actually stores, shown
 * under the value input. Editors think in labels ("Yes", "£5,000–£9,999") while
 * rules match on stored values (`yes`, `5000-9999`), and nothing in the admin
 * otherwise reveals the difference.
 */
export function describeSource(blockType: string | undefined, hasOptions: boolean): string {
  switch (blockType) {
    case 'yesNo':
      return `This is a Yes / No field — answers are stored as “yes” or “no”. ${MATCHING_NOTE}`
    case 'checkbox':
      return `This is a checkbox — answers are stored as “true” or “false”. ${MATCHING_NOTE}`
    case 'select':
    case 'radioGroup':
    case 'checkboxGroup':
    case 'optionCards':
    case 'budgetRange':
      return hasOptions
        ? `Pick one of the field's own options. Rules match the stored value, not the label. ${MATCHING_NOTE}`
        : `This field's options are matched by their stored value, not their label. Add its options first and they will appear here. ${MATCHING_NOTE}`
    case 'number':
    case 'numberStepper':
      return 'This is a number field — enter a number to compare against.'
    default:
      return `Compared against the answer this field stores. ${MATCHING_NOTE}`
  }
}
