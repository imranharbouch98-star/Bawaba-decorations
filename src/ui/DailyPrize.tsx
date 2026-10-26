import { useMemo } from 'react'
import { DAILY_POINTS_TARGET, todayKey } from '../game/daily'
import { ITEMS_BY_ID, RARITY_LABEL } from '../game/items'
import { isBusyToday, todayPoints, todaysOffers, useGame } from '../game/store'
import { ItemIcon } from './ItemIcon'

export function DailyPrize() {
  const points = useGame(todayPoints)
  const busy = useGame(isBusyToday)
  const claim = useGame((s) => (s.dailyClaim?.date === todayKey() ? s.dailyClaim : null))
  const claimDailyPrize = useGame((s) => s.claimDailyPrize)
  const enabledItems = useGame((s) => s.enabledItems)
  const inventory = useGame((s) => s.inventory)
  const busyDates = useGame((s) => s.busyDates)
  const offers = useMemo(() => todaysOffers({ enabledItems, inventory, busyDates }), [enabledItems, inventory, busyDates])

  const reached = points >= DAILY_POINTS_TARGET

  return (
    <section className={`daily ${busy ? 'busy' : ''}`}>
      <header>
        <span className="eyebrow">{busy ? 'Drukke dag · extra mooie prijzen' : 'Vandaag'}</span>
        <h3>Dagprijs</h3>
      </header>
      <div className="daily-points">
        <span className="daily-number">{Math.min(points, 999)}</span>
        <span className="daily-target">/ {DAILY_POINTS_TARGET} punten</span>
      </div>
      <div className="bar daily-bar">
        <div style={{ width: `${Math.min(points / DAILY_POINTS_TARGET, 1) * 100}%` }} />
      </div>

      {claim ? (
        <p className="daily-note">
          Je koos vandaag <b>{ITEMS_BY_ID[claim.itemId].name}</b>. Morgen wacht er een nieuwe prijs.
        </p>
      ) : !reached ? (
        <p className="daily-note">
          Haal vandaag {DAILY_POINTS_TARGET} punten en kies een decoratie.
          {busy && ' Vandaag kies je uit zeldzame en speciale stukken.'}
        </p>
      ) : offers.length === 0 ? (
        <p className="daily-note">Er zijn nog geen prijzen beschikbaar.</p>
      ) : (
        <>
          <p className="daily-note">Gelukt. Kies je prijs van vandaag:</p>
          <ul className="offers">
            {offers.map((id) => {
              const item = ITEMS_BY_ID[id]
              return (
                <li key={id}>
                  <button className={`offer ${item.rarity}`} onClick={() => claimDailyPrize(id)}>
                    <span className="card-window">
                      <ItemIcon item={item} />
                    </span>
                    <span className="name">{item.name}</span>
                    <span className={`rarity ${item.rarity}`}>{RARITY_LABEL[item.rarity]}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
