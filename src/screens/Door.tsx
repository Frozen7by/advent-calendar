import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { DropCard } from '../components/DropCard.tsx'
import type { DoorState } from '../calendar/logic.ts'
import type { DealDoor } from '../deal/types.ts'
import { unlockAudio } from '../sound/sound.ts'

/** How far the door leaf swings on its hinge: open, but still inside its own tile. */
const OPEN_ANGLE = -78

interface DoorProps {
  door: DealDoor
  state: DoorState
  /** True while this door is swinging open on the way to its case. Owned by the app, one door at a time. */
  swinging: boolean
  /** Called when an available or opened door is tapped. A locked door only shakes. */
  onTap: () => void
  /** Called when an available door has finished swinging open. */
  onSwung: () => void
}

export function Door({ door, state, swinging, onTap, onSwung }: DoorProps) {
  const [shaking, setShaking] = useState(false)
  const reduceMotion = useReducedMotion()

  const tap = () => {
    if (state === 'locked') {
      setShaking(true)
      return
    }
    // iOS only lets sound start inside a tap, so wake the audio before the case appears.
    if (state === 'available') unlockAudio()
    onTap()
  }

  return (
    <button
      type="button"
      className={shaking ? 'door door--shake' : 'door'}
      data-state={state}
      data-swinging={swinging ? '' : undefined}
      // The grade stays a surprise until the door has been opened.
      data-grade={state === 'opened' ? door.cases[0].grade : undefined}
      aria-label={String(door.day)}
      onClick={tap}
      onAnimationEnd={() => setShaking(false)}
    >
      {state === 'opened' && (
        <span className="door__inside" data-count={door.cases.length}>
          <span className="door__tag">{door.day}</span>
          {door.cases.map((c, i) => (
            <DropCard key={i} drop={c.drop} variant="door" />
          ))}
        </span>
      )}
      <motion.span
        className="door__leaf"
        initial={false}
        animate={{ rotateY: state === 'opened' || swinging ? OPEN_ANGLE : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.3, 0, 0.2, 1] }}
        onAnimationComplete={() => {
          if (swinging && state === 'available') onSwung()
        }}
      >
        {door.day}
      </motion.span>
    </button>
  )
}
