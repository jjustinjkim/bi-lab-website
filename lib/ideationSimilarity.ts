// Lightweight near-duplicate flag for the ideation board: lowercase
// word-overlap (Jaccard similarity) between idea titles. Catches
// near-identical phrasing ("meningioma immune infiltrate" vs "immune
// infiltrate in meningioma"), not true paraphrases with no shared words --
// a human should still skim the board, this just flags the obvious ones.

export function wordSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2) // drop tiny/stopword-ish tokens ("a", "of", "to")
  )
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = wordSet(a)
  const setB = wordSet(b)
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const w of setA) if (setB.has(w)) intersection++
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

export const DUPLICATE_THRESHOLD = 0.5

// For each idea, the id of the single most similar OTHER idea, if its
// similarity clears the threshold. O(n^2) -- fine at brainstorm-board scale
// (tens of ideas, not thousands); revisit if this table ever gets huge.
export function findPossibleDuplicates(ideas: { id: string; title: string }[]): Map<string, string> {
  const result = new Map<string, string>()
  for (let i = 0; i < ideas.length; i++) {
    let bestScore = 0
    let bestId: string | null = null
    for (let j = 0; j < ideas.length; j++) {
      if (i === j) continue
      const score = jaccardSimilarity(ideas[i].title, ideas[j].title)
      if (score > bestScore) {
        bestScore = score
        bestId = ideas[j].id
      }
    }
    if (bestId && bestScore >= DUPLICATE_THRESHOLD) {
      result.set(ideas[i].id, bestId)
    }
  }
  return result
}
