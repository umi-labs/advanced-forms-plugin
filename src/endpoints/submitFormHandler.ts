import type { PayloadHandler } from 'payload'
import type { FormDocument, FormPluginConfig } from '../types.js'
import { sanitizeSubmission } from '../utilities/sanitizeSubmission.js'
import { validateVisibleSubmission } from '../utilities/validateVisibleSubmission.js'

function interpolate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''))
}

function buildEmailHtml(formTitle: string, data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 8px;font-weight:bold">${k}</td>` +
        `<td style="padding:4px 8px">${typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')}</td></tr>`,
    )
    .join('')
  return `<h2>Form Submission: ${formTitle}</h2><table border="1" cellpadding="0" cellspacing="0">${rows}</table>`
}

export const createSubmitFormHandler = (pluginOptions: FormPluginConfig): PayloadHandler =>
  async (req) => {
    const { payload, routeParams } = req
    const formSlug = routeParams?.formSlug as string | undefined

    if (!formSlug) {
      return Response.json(
        { success: false, errors: [{ field: '', message: 'Form slug is required' }] },
        { status: 400 },
      )
    }

    let body: {
      data?: Record<string, unknown>
      metadata?: Record<string, unknown>
      context?: unknown
    }
    try {
      body = (await req.json?.()) as typeof body
    } catch {
      return Response.json(
        { success: false, errors: [{ field: '', message: 'Invalid JSON body' }] },
        { status: 400 },
      )
    }

    const submissionData = body.data ?? {}
    const metadata = body.metadata ?? {}
    // Only persist context when it's a plain object; ignore arrays/primitives/null.
    const isPlainObject = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null && !Array.isArray(value)
    const context = isPlainObject(body.context) ? body.context : undefined

    const formsSlug = (pluginOptions.collections?.forms ?? 'forms') as Parameters<
      typeof payload.find
    >[0]['collection']
    const submissionsSlug = (pluginOptions.collections?.submissions ??
      'form-submissions') as Parameters<typeof payload.create>[0]['collection']

    // Load form by slug
    const result = await payload.find({
      collection: formsSlug,
      where: { slug: { equals: formSlug } },
      limit: 1,
    })

    if (result.docs.length === 0) {
      return Response.json(
        { success: false, errors: [{ field: '', message: `Form '${formSlug}' not found` }] },
        { status: 404 },
      )
    }

    const form = result.docs[0] as FormDocument

    // Validate required fields (respecting conditional visibility) and strip
    // values for fields hidden by their conditions so they are never stored.
    const { errors, data: visibleData } = validateVisibleSubmission(form, submissionData)

    if (errors.length > 0) {
      return Response.json({ success: false, errors }, { status: 422 })
    }

    // Store submission
    const submission = await payload.create({
      collection: submissionsSlug,
      data: {
        form: form.id,
        submittedAt: new Date().toISOString(),
        data: sanitizeSubmission(visibleData),
        metadata: {
          userAgent: req.headers.get('user-agent') ?? '',
          ip: req.headers.get('x-forwarded-for') ?? '',
          referrer: String(metadata.referrer ?? ''),
        },
        ...(context ? { context } : {}),
      },
    })

    // Execute submission actions
    const responseActions: { confirmationMessage?: unknown; redirectUrl?: string } = {}

    for (const action of form.submissionActions) {
      if (action.blockType === 'sendEmail') {
        const emailValue = submissionData['email'] as string | undefined
        const html =
          action.includeSubmissionData !== false
            ? buildEmailHtml(form.title, submissionData)
            : undefined

        await payload.sendEmail({
          to: action.to,
          replyTo: action.replyTo ?? emailValue,
          subject: interpolate(action.subject, submissionData),
          html,
        })
      } else if (action.blockType === 'confirmationMessage') {
        responseActions.confirmationMessage = action.message
      } else if (action.blockType === 'redirect') {
        responseActions.redirectUrl = action.url
      }
    }

    return Response.json({
      success: true,
      actions: responseActions,
      submissionId: String(submission.id),
    })
  }
