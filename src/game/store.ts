import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { checkAdmin } from './admin'
import {
  BOOKSHELF_CAPACITY, DEFAULT_LAYOUT, FIXTURE_IDS, ITEMS, ITEMS_BY_ID, PAINT_RESET, isBook, isPaint, isPrize,
} from './items'
import { defaultSpin, spinFor, type PlacedItem, type Vec3 } from './placement'
import { SEED_QUIZZES, attemptsLeft, countCorrect, newId, type Question, type Quiz, type QuizResult } from './quiz'

export type Surface = 'wall-back' | 'wall-left' | 'floor'

/** What a paint bucket was dropped on: a room surface or a placed piece of furniture. */
export type PaintTarget = { surface: Surface } | { uid: string }

export interface RoomState {
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

/** Everything that belongs to one agent. */
export interface Profile {
  name: string
  rooms: RoomState[]
  currentRoom: number
  inventory: string[]
  quizResults: Record<string, QuizResult>
}

const PROFILE_KEYS = ['name', 'rooms', 'currentRoom', 'inventory', 'quizResults'] as const

export interface QuizOutcome {
  correct: number
  total: number
  passed: boolean
  /** Attempts remaining after this one (Infinity = unlimited). */
  attemptsLeft: number
  /** Set when this attempt won the prize. */
  prizeId?: string
  /** Passed before, so no new prize. */
  alreadyWon: boolean
}

interface GameState extends Profile {
  /** Key of the logged-in agent's profile. */
  agent: string | null
  isAdmin: boolean
  profiles: Record<string, Profile>

  /** Admin-made quizzes. Kept locally for now; these belong on the backend. */
  quizzes: Quiz[]

  collectionOpen: boolean
  /** Quiz the agent is taking; shown as its own page over the room. */
  playingQuiz: string | null
  /** Bookshelf (placed uid) whose editor is open. */
  shelfEditor: string | null
  drag: Drag | null
  selectedUid: string | null
  toast: string | null

  loginAgent: (name: string) => void
  logoutAgent: () => void
  loginAdmin: (username: string, password: string) => Promise<boolean>
  logoutAdmin: () => void

  playQuiz: (quizId: string | null) => void
  /** `answers[i]` holds the option indexes chosen for question i. */
  submitQuiz: (quizId: string, answers: number[][]) => QuizOutcome | null

  saveQuiz: (quiz: Quiz) => void
  deleteQuiz: (quizId: string) => void
  setQuizActive: (quizId: string, active: boolean) => void

