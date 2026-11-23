import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { doorState } from '../calendar/logic.ts'
import { DROP_ICONS, isRoblox } from '../deal/drops.ts'
import type { Deal, DealDoor } from '../deal/types.ts'
import { Door } from './Door.tsx'
import './calendar.css'

interface CalendarScreenProps {
  deal: Deal
  now: Date
  opened: ReadonlySet<number>
  /** The door currently swinging open or showing its case, if any. */
  swingingDay: number | null
  /** An available door was tapped and may start swinging open. */
  onSwingDoor: (day: number) => void
  /** The door has swung open: show its case. */
  onOpenDoor: (day: number) => void
  onShowGifts: () => void
  /** Development only: forget which doors were opened. */
  onReset?: () => void
}

export function CalendarScreen({
  deal,
  now,
  opened,
  swingingDay,
  onSwingDoor,
  onOpenDoor,
  onShowGifts,
  onReset,
}: CalendarScreenProps) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState<DealDoor | null>(null)

  return (
    <main className="calendar">
      <div className="snow" aria-hidden="true" />
      <h1 className="calendar__title">{t('app.title')}</h1>

      <div className="calendar__grid">
        {deal.map((door) => {
          const state = doorState(door.day, now, opened)
          return (
            <Door
              key={door.day}
              door={door}
              state={state}
              swinging={swingingDay === door.day}
              onTap={() => {
                if (state === 'opened') setDetail(door)
                // One door at a time: taps on other doors wait until this one's case is done.
                else if (swingingDay === null) onSwingDoor(door.day)
              }}
              onSwung={() => onOpenDoor(door.day)}
            />
          )
        })}
      </div>

      <div className="calendar__footer">
        <button type="button" className="chunky-button" onClick={onShowGifts}>
          {t('calendar.gifts')}
        </button>
        {onReset && (
          <button type="button" className="calendar__reset" onClick={onReset}>
            reset
          </button>
        )}
      </div>

      {detail && (
        <div className="detail" onClick={() => setDetail(null)}>
          <div className="detail__sheet">
            <p className="detail__date">{t('date.dec', { day: detail.day })}</p>
            {detail.cases.map((c, i) => (
              <div key={i} className="detail__gift" data-grade={c.grade} data-gold={isRoblox(c.drop) ? '' : undefined}>
                <span className="detail__icon" aria-hidden="true">
                  {DROP_ICONS[c.drop]}
                </span>
                <span className="detail__text">{t(`drop.${c.drop}`)}</span>
                <span className="grade-pill">{t(`rarity.${c.grade}`)}</span>
              </div>
            ))}
            <button type="button" className="chunky-button">
              {t('gifts.back')}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
