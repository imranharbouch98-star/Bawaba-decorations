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

export const IconBrush = () => (
  <Icon>
    <path d="M10 2.5l3.5 3.5-5 5-3.5-3.5zM5 7.5L2.5 13.5 8.5 11" />
  </Icon>
)
