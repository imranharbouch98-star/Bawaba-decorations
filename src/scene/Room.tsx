import { useMemo } from 'react'
import * as THREE from 'three'
import { ITEMS_BY_ID, ROOM_THEMES } from '../game/items'
import { useGame, type Surface } from '../game/store'
import { patternTexture, zelligeTexture, type Repeat } from './textures'

export const ROOM_SIZE = 8
const HEIGHT = 4
const WAINSCOT = 0.7

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
        <SurfaceMaterial paintId={paint.floor} fallback={theme.floor} repeat={4} roughness={0.85} />
      </mesh>

      {/* back + left wall: open dollhouse view */}
      <mesh position={[0, HEIGHT / 2, -half]} receiveShadow userData={{ surface: 'wall-back' }}>
        <boxGeometry args={[ROOM_SIZE, HEIGHT, 0.1]} />
        <SurfaceMaterial paintId={paint['wall-back']} fallback={theme.wall} repeat={[4, 2]} />
      </mesh>
      <mesh position={[-half, HEIGHT / 2, 0]} receiveShadow userData={{ surface: 'wall-left' }}>
        <boxGeometry args={[0.1, HEIGHT, ROOM_SIZE]} />
        <SurfaceMaterial paintId={paint['wall-left']} fallback={theme.wall} repeat={[4, 2]} />
      </mesh>

      {/* zellige tiled wainscot */}
      <Wainscot tiles={tiles} surface="wall-back" position={[0, WAINSCOT / 2, -half + 0.06]} rotation={0} />
      <Wainscot tiles={tiles} surface="wall-left" position={[-half + 0.06, WAINSCOT / 2, 0]} rotation={Math.PI / 2} />
    </group>
  )
}

function SurfaceMaterial({ paintId, fallback, repeat, roughness = 0.9 }: { paintId?: string; fallback: string; repeat: Repeat; roughness?: number }) {
  const paint = paintId ? ITEMS_BY_ID[paintId] : undefined
  const map = paint?.pattern ? patternTexture(paint.pattern, paint.color, paint.accent, repeat) : undefined
  return (
    <meshStandardMaterial
      key={paintId ?? 'default'}
      color={map ? '#ffffff' : (paint?.color ?? fallback)}
      map={map}
      roughness={roughness}
    />
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
        <meshStandardMaterial map={map} roughness={0.3} />
      </mesh>
      <mesh position={[0, WAINSCOT / 2, 0.015]} userData={{ surface }}>
        <boxGeometry args={[ROOM_SIZE, 0.05, 0.03]} />
        <meshStandardMaterial color="#d4a640" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}
