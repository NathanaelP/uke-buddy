// localStorage CRUD for saved chord progressions ("songs").
const PROGRESSION_STORE_KEY = "uke-buddy:songs";

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

function loadAllSongs() {
  const raw = localStorage.getItem(PROGRESSION_STORE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse saved songs from localStorage", err);
    return [];
  }
}

function saveAllSongs(songs) {
  localStorage.setItem(PROGRESSION_STORE_KEY, JSON.stringify(songs));
}

// Saves a new song. Expects { title, bpm, progression, source }.
// Returns the saved song (with generated id).
function saveSong(song) {
  const songs = loadAllSongs();
  const record = {
    id: song.id || generateId(),
    title: song.title,
    bpm: song.bpm || null,
    progression: song.progression || [],
    source: song.source || "manual",
  };
  const existingIndex = songs.findIndex((s) => s.id === record.id);
  if (existingIndex >= 0) {
    songs[existingIndex] = record;
  } else {
    songs.push(record);
  }
  saveAllSongs(songs);
  return record;
}

function getSong(id) {
  return loadAllSongs().find((s) => s.id === id) || null;
}

function deleteSong(id) {
  const songs = loadAllSongs().filter((s) => s.id !== id);
  saveAllSongs(songs);
}
