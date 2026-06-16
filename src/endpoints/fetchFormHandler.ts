import type { PayloadHandler } from 'payload'
import type { FormDocument, FormPluginConfig } from '../types.js'

import { normalizeFormSteps } from '../utilities/normalizeFormSteps.js'

export const createFetchFormHandler = (pluginOptions: FormPluginConfig): PayloadHandler =>
  async (req) => {
    const { payload, routeParams } = req
    const slug = routeParams?.slug as string | undefined

    if (!slug) {
      return Response.json({ error: 'Form slug is required' }, { status: 400 })
    }

    const formsSlug = (pluginOptions.collections?.forms ?? 'forms') as Parameters<
      typeof payload.find
    >[0]['collection']

    const result = await payload.find({
      collection: formsSlug,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })

    if (result.docs.length === 0) {
      return Response.json({ error: `Form '${slug}' not found` }, { status: 404 })
    }

    // Collapse single-stage / multi-stage authoring into the canonical `steps`
    // shape the runtime always consumes.
    const doc = result.docs[0] as FormDocument
    return Response.json({ ...doc, steps: normalizeFormSteps(doc) })
  }
