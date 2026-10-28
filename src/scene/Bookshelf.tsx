import { BOOKSHELF_CAPACITY, ITEMS_BY_ID } from '../game/items'
import { RoundedBox } from '@react-three/drei'
import { BookMesh, bookSize } from './Books'
import { useGraphics } from '../ui/graphics'
import { woodGrain } from './materials'

export const SHELVES = 3
export const PER_SHELF = BOOKSHELF_CAPACITY / SHELVES
const WIDTH = 1.8
const HEIGHT = 2.4
const DEPTH = 0.45
const SHELF_GAP = HEIGHT / SHELVES

/** Small fixed lean per slot so a full shelf does not look machine-made. */
const lean = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 0.08
}

/** Slot order: bottom shelf first, left to right. */
export function BookshelfModel({ books = [], wood, back }: { books?: (string | null)[]; wood: string; back: string }) {
  const simple = useGraphics((s) => s.simple)
  const woodMat = simple ? <meshStandardMaterial color={wood} roughness={0.7} /> : <meshStandardMaterial map={woodGrain(wood)} roughness={0.6} />
  return (
    <group>
      {/* sides, back, shelves */}
      {[-WIDTH / 2, WIDTH / 2].map((x) => (
        <RoundedBox key={x} args={[0.07, HEIGHT, DEPTH]} radius={0.02} position={[x, HEIGHT / 2, 0]} castShadow receiveShadow>
          {woodMat}
        </RoundedBox>
      ))}
      <mesh position={[0, HEIGHT / 2, -DEPTH / 2 + 0.02]} receiveShadow>
        <boxGeometry args={[WIDTH, HEIGHT, 0.03]} />
        {simple ? <meshStandardMaterial color={back} roughness={0.8} /> : <meshStandardMaterial map={woodGrain(back, [2, 2])} roughness={0.7} />}
      </mesh>
      {Array.from({ length: SHELVES + 1 }, (_, i) => (
        <RoundedBox key={i} args={[WIDTH, 0.05, DEPTH]} radius={0.015} position={[0, i * SHELF_GAP + 0.02, 0]} castShadow receiveShadow>
          {woodMat}
        </RoundedBox>
      ))}
      {/* crown and plinth */}
      <RoundedBox args={[WIDTH + 0.14, 0.08, DEPTH + 0.06]} radius={0.025} position={[0, HEIGHT + 0.05, 0.01]} castShadow receiveShadow>
        {woodMat}
      </RoundedBox>
      <RoundedBox args={[WIDTH + 0.06, 0.06, DEPTH + 0.02]} radius={0.02} position={[0, 0.005, 0.005]} castShadow receiveShadow>
        {woodMat}
      </RoundedBox>

      {books.slice(0, BOOKSHELF_CAPACITY).map((id, i) => {
        const book = id ? ITEMS_BY_ID[id] : undefined
        if (!book) return null
        const shelf = Math.floor(i / PER_SHELF)
        const slot = i % PER_SHELF
        const { depth } = bookSize(book.id)
        return (
          <group
            key={i}
            position={[-WIDTH / 2 + 0.25 + slot * 0.43, shelf * SHELF_GAP + 0.045, DEPTH / 2 - depth / 2 - 0.02]}
            rotation={[0, 0, lean(i)]}
          >
            <BookMesh book={book} />
          </group>
        )
      })}
    </group>
  )
}
