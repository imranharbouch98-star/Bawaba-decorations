import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const KEY = 'bawaba-theme'

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // storage can be blocked; fall back to the system setting
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Current color theme. index.html sets the same attribute before React loads to avoid a flash. */
export const useTheme = create<{ theme: Theme; toggle: () => void }>((set, get) => ({
  theme: initialTheme(),
  toggle: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // not saved, still switches for this visit
    }
    set({ theme })
  },
}))

useTheme.subscribe(({ theme }) => {
  document.documentElement.dataset.theme = theme
})
document.documentElement.dataset.theme = useTheme.getState().theme