  setCollectionOpen: (open: boolean) => void
  openShelf: (uid: string | null) => void
  setShelfSlot: (uid: string, slot: number, bookId: string | null) => void
  addBookToShelf: (uid: string, bookId: string) => boolean

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
}

const defaultFurniture = (): PlacedItem[] =>
  DEFAULT_LAYOUT.map(([itemId, position, normal, spin]) => ({ uid: newId(), itemId, position, normal, spin }))

/** A new room comes with its own furniture, which also counts as owned. */
const newRoom = (): RoomState => ({ placed: defaultFurniture(), paint: {} })

const newProfile = (name: string): Profile => ({
  name,
  rooms: [newRoom()],
  currentRoom: 0,
  inventory: [
    ...FIXTURE_IDS,
    PAINT_RESET,
    'rug-berber', 'cushion-terracotta', 'cushion-saffron', 'teapot-brass', 'plant-olive', 'plate-fez', 'paint-mint',
    'book-andalus', 'book-fez', 'book-tea',
  ],
  quizResults: {},
})

const profileKey = (name: string) => name.trim().toLowerCase()
const pickProfile = (s: Profile): Profile => ({
  name: s.name,
  rooms: s.rooms,
  currentRoom: s.currentRoom,
  inventory: s.inventory,
  quizResults: s.quizResults,
})

const PRIZE_IDS = ITEMS.filter(isPrize).map((i) => i.id)

/** A random collectible, preferring ones the agent does not own yet. */
function drawPrize(owned: string[] = []) {
  const fresh = PRIZE_IDS.filter((id) => !owned.includes(id))
  const from = fresh.length ? fresh : PRIZE_IDS
  return from[Math.floor(Math.random() * from.length)]
}

export const randomPrizeId = () => drawPrize()

export const isBookshelf = (p?: PlacedItem) => !!p && ITEMS_BY_ID[p.itemId]?.model === 'bookshelf'

const shelfSlots = (p: PlacedItem) => Array.from({ length: BOOKSHELF_CAPACITY }, (_, i) => p.books?.[i] ?? null)

export const useGame = create<GameState>()(
  persist(
    (set, get) => {
      const updateRoom = (fn: (room: RoomState) => RoomState) =>
        set((s) => ({ rooms: s.rooms.map((r, i) => (i === s.currentRoom ? fn(r) : r)) }))

      const updatePlaced = (uid: string, fn: (p: PlacedItem) => PlacedItem) =>
        updateRoom((r) => ({ ...r, placed: r.placed.map((p) => (p.uid === uid ? fn(p) : p)) }))

      /** A full bookshelf in the newest room unlocks the next room. */
      const maybeUnlockRoom = () => {
        const s = get()
        if (s.currentRoom !== s.rooms.length - 1) return
        const full = s.rooms[s.currentRoom].placed.some((p) => isBookshelf(p) && shelfSlots(p).every(Boolean))
        if (!full) return
        set({
          rooms: [...s.rooms, newRoom()],
          inventory: [...s.inventory, ...FIXTURE_IDS],
          toast: 'De boekenkast is vol! Een nieuwe kamer is vrijgespeeld.',
        })
      }

      return {
        ...newProfile(''),
        agent: null,
        isAdmin: false,
        profiles: {},
        quizzes: SEED_QUIZZES,
        collectionOpen: false,
        playingQuiz: null,
        shelfEditor: null,
        drag: null,
        selectedUid: null,
        toast: null,

        loginAgent: (name) => {
          const key = profileKey(name)
          if (!key) return
          const profiles = get().profiles
          const profile = profiles[key] ?? newProfile(name.trim())
          set({
            ...profile,
            profiles: { ...profiles, [key]: profile },
            agent: key,
            selectedUid: null,
            shelfEditor: null,
            collectionOpen: false,
          })
        },
        logoutAgent: () =>
          set({ agent: null, selectedUid: null, shelfEditor: null, collectionOpen: false, playingQuiz: null, drag: null }),

        loginAdmin: async (username, password) => {
          const ok = await checkAdmin(username, password)
          if (ok) set({ isAdmin: true })
          return ok
        },
        logoutAdmin: () => set({ isAdmin: false }),

        submitQuiz: (quizId, answers) => {
          const s = get()
          const quiz = s.quizzes.find((q) => q.id === quizId)
          if (!quiz || !s.agent) return null
          const prev = s.quizResults[quizId]
          const alreadyWon = !!prev?.passed
          // out of attempts: the quiz can no longer be submitted
          if (!alreadyWon && attemptsLeft(quiz, prev) <= 0) return null
          const correct = countCorrect(quiz, answers)
          const passed = correct >= quiz.passCount
          let prizeId: string | undefined
          if (passed && !alreadyWon) {
            prizeId =
              quiz.prize.kind === 'item' && ITEMS_BY_ID[quiz.prize.itemId]
                ? quiz.prize.itemId
                : drawPrize(s.inventory)
          }
          set({
            quizResults: {
              ...s.quizResults,
              [quizId]: {
                attempts: (prev?.attempts ?? 0) + 1,
                bestCorrect: Math.max(prev?.bestCorrect ?? 0, correct),
                passed: alreadyWon || passed,
                prizeId: prev?.prizeId ?? prizeId,
              },
            },
            inventory: prizeId ? [...s.inventory, prizeId] : s.inventory,
          })
          const attempts = (prev?.attempts ?? 0) + 1
          return {
            correct,
            total: quiz.questions.length,
            passed,
            prizeId,
            alreadyWon,
            attemptsLeft: attemptsLeft(quiz, { attempts, bestCorrect: 0, passed }),
          }
        },

        playQuiz: (playingQuiz) => set({ playingQuiz, selectedUid: null }),

        saveQuiz: (quiz) => {
          if (!get().isAdmin) return
          set((s) => ({
            quizzes: s.quizzes.some((q) => q.id === quiz.id)
              ? s.quizzes.map((q) => (q.id === quiz.id ? quiz : q))
              : [quiz, ...s.quizzes],
          }))
        },
        deleteQuiz: (quizId) => {
          if (!get().isAdmin) return
          set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== quizId) }))
        },
        setQuizActive: (quizId, active) => {
          if (!get().isAdmin) return
          set((s) => ({ quizzes: s.quizzes.map((q) => (q.id === quizId ? { ...q, active } : q)) }))
        },

