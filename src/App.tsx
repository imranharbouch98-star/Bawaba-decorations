import { GameCanvas } from './scene/GameCanvas'
import { ThumbnailBaker } from './scene/Thumbnails'
import { CollectionModal } from './ui/Collection'
import { GoalsPanel } from './ui/GoalsPanel'
import { Hud } from './ui/Hud'

export function App() {
  return (
    <div className="app">
      <main className="stage">
        <GameCanvas />
        <Hud />
      </main>
      <GoalsPanel />
      <CollectionModal />
      <ThumbnailBaker />
    </div>
  )
}
