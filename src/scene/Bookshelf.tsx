import { BOOKSHELF_CAPACITY } from '../game/items'

const BOOK_COLORS = ['#b5432f', '#2f7f7a', '#e6a83a', '#6b4e8a', '#e8a3a1', '#3f6fb0', '#7a9a4b']
const SHELVES = 3
const PER_SHELF = BOOKSHELF_CAPACITY / SHELVES

/** Deterministic pseudo-random so each book keeps its look between renders. */
const rand = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function BookshelfModel({ books, wood, back }: { books: number; wood: string; back: string }) {
  const width = 1.8
  const height = 2.4
  const depth = 0.45
  const shelfGap = height / SHELVES

  return (
    <group>
      {/* sides, back, shelves */}
      {[-width / 2, width / 2].map((x) => (
        <mesh key={x} position={[x, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.06, height, depth]} />
          <meshStandardMaterial color={wood} />
        </mesh>
      ))}
      <mesh position={[0, height / 2, -depth / 2 + 0.02]} receiveShadow>
        <boxGeometry args={[width, height, 0.03]} />
        <meshStandardMaterial color={back} />
      </mesh>
      {Array.from({ length: SHELVES + 1 }, (_, i) => (
        <mesh key={i} position={[0, i * shelfGap + 0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.05, depth]} />
          <meshStandardMaterial color={wood} />
        </mesh>
      ))}

      {Array.from({ length: Math.min(books, BOOKSHELF_CAPACITY) }, (_, i) => {
        const shelf = Math.floor(i / PER_SHELF)
        const slot = i % PER_SHELF
        const h = 0.48 + rand(i) * 0.22
        const w = 0.12 + rand(i + 50) * 0.06
        const x = -width / 2 + 0.2 + slot * 0.36
        return (
          <mesh
            key={i}
            position={[x, shelf * shelfGap + 0.045 + h / 2, 0.02]}
            rotation={[0, 0, (rand(i + 99) - 0.5) * 0.12]}
            castShadow
          >
            <boxGeometry args={[w, h, 0.32]} />
            <meshStandardMaterial color={BOOK_COLORS[i % BOOK_COLORS.length]} roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}
