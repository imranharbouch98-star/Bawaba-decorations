import type { ItemDef } from '../game/items'
import { useThumbs } from '../scene/Thumbnails'

/** Rendered thumbnail of the item, with a simple color swatch while it is still being baked. */
export function ItemIcon({ item, className = '' }: { item: ItemDef; className?: string }) {
  const url = useThumbs((s) => s.urls[item.id])
  if (url) return <img src={url} alt="" className={`item-icon ${className}`} draggable={false} />
  return (
    <svg viewBox="0 0 40 40" className={`item-icon ${className}`} aria-hidden>
      <rect x="4" y="4" width="32" height="32" rx="10" fill={item.color} />
      <rect x="4" y="24" width="32" height="12" rx="6" fill={item.accent} opacity="0.7" />
    </svg>
  )
}
