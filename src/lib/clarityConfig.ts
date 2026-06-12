export const DEFAULT_CLARITY_PROJECT_ID = 'x604ovwxq7'

export function getClarityProjectId(): string {
  return process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim() || DEFAULT_CLARITY_PROJECT_ID
}
