import { useMemo, useState } from 'react'

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

export default function WinScreen({ start, moves, optimalMoves, optimalPath, onNewTurd }) {
  const [showRoute, setShowRoute] = useState(false)
  const over = moves - optimalMoves
  const matchedOptimal = over === 0

  // useMemo so the headline does not change on every re-render (e.g. toggling the route).
  const headline = useMemo(
    () => pick(matchedOptimal ? PERFECT : over <= 2 ? CLOSE : LONG),
    [matchedOptimal, over],
  )

  const verdict = matchedOptimal
    ? 'You matched the optimal solution!'
    : `${over} move${over === 1 ? '' : 's'} over the optimal solution.`

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="win-title">
      <div className="win-card">
        <div className="win-emoji" aria-hidden="true">💩</div>
        <h2 id="win-title" className="win-title">{headline}</h2>
        <p className="win-text">
          You turned <strong>{start}</strong> into <strong>TURD</strong>.
        </p>

        <div className="win-stats">
          <div className="stat">
            <span className="stat-label">Your moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Optimal</span>
            <span className="stat-value">{optimalMoves}</span>
          </div>
        </div>

        <p className={`win-verdict ${matchedOptimal ? 'win-verdict-perfect' : ''}`}>{verdict}</p>

        {!matchedOptimal && (
          <button type="button" className="btn btn-ghost" onClick={() => setShowRoute((s) => !s)}>
            {showRoute ? 'Hide shortest route' : 'Show shortest route'}
          </button>
        )}
        {showRoute && <p className="win-route">{optimalPath.join(' → ')}</p>}

        <button type="button" className="btn btn-primary btn-big" onClick={onNewTurd} autoFocus>
          New Turd
        </button>
      </div>
    </div>
  )
}
