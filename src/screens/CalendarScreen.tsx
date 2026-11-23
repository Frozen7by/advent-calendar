import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MONTH_KEY, doorState } from '../calendar/logic.ts'
import type { CalendarDoor } from '../calendar/logic.ts'
import { DROP_ICONS, isPrize } from '../deal/drops.ts'
import { Door } from './Door.tsx'
import './calendar.css'

interface CalendarScreenProps {
  doors: readonly CalendarDoor[]
  now: Date
  /** Ids of the doors opened on this device. */
  opened: ReadonlySet<string>
  /** Id of the door currently swinging open or showing its case, if any. */
  swingingDoor: string | null
  /** An available door was tapped and may start swinging open. */
  onSwingDoor: (doorId: string) => void
  /** The door has swung open: show its case. */
  onOpenDoor: (doorId: string) => void
  onShowGifts: () => void
  /** Development only: forget which doors were opened. */
  onReset?: () => void
}

export function CalendarScreen({
  doors,
  now,
  opened,
  swingingDoor,
  onSwingDoor,
  onOpenDoor,
  onShowGifts,
  onReset,
}: CalendarScreenProps) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState<CalendarDoor | null>(null)

  return (
    <main className="calendar">
      <div className="snow" aria-hidden="true" />
      <h1 className="calendar__title">{t('app.title')}</h1>

      <div className="calendar__grid">
        {doors.map((door) => {
          const state = doorState(door, now, opened)
          return (
            <Door
              key={door.id}
              door={door}
              state={state}
              swinging={swingingDoor === door.id}
              onTap={() => {
                if (state === 'opened') setDetail(door)
                // One door at a time: taps on other doors wait until this one's case is done.
                else if (swingingDoor === null) onSwingDoor(door.id)
              }}
              onSwung={() => onOpenDoor(door.id)}
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
            <p className="detail__date">{t(`date.${MONTH_KEY[detail.month]}`, { day: detail.day })}</p>
            {detail.cases.map((c, i) => (
              <div key={i} className="detail__gift" data-grade={c.grade} data-gold={isPrize(c.drop) ? '' : undefined}>
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
