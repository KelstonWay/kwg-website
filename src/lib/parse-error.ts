export function parseError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)

  if (msg.includes('row-level security') || msg.includes('permission denied'))
    return "You don't have permission to do that."
  if (msg.includes('duplicate key') || msg.includes('unique constraint'))
    return 'That record already exists.'
  if (msg.includes('foreign key constraint'))
    return 'Cannot complete — a linked record is missing.'
  if (msg.includes('JWT') || msg.includes('token') || msg.includes('session'))
    return 'Your session has expired. Please log in again.'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch'))
    return 'Network error. Check your connection and try again.'
  if (msg.includes('invalid input syntax') || msg.includes('invalid value'))
    return 'Invalid input. Please check your entries.'

  return msg || 'Something went wrong. Please try again.'
}