        setCollectionOpen: (collectionOpen) => set({ collectionOpen }),
        openShelf: (shelfEditor) => set({ shelfEditor }),

        setShelfSlot: (uid, slot, bookId) => {
          updatePlaced(uid, (p) => {
            const books = shelfSlots(p)
            books[slot] = bookId
            return { ...p, books }
          })
          maybeUnlockRoom()
        },

        addBookToShelf: (uid, bookId) => {
          const shelf = get().rooms[get().currentRoom].placed.find((p) => p.uid === uid)
          if (!shelf) return false
          const slot = shelfSlots(shelf).indexOf(null)
          if (slot < 0) return false
          get().setShelfSlot(uid, slot, bookId)
          return true
        },

        startDrag: (drag) => set({ drag }),
        activateDrag: () => set((s) => (s.drag ? { drag: { ...s.drag, active: true } } : {})),
        endDrag: () => set({ drag: null }),

        placeItem: (itemId, position, normal) => {
          const id = newId()
          updateRoom((r) => ({ ...r, placed: [...r.placed, { uid: id, itemId, position, normal, spin: defaultSpin(normal) }] }))
          set({ selectedUid: id })
        },

        applyPaint: (paintId, target) => {
          const paint = paintId === PAINT_RESET ? undefined : paintId
          if ('surface' in target) updateRoom((r) => ({ ...r, paint: { ...r.paint, [target.surface]: paint } }))
          else updatePlaced(target.uid, (p) => ({ ...p, paint }))
        },

        moveItem: (id, position, normal) => updatePlaced(id, (p) => ({ ...p, position, normal, spin: spinFor(p, normal) })),

        rotateItem: (id, delta) => updatePlaced(id, (p) => ({ ...p, spin: p.spin + delta })),

        // a stored bookshelf drops its books back into the inventory with it
        storeItem: (id) => {
          updateRoom((r) => ({ ...r, placed: r.placed.filter((p) => p.uid !== id) }))
          set((s) => ({
            selectedUid: s.selectedUid === id ? null : s.selectedUid,
            shelfEditor: s.shelfEditor === id ? null : s.shelfEditor,
          }))
        },

        select: (selectedUid) => set({ selectedUid }),

        goToRoom: (index) => set({ currentRoom: index, selectedUid: null, shelfEditor: null }),

        clearToast: () => set({ toast: null }),
      }
    },
    {
      name: 'bawaba-decorations',
      version: 7,
      partialize: ({ agent, profiles, quizzes }) => ({ agent, profiles, quizzes }),
      // the active profile lives in the top-level fields while an agent is logged in
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>
        const merged = { ...current, ...p }
        const profile = p.agent ? p.profiles?.[p.agent] : undefined
        return profile ? { ...merged, ...profile } : { ...merged, agent: null }
      },
      migrate: (persisted, version) => {
        if (version < 4) return { agent: null, profiles: {}, quizzes: SEED_QUIZZES }
        const v5 = version < 5 ? fromSinglePlayer(persisted) : (persisted as PersistedV5)
        const v6 = version < 6 ? toCountBasedQuizzes(v5) : v5
        const v7 = version < 7 ? toMultiAnswer(v6) : v6
        // the prize pool was dropped in v7
        const { agent, profiles, quizzes } = v7
        return { agent, profiles, quizzes }
      },
    },
  ),
)

