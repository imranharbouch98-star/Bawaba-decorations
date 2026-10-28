import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { CATEGORY_LABEL, ITEMS, RARITY_LABEL, categoryOf, isPrize, type Category, type ItemDef } from '../game/items'
import { useGame } from '../game/store'
import { IconCheck, IconClose, IconGem, IconLock } from './icons'
import { ItemIcon } from './ItemIcon'

/** Everything that can be collected (room furniture is not part of the collection). */
export const COLLECTIBLES = ITEMS.filter(isPrize)
export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]

type Status = 'owned' | 'winnable' | 'locked'
type Filter = 'all' | Status

const STATUS: Record<Status, { label: string; help: string; icon: ReactNode }> = {
  owned: { label: 'In bezit', help: 'staat in je inventaris', icon: <IconCheck /> },
  winnable: { label: 'Te winnen', help: 'de prijs van een quiz', icon: <IconGem /> },
  locked: { label: 'Nog geheim', help: 'misschien een verrassingsprijs', icon: <IconLock /> },
}

/** Winnable = the fixed prize of an active quiz. Surprise prizes can be anything. */
function useStatus() {
  const inventory = useGame((s) => s.inventory)
  const quizzes = useGame((s) => s.quizzes)
  return useMemo(() => {
    const owned = new Set(inventory)
    const winnable = new Set<string>()
    for (const q of quizzes) if (q.active && q.prize.kind === 'item') winnable.add(q.prize.itemId)
    return (item: ItemDef): Status => (owned.has(item.id) ? 'owned' : winnable.has(item.id) ? 'winnable' : 'locked')
  }, [inventory, quizzes])
}

export function CollectionButton() {
  const open = useGame((s) => s.setCollectionOpen)
  const status = useStatus()
  const owned = COLLECTIBLES.filter((i) => status(i) === 'owned').length
  return (
    <button className="collection-button" onClick={() => open(true)}>
      Collectie {owned}/{COLLECTIBLES.length}
    </button>
  )
}

export function CollectionModal() {
  const isOpen = useGame((s) => s.collectionOpen)
  const close = useGame((s) => s.setCollectionOpen)
  const status = useStatus()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  if (!isOpen) return null
  const owned = COLLECTIBLES.filter((i) => status(i) === 'owned').length

  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && close(false)}>
      <div className="modal" role="dialog" aria-modal aria-labelledby="collection-title">
        <header className="modal-header">
          <div className="modal-title">
            <h2 id="collection-title">Collectie</h2>
            <div className="collection-progress">
              <div className="bar">
                <div style={{ width: `${(owned / COLLECTIBLES.length) * 100}%` }} />
              </div>
              <span>
                {owned} van {COLLECTIBLES.length} verzameld
              </span>
            </div>
          </div>
          <button className="icon-button close" onClick={() => close(false)} aria-label="Sluiten">
            <IconClose />
          </button>
        </header>

        <div className="modal-body">
          <CollectionView status={status} />
        </div>
      </div>
    </div>
  )
}

function CollectionView({ status }: { status: (item: ItemDef) => Status }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const visible = COLLECTIBLES.filter(
    (i) => (filter === 'all' || status(i) === filter) && (category === 'all' || categoryOf(i) === category),
  )
  const count = (f: Filter) => (f === 'all' ? COLLECTIBLES.length : COLLECTIBLES.filter((i) => status(i) === f).length)

  return (
    <>
      <div className="toolbar">
        <div className="chips">
          {(['all', 'owned', 'winnable', 'locked'] as Filter[]).map((f) => (
            <button key={f} className={`chip ${f} ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'Alles' : STATUS[f].label}
              <span className="chip-count">{count(f)}</span>
            </button>
          ))}
        </div>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      <p className="legend">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <span key={s} className={`legend-item ${s}`}>
            <b>{STATUS[s].icon}</b> {STATUS[s].label}: {STATUS[s].help}
          </span>
        ))}
      </p>

      {CATEGORIES.map((c) => {
        const items = visible.filter((i) => categoryOf(i) === c)
        if (!items.length) return null
        const ownedHere = COLLECTIBLES.filter((i) => categoryOf(i) === c && status(i) === 'owned').length
        const totalHere = COLLECTIBLES.filter((i) => categoryOf(i) === c).length
        return (
          <section key={c} className="collection-section">
            <h3>
              {CATEGORY_LABEL[c]} <span>{ownedHere}/{totalHere}</span>
            </h3>
            <ul className="collection-grid">
              {items.map((item) => (
                <CollectionCard key={item.id} item={item} status={status(item)} />
              ))}
            </ul>
          </section>
        )
      })}
      {!visible.length && <p className="empty-state">Niets gevonden met deze filters.</p>}
    </>
  )
}

function CollectionCard({ item, status }: { item: ItemDef; status: Status }) {
  const hidden = status === 'locked'
  return (
    <li className={`collection-card ${status}`}>
      <span className={`status-pill ${status}`}>
        {STATUS[status].icon} {STATUS[status].label}
      </span>
      <span className="card-window">
        <ItemIcon item={item} className={hidden ? 'silhouette' : ''} />
      </span>
      <span className="name">{hidden ? 'Nog geheim' : item.name}</span>
      <span className={`rarity-pill ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
    </li>
  )
}

export function CategorySelect({ value, onChange }: { value: Category | 'all'; onChange: (c: Category | 'all') => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Category | 'all')} aria-label="Categorie">
      <option value="all">Alle categorieën</option>
      {CATEGORIES.map((c) => (
        <option key={c} value={c}>
          {CATEGORY_LABEL[c]}
        </option>
      ))}
    </select>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="switch-track" aria-hidden />
    </span>
  )
}
