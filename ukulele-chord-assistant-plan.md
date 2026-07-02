# Ukulele Chord Assistant — Project Plan

## Overview
A web-based follow-along ukulele practice tool. User enters or imports a chord progression, the app listens via microphone, detects the currently-played chord using pitch/chroma analysis, and auto-advances through the progression while displaying fingering diagrams — similar in spirit to Bread Buddy / Cheese Buddy (single-page PWA, offline-capable, localStorage-first, no backend required for core function).

**Repo name suggestion:** `uke-buddy` (keeps naming consistent with the "Buddy" app family)

**Stack:** HTML, CSS, vanilla JavaScript. No frameworks required. PWA manifest + service worker for offline use, same pattern as prior Buddy apps.

---

## V1 Scope — Follow-Along Mode

### Core features
1. **Chord progression input**
   - Manual builder UI: add chord + duration (in beats), reorder, delete, edit
   - ChordPro (.cho/.crd) file import — parse inline `[Chord]lyric` format into a sequence
   - Save/load progressions to localStorage (list of saved songs)

2. **Chord diagram renderer (SVG)**
   - Ukulele-specific: 4 strings (GCEA), 4-5 frets visible
   - JSON chord database covering ~50 common open/first-position shapes (C, Am, F, G, Dm, Em, A7, D7, etc., plus common variants)
   - Renders current chord (large, primary) and next chord (small, preview)

3. **Audio listening & chord detection**
   - `getUserMedia()` mic capture
   - Web Audio API `AnalyserNode` / `AudioWorklet` for FFT
   - Chroma vector computation (12 pitch classes) — consider Meyda.js for feature extraction to avoid writing DSP from scratch
   - Match detected chroma against expected chord's template (not blind matching — always comparing against "is this the chord we expect next")
   - Confidence threshold + debounce (avoid advancing on strum noise/transients)

4. **Follow-along logic (event-driven, not clock-driven)**
   - App waits for mic confirmation of the expected next chord, then advances
   - Optional BPM/beats-per-chord used only for visual pacing cues ("coming up in ~2 beats"), never for driving advancement
   - Manual override: tap/swipe to advance or go back regardless of detection

5. **Practice session UI**
   - Current chord (big diagram) + next chord (small preview) + progression strip (scrollable, highlights position)
   - Start/stop/reset listening
   - Visual "listening / matched / waiting" state indicator

6. **PWA basics**
   - manifest.json, service worker for offline shell caching
   - Installable on mobile (matches Bread Buddy / Cheese Buddy pattern)

### Explicit non-goals for V1
- No blind/unprompted chord recognition (always follow-along against a known sequence)
- No account system / cloud sync — localStorage only
- No precise tempo-locked timing from external sources

### Suggested file structure
```
/uke-buddy
  index.html
  /css
    styles.css
  /js
    app.js              // orchestration
    audio-listener.js   // mic capture, FFT, chroma
    chord-matcher.js    // chroma-to-chord matching against expected chord
    chord-data.js       // JSON chord fingering database
    chordpro-parser.js  // .cho/.crd import parser
    progression-store.js // localStorage CRUD for saved songs
    diagram-renderer.js // SVG fingering diagram generation
    sw.js               // service worker
  manifest.json
  README.md
```

### Data structures
```js
// Chord progression entry
{ chord: "C", beats: 4 }

// Chord database entry
{
  name: "C",
  frets: [0, 0, 0, 3],   // G C E A strings, fret per string, 0 = open
  fingers: [0, 0, 0, 3]  // suggested finger number per string, 0 = open/none
}

// Saved song
{
  id: "uuid",
  title: "Riptide",
  bpm: 100,           // optional, display-only
  progression: [ {chord, beats}, ... ],
  source: "manual" | "chordpro-import"
}
```

### Acceptance criteria for V1
- [ ] Can manually build a progression and save it
- [ ] Can import a basic ChordPro file and get a correct chord sequence
- [ ] Mic-based detection correctly confirms an expected open chord (C, G, Am, F, Em minimum) in a quiet room at reasonable volume
- [ ] App auto-advances only on confirmed match, with a manual override always available
- [ ] Fingering diagrams render correctly for all chords in the V1 database
- [ ] Works offline after first load (PWA)
- [ ] Works on mobile Chrome/Safari (mic permission flow handled gracefully)

---

## V2 Scope — Planned Enhancements

### 1. True live/blind detection mode
- Continuous chroma matching with no pre-loaded progression
- Chord history log building in real time as the user plays
- Accept lower accuracy here; frame as "jam mode" rather than practice mode

### 2. Expanded chord database
- Barre chords, 7ths, sus2/sus4, add9, altered tunings (baritone DGBE)
- Alternate fingering suggestions (user can cycle through voicings for the same chord)

### 3. Tempo & rhythm features
- Tap-tempo BPM entry
- Visual metronome pulse synced to beats-per-chord
- Strum pattern display (down/up arrows) per chord if provided

### 4. Better song import
- Broader ChordPro directive support (key, capo, sections/verse-chorus tags)
- Optional: paste-in plain text with inline `[Chord]` markers (looser parsing than strict ChordPro)
- Transpose function (shift whole progression up/down by semitones, re-render diagrams)

### 5. Practice analytics
- Track chord-change speed/accuracy over practice sessions (local only)
- "Trouble chords" report — which transitions are slowest/most missed
- Session history stored in localStorage, same pattern as your other Buddy apps' local data model

### 6. Audio quality improvements
- Noise-gate / strum-transient filtering tuning
- Optional pitch-detection library upgrade (e.g., evaluate Essentia.js if Meyda's chroma proves insufficient for reliable barre chord detection)

### 7. UI polish
- Dark mode toggle (consistent with Cheese Buddy/Bread Buddy styling conventions)
- Larger "performance mode" display for propped-up phone during practice

### Explicit non-goals for V2 (candidates for V3+ if ever)
- Full song audio playback/backing tracks
- User accounts / multi-device cloud sync
- Scraping third-party chord sites (ToS risk — stick to ChordPro/manual entry)

---

## GitHub / Claude Code Workflow Notes
- Repo: create fresh GitHub repo (`uke-buddy`), Claude Code operates directly against it via git push/PR workflow, same as your existing flow
- Suggested branch approach: `main` stable, feature branches per milestone (e.g. `feature/chordpro-import`, `feature/chroma-matcher`), merge via PR
- This doc (`ukulele-chord-assistant-plan.md`) can live at repo root or in `/docs` as the source-of-truth spec for Claude Code to reference across sessions
- Suggested first Claude Code task: scaffold file structure + chord database + static diagram renderer (no audio yet) — gets a visually testable app before tackling the harder DSP work
