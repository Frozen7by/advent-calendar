import { useEffect, useState } from 'react'
import { giftList, resolveNow } from './calendar/logic.ts'
import { useNow } from './calendar/useNow.ts'
import { useOpened } from './calendar/useOpened.ts'
import { dealProblems, doors } from './data/deal.ts'
import { OpeningStage } from './opening/OpeningStage.tsx'
import { CalendarScreen } from './screens/CalendarScreen.tsx'
import { GiftsScreen } from './screens/GiftsScreen.tsx'
import { updater } from './update/autoUpdate.ts'

const currentTime = () => resolveNow(new Date(), window.location.search, import.meta.env.DEV)

function App() {
  const now = useNow(currentTime)
  const { opened, markOpened, resetOpened } = useOpened()
  const [screen, setScreen] = useState<'calendar' | 'gifts'>('calendar')
  // A tapped door first swings open (swingingDoor), then its case is shown (openingDoorId).
  const [swingingDoor, setSwingingDoor] = useState<string | null>(null)
  const [openingDoorId, setOpeningDoorId] = useState<string | null>(null)

  // A new version must not reload the app while a door is swinging open or its case is on screen.
  const doorOpening = swingingDoor !== null || openingDoorId !== null
  useEffect(() => updater.setBusy(doorOpening), [doorOpening])

  // A hand-edit mistake in a deal file is shown here, in development, before it can be deployed.
  if (import.meta.env.DEV && dealProblems.length > 0) {
    return (
      <main className="deal-problems">
        <h1>src/data</h1>
        <ul>
          {dealProblems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      </main>
    )
  }

  const openingDoor = doors.find((door) => door.id === openingDoorId)

  return (
    <>
      {screen === 'calendar' ? (
        <CalendarScreen
          doors={doors}
          now={now}
          opened={opened}
          swingingDoor={swingingDoor}
          onSwingDoor={setSwingingDoor}
          onOpenDoor={setOpeningDoorId}
          onShowGifts={() => setScreen('gifts')}
          onReset={import.meta.env.DEV ? resetOpened : undefined}
        />
      ) : (
        <GiftsScreen gifts={giftList(doors, opened)} onBack={() => setScreen('calendar')} />
      )}
      {openingDoor && (
        <OpeningStage
          key={openingDoor.id}
          door={openingDoor}
          onOpened={markOpened}
          onClose={() => {
            setOpeningDoorId(null)
            setSwingingDoor(null)
          }}
        />
      )}
    </>
  )
}

export default App
