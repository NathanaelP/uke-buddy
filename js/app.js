// Orchestration: view switching, progression builder, and static practice view.
const VIEWS = ["builder", "practice", "songs"];

let builderProgression = [];
let builderProgressionSource = "manual"; // "manual" | "chordpro-import"
let practiceState = { title: "", progression: [], index: 0 };

document.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  initNav();
  initBuilder();
  initChordProImport();
  initPractice();
  initSongsView();
  showView("builder");
});

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.error("Service worker registration failed", err);
    });

    // When a new service worker version takes over (see CACHE_NAME in sw.js),
    // reload once so the page picks up the fresh assets immediately instead of
    // silently continuing to run on stale cached files.
    let hasReloadedForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasReloadedForUpdate) return;
      hasReloadedForUpdate = true;
      window.location.reload();
    });
  }
}

function showView(name) {
  VIEWS.forEach((v) => {
    document.getElementById(`view-${v}`).classList.toggle("hidden", v !== name);
    document.getElementById(`btn-view-${v}`).classList.toggle("active", v === name);
  });
  if (name === "songs") renderSongsList();
}

function initNav() {
  VIEWS.forEach((v) => {
    document.getElementById(`btn-view-${v}`).addEventListener("click", () => showView(v));
  });
}

// ---- Builder view ----

function initBuilder() {
  const chordSelect = document.getElementById("chord-select");
  CHORD_DATABASE.forEach((chord) => {
    const option = document.createElement("option");
    option.value = chord.name;
    option.textContent = chord.name;
    chordSelect.appendChild(option);
  });

  document.getElementById("add-chord-btn").addEventListener("click", () => {
    const beatsInput = document.getElementById("beats-input");
    const beats = parseInt(beatsInput.value, 10) || 4;
    builderProgression.push({ chord: chordSelect.value, beats });
    renderProgressionList();
  });

  document.getElementById("clear-progression-btn").addEventListener("click", () => {
    builderProgression = [];
    builderProgressionSource = "manual";
    document.getElementById("chordpro-file-input").value = "";
    document.getElementById("song-title-input").value = "";
    document.getElementById("bpm-input").value = "";
    setBuilderStatus("");
    renderProgressionList();
  });

  document.getElementById("save-progression-btn").addEventListener("click", () => {
    const title = document.getElementById("song-title-input").value.trim();
    if (!title) {
      setBuilderStatus("Enter a song title before saving.");
      return;
    }
    if (builderProgression.length === 0) {
      setBuilderStatus("Add at least one chord before saving.");
      return;
    }
    const bpmValue = parseInt(document.getElementById("bpm-input").value, 10);
    saveSong({
      title,
      bpm: Number.isFinite(bpmValue) ? bpmValue : null,
      progression: builderProgression,
      source: builderProgressionSource,
    });
    setBuilderStatus(`Saved "${title}".`);
  });

  document.getElementById("practice-now-btn").addEventListener("click", () => {
    if (builderProgression.length === 0) {
      setBuilderStatus("Add at least one chord before practicing.");
      return;
    }
    const title = document.getElementById("song-title-input").value.trim();
    loadIntoPractice({ title: title || "Untitled", progression: builderProgression });
  });

  renderProgressionList();
}

function setBuilderStatus(message) {
  document.getElementById("builder-status").textContent = message;
}

function renderProgressionList() {
  const list = document.getElementById("progression-list");
  list.innerHTML = "";

  if (builderProgression.length === 0) {
    const empty = document.createElement("li");
    empty.className = "progression-list__empty";
    empty.textContent = "No chords added yet.";
    list.appendChild(empty);
  }

  builderProgression.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "progression-list__item";

    const label = document.createElement("span");
    label.className = "progression-list__label";
    label.textContent = `${entry.chord} (${entry.beats} beats)`;
    li.appendChild(label);

    const controls = document.createElement("span");
    controls.className = "progression-list__controls";

    const upBtn = makeButton("▲", "Move up", () => {
      if (index === 0) return;
      [builderProgression[index - 1], builderProgression[index]] = [builderProgression[index], builderProgression[index - 1]];
      renderProgressionList();
    });
    upBtn.disabled = index === 0;

    const downBtn = makeButton("▼", "Move down", () => {
      if (index === builderProgression.length - 1) return;
      [builderProgression[index + 1], builderProgression[index]] = [builderProgression[index], builderProgression[index + 1]];
      renderProgressionList();
    });
    downBtn.disabled = index === builderProgression.length - 1;

    const deleteBtn = makeButton("✕", "Delete", () => {
      builderProgression.splice(index, 1);
      renderProgressionList();
    });

    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    controls.appendChild(deleteBtn);
    li.appendChild(controls);

    list.appendChild(li);
  });
}

function makeButton(label, ariaLabel, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", onClick);
  return btn;
}

// ---- ChordPro import ----

