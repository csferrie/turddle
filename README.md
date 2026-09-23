# 💩 Turddle

A tiny mobile-first word-ladder game. You get a random 4-letter word and must turn it into **TURD**, changing exactly one letter per move, with every step a valid word.

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
    logic.test.js   unit tests
  components/
    Board.jsx       current word tiles + draft row + status message
    Keyboard.jsx    on-screen QWERTY keyboard (iPhone has no text input to fight with)
    History.jsx     chain of words submitted so far
    WinScreen.jsx   win overlay: your moves vs optimal, funny verdict, "New Turd"
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
- **Two-tier dictionary.** Every 4-letter word in ENABLE (the public-domain Scrabble-style
  list) is a valid move, and the pathfinder searches that full graph, so "optimal" is honest.
  Starting words are drawn only from common English words (Google 10k ∩ ENABLE) so a puzzle
  never opens on obscure Scrabble fodder. Sexual and slur-adjacent words are kept off the
  opening tile but remain valid moves; scatological ones stay in, on brand.

## Regenerating the dictionary

```bash
node scripts/build-words.mjs   # fetches the source lists and rewrites src/game/dictionary.js
npm test
```

The generated file is committed, so the game itself never needs the network. To force a word
in or keep one off the opening tile, edit `EXTRA_VALID` or `NEVER_START` in the script and rerun.
