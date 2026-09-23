import { useCallback, useEffect, useMemo, useState } from 'react'
import { TARGET } from './game/words.js'
import { validateMove } from './game/logic.js'
import { createGame, derive, loadGame, loadMode, nextHint, saveGame, saveMode } from './game/session.js'
import { applyWin, loadStats, saveStats } from './game/stats.js'
import { dailyNumber, dateKey } from './game/daily.js'
import Board from './components/Board.jsx'
import Keyboard from './components/Keyboard.jsx'
import History from './components/History.jsx'
import WinScreen from './components/WinScreen.jsx'
import StatsScreen from './components/StatsScreen.jsx'

export default function App() {
  const [mode, setMode] = useState(loadMode)
  const [game, setGame] = useState(() => loadGame(mode))
  const [draft, setDraft] = useState('')
  // `error` carries an id so the same message can re-trigger the shake animation.
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(loadStats)
  const [showWin, setShowWin] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const { current, won, moves, par, optimalPath } = useMemo(() => derive(game), [game])

  // Persist whenever the game record or mode changes. Cheap, and survives refreshes.
  useEffect(() => saveGame(game), [game])
  useEffect(() => saveMode(mode), [mode])

  const resetEntry = () => {
    setDraft('')
    setError(null)
  }

  const switchMode = useCallback(
    (next) => {
      if (next === mode) return
      setMode(next)
      setGame(loadGame(next))
      setShowWin(false)
      resetEntry()
    },
    [mode],
  )

  const startNewTurd = useCallback(() => {
    setMode('random')
    setGame(createGame('random', { exclude: game.start }))
    setShowWin(false)
    resetEntry()
  }, [game.start])

  const undo = useCallback(() => {
    if (won || game.history.length < 2) return
    setGame((g) => ({ ...g, history: g.history.slice(0, -1) }))
    resetEntry()
  }, [won, game.history.length])

  const hint = useCallback(() => {
    if (won) return
    const h = nextHint(current)
    if (!h || h === draft) return
    setDraft(h)
    setError(null)
    setGame((g) => ({ ...g, hints: g.hints + 1 }))
  }, [won, current, draft])

  const addLetter = useCallback(
    (letter) => {
      if (won) return
      setDraft((d) => (d.length < 4 ? d + letter : d))
      setError(null)
    },
    [won],
  )

  const deleteLetter = useCallback(() => {
    if (won) return
    setDraft((d) => d.slice(0, -1))
    setError(null)
  }, [won])

  const submit = useCallback(() => {
    if (won) return
    const result = validateMove(current, draft, game.history)
    if (!result.ok) {
      setError({ message: result.reason, id: Date.now() })
      return
    }
    const history = [...game.history, draft]
    setGame({ ...game, history })
    resetEntry()
    if (draft === TARGET) {
      // Record stats here, synchronously, so a win is counted exactly once.
      const finalMoves = history.length - 1 + game.hints
      const next = applyWin(stats, { mode, moves: finalMoves, par, dateKey: game.dateKey })
      setStats(next)
      saveStats(next)
      setShowWin(true)
    }
  }, [won, current, draft, game, stats, mode, par])

  // Physical keyboard support (desktop, or iPad with a keyboard).
  useEffect(() => {
    function onKeyDown(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (showWin || showStats) return
      if (e.key === 'Enter') submit()
      else if (e.key === 'Backspace') deleteLetter()
      else if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase())
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submit, deleteLetter, addLetter, showWin, showStats])

  const canUndo = !won && game.history.length > 1

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <h1 className="title">
            <span className="title-emoji" aria-hidden="true">💩</span> Turddle
          </h1>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowStats(true)}
            aria-label="Statistics"
          >
            📊
          </button>
        </div>
        <div className="segmented" role="tablist" aria-label="Game mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'daily'}
            className={`segment ${mode === 'daily' ? 'segment-active' : ''}`}
            onClick={() => switchMode('daily')}
          >
            Daily #{dailyNumber()}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'random'}
            className={`segment ${mode === 'random' ? 'segment-active' : ''}`}
            onClick={() => switchMode('random')}
          >
            Random
          </button>
        </div>
        <p className="subtitle">
          Turn <strong>{game.start}</strong> into <strong>{TARGET}</strong>, one letter at a time.
        </p>
      </header>

      <main className="main">
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Par</span>
            <span className="stat-value">{par}</span>
          </div>
          {game.hints > 0 && (
            <div className="stat">
              <span className="stat-label">Hints</span>
              <span className="stat-value">{game.hints}</span>
            </div>
          )}
        </div>

        <Board current={current} draft={draft} error={error} />

        <History words={game.history} />

        <div className="actions">
          {won ? (
            <>
              <button type="button" className="btn btn-primary" onClick={() => setShowWin(true)}>
                Results
              </button>
              <button type="button" className="btn btn-ghost" onClick={startNewTurd}>
                {mode === 'daily' ? 'Play a random Turd' : 'New Turd'}
              </button>
            </>
          ) : (
            <>
              {mode === 'random' && (
                <button type="button" className="btn btn-primary" onClick={startNewTurd}>
                  New Turd
                </button>
              )}
              <button type="button" className="btn btn-pill" onClick={hint} title="Reveals the next word, costs one move">
                Hint +1
              </button>
              <button type="button" className="btn btn-pill" onClick={undo} disabled={!canUndo}>
                Undo
              </button>
            </>
          )}
        </div>
      </main>

      <Keyboard onLetter={addLetter} onDelete={deleteLetter} onEnter={submit} disabled={won} />

      {showWin && won && (
        <WinScreen
          game={game}
          moves={moves}
          par={par}
          optimalPath={optimalPath}
          onNewTurd={startNewTurd}
          onClose={() => setShowWin(false)}
        />
      )}

      {showStats && <StatsScreen stats={stats} today={dateKey()} onClose={() => setShowStats(false)} />}
    </div>
  )
}
