import { useMemo } from 'react'
import * as THREE from 'three'
import { ITEMS_BY_ID, ROOM_THEMES } from '../game/items'
import { useGame, type Surface } from '../game/store'
import { useGraphics } from '../ui/graphics'
import { woodFloor } from './materials'
import { patternTexture, zelligeTexture, type Repeat } from './textures'

export const ROOM_SIZE = 8
const HEIGHT = 4
const WAINSCOT = 0.7
const WALL = 0.12
const TRIM = '#f4efe6'

/** The room shell: floor and the two walls. Furniture lives in PlacedItems. */
export function Room() {
  const currentRoom = useGame((s) => s.currentRoom)
  const paint = useGame((s) => s.rooms[s.currentRoom].paint)
  const theme = ROOM_THEMES[currentRoom % ROOM_THEMES.length]
  const tiles = zelligeTexture(theme.tiles, 1)
  const half = ROOM_SIZE / 2

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ surface: 'floor' }}>
        <planeGeometry args={[ROOM_SIZE, ROOM_SIZE]} />
        <FloorMaterial paintId={paint.floor} fallback={theme.floor} />
      </mesh>
      {/* floor edge, so the cut-away room reads as a solid slab */}
      <mesh position={[0, -0.095, 0]} receiveShadow>
        <boxGeometry args={[ROOM_SIZE + 0.02, 0.16, ROOM_SIZE + 0.02]} />
        <meshStandardMaterial color="#6f5641" roughness={0.8} />
      </mesh>

      {/* back + left wall: open dollhouse view */}
      <mesh position={[0, HEIGHT / 2, -half - WALL / 2 + 0.05]} receiveShadow userData={{ surface: 'wall-back' }}>
        <boxGeometry args={[ROOM_SIZE, HEIGHT, WALL]} />
        <WallMaterial paintId={paint['wall-back']} fallback={theme.wall} repeat={[4, 2]} />
      </mesh>
      <mesh position={[-half - WALL / 2 + 0.05, HEIGHT / 2, 0]} receiveShadow userData={{ surface: 'wall-left' }}>
        <boxGeometry args={[WALL, HEIGHT, ROOM_SIZE]} />
        <WallMaterial paintId={paint['wall-left']} fallback={theme.wall} repeat={[4, 2]} />
      </mesh>
      {/* corner post where the walls meet */}
      <mesh position={[-half - WALL / 2 + 0.05, HEIGHT / 2, -half - WALL / 2 + 0.05]}>
        <boxGeometry args={[WALL, HEIGHT, WALL]} />
        <meshStandardMaterial color={TRIM} roughness={0.6} />
      </mesh>

      {/* crown molding along the top of both walls */}
      <Molding position={[0, HEIGHT - 0.06, -half + 0.09]} length={ROOM_SIZE} rotation={0} />
      <Molding position={[-half + 0.09, HEIGHT - 0.06, 0]} length={ROOM_SIZE} rotation={Math.PI / 2} />
      {/* wall caps */}
      <mesh position={[0, HEIGHT + 0.015, -half - WALL / 2 + 0.05]}>
        <boxGeometry args={[ROOM_SIZE + 0.02, 0.03, WALL + 0.02]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} />
      </mesh>
      <mesh position={[-half - WALL / 2 + 0.05, HEIGHT + 0.015, 0]}>
        <boxGeometry args={[WALL + 0.02, 0.03, ROOM_SIZE + 0.02]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} />
      </mesh>

      {/* tiled wainscot */}
      <Wainscot tiles={tiles} surface="wall-back" position={[0, WAINSCOT / 2, -half + 0.06]} rotation={0} />
      <Wainscot tiles={tiles} surface="wall-left" position={[-half + 0.06, WAINSCOT / 2, 0]} rotation={Math.PI / 2} />
    </group>
  )
}

/** Wooden planks in the theme color; plain paint tints the wood, patterned paint replaces it. */
function FloorMaterial({ paintId, fallback }: { paintId?: string; fallback: string }) {
  const paint = paintId ? ITEMS_BY_ID[paintId] : undefined
  if (paint?.pattern) {
    const map = patternTexture(paint.pattern, paint.color, paint.accent, 4)
    return <meshStandardMaterial key={paintId} map={map} roughness={0.55} />
  }
  const simple = useGraphics((s) => s.simple)
  if (simple) return <meshStandardMaterial key={paintId ?? 'default'} color={paint?.color ?? fallback} roughness={0.8} />
  const wood = woodFloor(paint?.color ?? fallback)
  return <meshStandardMaterial key={paintId ?? 'default'} map={wood.map} bumpMap={wood.bumpMap} bumpScale={0.6} roughness={0.62} />
}

function WallMaterial({ paintId, fallback, repeat }: { paintId?: string; fallback: string; repeat: Repeat }) {
  const paint = paintId ? ITEMS_BY_ID[paintId] : undefined
  // plain paint is a clean, flat color; patterned paint shows its pattern
  const map = paint?.pattern ? patternTexture(paint.pattern, paint.color, paint.accent, repeat) : undefined
  return <meshStandardMaterial key={paintId ?? 'default'} color={map ? '#ffffff' : (paint?.color ?? fallback)} map={map} roughness={0.9} />
}

function Molding({ position, length, rotation }: { position: [number, number, number]; length: number; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.12, 0.06]} />
        <meshStandardMaterial color={TRIM} roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.075, 0.015]} castShadow>
        <boxGeometry args={[length, 0.03, 0.09]} />
        <meshStandardMaterial color={TRIM} roughness={0.55} />
      </mesh>
    </group>
  )
}

function Wainscot({ tiles, surface, position, rotation }: { tiles: THREE.Texture; surface: Surface; position: [number, number, number]; rotation: number }) {
  const map = useMemo(() => {
    const t = tiles.clone()
    t.repeat.set(ROOM_SIZE / WAINSCOT, 1)
    t.needsUpdate = true
    return t
  }, [tiles])
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh receiveShadow userData={{ surface }}>
        <planeGeometry args={[ROOM_SIZE, WAINSCOT]} />
        <meshStandardMaterial map={map} roughness={0.22} metalness={0.05} />
      </mesh>
      <mesh position={[0, WAINSCOT / 2, 0.015]} userData={{ surface }} castShadow>
        <boxGeometry args={[ROOM_SIZE, 0.05, 0.035]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}
