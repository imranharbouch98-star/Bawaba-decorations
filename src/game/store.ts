import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { checkAdmin } from './admin'
import { DAILY_POINTS_TARGET, dailyOffers, todayKey } from './daily'
import { GOALS, type Metric } from './goals'
import { BOOKSHELF_CAPACITY, DEFAULT_ENABLED, DEFAULT_LAYOUT, FIXTURE_IDS, ITEMS_BY_ID, PAINT_RESET, isPaint, isPrize } from './items'
import { defaultSpin, spinFor, type PlacedItem, type Vec3 } from './placement'

export type Surface = 'wall-back' | 'wall-left' | 'floor'

/** What a paint bucket was dropped on: a room surface or a placed piece of furniture. */
export type PaintTarget = { surface: Surface } | { uid: string }

export interface RoomState {
  books: number
  placed: PlacedItem[]
  /** Paint item applied per surface; missing = theme default. */
  paint: Partial<Record<Surface, string>>
}

export interface Drag {
  itemId: string
  /** Set when moving an item that is already in the room. */
  uid?: string
  /** Becomes true once the pointer moved far enough to count as a drag. */
  active: boolean
  startX: number
  startY: number
}

interface GameState {
  rooms: RoomState[]
  currentRoom: number
  inventory: string[]
  stats: { quizzes: number; busyDays: number }
  claimedGoals: string[]
  /** Today's points. Mocked locally until the external points system is connected. */
  points: { date: string; value: number }
  dailyClaim: { date: string; itemId: string } | null

  /** Admin settings. Kept locally for now; these belong on the backend. */
  enabledItems: string[]
  busyDates: string[]

  isAdmin: boolean
  collectionOpen: boolean
  drag: Drag | null
  selectedUid: string | null
  toast: string | null

  completeQuiz: () => void
  addPoints: (n: number) => void
  claimDailyPrize: (itemId: string) => void
  grantRandomItem: () => void
  claimGoal: (goalId: string) => void

  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  setItemEnabled: (id: string, enabled: boolean) => void
  setItemsEnabled: (ids: string[], enabled: boolean) => void
  setBusyToday: (busy: boolean) => void
  setCollectionOpen: (open: boolean) => void

  startDrag: (drag: Drag) => void
  activateDrag: () => void
  endDrag: () => void

  placeItem: (itemId: string, position: Vec3, normal: Vec3) => void
  applyPaint: (paintId: string, target: PaintTarget) => void
  moveItem: (uid: string, position: Vec3, normal: Vec3) => void
  rotateItem: (uid: string, delta: number) => void
  storeItem: (uid: string) => void
  select: (uid: string | null) => void

