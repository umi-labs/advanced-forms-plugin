export function sanitizeSubmission(
  data: Record<string, unknown>,
): Array<{ fieldName: string; value: string }> {
  return Object.entries(data).map(([fieldName, value]) => ({
    fieldName,
    value:
      value !== null && typeof value === 'object'
        ? JSON.stringify(value)
        : String(value ?? ''),
  }))
}
