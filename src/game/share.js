/**
 * Wordle-style shareable result. Each row is one move: the tile that changed
 * is 🟨, unchanged tiles are 🟫, and the move that lands on TURD gets 💩.
 * Positions are revealed, letters are not, so it does not spoil the puzzle.
 */
export function buildShareGrid(history) {
  const rows = []
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]
    const cur = history[i]
    const last = i === history.length - 1
    let row = ''
    for (let j = 0; j < 4; j++) {
      if (prev[j] === cur[j]) row += '🟫'
      else row += last ? '💩' : '🟨'
    }
    rows.push(row)
  }
  return rows.join('\n')
}

export function buildShareText({ mode, number, start, moves, par, hints, history }) {
  const title = mode === 'daily' ? `Turddle #${number}` : 'Turddle'
  const diff = moves - par
  const verdict = diff === 0 ? 'on par ⛳' : diff < 0 ? `${-diff} under par 🤯` : `${diff} over par`
  const hintNote = hints > 0 ? `, ${hints} hint${hints === 1 ? '' : 's'}` : ''
  return [
    `${title} 💩`,
    `${start} → TURD in ${moves} moves (${verdict}${hintNote})`,
    buildShareGrid(history),
  ].join('\n')
}

/** Native share sheet on iPhone, clipboard elsewhere. Resolves to what happened. */
export async function shareResult(text) {
  try {
    if (navigator.share) {
      await navigator.share({ text })
      return 'shared'
    }
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled'
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'copied'
  } catch {
    return 'failed'
  }
}
