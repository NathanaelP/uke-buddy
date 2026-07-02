# Uke Buddy

A web-based follow-along ukulele practice assistant. Load or type in a chord progression, play along, and the app listens through your mic to confirm each chord change and auto-advance — showing fingering diagrams as you go.

Part of the "Buddy" family of lightweight offline-first practice/utility apps (alongside Bread Buddy and Cheese Buddy).

## What it does

- **Follow-along mode**: you supply the chord sequence (typed manually or imported from a ChordPro file), the app listens and confirms each chord as you play it, then advances — no rigid timing required
- **Fingering diagrams**: SVG chord charts for standard GCEA ukulele tuning, current + next chord shown during practice
- **Offline-capable**: installable PWA, works without a network connection after first load
- **Local-only data**: saved progressions live in localStorage, no account or backend needed

## Tech stack

Plain HTML, CSS, and JavaScript. No build step, no frameworks. Audio analysis via the Web Audio API (chroma/pitch-class matching against expected chords).

## Status

🚧 Early development — V1 (follow-along mode) in progress. See [`ukulele-chord-assistant-plan.md`](./ukulele-chord-assistant-plan.md) for the full V1/V2 roadmap.

## Project structure

```
/uke-buddy
  index.html
  sw.js                  // service worker (kept at root for full-app cache scope)
  manifest.json
  /css
    styles.css
  /js
    app.js               // orchestration
    audio-listener.js    // mic capture, FFT, chroma
    chord-matcher.js      // chroma-to-chord matching
    chord-data.js         // chord fingering database
    chordpro-parser.js    // .cho/.crd import parser
    progression-store.js  // localStorage CRUD
    diagram-renderer.js   // SVG fingering diagrams
  /icons
    icon-192.png
    icon-512.png
  ukulele-chord-assistant-plan.md
  README.md
```

## Running locally

No build step. Serve the directory with any static file server and open in a browser (mic access requires either `localhost` or HTTPS):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Roadmap

Full detail in [`ukulele-chord-assistant-plan.md`](./ukulele-chord-assistant-plan.md).

- **V1**: manual/ChordPro chord entry, SVG fingering diagrams, mic-based follow-along detection, offline PWA
- **V2**: live/blind detection mode, expanded chord database (barre, 7ths, alt tunings), tempo/metronome features, practice analytics
