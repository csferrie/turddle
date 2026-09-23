const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

// Blur after each tap so a focused key does not also fire when the player
// presses Enter on a physical keyboard.
function tap(handler) {
  return (e) => {
    e.currentTarget.blur()
    handler()
  }
}

/** On-screen keyboard so the game works on iPhone without a text input. */
export default function Keyboard({ onLetter, onDelete, onEnter, disabled }) {
  return (
    <div className="keyboard" role="group" aria-label="Keyboard">
      {ROWS.map((row, rowIndex) => (
        <div key={row} className="keyboard-row">
          {rowIndex === 2 && (
            <button
              type="button"
              className="key key-wide"
              onClick={tap(onEnter)}
              disabled={disabled}
              aria-label="Submit word"
            >
              ENTER
            </button>
          )}
          {row.split('').map((letter) => (
            <button
              key={letter}
              type="button"
              className="key"
              onClick={tap(() => onLetter(letter))}
              disabled={disabled}
            >
              {letter}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              className="key key-wide"
              onClick={tap(onDelete)}
              disabled={disabled}
              aria-label="Delete letter"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