function initChordProImport() {
  const fileInput = document.getElementById("chordpro-file-input");
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleChordProFileLoaded(String(reader.result || ""));
      fileInput.value = ""; // allow re-selecting the same file later
    };
    reader.onerror = () => {
      setBuilderStatus("Could not read that file. Please try again.");
      fileInput.value = "";
    };
    reader.readAsText(file);
  });
}

function handleChordProFileLoaded(text) {
  let result;
  try {
    result = parseChordPro(text);
  } catch (err) {
    console.error("Failed to parse ChordPro file", err);
    setBuilderStatus("Could not parse that file as ChordPro.");
    return;
  }

  builderProgression = result.progression;
  builderProgressionSource = "chordpro-import";
  renderProgressionList();

  const titleInput = document.getElementById("song-title-input");
  if (!titleInput.value.trim() && result.title) {
    titleInput.value = result.title;
  }

  setBuilderStatus(summarizeChordProImport(result));
}

function summarizeChordProImport(result) {
  const count = result.progression.length;
  if (count === 0) {
    return "No chords found in that file.";
  }
  let message = `Imported ${count} chord${count === 1 ? "" : "s"}`;
  if (result.title) message += ` from "${result.title}"`;
  message += ".";
  if (result.unsupportedChords.length > 0) {
    message += ` No diagram available for: ${result.unsupportedChords.join(", ")}.`;
  }
  return message;
}

// ---- Practice view ----

function initPractice() {
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (practiceState.index > 0) {
      practiceState.index -= 1;
      renderPracticeView();
    }
  });

  document.getElementById("next-btn").addEventListener("click", () => {
    if (practiceState.index < practiceState.progression.length - 1) {
      practiceState.index += 1;
      renderPracticeView();
    }
  });
}

function loadIntoPractice(song) {
  practiceState = {
    title: song.title || "Untitled",
    progression: song.progression || [],
    index: 0,
  };
  renderPracticeView();
  showView("practice");
}

function renderPracticeView() {
  const titleEl = document.getElementById("practice-song-title");
  const emptyMessage = document.getElementById("practice-empty-message");
  const content = document.getElementById("practice-content");
  const currentContainer = document.getElementById("practice-current-diagram");
  const nextContainer = document.getElementById("practice-next-diagram");
  const nextLabel = document.getElementById("practice-next-label");
  const strip = document.getElementById("practice-strip");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  titleEl.textContent = practiceState.title;

  if (practiceState.progression.length === 0) {
    emptyMessage.classList.remove("hidden");
    content.classList.add("hidden");
    return;
  }
  emptyMessage.classList.add("hidden");
  content.classList.remove("hidden");

  const { progression, index } = practiceState;
  const currentEntry = progression[index];
  const nextEntry = progression[index + 1];

  renderChordDiagramInto(currentContainer, getChordByName(currentEntry.chord), "large", currentEntry.chord);

  if (nextEntry) {
    nextLabel.textContent = "Next";
    renderChordDiagramInto(nextContainer, getChordByName(nextEntry.chord), "small", nextEntry.chord);
  } else {
    nextLabel.textContent = "End of progression";
    nextContainer.innerHTML = "";
  }

  strip.innerHTML = "";
  progression.forEach((entry, i) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "practice-strip__item" + (i === index ? " practice-strip__item--current" : "");
    item.textContent = `${entry.chord}`;
    item.addEventListener("click", () => {
      practiceState.index = i;
      renderPracticeView();
    });
    strip.appendChild(item);
  });

  const currentItem = strip.querySelector(".practice-strip__item--current");
  if (currentItem) {
    currentItem.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === progression.length - 1;
}

// ---- Songs view ----

function initSongsView() {
  renderSongsList();
}

function renderSongsList() {
  const list = document.getElementById("songs-list");
  const emptyMessage = document.getElementById("songs-empty-message");
  const songs = loadAllSongs();
  list.innerHTML = "";

  if (songs.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  }
  emptyMessage.classList.add("hidden");

  songs.forEach((song) => {
    const li = document.createElement("li");
    li.className = "songs-list__item";

    const info = document.createElement("span");
    info.className = "songs-list__info";
    const bpmText = song.bpm ? ` • ${song.bpm} BPM` : "";
    info.textContent = `${song.title} (${song.progression.length} chords${bpmText})`;
    li.appendChild(info);

    const controls = document.createElement("span");
    controls.className = "songs-list__controls";

    const loadBtn = makeButton("Load", `Load ${song.title}`, () => loadIntoPractice(song));
    const deleteBtn = makeButton("Delete", `Delete ${song.title}`, () => {
      deleteSong(song.id);
      renderSongsList();
    });

    controls.appendChild(loadBtn);
    controls.appendChild(deleteBtn);
    li.appendChild(controls);

    list.appendChild(li);
  });
}
