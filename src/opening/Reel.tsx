import { animate, motion, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { DropCard } from '../components/DropCard.tsx'
import type { DropId } from '../deal/drops.ts'
import { CARD_GAP, CARD_W, SPIN_EASE, SPIN_MS, WIN_INDEX, buildStrip, reelOffset } from './reel.ts'

/** How long the winning card stays highlighted before the reveal. */
const HIGHLIGHT_MS = 700

interface ReelProps {
  /** The drop the reel lands on. It was fixed in advance; the spin is only show. */
  win: DropId
  onStop: () => void
  /** Called each time a new card passes under the marker. */
  onTick?: () => void
}

/** A strip of cards that races past a centre marker and slows down onto the drop. */
export function Reel({ win, onStop, onTick }: ReelProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [strip] = useState(() => buildStrip(win, Math.random))
  const [landed, setLanded] = useState(false)
  const callbacks = useRef({ onStop, onTick })

  useEffect(() => {
    callbacks.current = { onStop, onTick }
  })

  useEffect(() => {
    const width = windowRef.current?.clientWidth ?? window.innerWidth
    let cancelled = false
    let highlight: number | undefined
    let cardUnderMarker = -1

    x.set(0)
    const stopListening = x.on('change', (value) => {
      const index = Math.floor((width / 2 - value) / (CARD_W + CARD_GAP))
      if (index !== cardUnderMarker) {
        cardUnderMarker = index
        callbacks.current.onTick?.()
      }
    })

    const spin = animate(x, reelOffset(width, Math.random() * 2 - 1), { duration: SPIN_MS / 1000, ease: SPIN_EASE })
    void spin.then(() => {
      if (cancelled) return
      setLanded(true)
      highlight = window.setTimeout(() => callbacks.current.onStop(), HIGHLIGHT_MS)
    })

    return () => {
      cancelled = true
      stopListening()
      spin.stop()
      window.clearTimeout(highlight)
    }
  }, [x])

  return (
    <div className="reel" ref={windowRef}>
      <motion.div className="reel__strip" style={{ x }}>
        {strip.map((drop, i) => (
          <div key={i} className={landed && i === WIN_INDEX ? 'reel__slot reel__slot--win' : 'reel__slot'}>
            <DropCard drop={drop} variant="reel" />
          </div>
        ))}
      </motion.div>
      <div className="reel__marker" />
    </div>
  )
}
