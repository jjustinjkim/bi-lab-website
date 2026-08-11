import { describe, it, expect } from 'vitest'
import { jaccardSimilarity, findPossibleDuplicates } from './ideationSimilarity'

describe('jaccardSimilarity', () => {
  it('scores identical titles at 1', () => {
    expect(jaccardSimilarity('Meningioma immune infiltrate', 'Meningioma immune infiltrate')).toBe(1)
  })

  it('scores completely unrelated titles at 0', () => {
    expect(jaccardSimilarity('Meningioma immune infiltrate', 'IONM electrode placement guide')).toBe(0)
  })

  it('is insensitive to word order and case', () => {
    const a = jaccardSimilarity('Meningioma Immune Infiltrate', 'immune infiltrate meningioma')
    expect(a).toBe(1)
  })

  it('scores a partial overlap between 0 and 1', () => {
    const score = jaccardSimilarity('Meningioma immune infiltrate mapping', 'Pituitary immune infiltrate mapping')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })
})

describe('findPossibleDuplicates', () => {
  it('flags two near-identical titles as duplicates of each other', () => {
    const ideas = [
      { id: 'a', title: 'Meningioma immune infiltrate mapping' },
      { id: 'b', title: 'Immune infiltrate mapping in meningioma' },
      { id: 'c', title: 'IONM electrode placement guide' },
    ]
    const dupes = findPossibleDuplicates(ideas)
    expect(dupes.get('a')).toBe('b')
    expect(dupes.get('b')).toBe('a')
    expect(dupes.has('c')).toBe(false)
  })

  it('returns an empty map when nothing is similar', () => {
    const ideas = [
      { id: 'a', title: 'Meningioma immune infiltrate mapping' },
      { id: 'b', title: 'IONM electrode placement guide' },
    ]
    expect(findPossibleDuplicates(ideas).size).toBe(0)
  })
})
