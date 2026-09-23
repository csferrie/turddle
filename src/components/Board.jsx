import { TARGET } from '../game/words.js'

/**
 * The play area: the current word as four big tiles, a draft row the
 * player fills in, and the target word as a reminder.
 */
export default function Board({ current, draft, error }) {
  const draftLetters = Array.from({ length: 4 }, (_, i) => draft[i] ?? '')
  const draftFull = draft.length === 4

  return (
    <section className="board" aria-label="Game board">
      <div className="tiles tiles-current" aria-label={`Current word ${current}`}>
        {current.split('').map((ch, i) => (
          <div key={i} className="tile tile-solid">
            {ch}
          </div>
        ))}
      </div>

      <div className="arrow" aria-hidden="true">↓</div>

      <div
        key={error?.id ?? 'ok'}
        className={`tiles tiles-draft ${error ? 'shake' : ''}`}
        aria-label={draft ? `Your next word ${draft}` : 'Type your next word'}
      >
        {draftLetters.map((ch, i) => {
          const changed = draftFull && ch !== current[i]
          const classes = ['tile', 'tile-draft']
          if (ch) classes.push('tile-filled')
          if (changed) classes.push('tile-changed')
          if (i === draft.length && !draftFull) classes.push('tile-cursor')
          return (
            <div key={i} className={classes.join(' ')}>
              {ch}
            </div>
          )
        })}
      </div>

      <p className={`message ${error ? 'message-error' : ''}`} role="status" aria-live="polite">
        {error ? error.message : `Goal: ${TARGET}`}
      </p>
    </section>
  )
}
