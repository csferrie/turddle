/** The chain of words so far, newest last. Wraps onto new lines on narrow screens. */
export default function History({ words }) {
  return (
    <section className="history" aria-label="Word history">
      <ol className="history-list">
        {words.map((w, i) => (
          <li key={`${w}-${i}`} className="history-item">
            {i > 0 && <span className="history-arrow" aria-hidden="true">→</span>}
            <span className={`chip ${i === words.length - 1 ? 'chip-current' : ''}`}>{w}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
