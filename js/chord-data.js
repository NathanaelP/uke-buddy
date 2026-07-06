// Ukulele chord fingering database — standard GCEA tuning.
// frets/fingers arrays are in string order [G, C, E, A]. 0 = open string, -1 = muted.
// baseFret is the fret number shown at the top of the diagram (1 = nut/open position).
// Every entry here is validated against music theory (root/3rd/5th/7th pitch classes)
// by the generator script used to build this file — see scratchpad history if extending.
const CHORD_DATABASE = [
  { name: "C", frets: [0,0,0,3], fingers: [0,0,0,1], baseFret: 1 },
  { name: "G", frets: [0,2,3,2], fingers: [0,1,2,1], baseFret: 1 },
  { name: "F", frets: [2,0,1,0], fingers: [2,0,1,0], baseFret: 1 },
  { name: "Am", frets: [2,0,0,0], fingers: [1,0,0,0], baseFret: 1 },
  { name: "Em", frets: [0,4,3,2], fingers: [0,3,2,1], baseFret: 1 },
  { name: "Dm", frets: [2,2,1,0], fingers: [2,2,1,0], baseFret: 1 },
  { name: "A", frets: [2,1,0,0], fingers: [2,1,0,0], baseFret: 1 },
  { name: "D", frets: [2,2,2,0], fingers: [1,1,1,0], baseFret: 1 },
  { name: "E", frets: [1,4,0,2], fingers: [1,3,0,2], baseFret: 1 },
  { name: "A7", frets: [0,1,0,0], fingers: [0,1,0,0], baseFret: 1 },
  { name: "D7", frets: [2,2,2,3], fingers: [1,1,1,2], baseFret: 1 },
  { name: "G7", frets: [0,2,1,2], fingers: [0,2,1,2], baseFret: 1 },
  { name: "C7", frets: [0,0,0,1], fingers: [0,0,0,1], baseFret: 1 },
  { name: "Bm", frets: [4,2,2,2], fingers: [2,1,1,1], baseFret: 1 },
  { name: "Fmaj7", frets: [2,4,1,0], fingers: [2,3,1,0], baseFret: 1 },
  { name: "Db", frets: [6,5,4,4], fingers: [3,2,1,1], baseFret: 4 },
  { name: "Eb", frets: [3,3,3,6], fingers: [1,1,1,2], baseFret: 3 },
  { name: "F#", frets: [3,1,2,1], fingers: [3,1,2,1], baseFret: 1 },
  { name: "Ab", frets: [1,3,4,3], fingers: [1,2,3,2], baseFret: 1 },
  { name: "Bb", frets: [3,2,1,1], fingers: [3,2,1,1], baseFret: 1 },
  { name: "B", frets: [4,3,2,2], fingers: [3,2,1,1], baseFret: 1 },
  { name: "Cm", frets: [5,3,3,3], fingers: [2,1,1,1], baseFret: 3 },
  { name: "Dbm", frets: [6,4,4,4], fingers: [2,1,1,1], baseFret: 4 },
  { name: "Ebm", frets: [3,3,2,1], fingers: [3,3,2,1], baseFret: 1 },
  { name: "Fm", frets: [5,5,4,3], fingers: [3,3,2,1], baseFret: 3 },
  { name: "F#m", frets: [6,6,5,4], fingers: [3,3,2,1], baseFret: 4 },
  { name: "Gm", frets: [7,7,6,5], fingers: [3,3,2,1], baseFret: 5 },
  { name: "Abm", frets: [8,8,7,6], fingers: [3,3,2,1], baseFret: 6 },
  { name: "Bbm", frets: [3,1,1,1], fingers: [2,1,1,1], baseFret: 1 },
  { name: "E7", frets: [4,4,4,5], fingers: [1,1,1,2], baseFret: 4 },
  { name: "B7", frets: [2,3,2,2], fingers: [1,2,1,1], baseFret: 1 },
  { name: "Cmaj7", frets: [0,0,0,2], fingers: [0,0,0,1], baseFret: 1 },
  { name: "Gmaj7", frets: [0,2,2,2], fingers: [0,1,1,1], baseFret: 1 },
  { name: "Dmaj7", frets: [2,2,2,4], fingers: [1,1,1,2], baseFret: 1 },
  { name: "Amaj7", frets: [1,1,0,0], fingers: [1,1,0,0], baseFret: 1 },
  { name: "Am7", frets: [0,0,0,0], fingers: [0,0,0,0], baseFret: 1 },
  { name: "Dm7", frets: [2,2,1,3], fingers: [2,2,1,3], baseFret: 1 },
  { name: "Em7", frets: [0,2,0,2], fingers: [0,1,0,1], baseFret: 1 },
  { name: "Csus4", frets: [0,0,1,3], fingers: [0,0,1,2], baseFret: 1 },
  { name: "Csus2", frets: [0,2,3,3], fingers: [0,1,2,2], baseFret: 1 },
  { name: "Dsus4", frets: [2,2,3,0], fingers: [1,1,2,0], baseFret: 1 },
  { name: "Gsus4", frets: [0,2,3,3], fingers: [0,1,2,2], baseFret: 1 },
  { name: "Asus4", frets: [2,2,0,0], fingers: [1,1,0,0], baseFret: 1 },
  { name: "Cadd9", frets: [0,2,0,3], fingers: [0,1,0,2], baseFret: 1 },
  { name: "Gadd9", frets: [2,2,3,2], fingers: [1,1,2,1], baseFret: 1 },
];

// Enharmonic root spellings (e.g. "C#" / "Db") so a lookup for either name
// finds the same database entry, since ChordPro sources may use either.
const ENHARMONIC_ROOTS = {
  "C#": "Db", "Db": "C#",
  "D#": "Eb", "Eb": "D#",
  "F#": "Gb", "Gb": "F#",
  "G#": "Ab", "Ab": "G#",
  "A#": "Bb", "Bb": "A#",
};

function getChordByName(name) {
  const direct = CHORD_DATABASE.find((chord) => chord.name === name);
  if (direct) return direct;

  const rootMatch = name.match(/^([A-G][#b]?)(.*)$/);
  if (!rootMatch) return null;
  const [, root, suffix] = rootMatch;
  const altRoot = ENHARMONIC_ROOTS[root];
  if (!altRoot) return null;
  return CHORD_DATABASE.find((chord) => chord.name === altRoot + suffix) || null;
}
