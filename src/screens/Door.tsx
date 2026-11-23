import { useState } from 'react'
import { DropCard } from '../components/DropCard.tsx'
import type { DoorState } from '../calendar/logic.ts'
import type { DealDoor } from '../deal/types.ts'

interface DoorProps {
  door: DealDoor
  state: DoorState
  /** Called for available and opened doors. A locked door only shakes. */
  onTap: () => void
}

export function Door({ door, state, onTap }: DoorProps) {
  const [shaking, setShaking] = useState(false)

  const tap = () => {
    if (state === 'locked') setShaking(true)
    else onTap()
  }

  return (
    <button
      type="button"
      className={shaking ? 'door door--shake' : 'door'}
      data-state={state}
      // The grade stays a surprise until the door has been opened.
      data-grade={state === 'opened' ? door.cases[0].grade : undefined}
      onClick={tap}
      onAnimationEnd={() => setShaking(false)}
    >
      <span className="door__number">{door.day}</span>
      {state === 'opened' && (
        <span className="door__drops" data-count={door.cases.length}>
          {door.cases.map((c, i) => (
            <DropCard key={i} drop={c.drop} variant="door" />
          ))}
        </span>
      )}
    </button>
  )
}
