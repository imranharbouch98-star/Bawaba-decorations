import { ITEMS_BY_ID, isPrize } from './items'

/** Points an agent needs on a day to unlock that day's prize. */
export const DAILY_POINTS_TARGET = 75
export const OFFER_COUNT = 3

/** Local calendar date as YYYY-MM-DD. */
export function todayKey(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function seededRandom(seed: string) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/**
 * The prizes an agent can pick from today. Stable for the whole day.
 * Prefers items the agent does not own yet; on busy days only rare and special items.
 */
export function dailyOffers(dateKey: string, enabled: string[], owned: Set<string>, busy: boolean) {
  let pool = enabled.filter((id) => ITEMS_BY_ID[id] && isPrize(ITEMS_BY_ID[id]))
  if (busy) {
    const premium = pool.filter((id) => ITEMS_BY_ID[id].rarity !== 'common')
    if (premium.length >= OFFER_COUNT) pool = premium
  }
  const fresh = pool.filter((id) => !owned.has(id))
  if (fresh.length >= OFFER_COUNT) pool = fresh

  const rnd = seededRandom(dateKey)
  const shuffled = [...pool].sort()
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, OFFER_COUNT)
}
