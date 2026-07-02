// Renders SVG fingering diagrams for ukulele chords (4 strings: G C E A).
const SVG_NS = "http://www.w3.org/2000/svg";

const DIAGRAM_SIZES = {
  large: { width: 160, height: 210, fretRows: 4, dotRadius: 12, fontSize: 20, labelFontSize: 22 },
  small: { width: 90, height: 120, fretRows: 4, dotRadius: 7, fontSize: 12, labelFontSize: 14 },
};

function createSvgElement(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
  return el;
}

// Renders a chord object (see chord-data.js) as an SVG diagram.
// size: "large" (current chord) or "small" (next chord preview)
function renderChordDiagram(chord, size = "large") {
  const cfg = DIAGRAM_SIZES[size] || DIAGRAM_SIZES.large;
  const { width, height, fretRows, dotRadius, fontSize, labelFontSize } = cfg;

  const marginTop = labelFontSize + 24;
  const marginSide = width * 0.15;
  const gridWidth = width - marginSide * 2;
  const gridHeight = height - marginTop - 16;
  const stringGap = gridWidth / 3;
  const fretGap = gridHeight / fretRows;

  const svg = createSvgElement("svg", {
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    class: `chord-diagram chord-diagram--${size}`,
    role: "img",
    "aria-label": `${chord.name} chord diagram`,
  });

  // Chord name label
  const label = createSvgElement("text", {
    x: width / 2,
    y: labelFontSize,
    "text-anchor": "middle",
    "font-size": labelFontSize,
    "font-weight": "bold",
    class: "chord-diagram__label",
  });
  label.textContent = chord.name;
  svg.appendChild(label);

  // Nut (thick top line) and fret lines
  for (let f = 0; f <= fretRows; f++) {
    const y = marginTop + f * fretGap;
    svg.appendChild(
      createSvgElement("line", {
        x1: marginSide,
        y1: y,
        x2: marginSide + gridWidth,
        y2: y,
        stroke: "currentColor",
        "stroke-width": f === 0 ? 4 : 1.5,
        class: "chord-diagram__fret-line",
      })
    );
  }

  // Strings (vertical lines)
  for (let s = 0; s < 4; s++) {
    const x = marginSide + s * stringGap;
    svg.appendChild(
      createSvgElement("line", {
        x1: x,
        y1: marginTop,
        x2: x,
        y2: marginTop + gridHeight,
        stroke: "currentColor",
        "stroke-width": 1.5,
        class: "chord-diagram__string",
      })
    );
  }

  // Open/muted markers + fretted dots
  chord.frets.forEach((fret, stringIndex) => {
    const x = marginSide + stringIndex * stringGap;

    if (fret === 0) {
      const marker = createSvgElement("text", {
        x,
        y: marginTop - 8,
        "text-anchor": "middle",
        "font-size": fontSize * 0.8,
        class: "chord-diagram__open-marker",
      });
      marker.textContent = "O";
      svg.appendChild(marker);
      return;
    }

    if (fret < 0) {
      const marker = createSvgElement("text", {
        x,
        y: marginTop - 8,
        "text-anchor": "middle",
        "font-size": fontSize * 0.8,
        class: "chord-diagram__mute-marker",
      });
      marker.textContent = "X";
      svg.appendChild(marker);
      return;
    }

    const y = marginTop + (fret - 0.5) * fretGap;
    svg.appendChild(
      createSvgElement("circle", {
        cx: x,
        cy: y,
        r: dotRadius,
        class: "chord-diagram__dot",
      })
    );

    const finger = chord.fingers ? chord.fingers[stringIndex] : 0;
    if (finger > 0) {
      const fingerLabel = createSvgElement("text", {
        x,
        y: y + fontSize * 0.35,
        "text-anchor": "middle",
        "font-size": fontSize,
        class: "chord-diagram__finger",
      });
      fingerLabel.textContent = String(finger);
      svg.appendChild(fingerLabel);
    }
  });

  return svg;
}

// Renders a chord diagram into a container element, replacing its contents.
function renderChordDiagramInto(container, chord, size = "large") {
  container.innerHTML = "";
  if (!chord) return;
  container.appendChild(renderChordDiagram(chord, size));
}
