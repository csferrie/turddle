import { loadJSON, saveJSON } from './storage.js'
import { previousDateKey } from './daily.js'

const KEY = 'stats'

export const EMPTY_STATS = {
  played: 0, // games finished (daily + random)
  perfect: 0, // games finished at par
  totalOver: 0, // sum of (moves - par), for the average
  currentStreak: 0, // consecutive daily puzzles solved
  maxStreak: 0,
  lastDailyKey: null, // date of the last daily solved
}

export function loadStats() {
  return { ...EMPTY_STATS, ...(loadJSON(KEY, {}) || {}) }
}

export function saveStats(stats) {
  saveJSON(KEY, stats)
}

/**
 * Pure: return the stats after recording a finished game.
 * Streaks only count daily puzzles, and a daily is counted at most once.
 */
export function applyWin(stats, { mode, moves, par, dateKey }) {
  const next = { ...stats }
  next.played += 1
  if (moves === par) next.perfect += 1
  next.totalOver += Math.max(0, moves - par)

  if (mode === 'daily' && dateKey && dateKey !== stats.lastDailyKey) {
    const continues = stats.lastDailyKey === previousDateKey(dateKey)
    next.currentStreak = continues ? stats.currentStreak + 1 : 1
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak)
    next.lastDailyKey = dateKey
  }
  return next
}

/** Streak display: a streak is only "current" if yesterday or today was solved. */
export function effectiveStreak(stats, todayKey) {
  if (!stats.lastDailyKey) return 0
  if (stats.lastDailyKey === todayKey || stats.lastDailyKey === previousDateKey(todayKey)) {
    return stats.currentStreak
  }
  return 0
}

export function averageOverPar(stats) {
  return stats.played === 0 ? 0 : stats.totalOver / stats.played
}
