import { useEffect, useMemo, useState } from 'react'
import { BOOKSHELF_CAPACITY, ITEMS_BY_ID, RARITY_LABEL } from '../game/items'
import { availableBooks, useGame } from '../game/store'
import { PER_SHELF, SHELVES } from '../scene/Bookshelf'
import { IconBook, IconClose, IconPlus, IconStore } from './icons'
import { ItemIcon } from './ItemIcon'

/** Pick which book stands in which slot of a bookshelf. */
export function ShelfEditor() {
  const uid = useGame((s) => s.shelfEditor)
  const shelf = useGame((s) => s.rooms[s.currentRoom].placed.find((p) => p.uid === s.shelfEditor))
  const inventory = useGame((s) => s.inventory)
  const rooms = useGame((s) => s.rooms)
  const setShelfSlot = useGame((s) => s.setShelfSlot)
  const close = useGame((s) => s.openShelf)
  const [slot, setSlot] = useState<number | null>(null)
  const books = useMemo(() => availableBooks({ inventory, rooms }), [inventory, rooms])

  useEffect(() => {
    setSlot(null)
    if (!uid) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [uid, close])

  if (!uid || !shelf) return null
  const slots = Array.from({ length: BOOKSHELF_CAPACITY }, (_, i) => shelf.books?.[i] ?? null)
  const filled = slots.filter(Boolean).length
  const selectedBook = slot !== null ? slots[slot] : null

  const place = (bookId: string) => {
    const target = slot ?? slots.indexOf(null)
    if (target < 0) return
    setShelfSlot(uid, target, bookId)
    // move on to the next empty slot so filling a shelf is quick
    const next = slots.findIndex((b, i) => !b && i !== target)
    setSlot(next >= 0 ? next : null)
  }

  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && close(null)}>
      <div className="modal shelf-modal" role="dialog" aria-modal aria-labelledby="shelf-title">
        <header className="modal-header">
          <div className="modal-title">
            <span className="eyebrow">Jouw boekenkast</span>
            <h2 id="shelf-title">Boeken indelen</h2>
            <div className="collection-progress">
              <div className="bar">
                <div style={{ width: `${(filled / BOOKSHELF_CAPACITY) * 100}%` }} />
              </div>
              <span>
                {filled} van {BOOKSHELF_CAPACITY} plekken gevuld · een volle kast opent een nieuwe kamer
              </span>
            </div>
          </div>
          <button className="icon-button close" onClick={() => close(null)} aria-label="Sluiten">
            <IconClose />
          </button>
        </header>

        <div className="modal-body shelf-body">
          <section className="shelf-view" aria-label="Boekenkast">
            {Array.from({ length: SHELVES }, (_, row) => {
              // show the top shelf first; slots are stored bottom shelf first
              const shelfIndex = SHELVES - 1 - row
              return (
                <div key={row} className="shelf-row">
                  {Array.from({ length: PER_SHELF }, (_, col) => {
                    const i = shelfIndex * PER_SHELF + col
                    const book = slots[i] ? ITEMS_BY_ID[slots[i]!] : undefined
                    return (
                      <button
                        key={i}
                        className={`shelf-slot ${book ? 'filled' : ''} ${slot === i ? 'selected' : ''}`}
                        onClick={() => setSlot(slot === i ? null : i)}
                        aria-label={book ? book.name : `Lege plek ${i + 1}`}
                        title={book?.name}
                      >
                        {book ? <ItemIcon item={book} /> : <IconPlus />}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </section>

          <section className="shelf-side">
            {slot !== null && (
              <div className="shelf-selected">
                <span className="eyebrow">Plek {slot + 1}</span>
                {selectedBook ? (
                  <>
                    <h3>{ITEMS_BY_ID[selectedBook].name}</h3>
                    <button onClick={() => setShelfSlot(uid, slot, null)}>
                      <IconStore /> Terug naar inventaris
                    </button>
                  </>
                ) : (
                  <h3>Kies hieronder een boek voor deze plek</h3>
                )}
              </div>
            )}

            <h3 className="shelf-side-title">
              <IconBook /> Jouw boeken
            </h3>
            {books.length ? (
              <ul className="book-list">
                {books.map(([id, count]) => {
                  const book = ITEMS_BY_ID[id]
                  return (
                    <li key={id}>
                      <button className="book-option" onClick={() => place(id)} disabled={!slots.includes(null) && !selectedBook}>
                        <span className="reward-window">
                          <ItemIcon item={book} />
                        </span>
                        <span className="book-option-text">
                          <span className="book-title">{book.name}</span>
                          <span className={`rarity ${book.rarity}`}>{RARITY_LABEL[book.rarity]}</span>
                        </span>
                        {count > 1 && <span className="book-count">{count}×</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="empty-state">Al je boeken staan in de kast. Win nieuwe boeken met quizzen.</p>
            )}
            <p className="tip">Tip: je kunt een boek ook vanuit je inventaris op de kast slepen.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
