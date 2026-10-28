import type { ReactNode } from 'react'

/** Line icons, drawn on a 16px grid in the current text color. */
function Icon({ children, size = 16 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

export const IconBook = () => (
  <Icon>
    <path d="M2.5 3.5c2-1 4-1 5.5.5v9c-1.5-1.5-3.5-1.5-5.5-.5zM13.5 3.5c-2-1-4-1-5.5.5v9c1.5-1.5 3.5-1.5 5.5-.5z" />
  </Icon>
)

export const IconClose = () => (
  <Icon>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Icon>
)

export const IconRotateLeft = () => (
  <Icon>
    <path d="M3 3v3.5h3.5" />
    <path d="M3.4 6.5A5 5 0 1 1 4 11" />
  </Icon>
)

export const IconRotateRight = () => (
  <Icon>
    <path d="M13 3v3.5H9.5" />
    <path d="M12.6 6.5A5 5 0 1 0 12 11" />
  </Icon>
)

export const IconStore = () => (
  <Icon>
    <path d="M2.5 5.5h11v8h-11zM1.5 2.5h13v3h-13zM6.5 8.5h3" />
  </Icon>
)

export const IconCheck = () => (
  <Icon>
    <path d="M3 8.5l3 3 7-7" />
  </Icon>
)

export const IconLock = () => (
  <Icon>
    <rect x="3.5" y="7" width="9" height="6.5" rx="1" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </Icon>
)

/** Small lozenge, the "can be won" marker. */
export const IconGem = () => (
  <Icon>
    <path d="M8 2l5 6-5 6-5-6z" />
  </Icon>
)

export const IconKey = () => (
  <Icon>
    <circle cx="5" cy="8" r="2.5" />
    <path d="M7.5 8h6M11.5 8v2M13.5 8v1.5" />
  </Icon>
)

export const IconLogout = () => (
  <Icon>
    <path d="M6.5 2.5h-3v11h3M10 5l3 3-3 3M13 8H6" />
  </Icon>
)

export const IconPlus = () => (
  <Icon>
    <path d="M8 3v10M3 8h10" />
  </Icon>
)

export const IconTrash = () => (
  <Icon>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.7 9h5.6l.7-9" />
  </Icon>
)

export const IconEdit = () => (
  <Icon>
    <path d="M10.5 2.5l3 3-8 8h-3v-3z" />
  </Icon>
)

export const IconDice = () => (
  <Icon>
    <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
    <circle cx="5.5" cy="5.5" r="0.6" fill="currentColor" />
    <circle cx="10.5" cy="10.5" r="0.6" fill="currentColor" />
    <circle cx="8" cy="8" r="0.6" fill="currentColor" />
  </Icon>
)

export const IconArrowLeft = () => (
  <Icon>
    <path d="M13 8H3M7 4L3 8l4 4" />
  </Icon>
)

export const IconSun = () => (
  <Icon>
    <circle cx="8" cy="8" r="2.8" />
    <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
  </Icon>
)

export const IconMoon = () => (
  <Icon>
    <path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" />
  </Icon>
)

export const IconGauge = () => (
  <Icon>
    <path d="M2.5 11.5a5.5 5.5 0 1 1 11 0" />
    <path d="M8 11.5l2.5-3.5" />
  </Icon>
)

export const IconBrush = () => (
  <Icon>
    <path d="M10 2.5l3.5 3.5-5 5-3.5-3.5zM5 7.5L2.5 13.5 8.5 11" />
  </Icon>
)
