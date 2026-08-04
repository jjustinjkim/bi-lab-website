// Escape ILIKE metacharacters (\, %, _) so a case-insensitive lookup can't be
// turned into a wildcard match -- without this, an email containing "_" or "%"
// would match other members' rows that merely have a similarly-shaped email.
export function escapeLikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}
