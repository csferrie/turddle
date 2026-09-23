import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  differsByOneLetter,
  findShortestPath,
  DISTANCE_TO_TARGET,
  SOLVABLE_STARTS,
  pickStartWord,
  validateMove,
  neighbors,
} from './logic.js'
import { WORDS, COMMON_WORDS, COMMON_SET, TARGET, isValidWord } from './words.js'

test('differsByOneLetter', () => {
  assert.equal(differsByOneLetter('CURD', 'TURD'), true)
  assert.equal(differsByOneLetter('turd', 'TURF'), true)
  assert.equal(differsByOneLetter('TURD', 'TURD'), false)
  assert.equal(differsByOneLetter('CARD', 'TURD'), false)
  assert.equal(differsByOneLetter('TUR', 'TURD'), false)
  assert.equal(differsByOneLetter('DRUT', 'TURD'), false) // anagram, positions matter
})

test('dictionary is clean and complete enough', () => {
  assert.ok(WORDS.includes(TARGET))
  for (const w of WORDS) assert.match(w, /^[A-Z]{4}$/)
  assert.equal(new Set(WORDS).size, WORDS.length)
  assert.ok(WORDS.length > 3000, `expected a full dictionary, got ${WORDS.length}`)
  for (const w of ['PART', 'POOP', 'CARD', 'LOVE', 'QUIZ', 'JAZZ']) {
    assert.ok(isValidWord(w), `${w} should be valid`)
  }
  assert.equal(isValidWord('ZZZZ'), false)
  // Every common word is also a valid word.
  for (const w of COMMON_WORDS) assert.ok(isValidWord(w), w)
  assert.ok(COMMON_WORDS.length > 500)
})

test('neighbors of TURD', () => {
  const n = neighbors('TURD')
  for (const w of n) {
    assert.ok(isValidWord(w))
    assert.ok(differsByOneLetter(w, 'TURD'))
  }
  for (const w of ['CURD', 'TURF', 'TURN']) assert.ok(n.includes(w), w)
  assert.ok(!n.includes('TURD'))
})

test('BFS finds a shortest path and it obeys the rules', () => {
  for (const start of ['POOP', 'PART']) {
    const path = findShortestPath(start)
    assert.ok(path, `${start} should reach TURD`)
    assert.equal(path[0], start)
    assert.equal(path.at(-1), TARGET)
    for (let i = 1; i < path.length; i++) {
      assert.ok(isValidWord(path[i]), path[i])
      assert.ok(differsByOneLetter(path[i - 1], path[i]), `${path[i - 1]} -> ${path[i]}`)
    }
    assert.equal(path.length - 1, DISTANCE_TO_TARGET.get(start))
  }
  assert.equal(findShortestPath('TURD').length, 1)
  assert.equal(findShortestPath('ZZZZ'), null)
})

test('every solvable start is common and has a matching path length', () => {
  for (const w of SOLVABLE_STARTS) {
    assert.ok(COMMON_SET.has(w), `${w} should be a common word`)
    const path = findShortestPath(w)
    assert.ok(path, `${w} should be solvable`)
    assert.equal(path.length - 1, DISTANCE_TO_TARGET.get(w), w)
  }
  assert.ok(SOLVABLE_STARTS.length >= 500, 'dictionary should give plenty of puzzles')
})

test('unsavoury words are never starting words but remain valid moves', () => {
  for (const w of ['CUNT', 'RAPE', 'SLUT']) {
    assert.ok(isValidWord(w))
    assert.ok(!SOLVABLE_STARTS.includes(w), `${w} should not be a start`)
  }
})

test('pickStartWord respects minMoves and exclude', () => {
  for (let i = 0; i < 200; i++) {
    const w = pickStartWord({ minMoves: 3, exclude: 'CARD' })
    assert.ok(DISTANCE_TO_TARGET.get(w) >= 3)
    assert.notEqual(w, 'CARD')
    assert.notEqual(w, TARGET)
  }
})

test('validateMove', () => {
  assert.deepEqual(validateMove('CURD', 'TURD'), { ok: true })
  assert.deepEqual(validateMove('PART', 'CART'), { ok: true })
  assert.equal(validateMove('CURD', 'CUR').ok, false)
  assert.equal(validateMove('CURD', 'CURD').ok, false)
  assert.equal(validateMove('CURD', 'TURN').ok, false) // two letters
  assert.equal(validateMove('CURD', 'CURX').ok, false) // not a word
  assert.equal(validateMove('CURD', 'CARD', ['CARD', 'CURD']).ok, false) // repeat
})
