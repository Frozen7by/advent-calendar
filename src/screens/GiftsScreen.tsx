import { useTranslation } from 'react-i18next'
import { MONTH_KEY } from '../calendar/logic.ts'
import type { Gift } from '../calendar/logic.ts'
import { DROP_ICONS, isRoblox } from '../deal/drops.ts'
import './gifts.css'

interface GiftsScreenProps {
  gifts: Gift[]
  onBack: () => void
}

/** Everything the child has collected, to show the parent. */
export function GiftsScreen({ gifts, onBack }: GiftsScreenProps) {
  const { t } = useTranslation()

  return (
    <main className="gifts">
      <header className="gifts__header">
        <button type="button" className="gifts__back" onClick={onBack}>
          {t('gifts.back')}
        </button>
        <h1 className="gifts__title">{t('gifts.title')}</h1>
      </header>

      {gifts.length === 0 ? (
        <p className="gifts__empty">{t('gifts.empty')}</p>
      ) : (
        <ul className="gifts__list">
          {gifts.map((gift) => (
            <li
              key={`${gift.doorId}-${gift.bonus ? 'bonus' : 'main'}`}
              className="gift"
              data-grade={gift.grade}
              data-gold={isRoblox(gift.drop) ? '' : undefined}
            >
              <span className="gift__icon" aria-hidden="true">
                {DROP_ICONS[gift.drop]}
              </span>
              <span className="gift__body">
                <span className="gift__text">{t(`drop.${gift.drop}`)}</span>
                <span className="gift__date">{t(`date.${MONTH_KEY[gift.month]}`, { day: gift.day })}</span>
              </span>
              <span className="gift__tags">
                <span className="grade-pill">{t(`rarity.${gift.grade}`)}</span>
                {gift.bonus && <span className="bonus-pill">{t('gifts.bonus')}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
