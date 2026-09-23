import { WORD_SET, COMMON_WORDS, TARGET, isValidWord } from './words.js'

/** True only when the two words have the same length and differ in exactly one position. */
export function differsByOneLetter(wordA, wordB) {
  const a = String(wordA).toUpperCase()
  const b = String(wordB).toUpperCase()
  if (a.length !== b.length) return false
  let diffs = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      diffs++
      if (diffs > 1) return false
    }
  }
  return diffs === 1
}

/** All dictionary words that are one letter away from `word`. */
export function neighbors(word, wordSet = WORD_SET) {
  const w = String(word).toUpperCase()
  const out = []
  for (let i = 0; i < w.length; i++) {
    for (let c = 65; c <= 90; c++) {
      const letter = String.fromCharCode(c)
      if (letter === w[i]) continue
      const candidate = w.slice(0, i) + letter + w.slice(i + 1)
      if (wordSet.has(candidate)) out.push(candidate)
    }
  }
  return out
}

/**
 * Breadth-first search for the shortest ladder from `start` to `target`.
 * Returns an array of words including both endpoints, or null if unreachable.
 */
export function findShortestPath(start, target = TARGET, wordSet = WORD_SET) {
  const s = String(start).toUpperCase()
  const t = String(target).toUpperCase()
  if (!wordSet.has(s) || !wordSet.has(t)) return null
  if (s === t) return [s]

  const parent = new Map([[s, null]])
  const queue = [s]
  let head = 0
  while (head < queue.length) {
    const current = queue[head++]
    for (const next of neighbors(current, wordSet)) {
      if (parent.has(next)) continue
      parent.set(next, current)
      if (next === t) {
        const path = [t]
        let node = current
        while (node !== null) {
          path.push(node)
          node = parent.get(node)
        }
        return path.reverse()
      }
      queue.push(next)
    }
  }
  return null
}

/**
 * One BFS outward from the target gives the distance to TURD for every word.
 * The ladder graph is undirected, so distance(word -> TURD) == distance(TURD -> word).
 * Computed once at module load; the dictionary is static.
 */
export function buildDistanceMap(target = TARGET, wordSet = WORD_SET) {
  const t = String(target).toUpperCase()
  const dist = new Map([[t, 0]])
  const queue = [t]
  let head = 0
  while (head < queue.length) {
    const current = queue[head++]
    const d = dist.get(current)
    for (const next of neighbors(current, wordSet)) {
      if (dist.has(next)) continue
      dist.set(next, d + 1)
      queue.push(next)
    }
  }
  return dist
}

export const DISTANCE_TO_TARGET = buildDistanceMap()

/**
 * Candidate starting words: common (not obscure) words that can actually reach
 * TURD, excluding TURD itself. Validation and pathfinding still use the full list.
 */
export const SOLVABLE_STARTS = COMMON_WORDS.filter(
  (w) => w !== TARGET && DISTANCE_TO_TARGET.has(w),
)

/**
 * Pick a random start word that has a route to TURD.
 * `minMoves` avoids trivially short puzzles (default: at least 2 moves).
 */
export function pickStartWord({ minMoves = 2, exclude = null, random = Math.random } = {}) {
  let pool = SOLVABLE_STARTS.filter((w) => DISTANCE_TO_TARGET.get(w) >= minMoves)
  if (exclude && pool.length > 1) pool = pool.filter((w) => w !== exclude)
  if (pool.length === 0) pool = SOLVABLE_STARTS
  return pool[Math.floor(random() * pool.length)]
}

/** Create a fresh puzzle with the optimal move count precomputed. */
export function newPuzzle(options) {
  const start = pickStartWord(options)
  return {
    start,
    target: TARGET,
    optimalMoves: DISTANCE_TO_TARGET.get(start),
    optimalPath: findShortestPath(start),
  }
}

/**
 * Validate a proposed next word. Returns { ok: true } or { ok: false, reason }.
 * Order matters: the most specific, most helpful message wins.
 */
export function validateMove(current, proposed, history = []) {
  const next = String(proposed).toUpperCase()
  if (next.length !== 4) return { ok: false, reason: 'Words must be 4 letters.' }
  if (!/^[A-Z]{4}$/.test(next)) return { ok: false, reason: 'Letters only, please.' }
  if (next === current) return { ok: false, reason: 'Same word. Change one letter.' }
  if (!differsByOneLetter(current, next)) {
    return { ok: false, reason: 'Change exactly one letter.' }
  }
  if (!isValidWord(next)) return { ok: false, reason: `${next} is not in the word list.` }
  if (history.includes(next)) return { ok: false, reason: `You already used ${next}.` }
  return { ok: true }
}
