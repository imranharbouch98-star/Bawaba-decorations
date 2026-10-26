import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CATEGORY_LABEL, ITEMS, RARITY_LABEL, categoryOf, isPrize, type Category, type ItemDef } from '../game/items'
import { isBusyToday, useGame } from '../game/store'
import { ItemIcon } from './ItemIcon'

/** Everything that can be collected (room furniture is not part of the collection). */
const COLLECTIBLES = ITEMS.filter(isPrize)
const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]

type Status = 'owned' | 'winnable' | 'locked'
type Filter = 'all' | Status

const STATUS: Record<Status, { label: string; help: string; icon: string }> = {
  owned: { label: 'In bezit', help: 'staat in je inventaris', icon: '✓' },
  winnable: { label: 'Te winnen', help: 'kan je winnen met je dagprijs', icon: '★' },
  locked: { label: 'Vergrendeld', help: 'nog niet beschikbaar', icon: '🔒' },
}

function useStatus() {
  const inventory = useGame((s) => s.inventory)
  const enabledItems = useGame((s) => s.enabledItems)
  return useMemo(() => {
    const owned = new Set(inventory)
    const enabled = new Set(enabledItems)
    return (item: ItemDef): Status => (owned.has(item.id) ? 'owned' : enabled.has(item.id) ? 'winnable' : 'locked')
  }, [inventory, enabledItems])
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
  const isAdmin = useGame((s) => s.isAdmin)
  const [view, setView] = useState<'collection' | 'login' | 'admin'>('collection')
  const status = useStatus()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  useEffect(() => {
    if (!isAdmin && view === 'admin') setView('collection')
  }, [isAdmin, view])

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
          {isAdmin ? (
            <nav className="tabs">
              <button className={view === 'collection' ? 'active' : ''} onClick={() => setView('collection')}>
                Collectie
              </button>
              <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>
                Beheer
              </button>
            </nav>
          ) : (
            view !== 'login' && (
              <button className="admin-link" onClick={() => setView('login')}>
                🔑 Beheerder
              </button>
            )
          )}
          <button className="close" onClick={() => close(false)} aria-label="Sluiten">
            ×
          </button>
        </header>

        <div className="modal-body">
          {view === 'login' && !isAdmin ? (
            <LoginForm onDone={() => setView('admin')} onCancel={() => setView('collection')} />
          ) : view === 'admin' && isAdmin ? (
            <AdminView />
          ) : (
            <CollectionView status={status} />
          )}
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
        <select value={category} onChange={(e) => setCategory(e.target.value as Category | 'all')} aria-label="Categorie">
          <option value="all">Alle categorieën</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
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
      <div className="thumb">
        <ItemIcon item={item} className={hidden ? 'silhouette' : ''} />
      </div>
      <span className="name">{hidden ? 'Nog geheim' : item.name}</span>
      <span className={`rarity-pill ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
    </li>
  )
}

function LoginForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const login = useGame((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const ok = await login(username, password)
    setBusy(false)
    if (ok) onDone()
    else setError(true)
  }

  return (
    <form className="login-card" onSubmit={submit}>
      <h3>Inloggen als beheerder</h3>
      <p>Beheerders bepalen welke decoraties agenten kunnen winnen en welke dagen drukke dagen zijn.</p>
      <label>
        Gebruikersnaam
        <input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
      </label>
      <label>
        Wachtwoord
        <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <span className="error">Gebruikersnaam of wachtwoord klopt niet.</span>}
      <div className="login-actions">
        <button type="button" onClick={onCancel}>
          Annuleren
        </button>
        <button type="submit" className="primary" disabled={busy || !username || !password}>
          Inloggen
        </button>
      </div>
    </form>
  )
}

function AdminView() {
  const logout = useGame((s) => s.logout)
  const setBusyToday = useGame((s) => s.setBusyToday)
  const setItemsEnabled = useGame((s) => s.setItemsEnabled)
  const setItemEnabled = useGame((s) => s.setItemEnabled)
  const busy = useGame(isBusyToday)
  const enabledItems = useGame((s) => s.enabledItems)
  const enabled = useMemo(() => new Set(enabledItems), [enabledItems])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const q = query.trim().toLowerCase()
  const visible = COLLECTIBLES.filter(
    (i) => (category === 'all' || categoryOf(i) === category) && (!q || i.name.toLowerCase().includes(q)),
  )
  const activeCount = COLLECTIBLES.filter((i) => enabled.has(i.id)).length

  return (
    <div className="admin">
      <div className="admin-cards">
        <div className="admin-card">
          <span className="admin-card-label">Actief als prijs</span>
          <strong>
            {activeCount} <small>van {COLLECTIBLES.length}</small>
          </strong>
          <span className="admin-card-help">Alleen actieve decoraties verschijnen als dagprijs.</span>
        </div>
        <label className={`admin-card busy-card ${busy ? 'on' : ''}`}>
          <span className="admin-card-label">Drukke dag</span>
          <span className="switch-row">
            <Switch checked={busy} onChange={setBusyToday} />
            <strong>{busy ? 'Vandaag is een drukke dag' : 'Gewone dag'}</strong>
          </span>
          <span className="admin-card-help">Op drukke dagen bestaat de dagprijs alleen uit zeldzame en speciale decoraties.</span>
        </label>
        <div className="admin-card account">
          <span className="admin-card-label">Ingelogd als beheerder</span>
          <button onClick={logout}>Uitloggen</button>
        </div>
      </div>

      <div className="toolbar">
        <input className="search" placeholder="Zoek een decoratie…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value as Category | 'all')} aria-label="Categorie">
          <option value="all">Alle categorieën</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
        <button onClick={() => setItemsEnabled(visible.map((i) => i.id), true)}>Selectie aan</button>
        <button onClick={() => setItemsEnabled(visible.map((i) => i.id), false)}>Selectie uit</button>
      </div>

      {CATEGORIES.map((c) => {
        const items = visible.filter((i) => categoryOf(i) === c)
        if (!items.length) return null
        const on = items.filter((i) => enabled.has(i.id)).length
        return (
          <section key={c} className="admin-section">
            <h3>
              {CATEGORY_LABEL[c]}
              <span>
                {on}/{items.length} actief
              </span>
              <button onClick={() => setItemsEnabled(items.map((i) => i.id), on < items.length)}>
                {on < items.length ? 'Alles aan' : 'Alles uit'}
              </button>
            </h3>
            <ul className="admin-list">
              {items.map((item) => (
                <li key={item.id} className={enabled.has(item.id) ? 'on' : ''}>
                  <ItemIcon item={item} />
                  <span className="admin-name">
                    {item.name}
                    <span className={`rarity-pill ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
                  </span>
                  <span className="admin-state">{enabled.has(item.id) ? 'Actief' : 'Uit'}</span>
                  <Switch checked={enabled.has(item.id)} onChange={(v) => setItemEnabled(item.id, v)} label={item.name} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}
      {!visible.length && <p className="empty-state">Niets gevonden.</p>}

      <p className="admin-note">Let op: deze instellingen worden voorlopig alleen in deze browser bewaard.</p>
    </div>
  )
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
      <span className="switch-track" aria-hidden />
    </span>
  )
}
