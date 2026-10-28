import { useEffect, useMemo, type PointerEvent } from 'react'
import { BOOKSHELF_CAPACITY, ITEMS_BY_ID, RARITY_LABEL, ROOM_THEMES, isBook, isPaint } from '../game/items'
import { availableItems, isBookshelf, useGame } from '../game/store'
import { CollectionButton } from './Collection'
import { IconBook, IconBrush, IconClose, IconLogout, IconRotateLeft, IconRotateRight, IconStore } from './icons'
import { ItemIcon } from './ItemIcon'
import { GraphicsToggle } from './GraphicsToggle'
import { ThemeToggle } from './ThemeToggle'

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
  const name = useGame((s) => s.name)
  const logout = useGame((s) => s.logoutAgent)
  // the fullest bookshelf in this room decides when the next room unlocks
  const books = Math.max(0, ...rooms[currentRoom].placed.filter(isBookshelf).map((p) => (p.books ?? []).filter(Boolean).length))

  return (
    <header className="topbar">
      <div className="plaque">
        <span className="eyebrow">Kamer {currentRoom + 1}</span>
        <h1>{ROOM_THEMES[currentRoom % ROOM_THEMES.length].name}</h1>
      </div>
      <div className="topbar-strip">
        <div className="books" title="Vul een boekenkast helemaal om een nieuwe kamer vrij te spelen.">
          <IconBook />
          <span className="books-count">
            {books}
            <small>/{BOOKSHELF_CAPACITY}</small>
          </span>
          <div className="bar">
            <div style={{ width: `${(books / BOOKSHELF_CAPACITY) * 100}%` }} />
          </div>
        </div>
        {rooms.length > 1 && (
          <nav className="rooms" aria-label="Kamers">
            {rooms.map((_, i) => (
              <button key={i} className={i === currentRoom ? 'active' : ''} onClick={() => goToRoom(i)}>
                {i + 1}
              </button>
            ))}
          </nav>
        )}
        <CollectionButton />
        <div className="agent">
          <GraphicsToggle />
          <ThemeToggle />
          <span>{name}</span>
          <button className="icon-button" onClick={logout} title="Uitloggen" aria-label="Uitloggen">
            <IconLogout />
          </button>
        </div>
      </div>
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
  const draggingBook = useGame((s) => !!s.drag?.active && isBook(ITEMS_BY_ID[s.drag.itemId]))
  const decorations = items.filter(([id]) => !isPaint(ITEMS_BY_ID[id]) && !isBook(ITEMS_BY_ID[id]))
  const books = items.filter(([id]) => isBook(ITEMS_BY_ID[id]))
  const paints = items.filter(([id]) => isPaint(ITEMS_BY_ID[id]))

  const onPointerDown = (itemId: string) => (e: PointerEvent) => {
    e.preventDefault()
    startDrag({ itemId, active: false, startX: e.clientX, startY: e.clientY })
  }

  const card = ([id, count]: [string, number]) => {
    const item = ITEMS_BY_ID[id]
    const tip = isPaint(item)
      ? 'sleep op een muur, de vloer of een meubel'
      : isBook(item)
        ? 'sleep naar een boekenkast'
        : 'sleep naar je kamer'
    return (
      <li key={id} className={`card ${item.rarity}`} onPointerDown={onPointerDown(id)} title={`${item.name}: ${tip}`}>
        <span className="card-window">
          <ItemIcon item={item} />
        </span>
        <span className="name">{item.name}</span>
        <span className={`rarity ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
        {count > 1 && <span className="count">{count}</span>}
      </li>
    )
  }

  return (
    <section className={`inventory ${dragging ? 'drop-target' : ''}`}>
      {dragging ? (
        <p className="inventory-message">
          <IconStore /> Laat hier los om op te bergen
        </p>
      ) : draggingBook ? (
        <p className="inventory-message">
          <IconBook /> Laat het boek los op een boekenkast
        </p>
      ) : draggingPaint ? (
        <p className="inventory-message">
          <IconBrush /> Laat de verf los op een muur, de vloer of een meubel
        </p>
      ) : (
        <div className="inventory-rows">
          <div className="inventory-row">
            <h2>Inventaris</h2>
            {decorations.length ? (
              <ul>{decorations.map(card)}</ul>
            ) : (
              <p className="empty">Alles staat al in je kamer. Win nieuwe spullen met quizzen.</p>
            )}
          </div>
          {books.length > 0 && (
            <div className="inventory-row side">
              <h2>Boeken</h2>
              <ul>{books.map(card)}</ul>
            </div>
          )}
          {paints.length > 0 && (
            <div className="inventory-row side">
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
  const openShelf = useGame((s) => s.openShelf)

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
    return <p className="hint">Sleep iets uit je inventaris de kamer in</p>
  }
  const item = ITEMS_BY_ID[selected.itemId]

  return (
    <aside className="selection">
      <div className="selection-header">
        <span className="selection-window">
          <ItemIcon item={item} />
        </span>
        <div>
          <span className="eyebrow">Geselecteerd</span>
          <h2>{item.name}</h2>
        </div>
        <button className="icon-button" onClick={() => select(null)} aria-label="Sluiten">
          <IconClose />
        </button>
      </div>
      <div className="actions">
        <button onClick={() => rotateItem(selected.uid, ROTATE_STEP)} title="Draai (R)">
          <IconRotateLeft /> Draai
        </button>
        <button className="icon-button" onClick={() => rotateItem(selected.uid, -ROTATE_STEP)} title="Draai terug (Shift+R)" aria-label="Draai terug">
          <IconRotateRight />
        </button>
        <button className="danger" onClick={() => storeItem(selected.uid)} title="Opbergen (Delete)">
          <IconStore /> Opbergen
        </button>
      </div>
      {isBookshelf(selected) && (
        <button className="primary wide" onClick={() => openShelf(selected.uid)}>
          <IconBook /> Boeken indelen
        </button>
      )}
      <p className="tip">Sleep het voorwerp om het te verplaatsen</p>
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

  return toast ? (
    <div className="toast" role="status">
      {toast}
    </div>
  ) : null
}
