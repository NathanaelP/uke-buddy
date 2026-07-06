// Chroma-to-chord matching against the expected next chord, with debounce
// to avoid triggering on strum/pick transients.

// Open string MIDI notes for standard GCEA tuning (G4, C4, E4, A4), in the
// same [G, C, E, A] order as chord-data.js's frets/fingers arrays.
const OPEN_STRING_MIDI = [67, 60, 64, 69];

const CHORD_MATCH_THRESHOLD = 0.65;
const CHORD_MATCH_CONSECUTIVE_FRAMES = 8; // ~130ms at 60fps — longer than a strum transient, short enough to feel responsive

// Set of pitch classes (0=C..11=B) expected to sound for a chord object from chord-data.js.
function getExpectedPitchClasses(chord) {
  const pitchClasses = new Set();
  chord.frets.forEach((fret, stringIndex) => {
    if (fret < 0) return; // muted string
    const midi = OPEN_STRING_MIDI[stringIndex] + fret;
    pitchClasses.add(((midi % 12) + 12) % 12);
  });
  return pitchClasses;
}

// Fraction (0..1) of total chroma energy landing on the chord's expected pitch classes.
function scoreChordMatch(chroma, chord) {
  const expected = getExpectedPitchClasses(chord);
  let total = 0;
  let onTarget = 0;
  for (let pc = 0; pc < 12; pc++) {
    total += chroma[pc];
    if (expected.has(pc)) onTarget += chroma[pc];
  }
  return total > 0 ? onTarget / total : 0;
}

// One debouncer per "listening session for one expected chord" — create a
// fresh one any time the expected chord changes, for any reason, or a stale
// streak from the previous chord could instantly false-confirm the new one.
function createChordMatchDebouncer() {
  return { streak: 0 };
}

function resetChordMatchDebounce(debouncer) {
  debouncer.streak = 0;
}

// Call once per chroma frame. Returns true exactly once, on the frame where
// the streak newly reaches CHORD_MATCH_CONSECUTIVE_FRAMES, so callers can
// act on "true" without deduplicating themselves.
function checkChordMatch(debouncer, chroma, chord) {
  const score = scoreChordMatch(chroma, chord);
  debouncer.streak = score >= CHORD_MATCH_THRESHOLD ? debouncer.streak + 1 : 0;
  return debouncer.streak === CHORD_MATCH_CONSECUTIVE_FRAMES;
}
