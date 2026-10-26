import { useEffect, useMemo, type PointerEvent } from 'react'
import { BOOKSHELF_CAPACITY, ITEMS_BY_ID, RARITY_LABEL, ROOM_THEMES, isPaint } from '../game/items'
import { availableItems, useGame } from '../game/store'
import { CollectionButton } from './Collection'
import { ItemIcon } from './ItemIcon'

const ROTATE_STEP = Math.PI / 8

/** Overlays on top of the 3D room. */
export function Hud() {
  return (
    <>
      <TopBar />
      <SelectionPanel />
      <Inventory />
      <Toast />
    </>
  )
}

function TopBar() {
  const rooms = useGame((s) => s.rooms)
  const currentRoom = useGame((s) => s.currentRoom)
  const goToRoom = useGame((s) => s.goToRoom)
  const books = Math.min(rooms[currentRoom].books, BOOKSHELF_CAPACITY)

  return (
    <header className="topbar panel">
      <h1>{ROOM_THEMES[currentRoom % ROOM_THEMES.length].name}</h1>
      <div className="books" title="Elke quiz levert een boek op. Volle kast = nieuwe kamer.">
        📚 {books}/{BOOKSHELF_CAPACITY}
        <div className="bar">
          <div style={{ width: `${(books / BOOKSHELF_CAPACITY) * 100}%` }} />
        </div>
      </div>
      <CollectionButton />
      {rooms.length > 1 && (
        <nav className="rooms">
          {rooms.map((_, i) => (
            <button key={i} className={i === currentRoom ? 'active' : ''} onClick={() => goToRoom(i)}>
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

function Inventory() {
  const inventory = useGame((s) => s.inventory)
  const rooms = useGame((s) => s.rooms)
  const items = useMemo(() => availableItems({ inventory, rooms }), [inventory, rooms])
  const startDrag = useGame((s) => s.startDrag)
  const dragging = useGame((s) => !!s.drag?.active && !!s.drag.uid)
  const draggingPaint = useGame((s) => !!s.drag?.active && isPaint(ITEMS_BY_ID[s.drag.itemId]))
  const decorations = items.filter(([id]) => !isPaint(ITEMS_BY_ID[id]))
  const paints = items.filter(([id]) => isPaint(ITEMS_BY_ID[id]))

  const onPointerDown = (itemId: string) => (e: PointerEvent) => {
    e.preventDefault()
    startDrag({ itemId, active: false, startX: e.clientX, startY: e.clientY })
  }

  const card = ([id, count]: [string, number]) => {
    const item = ITEMS_BY_ID[id]
    const tip = isPaint(item) ? 'sleep op een muur, de vloer of een meubel' : 'sleep naar je kamer'
    return (
      <li key={id} className={`card ${item.rarity}`} onPointerDown={onPointerDown(id)} title={`${item.name}: ${tip}`}>
        <ItemIcon item={item} />
        <span className="name">{item.name}</span>
        <span className="rarity">{RARITY_LABEL[item.rarity]}</span>
        {count > 1 && <span className="count">×{count}</span>}
      </li>
    )
  }

  return (
    <section className={`inventory panel ${dragging ? 'drop-target' : ''}`}>
      {dragging ? (
        <p className="empty">Laat hier los om op te bergen</p>
      ) : draggingPaint ? (
        <p className="empty">Laat de verf los op een muur, de vloer of een meubel 🎨</p>
      ) : (
        <div className="inventory-rows">
          <div className="inventory-row">
            <h2>Inventaris</h2>
            {decorations.length ? (
              <ul>{decorations.map(card)}</ul>
            ) : (
              <p className="empty">Alles staat al in je kamer. Behaal doelen voor nieuwe spullen!</p>
            )}
          </div>
          {paints.length > 0 && (
            <div className="inventory-row paints">
              <h2>Verf</h2>
              <ul>{paints.map(card)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function SelectionPanel() {
  const selected = useGame((s) => s.rooms[s.currentRoom].placed.find((p) => p.uid === s.selectedUid))
  const rotateItem = useGame((s) => s.rotateItem)
  const storeItem = useGame((s) => s.storeItem)
  const select = useGame((s) => s.select)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') rotateItem(selected.uid, e.shiftKey ? -ROTATE_STEP : ROTATE_STEP)
      if (e.key === 'Delete' || e.key === 'Backspace') storeItem(selected.uid)
      if (e.key === 'Escape') select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, rotateItem, storeItem, select])

  if (!selected) {
    return <p className="hint panel">Sleep spullen uit je inventaris naar de kamer ✨</p>
  }
  const item = ITEMS_BY_ID[selected.itemId]

  return (
    <aside className="selection panel">
      <div className="selection-header">
        <ItemIcon item={item} />
        <h2>{item.name}</h2>
        <button className="close" onClick={() => select(null)} aria-label="Sluiten">×</button>
      </div>
      <div className="actions">
        <button onClick={() => rotateItem(selected.uid, ROTATE_STEP)} title="Draai (R)">⟲ Draai</button>
        <button onClick={() => rotateItem(selected.uid, -ROTATE_STEP)} title="Draai terug (Shift+R)">⟳</button>
        <button onClick={() => storeItem(selected.uid)} title="Opbergen (Delete)">Opbergen</button>
      </div>
      <p className="tip">Sleep om te verplaatsen</p>
    </aside>
  )
}

function Toast() {
  const toast = useGame((s) => s.toast)
  const clearToast = useGame((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 2800)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  return toast ? <div className="toast">{toast}</div> : null
}
