import type { ServerFieldBase } from 'payload'

import { describeDetails, describeSubmission } from '../utilities/describeSubmission.js'
import { SubmissionPanel } from './SubmissionPanel.js'

type Props = { formsSlug?: string } & ServerFieldBase

/**
 * Every answer on a submission, labelled with the form's own question, in place of the
 * collapsed "Datum 01…" rows. Answers can be corrected (e.g. a mistyped email) with Edit.
 */
export const SubmissionAnswers = async ({ data, formsSlug = 'forms', req }: Props) => {
  const formId = typeof data?.form === 'object' ? data?.form?.id : data?.form
  const form = formId
    ? await req.payload
        .findByID({ id: formId, collection: formsSlug as 'forms', depth: 0, req })
        .catch(() => null)
    : null

  const groups = describeSubmission(form as Parameters<typeof describeSubmission>[0], data?.data)

  return (
    <SubmissionPanel
      editable
      empty="Nothing was filled in."
      groups={groups.map((g) => ({ items: g.answers, title: g.title }))}
      heading="Answers"
      id="submission-answers"
    />
  )
}

/** Where the submission came from: page, IP, browser, and the context it was sent with. */
export const SubmissionDetails = ({ data }: ServerFieldBase) => (
  <SubmissionPanel groups={describeDetails(data ?? {})} heading="Details" id="submission-details" />
)
