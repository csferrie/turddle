import { averageOverPar, effectiveStreak } from '../game/stats.js'

export default function StatsScreen({ stats, today, onClose }) {
  const perfectPct = stats.played ? Math.round((stats.perfect / stats.played) * 100) : 0
  const avg = averageOverPar(stats)

  const items = [
    { label: 'Played', value: stats.played },
    { label: 'On par', value: `${perfectPct}%` },
    { label: 'Avg over par', value: stats.played ? avg.toFixed(1) : '–' },
    { label: 'Streak', value: effectiveStreak(stats, today) },
    { label: 'Best streak', value: stats.maxStreak },
  ]

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="stats-title" onClick={onClose}>
      <div className="win-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="stats-title" className="win-title">Your stats</h2>
        <div className="stats-grid">
          {items.map((it) => (
            <div key={it.label} className="stat">
              <span className="stat-value">{it.value}</span>
              <span className="stat-label">{it.label}</span>
            </div>
          ))}
        </div>
        <p className="win-text">Streaks count daily puzzles. Everything is stored on this device only.</p>
      </div>
    </div>
  )
}
