import { useMemo, useState } from 'react'
import { buildShareText, shareResult } from '../game/share.js'

const PERFECT = [
  'Flawless flush!',
  'A clean drop. No splash.',
  'One wipe wonder.',
  'Turd-ally optimal.',
  'That went down smooth.',
]

const CLOSE = [
  'Nearly a clean flush.',
  'A respectable dump.',
  'Solid effort. Emphasis on solid.',
  'Not perfect, but it got there.',
]

const LONG = [
  'That took a while. Everything okay in there?',
  'A real struggle on the porcelain throne.',
  'Took the scenic route to the bowl.',
  'You got there. Eventually. Wash your hands.',
]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export default function WinScreen({ game, moves, par, optimalPath, onNewTurd, onClose }) {
  const [showRoute, setShowRoute] = useState(false)
  const [shareStatus, setShareStatus] = useState(null)
  const over = moves - par
  const matchedOptimal = over === 0
  const isDaily = game.mode === 'daily'

  // useMemo so the headline does not change on every re-render (e.g. toggling the route).
  const headline = useMemo(
    () => pick(matchedOptimal ? PERFECT : over <= 2 ? CLOSE : LONG),
    [matchedOptimal, over],
  )

  const verdict = matchedOptimal
    ? 'You matched the optimal solution!'
    : `${over} move${over === 1 ? '' : 's'} over the optimal solution.`

  async function share() {
    const text = buildShareText({
      mode: game.mode,
      number: game.number,
      start: game.start,
      moves,
      par,
      hints: game.hints,
      history: game.history,
    })
    const outcome = await shareResult(text)
    setShareStatus(
      outcome === 'copied' ? 'Copied to clipboard!' : outcome === 'failed' ? 'Could not share.' : null,
    )
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="win-title">
      <div className="win-card">
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="win-emoji" aria-hidden="true">💩</div>
        <h2 id="win-title" className="win-title">{headline}</h2>
        <p className="win-text">
          {isDaily ? `Turddle #${game.number}. ` : ''}
          You turned <strong>{game.start}</strong> into <strong>TURD</strong>.
        </p>

        <div className="win-stats">
          <div className="stat">
            <span className="stat-label">Your moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Optimal</span>
            <span className="stat-value">{par}</span>
          </div>
          {game.hints > 0 && (
            <div className="stat">
              <span className="stat-label">Hints</span>
              <span className="stat-value">{game.hints}</span>
            </div>
          )}
        </div>

        <p className={`win-verdict ${matchedOptimal ? 'win-verdict-perfect' : ''}`}>{verdict}</p>

        {!matchedOptimal && (
          <button type="button" className="btn btn-ghost" onClick={() => setShowRoute((s) => !s)}>
            {showRoute ? 'Hide shortest route' : 'Show shortest route'}
          </button>
        )}
        {showRoute && <p className="win-route">{optimalPath.join(' → ')}</p>}

        <button type="button" className="btn btn-primary btn-big" onClick={share}>
          Share
        </button>
        {shareStatus && <p className="share-status" role="status">{shareStatus}</p>}

        <button type="button" className="btn btn-ghost" onClick={onNewTurd}>
          {isDaily ? 'Play a random Turd' : 'New Turd'}
        </button>
        {isDaily && <p className="win-next">Next Turddle at midnight.</p>}
      </div>
    </div>
  )
}
