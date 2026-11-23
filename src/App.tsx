import { useState } from 'react'
import { giftList, resolveNow } from './calendar/logic.ts'
import { useNow } from './calendar/useNow.ts'
import { useOpened } from './calendar/useOpened.ts'
import { deal, dealProblems } from './data/deal.ts'
import { OpeningStage } from './opening/OpeningStage.tsx'
import { CalendarScreen } from './screens/CalendarScreen.tsx'
import { GiftsScreen } from './screens/GiftsScreen.tsx'

const currentTime = () => resolveNow(new Date(), window.location.search, import.meta.env.DEV)

function App() {
  const now = useNow(currentTime)
  const { opened, markOpened, resetOpened } = useOpened()
  const [screen, setScreen] = useState<'calendar' | 'gifts'>('calendar')
  const [openingDay, setOpeningDay] = useState<number | null>(null)

  // A hand-edit mistake in deal.json is shown here, in development, before it can be deployed.
  if (import.meta.env.DEV && dealProblems.length > 0) {
    return (
      <main className="deal-problems">
        <h1>src/data/deal.json</h1>
        <ul>
          {dealProblems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      </main>
    )
  }

  const openingDoor = deal.find((door) => door.day === openingDay)

  return (
    <>
      {screen === 'calendar' ? (
        <CalendarScreen
          deal={deal}
          now={now}
          opened={opened}
          onOpenDoor={setOpeningDay}
          onShowGifts={() => setScreen('gifts')}
          onReset={import.meta.env.DEV ? resetOpened : undefined}
        />
      ) : (
        <GiftsScreen gifts={giftList(deal, opened)} onBack={() => setScreen('calendar')} />
      )}
      {openingDoor && (
        <OpeningStage
          key={openingDoor.day}
          door={openingDoor}
          onOpened={markOpened}
          onClose={() => setOpeningDay(null)}
        />
      )}
    </>
  )
}

export default App
