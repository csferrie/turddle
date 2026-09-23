import { DISTANCE_TO_TARGET, findShortestPath, newPuzzle } from './logic.js'
import { dailyPuzzle, dateKey } from './daily.js'
import { loadJSON, saveJSON } from './storage.js'
import { TARGET } from './words.js'

/**
 * A "game" is the persisted, player-owned part of a session:
 *   { mode, start, history, hints, dateKey?, number? }
 * Everything else (par, optimal path, won) is derived from it.
 */

const gameKey = (mode) => `game:${mode}`

export function createGame(mode, { exclude = null } = {}) {
  if (mode === 'daily') {
    const p = dailyPuzzle()
    return { mode, start: p.start, history: [p.start], hints: 0, dateKey: p.dateKey, number: p.number }
  }
  const p = newPuzzle({ exclude })
  return { mode, start: p.start, history: [p.start], hints: 0 }
}

function isSane(game, mode) {
  return (
    game &&
    game.mode === mode &&
    typeof game.start === 'string' &&
    Array.isArray(game.history) &&
    game.history[0] === game.start &&
    DISTANCE_TO_TARGET.has(game.start)
  )
}

/** Resume a saved game for this mode, or start a fresh one. Daily games expire at midnight. */
export function loadGame(mode) {
  const saved = loadJSON(gameKey(mode))
  if (isSane(saved, mode)) {
    if (mode !== 'daily' || saved.dateKey === dateKey()) {
      return { hints: 0, ...saved }
    }
  }
  return createGame(mode)
}

export function saveGame(game) {
  saveJSON(gameKey(game.mode), game)
}

export function loadMode() {
  const m = loadJSON('mode', 'daily')
  return m === 'random' ? 'random' : 'daily'
}

export function saveMode(mode) {
  saveJSON('mode', mode)
}

/** Everything the UI needs that follows from the game record. */
export function derive(game) {
  const current = game.history[game.history.length - 1]
  return {
    current,
    won: current === TARGET,
    moves: game.history.length - 1 + game.hints,
    par: DISTANCE_TO_TARGET.get(game.start),
    optimalPath: findShortestPath(game.start),
  }
}

/** The next word on a shortest route from the current word. */
export function nextHint(current) {
  const path = findShortestPath(current)
  return path && path.length > 1 ? path[1] : null
}
