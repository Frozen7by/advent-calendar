import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

function App() {
  const { t } = useTranslation()

  return (
    <main className="app">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        {t('app.title')}
      </motion.h1>
      <p>{t('app.comingSoon')}</p>
    </main>
  )
}

export default App