  goToRoom: (index: number) => void
  clearToast: () => void
  reset: () => void
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

const defaultFurniture = (): PlacedItem[] =>
  DEFAULT_LAYOUT.map(([itemId, position, normal, spin]) => ({ uid: uid(), itemId, position, normal, spin }))

/** A new room comes with its own furniture, which also counts as owned. */
const newRoom = (): RoomState => ({ books: 0, placed: defaultFurniture(), paint: {} })

const initialPlayer = {
  rooms: [newRoom()],
  currentRoom: 0,
  inventory: [
    ...FIXTURE_IDS,
    PAINT_RESET,
    'rug-berber', 'cushion-terracotta', 'cushion-saffron', 'teapot-brass', 'plant-olive', 'plate-fez', 'paint-mint',
  ],
  stats: { quizzes: 0, busyDays: 0 },
  claimedGoals: [] as string[],
  points: { date: todayKey(), value: 0 },
  dailyClaim: null,
}

const initialAdmin = {
  enabledItems: DEFAULT_ENABLED,
  busyDates: [] as string[],
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      const updateRoom = (fn: (room: RoomState) => RoomState) =>
        set((s) => ({ rooms: s.rooms.map((r, i) => (i === s.currentRoom ? fn(r) : r)) }))

      return {
        ...initialPlayer,
        ...initialAdmin,
        isAdmin: false,
        collectionOpen: false,
        drag: null,
        selectedUid: null,
        toast: null,

        completeQuiz: () =>
          set((s) => {
            const rooms = s.rooms.map((r) => ({ ...r }))
            const last = rooms[rooms.length - 1]
            last.books += 1
            const stats = { ...s.stats, quizzes: s.stats.quizzes + 1 }
            if (last.books >= BOOKSHELF_CAPACITY) {
              rooms.push(newRoom())
              return {
                rooms,
                stats,
                inventory: [...s.inventory, ...FIXTURE_IDS],
                toast: 'De boekenkast is vol! Een nieuwe kamer is vrijgespeeld.',
              }
            }
            return { rooms, stats, toast: `Nieuw boek! (${last.books}/${BOOKSHELF_CAPACITY})` }
          }),

        addPoints: (n) => set((s) => ({ points: { date: todayKey(), value: todayPoints(s) + n } })),

        claimDailyPrize: (itemId) => {
          const s = get()
          const today = todayKey()
          if (todayPoints(s) < DAILY_POINTS_TARGET || s.dailyClaim?.date === today) return
          if (!todaysOffers(s).includes(itemId)) return
          const busy = s.busyDates.includes(today)
          set({
            inventory: [...s.inventory, itemId],
            dailyClaim: { date: today, itemId },
            stats: busy ? { ...s.stats, busyDays: s.stats.busyDays + 1 } : s.stats,
            toast: `Dagprijs: ${ITEMS_BY_ID[itemId].name}`,
          })
        },

        grantRandomItem: () => {
          const pool = get().enabledItems.filter((id) => ITEMS_BY_ID[id] && isPrize(ITEMS_BY_ID[id]))
          if (!pool.length) return
          const item = ITEMS_BY_ID[pool[Math.floor(Math.random() * pool.length)]]
          set((s) => ({ inventory: [...s.inventory, item.id], toast: `Je hebt gewonnen: ${item.name}` }))
        },

        claimGoal: (goalId) => {
          const goal = GOALS.find((g) => g.id === goalId)
          const s = get()
          if (!goal || s.claimedGoals.includes(goalId) || goalProgress(s, goal.metric) < goal.target) return
          set({
            claimedGoals: [...s.claimedGoals, goalId],
            inventory: [...s.inventory, goal.reward],
            toast: `Beloning: ${ITEMS_BY_ID[goal.reward].name}`,
          })
        },

        login: async (username, password) => {
          const ok = await checkAdmin(username, password)
          if (ok) set({ isAdmin: true })
          return ok
        },
        logout: () => set({ isAdmin: false }),

        setItemEnabled: (id, enabled) => {
          if (!get().isAdmin) return
          set((s) => ({
            enabledItems: enabled ? [...new Set([...s.enabledItems, id])] : s.enabledItems.filter((i) => i !== id),
          }))
        },
        setItemsEnabled: (ids, enabled) => {
          if (!get().isAdmin) return
          const prizeIds = ids.filter((id) => ITEMS_BY_ID[id] && isPrize(ITEMS_BY_ID[id]))
          set((s) => ({
            enabledItems: enabled
              ? [...new Set([...s.enabledItems, ...prizeIds])]
              : s.enabledItems.filter((id) => !prizeIds.includes(id)),
          }))
        },
        setBusyToday: (busy) => {
          if (!get().isAdmin) return
          const today = todayKey()
          set((s) => ({ busyDates: busy ? [...new Set([...s.busyDates, today])] : s.busyDates.filter((d) => d !== today) }))
        },
        setCollectionOpen: (collectionOpen) => set({ collectionOpen }),

        startDrag: (drag) => set({ drag }),
        activateDrag: () => set((s) => (s.drag ? { drag: { ...s.drag, active: true } } : {})),
        endDrag: () => set({ drag: null }),

        placeItem: (itemId, position, normal) => {
          const id = uid()
          updateRoom((r) => ({ ...r, placed: [...r.placed, { uid: id, itemId, position, normal, spin: defaultSpin(normal) }] }))
          set({ selectedUid: id })
        },

        applyPaint: (paintId, target) => {
          const paint = paintId === PAINT_RESET ? undefined : paintId
          if ('surface' in target) {
            updateRoom((r) => ({ ...r, paint: { ...r.paint, [target.surface]: paint } }))
          } else {
            updateRoom((r) => ({ ...r, placed: r.placed.map((p) => (p.uid === target.uid ? { ...p, paint } : p)) }))
          }
        },

        moveItem: (id, position, normal) =>
          updateRoom((r) => ({
            ...r,
            placed: r.placed.map((p) => (p.uid === id ? { ...p, position, normal, spin: spinFor(p, normal) } : p)),
          })),

        rotateItem: (id, delta) =>
          updateRoom((r) => ({ ...r, placed: r.placed.map((p) => (p.uid === id ? { ...p, spin: p.spin + delta } : p)) })),

        storeItem: (id) => {
          updateRoom((r) => ({ ...r, placed: r.placed.filter((p) => p.uid !== id) }))
          set((s) => ({ selectedUid: s.selectedUid === id ? null : s.selectedUid }))
        },

        select: (selectedUid) => set({ selectedUid }),

        goToRoom: (index) => set({ currentRoom: index, selectedUid: null }),

        clearToast: () => set({ toast: null }),

        // resets the player's progress, keeps the admin settings
        reset: () => set({ ...initialPlayer, points: { date: todayKey(), value: 0 }, selectedUid: null }),
      }
    },
    {
      name: 'bawaba-decorations',
      version: 4,
      migrate: (persisted, version) => {
        if (version < 2) return { ...initialPlayer, ...initialAdmin }
        // v3 only added fields, which fall back to their defaults
        const s = { ...initialPlayer, ...initialAdmin, ...(persisted as object) }
        if (version >= 4) return s
        // v4: furniture became movable items and the star ornaments were removed
        const known = (id: string) => !!ITEMS_BY_ID[id]
        return {
          ...s,
          rooms: s.rooms.map((r) => ({
            ...r,
            paint: {},
            placed: [...defaultFurniture(), ...r.placed.filter((p) => known(p.itemId))],
          })),
          inventory: [...s.inventory.filter(known), ...s.rooms.flatMap(() => FIXTURE_IDS), PAINT_RESET],
          enabledItems: s.enabledItems.filter(known),
        }
      },
      partialize: ({ rooms, currentRoom, inventory, stats, claimedGoals, points, dailyClaim, enabledItems, busyDates }) => ({
        rooms,
        currentRoom,
        inventory,
        stats,
        claimedGoals,
        points,
        dailyClaim,
        enabledItems,
        busyDates,
      }),
    },
  ),
)

