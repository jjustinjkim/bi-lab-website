// Same daysUntil/byDeadline shape as app/portal/grants/page.tsx, shared here
// since it's used by both the JJK home digest and the presentations tracker.
export function daysUntil(dateStr: string): number {
  const target = new Date(`${dateStr}T00:00:00`).getTime()
  return Math.ceil((target - Date.now()) / 86_400_000)
}

export function byDeadline<T extends { deadline_date: string | null }>(a: T, b: T): number {
  if (a.deadline_date && b.deadline_date) return a.deadline_date.localeCompare(b.deadline_date)
  if (a.deadline_date) return -1
  if (b.deadline_date) return 1
  return 0
}

export const URGENT_WINDOW_DAYS = 90
export const SOON_WINDOW_DAYS = 14
