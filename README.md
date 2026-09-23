# 💩 Turddle

A tiny mobile-first word-ladder game. You get a 4-letter word and must turn it into **TURD**, changing exactly one letter per move, with every step a valid word.

- **Daily** mode: everyone gets the same puzzle each day (Turddle #1 was 2026-09-23). Share your result as a spoiler-free emoji grid.
- **Random** mode: endless puzzles, "New Turd" for another.
- Hints (reveal the next optimal word, +1 move), undo, and stats with daily streaks. Progress and stats live in localStorage on your device.

No backend, no accounts, no external APIs. Just React + Vite.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # game-logic unit tests (node:test, no extra deps)
npm run build    # production build in dist/
```

## How it works

```
src/
  game/
    dictionary.js   GENERATED word data (full + common lists), see scripts/build-words.mjs
    words.js        parses the dictionary into WORDS (valid) and COMMON_WORDS, TARGET = 'TURD'
    logic.js        differsByOneLetter, neighbors, BFS, puzzle generation, move validation
    daily.js        date helpers and the seeded daily puzzle
    session.js      the persisted game record (mode, start, history, hints) and what derives from it
    stats.js        played / on-par / streak bookkeeping (pure applyWin + storage)
    share.js        emoji result grid and native share / clipboard fallback
    storage.js      guarded localStorage wrapper
    *.test.js       unit tests (node:test)
  components/
    Board.jsx       current word tiles + draft row + status message
    Keyboard.jsx    on-screen QWERTY keyboard (iPhone has no text input to fight with)
    History.jsx     chain of words submitted so far
    WinScreen.jsx   win overlay: moves vs optimal, verdict, share, next steps
    StatsScreen.jsx stats modal
  App.jsx           game state (puzzle, history, draft, error) and physical-keyboard support
  styles.css        mobile-first styling, dark mode, safe-area insets
```

### Key decisions

- **One BFS from TURD, run once at load.** The word graph is undirected, so a single
  breadth-first search outward from TURD yields the distance to TURD for every word in the
  dictionary. Picking a solvable start word and computing the optimal move count is then a
  map lookup, not a search per game. `findShortestPath(start)` is a separate BFS used to
  produce the actual route shown on the win screen.
- **Only solvable starts are offered.** `SOLVABLE_STARTS` is every word with a finite distance
  to TURD. Puzzles default to at least 2 moves so they are never trivial.
- **Validation order is chosen for the most helpful message:** length, letters only, same word,
  more than one letter changed, not in dictionary, already used.
- **Repeats are rejected.** Revisiting a word is never useful and would let the move counter
  drift, so the history acts as a visited set.
- **No text input.** An on-screen keyboard avoids iOS zoom and autocorrect. A physical keyboard
  also works (letters, Backspace, Enter).
- **Daily puzzles are seeded, not stored.** The day number seeds a small PRNG that indexes into
  the pool of common starts with par between 3 and 7. Regenerating the dictionary can change
  which word a given day maps to, so treat the word list as part of the puzzle definition.
- **Hints cost a move, and undo does not refund them.** Otherwise hint-undo-hint would be free.
- **Stats are recorded in the submit handler**, synchronously, the moment TURD is submitted.
  That guarantees a win is counted exactly once, even across refreshes.
- **Share grid reveals positions, not letters.** 🟨 marks the changed tile per move, 💩 the
  final move, so a friend can see your route shape without being spoiled.
- **Two-tier dictionary.** Every 4-letter word in ENABLE (the public-domain Scrabble-style
  list) is a valid move, and the pathfinder searches that full graph, so "optimal" is honest.
  Starting words are drawn only from common English words (Google 10k ∩ ENABLE) so a puzzle
  never opens on obscure Scrabble fodder. Sexual and slur-adjacent words are kept off the
  opening tile but remain valid moves; scatological ones stay in, on brand.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/`
to GitHub Pages. One-time setup on GitHub: **Settings → Pages → Source: GitHub Actions**.
The site lands at `https://<user>.github.io/turddle/`. For a custom domain, remove the
`PAGES_REPO` env line from the workflow so the base path is `/`.

## Regenerating the dictionary

```bash
node scripts/build-words.mjs   # fetches the source lists and rewrites src/game/dictionary.js
npm test
```

The generated file is committed, so the game itself never needs the network. To force a word
in or keep one off the opening tile, edit `EXTRA_VALID` or `NEVER_START` in the script and rerun.
