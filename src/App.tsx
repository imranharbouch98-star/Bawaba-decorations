import { useEffect, useState } from 'react'
import { useGame } from './game/store'
import { GameCanvas } from './scene/GameCanvas'
import { ThumbnailBaker } from './scene/Thumbnails'
import { AdminApp } from './ui/AdminApp'
import { CollectionModal } from './ui/Collection'
import { Hud } from './ui/Hud'
import { AdminLoginPage, AgentLoginPage } from './ui/LoginScreen'
import { QuizPage, QuizPanel } from './ui/QuizPanel'
import { ShelfEditor } from './ui/ShelfEditor'

/** Hash routing keeps the admin pages separate without any server configuration. */
const isAdminRoute = () => window.location.hash.startsWith('#/admin')

function useAdminRoute() {
  const [admin, setAdmin] = useState(isAdminRoute)
  useEffect(() => {
    const onChange = () => setAdmin(isAdminRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return admin
}

export function App() {
  const adminRoute = useAdminRoute()
  const isAdmin = useGame((s) => s.isAdmin)
  const agent = useGame((s) => s.agent)

  return (
    <>
      {adminRoute ? isAdmin ? <AdminApp /> : <AdminLoginPage /> : agent ? <AgentApp /> : <AgentLoginPage />}
      <ThumbnailBaker />
    </>
  )
}

function AgentApp() {
  return (
    <div className="app">
      <main className="stage">
        <GameCanvas />
        <Hud />
      </main>
      <QuizPanel />
      <CollectionModal />
      <ShelfEditor />
      <QuizPage />
    </div>
  )
}