type CountState = Pick<GameState, 'inventory' | 'rooms'>

/** Decorations placed across all rooms (furniture does not count). */
const placedCount = (s: CountState) =>
  s.rooms.reduce((n, r) => n + r.placed.filter((p) => !ITEMS_BY_ID[p.itemId]?.fixture).length, 0)

export function goalProgress(s: CountState & Pick<GameState, 'stats'>, metric: Metric) {
  return metric === 'placed' ? placedCount(s) : s.stats[metric]
}

export const todayPoints = (s: Pick<GameState, 'points'>) => (s.points.date === todayKey() ? s.points.value : 0)

export const isBusyToday = (s: Pick<GameState, 'busyDates'>) => s.busyDates.includes(todayKey())

export function todaysOffers(s: Pick<GameState, 'enabledItems' | 'inventory' | 'busyDates'>) {
  return dailyOffers(todayKey(), s.enabledItems, new Set(s.inventory), isBusyToday(s))
}

/** Owned items that are not placed in any room, as [itemId, count] pairs. Paints are never used up. */
export function availableItems(s: CountState): [string, number][] {
  const counts = new Map<string, number>()
  for (const id of s.inventory) counts.set(id, (counts.get(id) ?? 0) + 1)
  for (const r of s.rooms) for (const p of r.placed) counts.set(p.itemId, (counts.get(p.itemId) ?? 0) - 1)
  return [...counts]
    .filter(([id, n]) => n > 0 && ITEMS_BY_ID[id])
    .map(([id, n]): [string, number] => [id, isPaint(ITEMS_BY_ID[id]) ? 1 : n])
}
