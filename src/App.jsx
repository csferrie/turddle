import { useCallback, useEffect, useState } from 'react'
import { TARGET } from './game/words.js'
import { newPuzzle, validateMove } from './game/logic.js'
import Board from './components/Board.jsx'
import Keyboard from './components/Keyboard.jsx'
import History from './components/History.jsx'
import WinScreen from './components/WinScreen.jsx'

export default function App() {
  const [puzzle, setPuzzle] = useState(() => newPuzzle())
  const [history, setHistory] = useState(() => [puzzle.start])
  const [draft, setDraft] = useState('')
  // `error` carries a counter so the same message can re-trigger the shake animation.
  const [error, setError] = useState(null)

  const current = history[history.length - 1]
  const moves = history.length - 1
  const won = current === TARGET

  const startNewTurd = useCallback(() => {
    const next = newPuzzle({ exclude: puzzle.start })
    setPuzzle(next)
    setHistory([next.start])
    setDraft('')
    setError(null)
  }, [puzzle.start])

  const restart = useCallback(() => {
    setHistory([puzzle.start])
    setDraft('')
    setError(null)
  }, [puzzle.start])

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
    const result = validateMove(current, draft, history)
    if (!result.ok) {
      setError({ message: result.reason, id: Date.now() })
      return
    }
    setHistory((h) => [...h, draft])
    setDraft('')
    setError(null)
  }, [won, current, draft, history])

  // Physical keyboard support (desktop, or iPad with a keyboard).
  useEffect(() => {
    function onKeyDown(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Enter') submit()
      else if (e.key === 'Backspace') deleteLetter()
      else if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key.toUpperCase())
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submit, deleteLetter, addLetter])

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span className="title-emoji" aria-hidden="true">💩</span> Turddle
        </h1>
        <p className="subtitle">
          Turn <strong>{puzzle.start}</strong> into <strong>{TARGET}</strong>, one letter at a time.
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
            <span className="stat-value">{puzzle.optimalMoves}</span>
          </div>
        </div>

        <Board current={current} draft={draft} error={error} />

        <History words={history} />

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={startNewTurd}>
            New Turd
          </button>
          {moves > 0 && !won && (
            <button type="button" className="btn btn-ghost" onClick={restart}>
              Start over
            </button>
          )}
        </div>
      </main>

      <Keyboard onLetter={addLetter} onDelete={deleteLetter} onEnter={submit} disabled={won} />

      {won && (
        <WinScreen
          start={puzzle.start}
          moves={moves}
          optimalMoves={puzzle.optimalMoves}
          optimalPath={puzzle.optimalPath}
          onNewTurd={startNewTurd}
        />
      )}
    </div>
  )
}
