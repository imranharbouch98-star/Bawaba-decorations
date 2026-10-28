import { create } from 'zustand'

const KEY = 'bawaba-simple-view'

function initial() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/** "Simple view": plain materials and no post-processing, for less powerful computers. */
export const useGraphics = create<{ simple: boolean; toggle: () => void }>((set, get) => ({
  simple: initial(),
  toggle: () => {
    const simple = !get().simple
    try {
      localStorage.setItem(KEY, simple ? '1' : '0')
    } catch {
      // not saved, still switches for this visit
    }
    set({ simple })
  },
}))
