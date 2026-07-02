# First Task for Claude Code: V1 Scaffold + Static Diagram Renderer

**Goal of this task:** get a visually testable app running before tackling audio/DSP work. No microphone code in this pass — that's task 2.

Reference `ukulele-chord-assistant-plan.md` in this repo for full context on V1/V2 scope, file structure, and data shapes. This task implements a slice of V1.

---

## Task 1: Project scaffold
- Create the file structure exactly as laid out in `ukulele-chord-assistant-plan.md`:
  - `index.html`, `/css/styles.css`, `/js/*.js`, `manifest.json`
- Basic `manifest.json` (name: "Uke Buddy", icons can be placeholder for now, `display: standalone`)
- Empty/stub service worker (`sw.js`) that caches the app shell — functional caching can be minimal for now, just get the registration working
- `index.html` should link all CSS/JS files even if some are stubs

## Task 2: Chord database (`chord-data.js`)
- Build a JSON/JS object covering these ~15-20 chords minimum for this pass (expand to full ~50 later):
  - C, G, F, Am, Em, Dm, A, D, E, A7, D7, G7, C7, Bm, Fmaj7
- Use the data shape from the plan doc:
  ```js
  {
    name: "C",
    frets: [0, 0, 0, 3],
    fingers: [0, 0, 0, 3]
  }
  ```
- Standard GCEA tuning, first-position/open shapes only for this pass

## Task 3: SVG fingering diagram renderer (`diagram-renderer.js`)
- Function that takes a chord object (from chord-data.js) and renders an SVG diagram:
  - 4 vertical lines (strings), 4-5 horizontal lines (frets)
  - Dots placed at correct fret/string intersections, sized to show finger number
  - Open strings marked with "O" above the nut, muted strings (if any) marked "X"
  - Chord name label above/below the diagram
- Should support two display sizes: large (primary/current chord) and small (next chord preview)

## Task 4: Progression builder UI (manual entry only for this pass)
- Simple UI: dropdown or searchable list to pick a chord from the database, input for beats/duration, "add to progression" button
- Display the current progression as an ordered, editable list (reorder, delete)
- No ChordPro import yet — that's a separate follow-up task

## Task 5: Static practice view (no audio yet)
- Given a saved progression, render:
  - Current chord (large diagram)
  - Next chord (small preview diagram)
  - A horizontal scrollable strip showing the full progression with the current position highlighted
- Add manual "Next" / "Previous" buttons to step through the progression (this is the placeholder for what mic detection will later trigger automatically)

## Task 6: Local storage persistence (`progression-store.js`)
- Save/load/delete named progressions to localStorage
- Data shape from the plan doc:
  ```js
  {
    id: "uuid",
    title: "Riptide",
    bpm: 100,
    progression: [ {chord, beats}, ... ],
    source: "manual"
  }
  ```
- Simple "My Songs" list view to load a saved progression into the practice view

---

## Out of scope for this task (future tasks)
- Microphone capture / Web Audio API / chroma detection (`audio-listener.js`, `chord-matcher.js`)
- ChordPro file import (`chordpro-parser.js`)
- Any V2 features

## Acceptance criteria for this task
- [ ] App loads and installs as a PWA (manifest + service worker registered)
- [ ] User can build a chord progression manually and see it rendered as a list
- [ ] Fingering diagrams render correctly for all chords in the initial database
- [ ] Practice view shows current + next chord diagrams and progression strip
- [ ] Manual Next/Previous buttons step through the progression correctly
- [ ] Progressions save to and load from localStorage correctly
- [ ] No console errors on load or during normal use

## Suggested branch name
`feature/v1-scaffold-static-diagrams`
