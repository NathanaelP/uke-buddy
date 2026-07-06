// Mic capture, FFT, and chroma (12 pitch-class energy) extraction.
//
// Frequency range and FFT size are tuned for standard GCEA ukulele tuning:
// the lowest fundamental any chord in chord-data.js can produce is open C4
// (261.63Hz — frets only raise pitch, never lower it below a string's open
// note), and the highest is around B4 (493.88Hz). CHROMA_MIN_HZ/MAX_HZ give
// headroom below/above that range (covering a few harmonics on the high end,
// since small-bodied nylon strings often have weak fundamentals relative to
// their harmonics) while excluding sub-100Hz handling noise/rumble that
// carries no pitch information.
const CHROMA_FFT_SIZE = 8192; // ~5-6Hz per bin @44.1-48kHz — several bins per semitone even at the lowest note
const CHROMA_MIN_HZ = 130;
const CHROMA_MAX_HZ = 2000;
const CHROMA_SMOOTHING = 0.4; // lower than the AnalyserNode default (0.8) so consecutive frames aren't overly blurred together

let audioListenerAudioContext = null;
let audioListenerStream = null;
let audioListenerAnalyserNode = null;
let audioListenerFrameBuffer = null;
let audioListenerFrameId = null;
let audioListenerOnChroma = null;
let audioListenerRunning = false;

// Starts mic capture and begins polling a 12-element chroma vector once per
// animation frame, passing it to onChroma. onStreamEnded (optional) fires if
// the mic track ends unexpectedly (device unplugged, permission revoked
// mid-session). Rejects with the raw error if getUserMedia/AudioContext
// setup fails — callers are responsible for a user-facing message.
async function startAudioListener(onChroma, onStreamEnded) {
  if (audioListenerRunning) return;

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const err = new Error("Microphone access requires a secure context (HTTPS or localhost).");
    err.name = "InsecureContextError";
    throw err;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    // Voice-tuned processing distorts musical harmonic content, so disable it.
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContextCtor();
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const sourceNode = audioContext.createMediaStreamSource(stream);
  const analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = CHROMA_FFT_SIZE;
  analyserNode.smoothingTimeConstant = CHROMA_SMOOTHING;

  // The Web Audio render graph is pulled from destination; an analyser with
  // no path there isn't guaranteed to update every quantum in all engines.
  // Route through a silent gain node so it stays inaudible but always live.
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;
  sourceNode.connect(analyserNode);
  analyserNode.connect(silentGain);
  silentGain.connect(audioContext.destination);

  audioListenerAudioContext = audioContext;
  audioListenerStream = stream;
  audioListenerAnalyserNode = analyserNode;
  audioListenerFrameBuffer = new Float32Array(analyserNode.frequencyBinCount);
  audioListenerOnChroma = onChroma;
  audioListenerRunning = true;

  stream.getAudioTracks()[0].addEventListener("ended", () => {
    stopAudioListener();
    if (onStreamEnded) onStreamEnded();
  });

  pollAudioListenerFrame();
}

function pollAudioListenerFrame() {
  if (!audioListenerRunning) return;
  audioListenerAnalyserNode.getFloatFrequencyData(audioListenerFrameBuffer);
  const chroma = computeChromaFromFrequencyData(
    audioListenerFrameBuffer,
    audioListenerAudioContext.sampleRate,
    CHROMA_FFT_SIZE
  );
  if (audioListenerOnChroma) audioListenerOnChroma(chroma);
  audioListenerFrameId = requestAnimationFrame(pollAudioListenerFrame);
}

// Idempotent. Cancels the polling loop, stops all mic tracks (so the
// browser's mic-in-use indicator turns off), closes the AudioContext, and
// clears module state. Safe to call even when not currently running.
function stopAudioListener() {
  if (audioListenerFrameId !== null) {
    cancelAnimationFrame(audioListenerFrameId);
    audioListenerFrameId = null;
  }
  if (audioListenerStream) {
    audioListenerStream.getTracks().forEach((track) => track.stop());
  }
  if (audioListenerAudioContext) {
    audioListenerAudioContext.close();
  }
  audioListenerAudioContext = null;
  audioListenerStream = null;
  audioListenerAnalyserNode = null;
  audioListenerFrameBuffer = null;
  audioListenerOnChroma = null;
  audioListenerRunning = false;
}

function isAudioListenerRunning() {
  return audioListenerRunning;
}

// Pure function, no DOM/Web Audio dependency — easy to test with synthetic
// arrays. freqData: Float32Array of dB magnitudes from
// analyser.getFloatFrequencyData(). Returns a 12-element array (index 0=C
// .. 11=B) normalized to sum to 1, or all zeros if there's no usable energy
// in [CHROMA_MIN_HZ, CHROMA_MAX_HZ].
function computeChromaFromFrequencyData(freqData, sampleRate, fftSize) {
  const binHz = sampleRate / fftSize;
  const minBin = Math.max(1, Math.ceil(CHROMA_MIN_HZ / binHz));
  const maxBin = Math.min(freqData.length - 1, Math.floor(CHROMA_MAX_HZ / binHz));
  const chroma = new Array(12).fill(0);

  for (let i = minBin; i <= maxBin; i++) {
    const db = freqData[i];
    if (!Number.isFinite(db)) continue;
    const freq = i * binHz;
    const magnitude = Math.pow(10, db / 20); // dB -> linear
    const midi = 69 + 12 * Math.log2(freq / 440);
    const pitchClass = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pitchClass] += magnitude;
  }

  const total = chroma.reduce((sum, v) => sum + v, 0);
  if (total > 0) {
    for (let pc = 0; pc < 12; pc++) chroma[pc] /= total;
  }
  return chroma;
}
