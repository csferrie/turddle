import { DISTANCE_TO_TARGET, SOLVABLE_STARTS, findShortestPath } from './logic.js'
import { TARGET } from './words.js'

// Turddle #1 is launch day. Later days count up from here.
export const EPOCH = '2026-09-23'

// Daily puzzles stay in a comfortable range: long enough to be a puzzle,
// short enough that nobody rage-quits before breakfast.
const DAILY_MIN_MOVES = 3
const DAILY_MAX_MOVES = 7

/** Local-time calendar date as YYYY-MM-DD. The daily rolls over at local midnight. */
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Days since EPOCH, 1-based, so launch day is Turddle #1. */
export function dailyNumber(key = dateKey()) {
  const [y, m, d] = key.split('-').map(Number)
  const [ey, em, ed] = EPOCH.split('-').map(Number)
  const ms = Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)
  return Math.round(ms / 86_400_000) + 1
}

/** The date key for the day before. Used for streak bookkeeping. */
export function previousDateKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  const prev = new Date(Date.UTC(y, m - 1, d) - 86_400_000)
  return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}-${String(prev.getUTCDate()).padStart(2, '0')}`
}

/** Small, deterministic PRNG so the same day always yields the same puzzle. */
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DAILY_POOL = SOLVABLE_STARTS.filter((w) => {
  const d = DISTANCE_TO_TARGET.get(w)
  return d >= DAILY_MIN_MOVES && d <= DAILY_MAX_MOVES
})

/** Deterministic puzzle for a given day. Everyone gets the same start word. */
export function dailyPuzzle(key = dateKey()) {
  const n = dailyNumber(key)
  // Mix the day number a little before seeding so nearby days do not cluster.
  const rand = mulberry32(n * 2654435761)
  const start = DAILY_POOL[Math.floor(rand() * DAILY_POOL.length)]
  return {
    start,
    target: TARGET,
    optimalMoves: DISTANCE_TO_TARGET.get(start),
    optimalPath: findShortestPath(start),
    dateKey: key,
    number: n,
  }
}
