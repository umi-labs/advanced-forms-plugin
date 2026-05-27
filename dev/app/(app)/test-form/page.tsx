import { EnquiryForm } from '@foundrykit/form-plugin/client'
import { fetchForm } from '@foundrykit/form-plugin/rsc'

export default async function TestFormPage() {
  let form
  try {
    form = await fetchForm({
      slug: 'travel-enquiry',
      baseUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000',
    })
  } catch (err) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Test Form</h1>
        <p>Could not load form. Make sure the dev server seeded the travel-enquiry form.</p>
        <pre>{String(err)}</pre>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1>Test Form</h1>
      <EnquiryForm form={form} />
    </main>
  )
}
