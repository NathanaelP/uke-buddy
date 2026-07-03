// ChordPro (.cho/.crd) file import parser.
// Parses inline [Chord]lyric syntax into a progression array. Pure function,
// no DOM dependency, so it can be exercised outside the browser too.
const CHORDPRO_DEFAULT_BEATS = 4; // matches beats-input's default value

// {title: ...} or {t: ...}, case-insensitive. First match in the file wins.
const TITLE_DIRECTIVE_RE = /\{\s*(?:title|t)\s*:\s*([^}]*)\}/i;

// Inline chord token, e.g. [C], [G/B], [Csus4]. Square brackets are reserved
// for chords in ChordPro (directives use curly braces), so a single pass over
// the raw text finds every chord in document order without needing to reason
// about lines, directives, or section markers separately.
const CHORD_TOKEN_RE = /\[([^\]]*)\]/g;

function parseChordPro(text) {
  const source = typeof text === "string" ? text : "";

  const titleMatch = source.match(TITLE_DIRECTIVE_RE);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const progression = [];
  const unsupportedChords = [];
  const seenUnsupported = new Set();
  let previousToken = null;

  const chordRegex = new RegExp(CHORD_TOKEN_RE.source, CHORD_TOKEN_RE.flags);
  let match;
  while ((match = chordRegex.exec(source)) !== null) {
    const token = match[1].trim();

    if (!token) continue; // skip "[]" / "[ ]"
    if (token === previousToken) continue; // collapse consecutive duplicates
    previousToken = token;

    if (!getChordByName(token) && !seenUnsupported.has(token)) {
      seenUnsupported.add(token);
      unsupportedChords.push(token);
    }

    progression.push({ chord: token, beats: CHORDPRO_DEFAULT_BEATS });
  }

  return { title, progression, unsupportedChords };
}
