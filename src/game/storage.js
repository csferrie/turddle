// Tiny safe wrapper around localStorage. Private browsing, blocked storage and
// old data can all throw or return junk, so every access is guarded and the
// game must work even when nothing persists.
const PREFIX = 'turddle:'

export function loadJSON(key, fallback = null) {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Storage unavailable; the game keeps working in memory.
  }
}

export function removeKey(key) {
  try {
    globalThis.localStorage?.removeItem(PREFIX + key)
  } catch {
    // ignore
  }
}
