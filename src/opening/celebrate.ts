import confetti from 'canvas-confetti'

/** A burst of gold confetti for a Roblox drop. Skipped when the device asks for reduced motion. */
export function celebrate(): void {
  try {
    void confetti({
      particleCount: 150,
      spread: 100,
      startVelocity: 48,
      origin: { y: 0.55 },
      colors: ['#ffd166', '#fff3cf', '#f0a23a', '#ffffff'],
      zIndex: 20,
      disableForReducedMotion: true,
    })
  } catch {
    // The reveal works without confetti.
  }
}
