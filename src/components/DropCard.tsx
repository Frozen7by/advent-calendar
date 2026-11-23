import { useTranslation } from 'react-i18next'
import { DROP_ICONS, ROBLOX } from '../deal/drops.ts'
import type { DropId } from '../deal/drops.ts'
import './drop-card.css'

interface DropCardProps {
  drop: DropId
  /** `reel` and `door` show the short label; `reveal` shows the full text. */
  variant: 'reel' | 'door' | 'reveal'
}

export function DropCard({ drop, variant }: DropCardProps) {
  const { t } = useTranslation()
  return (
    <div className={`drop-card drop-card--${variant}`} data-gold={drop === ROBLOX ? '' : undefined}>
      <span className="drop-card__icon" aria-hidden="true">
        {DROP_ICONS[drop]}
      </span>
      <span className="drop-card__text">{variant === 'reveal' ? t(`drop.${drop}`) : t(`dropShort.${drop}`)}</span>
    </div>
  )
}
