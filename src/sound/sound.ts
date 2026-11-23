// Reel sounds, synthesised with Web Audio so the app ships no audio files.
// Every function is a safe no-op when audio is missing or blocked.

let context: AudioContext | null = null
let lastTickAt = -1

/** Minimum gap between ticks, so the fast part of the spin does not turn into a buzz. */
const TICK_GAP_S = 0.04

/**
 * Creates or resumes the audio context. iOS only allows this inside a tap
 * handler, so call it from the door tap and the case tap.
 */
export function unlockAudio(): void {
  try {
    if (!context) {
      if (typeof AudioContext === 'undefined') return
      context = new AudioContext()
    }
    if (context.state === 'suspended') void context.resume().catch(() => {})
  } catch {
    context = null
  }
}

function running(): AudioContext | null {
  return context && context.state === 'running' ? context : null
}

function tone(ctx: AudioContext, frequency: number, start: number, duration: number, volume: number, type: OscillatorType) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

/** A short blip as a card passes the marker. */
export function playTick(): void {
  const ctx = running()
  if (!ctx || ctx.currentTime - lastTickAt < TICK_GAP_S) return
  lastTickAt = ctx.currentTime
  try {
    tone(ctx, 1200, ctx.currentTime, 0.03, 0.06, 'square')
  } catch {
    // A failed blip is not worth interrupting the reel for.
  }
}

const C5 = 523.25
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const E6 = 1318.51

/** Rising notes on the reveal: three for a chore, five and a held chord for Roblox. */
export function playFanfare(big: boolean): void {
  const ctx = running()
  if (!ctx) return
  const notes = big ? [C5, E5, G5, C6, E6] : [C5, E5, G5]
  const step = big ? 0.11 : 0.1
  const start = ctx.currentTime + 0.02
  try {
    notes.forEach((note, i) => tone(ctx, note, start + i * step, 0.22, 0.12, 'triangle'))
    if (big) {
      for (const note of [C5, E5, G5, C6]) tone(ctx, note, start + notes.length * step, 0.65, 0.07, 'triangle')
    }
  } catch {
    // Silence is an acceptable fallback.
  }
}
