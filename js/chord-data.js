// Ukulele chord fingering database — standard GCEA tuning, open/first-position shapes.
// frets/fingers arrays are in string order [G, C, E, A]. 0 = open string. -1 = muted (not used yet).
const CHORD_DATABASE = [
  { name: "C",      frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
  { name: "G",      frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
  { name: "F",      frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
  { name: "Am",     frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0] },
  { name: "Em",     frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1] },
  { name: "Dm",     frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0] },
  { name: "A",      frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
  { name: "D",      frets: [2, 2, 2, 0], fingers: [1, 1, 1, 0] },
  { name: "E",      frets: [4, 4, 0, 2], fingers: [4, 3, 0, 1] },
  { name: "A7",     frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0] },
  { name: "D7",     frets: [2, 2, 2, 3], fingers: [1, 1, 1, 4] },
  { name: "G7",     frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3] },
  { name: "C7",     frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
  { name: "Bm",     frets: [4, 2, 2, 2], fingers: [3, 1, 1, 1] },
  { name: "Fmaj7",  frets: [2, 4, 1, 0], fingers: [2, 3, 1, 0] },
];

function getChordByName(name) {
  return CHORD_DATABASE.find((chord) => chord.name === name) || null;
}
