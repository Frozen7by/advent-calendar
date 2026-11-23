import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DropCard } from '../components/DropCard.tsx'
import { ROBLOX } from '../deal/drops.ts'
import type { DealDoor } from '../deal/types.ts'
import { playFanfare, playTick, unlockAudio } from '../sound/sound.ts'
import { CaseBox } from './CaseBox.tsx'
import { flowReducer, initialFlow } from './flow.ts'
import { Reel } from './Reel.tsx'
import './opening.css'

interface OpeningStageProps {
  door: DealDoor
  /** Called the moment the child taps the first case, before anything animates. */
  onOpened: (day: number) => void
  /** Called after the last case's drop has been collected. */
  onClose: () => void
}

/** Full-screen overlay that walks the child through a door's case or cases. */
export function OpeningStage({ door, onOpened, onClose }: OpeningStageProps) {
  const { t } = useTranslation()
  const [flow, setFlow] = useState(initialFlow)
  const current = door.cases[flow.caseIndex]
  const caseTitle = t('stage.caseTitle', { grade: t(`rarity.${current.grade}`) })

  const tapCase = () => {
    if (flow.phase !== 'case') return
    unlockAudio()
    // Record first: if the app is closed from here on, the door stays opened
    // and the animation is never offered again.
    if (flow.caseIndex === 0) onOpened(door.day)
    setFlow(flowReducer(flow, 'tapCase', door.cases.length))
  }

  const reelStopped = () => {
    setFlow((state) => flowReducer(state, 'reelStopped', door.cases.length))
    playFanfare(current.drop === ROBLOX)
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
          <CaseBox grade={current.grade} label={caseTitle} onTap={tapCase} />
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
          <h2 className="stage__title">{caseTitle}</h2>
          <DropCard drop={current.drop} variant="reveal" />
          <button type="button" className="chunky-button" data-testid="collect" onClick={collect}>
            {t('stage.collect')}
          </button>
        </div>
      )}
    </div>
  )
}
