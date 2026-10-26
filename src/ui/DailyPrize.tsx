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
        <strong>Dagprijs</strong>
        {busy && <span className="badge">Drukke dag</span>}
      </header>
      <div className="goal-progress">
        <div className="bar">
          <div style={{ width: `${Math.min(points / DAILY_POINTS_TARGET, 1) * 100}%` }} />
        </div>
        <span>
          {points}/{DAILY_POINTS_TARGET} punten
        </span>
      </div>

      {claim ? (
        <p className="daily-note">
          Je koos vandaag <b>{ITEMS_BY_ID[claim.itemId].name}</b>. Morgen wacht er een nieuwe prijs!
        </p>
      ) : !reached ? (
        <p className="daily-note">
          Haal vandaag {DAILY_POINTS_TARGET} punten en kies een decoratie.
          {busy && ' Vandaag zijn het extra mooie spullen!'}
        </p>
      ) : offers.length === 0 ? (
        <p className="daily-note">Er zijn nog geen prijzen beschikbaar.</p>
      ) : (
        <>
          <p className="daily-note">Gelukt! Kies je prijs van vandaag:</p>
          <ul className="offers">
            {offers.map((id) => {
              const item = ITEMS_BY_ID[id]
              return (
                <li key={id}>
                  <button className={`offer ${item.rarity}`} onClick={() => claimDailyPrize(id)}>
                    <ItemIcon item={item} />
                    <span className="name">{item.name}</span>
                    <span className="rarity">{RARITY_LABEL[item.rarity]}</span>
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
