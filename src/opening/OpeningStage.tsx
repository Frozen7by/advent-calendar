import { motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropCard } from '../components/DropCard.tsx'
import { isRoblox } from '../deal/drops.ts'
import type { CalendarDoor } from '../calendar/logic.ts'
import { playFanfare, playTick, unlockAudio } from '../sound/sound.ts'
import { CaseBox } from './CaseBox.tsx'
import { celebrate } from './celebrate.ts'
import { flowReducer, initialFlow } from './flow.ts'
import { Reel } from './Reel.tsx'
import './opening.css'

interface OpeningStageProps {
  door: CalendarDoor
  /** Called with the door's id the moment the child taps the first case, before anything animates. */
  onOpened: (doorId: string) => void
  /** Called after the last case's drop has been collected. */
  onClose: () => void
}

/** Full-screen overlay that walks the child through a door's case or cases. */
export function OpeningStage({ door, onOpened, onClose }: OpeningStageProps) {
  const { t } = useTranslation()
  const [flow, setFlow] = useState(initialFlow)
  const current = door.cases[flow.caseIndex]
  const caseTitle = t('stage.caseTitle', { grade: t(`rarity.${current.grade}`) })
  const isGold = isRoblox(current.drop)

  const tapCase = () => {
    if (flow.phase !== 'case') return
    unlockAudio()
    // Record first: if the app is closed from here on, the door stays opened
    // and the animation is never offered again.
    if (flow.caseIndex === 0) onOpened(door.id)
    setFlow(flowReducer(flow, 'tapCase', door.cases.length))
  }

  const reelStopped = () => {
    setFlow((state) => flowReducer(state, 'reelStopped', door.cases.length))
    playFanfare(isGold)
    if (isGold) celebrate()
  }

  const collect = () => {
    const next = flowReducer(flow, 'collect', door.cases.length)
    if (next === flow) return
    setFlow(next)
    if (next.done) onClose()
  }

  if (flow.done) return null

  return (
    <div className="stage" data-grade={current.grade}>
      {flow.phase === 'case' && (
        <div className="stage__scene">
          {flow.caseIndex > 0 && <p className="stage__bonus">{t('stage.bonus')}</p>}
          <h2 className="stage__title">{caseTitle}</h2>
          {/* The case drops in with a bounce; the key replays it for the bonus case. */}
          <motion.div
            key={flow.caseIndex}
            initial={{ y: -320, scale: 0.8, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
          >
            <CaseBox grade={current.grade} label={caseTitle} onTap={tapCase} />
          </motion.div>
          <p className="stage__hint">{t('stage.tapToOpen')}</p>
        </div>
      )}
      {flow.phase === 'spinning' && (
        <div className="stage__scene">
          <h2 className="stage__title">{caseTitle}</h2>
          <Reel key={flow.caseIndex} win={current.drop} onStop={reelStopped} onTick={playTick} />
        </div>
      )}
      {flow.phase === 'revealed' && (
        <div className="stage__scene">
          {isGold && <div className="stage__rays" aria-hidden="true" />}
          <h2 className="stage__title">{caseTitle}</h2>
          <motion.div
            initial={{ scale: 0.3, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.45, duration: 0.7 }}
          >
            <DropCard drop={current.drop} variant="reveal" />
          </motion.div>
          <button type="button" className="chunky-button" data-testid="collect" onClick={collect}>
            {t('stage.collect')}
          </button>
        </div>
      )}
    </div>
  )
}
