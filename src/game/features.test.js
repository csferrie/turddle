import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dateKey, dailyNumber, dailyPuzzle, previousDateKey, EPOCH } from './daily.js'
import { applyWin, EMPTY_STATS, effectiveStreak } from './stats.js'
import { buildShareGrid, buildShareText } from './share.js'
import { createGame, derive, nextHint } from './session.js'
import { differsByOneLetter, DISTANCE_TO_TARGET } from './logic.js'
import { isValidWord } from './words.js'

test('date helpers', () => {
  assert.equal(dateKey(new Date(2026, 8, 23)), '2026-09-23')
  assert.equal(dailyNumber(EPOCH), 1)
  assert.equal(dailyNumber('2026-09-24'), 2)
  assert.equal(dailyNumber('2027-01-01'), 101)
  assert.equal(previousDateKey('2026-03-01'), '2026-02-28')
  assert.equal(previousDateKey('2027-01-01'), '2026-12-31')
})

test('daily puzzle is deterministic, solvable and in range', () => {
  const a = dailyPuzzle('2026-09-23')
  const b = dailyPuzzle('2026-09-23')
  assert.equal(a.start, b.start)
  assert.equal(a.number, 1)
  const starts = new Set()
  for (let d = 0; d < 60; d++) {
    const key = previousDateKeyN('2026-12-31', d)
    const p = dailyPuzzle(key)
    assert.ok(DISTANCE_TO_TARGET.has(p.start), key)
    assert.ok(p.optimalMoves >= 3 && p.optimalMoves <= 7, `${key} ${p.start} ${p.optimalMoves}`)
    starts.add(p.start)
  }
  assert.ok(starts.size > 50, 'consecutive days should mostly differ')
})

function previousDateKeyN(key, n) {
  let k = key
  for (let i = 0; i < n; i++) k = previousDateKey(k)
  return k
}

test('stats: streaks count consecutive dailies only once per day', () => {
  let s = EMPTY_STATS
  s = applyWin(s, { mode: 'daily', moves: 5, par: 5, dateKey: '2026-09-23' })
  assert.equal(s.played, 1)
  assert.equal(s.perfect, 1)
  assert.equal(s.currentStreak, 1)
  s = applyWin(s, { mode: 'daily', moves: 7, par: 5, dateKey: '2026-09-24' })
  assert.equal(s.currentStreak, 2)
  assert.equal(s.totalOver, 2)
  // Same day again does not bump the streak.
  s = applyWin(s, { mode: 'daily', moves: 5, par: 5, dateKey: '2026-09-24' })
  assert.equal(s.currentStreak, 2)
  // Random games count as played but not toward streaks.
  s = applyWin(s, { mode: 'random', moves: 4, par: 4 })
  assert.equal(s.played, 4)
  assert.equal(s.currentStreak, 2)
  // Skipping a day resets the streak.
  s = applyWin(s, { mode: 'daily', moves: 5, par: 5, dateKey: '2026-09-26' })
  assert.equal(s.currentStreak, 1)
  assert.equal(s.maxStreak, 2)
  assert.equal(effectiveStreak(s, '2026-09-27'), 1)
  assert.equal(effectiveStreak(s, '2026-09-28'), 0)
})

test('share grid marks the changed tile per row and the finishing tile with poo', () => {
  const grid = buildShareGrid(['CARD', 'CURD', 'TURD'])
  assert.equal(grid, '🟫🟨🟫🟫\n💩🟫🟫🟫')
  const text = buildShareText({
    mode: 'daily', number: 3, start: 'CARD', moves: 2, par: 2, hints: 0, history: ['CARD', 'CURD', 'TURD'],
  })
  assert.match(text, /^Turddle #3 💩\nCARD → TURD in 2 moves \(on par ⛳\)\n/)
  const t2 = buildShareText({
    mode: 'random', number: null, start: 'CARD', moves: 4, par: 2, hints: 1, history: ['CARD', 'CURD', 'TURD'],
  })
  assert.match(t2, /^Turddle 💩\nCARD → TURD in 4 moves \(2 over par, 1 hint\)/)
})

test('session: createGame, derive and hints', () => {
  const g = createGame('random')
  assert.equal(g.mode, 'random')
  assert.deepEqual(g.history, [g.start])
  const d = derive(g)
  assert.equal(d.won, false)
  assert.equal(d.moves, 0)
  assert.equal(d.par, DISTANCE_TO_TARGET.get(g.start))
  const h = nextHint(g.start)
  assert.ok(isValidWord(h))
  assert.ok(differsByOneLetter(g.start, h))
  assert.equal(DISTANCE_TO_TARGET.get(h), d.par - 1)
  assert.equal(nextHint('TURD'), null)
  const daily = createGame('daily')
  assert.equal(daily.dateKey, dateKey())
  assert.equal(daily.number, dailyNumber())
  // Hints count as moves.
  assert.equal(derive({ ...g, hints: 2 }).moves, 2)
})
