import { IconMoon, IconSun } from './icons'
import { useTheme } from './theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme((s) => s.theme)
  const toggle = useTheme((s) => s.toggle)
  const label = theme === 'dark' ? 'Lichte modus' : 'Donkere modus'
  return (
    <button className={`icon-button theme-toggle ${className}`} onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  )
}
