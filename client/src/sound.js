import { TURNS } from './constants'

// Lightweight Web Audio "pencil stroke" sounds — no asset files.
// A stroke is a short burst of band-passed white noise with a fast envelope
// and a downward filter sweep, which reads as a quick scratch on paper.

let ctx = null
let muted = false

export function setMuted(value) {
  muted = value
}

// Create/resume the AudioContext. Must be reachable from a user gesture the
// first time (browser autoplay policy); we also prime it on first pointerdown.
function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function primeAudio() {
  getContext()
}

function scratch(audio, when, { duration, startFreq, endFreq, freqCurve, gainCurve, q, gain }) {
  const samples = Math.max(1, Math.ceil(audio.sampleRate * duration))
  const buffer = audio.createBuffer(1, samples, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1

  const source = audio.createBufferSource()
  source.buffer = buffer

  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = q
  if (freqCurve) {
    // Sweep the filter through several frequencies (e.g. dip then rise).
    filter.frequency.setValueCurveAtTime(Float32Array.from(freqCurve), when, duration)
  } else {
    filter.frequency.setValueAtTime(startFreq, when)
    filter.frequency.linearRampToValueAtTime(endFreq, when + duration)
  }

  const env = audio.createGain()
  if (gainCurve) {
    env.gain.setValueCurveAtTime(Float32Array.from(gainCurve), when, duration)
  } else {
    env.gain.setValueAtTime(0.0001, when)
    env.gain.linearRampToValueAtTime(gain, when + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  }

  source.connect(filter)
  filter.connect(env)
  env.connect(audio.destination)
  source.start(when)
  source.stop(when + duration + 0.02)
}

// Play the sound for a placed mark, synced with its draw animation:
// X = two strokes (the second delayed like the X's second line),
// O = one longer continuous stroke.
export function playMark(value) {
  if (muted) return
  const audio = getContext()
  if (!audio) return
  const t = audio.currentTime

  if (value === TURNS.X) {
    scratch(audio, t, { duration: 0.12, startFreq: 2600, endFreq: 1500, q: 0.8, gain: 0.16 })
    scratch(audio, t + 0.16, { duration: 0.12, startFreq: 2400, endFreq: 1400, q: 0.8, gain: 0.16 })
  } else if (value === TURNS.O) {
    // One continuous stroke that dips low and rises to a bright end (agudo),
    // like the pen going around the circle and lifting off upward. The gain
    // curve keeps energy near the end so the high sweep is actually heard.
    const g = 0.14
    scratch(audio, t, {
      duration: 0.34,
      q: 1.2,
      freqCurve: [1700, 1300, 1150, 1300, 2000, 3400, 3600],
      gainCurve: [0.002, g, g * 0.7, g * 0.5, g * 0.85, g, 0.004],
    })
  }
}