type PersistedV5 = Pick<GameState, 'agent' | 'profiles' | 'quizzes'>

/** v4 was a single player: keep that progress as the "Demo" agent. */
function fromSinglePlayer(persisted: unknown): PersistedV5 {
  const old = persisted as { rooms?: RoomState[]; currentRoom?: number; inventory?: string[] }
  const known = (id: string) => !!ITEMS_BY_ID[id]
  const demo: Profile = {
    ...newProfile('Demo'),
    rooms: (old.rooms ?? [newRoom()]).map((r) => ({ placed: r.placed.filter((p) => known(p.itemId)), paint: r.paint ?? {} })),
    currentRoom: old.currentRoom ?? 0,
    inventory: [...(old.inventory ?? []).filter(known), 'book-andalus', 'book-fez', 'book-tea'],
  }
  return { agent: null, profiles: { demo }, quizzes: SEED_QUIZZES }
}

/** v6: quizzes need a number of correct answers instead of a percentage, and can limit attempts. */
function toCountBasedQuizzes(s: PersistedV5): PersistedV5 {
  type OldQuiz = Quiz & { passPercent?: number }
  type OldResult = QuizResult & { bestScore?: number }
  const quizzes = (s.quizzes as OldQuiz[]).map(({ passPercent = 70, ...q }) => ({
    ...q,
    passCount: Math.max(1, Math.ceil((passPercent / 100) * q.questions.length)),
    maxAttempts: null,
  }))
  const sizes = new Map(quizzes.map((q) => [q.id, q.questions.length]))
  const profiles = Object.fromEntries(
    Object.entries(s.profiles).map(([key, p]) => [
      key,
      {
        ...p,
        quizResults: Object.fromEntries(
          Object.entries(p.quizResults as Record<string, OldResult>).map(([id, { bestScore = 0, ...r }]) => [
            id,
            { ...r, bestCorrect: r.bestCorrect ?? Math.round((bestScore / 100) * (sizes.get(id) ?? 0)) },
          ]),
        ),
      },
    ]),
  )
  return { ...s, quizzes, profiles }
}

/** v7: every question lists its right answers, and may allow several. */
function toMultiAnswer(s: PersistedV5): PersistedV5 {
  type OldQuestion = Omit<Question, 'correct' | 'multiple'> & { correct: number | number[]; multiple?: boolean }
  const quizzes = s.quizzes.map((q) => ({
    ...q,
    questions: (q.questions as OldQuestion[]).map((question) => ({
      ...question,
      correct: Array.isArray(question.correct) ? question.correct : [question.correct],
      multiple: question.multiple ?? false,
    })),
  }))
  return { ...s, quizzes }
}

// keep the logged-in agent's saved profile in sync with the live state
useGame.subscribe((s, prev) => {
  if (!s.agent || s.agent !== prev.agent) return
  if (PROFILE_KEYS.every((k) => s[k] === prev[k])) return
  useGame.setState({ profiles: { ...s.profiles, [s.agent]: pickProfile(s) } })
})

/** Owned items that are not placed in a room or on a shelf, as [itemId, count] pairs. Paints are never used up. */
export function availableItems(s: Pick<Profile, 'inventory' | 'rooms'>): [string, number][] {
  const counts = new Map<string, number>()
  const add = (id: string, n: number) => counts.set(id, (counts.get(id) ?? 0) + n)
  for (const id of s.inventory) add(id, 1)
  for (const r of s.rooms) {
    for (const p of r.placed) {
      add(p.itemId, -1)
      for (const b of p.books ?? []) if (b) add(b, -1)
    }
  }
  return [...counts]
    .filter(([id, n]) => n > 0 && ITEMS_BY_ID[id])
    .map(([id, n]): [string, number] => [id, isPaint(ITEMS_BY_ID[id]) ? 1 : n])
}

/** Books the agent owns that are not on any shelf. */
export const availableBooks = (s: Pick<Profile, 'inventory' | 'rooms'>) =>
  availableItems(s).filter(([id]) => isBook(ITEMS_BY_ID[id]))
