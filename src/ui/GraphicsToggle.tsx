import { useGraphics } from './graphics'
import { IconGauge } from './icons'

/** Small icon button that switches the room to the lighter "simple view". */
export function GraphicsToggle() {
  const simple = useGraphics((s) => s.simple)
  const toggle = useGraphics((s) => s.toggle)
  const label = simple ? 'Eenvoudige weergave staat aan (klik voor mooie weergave)' : 'Eenvoudige weergave (lichter voor oudere computers)'
  return (
    <button
      className={`icon-button graphics-toggle ${simple ? 'on' : ''}`}
      onClick={toggle}
      aria-label="Eenvoudige weergave"
      aria-pressed={simple}
      title={label}
    >
      <IconGauge />
    </button>
  )
}
