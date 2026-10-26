import { useMemo } from 'react'
import * as THREE from 'three'
import type { Pattern } from '../game/items'
import { useGame } from '../game/store'
import { BookshelfModel } from './Bookshelf'
import { horseshoeArch } from './shapes'
import { latticeTexture, patternTexture } from './textures'

/** Room furniture. Same conventions as Models.tsx; `color` is the paintable part. */

interface Props {
  color: string
  accent: string
  pattern?: Pattern
}

/** Material for a paintable surface: plain color, or the pattern when one is painted on. */
function Paintable({ color, accent, pattern, repeat = 1, roughness = 0.9 }: Props & { repeat?: number | [number, number]; roughness?: number }) {
  const map = pattern ? patternTexture(pattern, color, accent, repeat) : undefined
  return <meshStandardMaterial key={pattern ?? 'plain'} color={map ? '#ffffff' : color} map={map} roughness={roughness} />
}

export function Sofa({ color, accent, pattern }: Props) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.4, 0.95]} />
        <meshStandardMaterial color="#7a4a2c" />
      </mesh>
      <mesh position={[0, 0.48, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.16, 0.9]} />
        <Paintable color={color} accent={accent} pattern={pattern} repeat={[3, 1]} />
      </mesh>
      <mesh position={[0, 0.48, 0.475]}>
        <boxGeometry args={[3.3, 0.03, 0.01]} />
        <meshStandardMaterial color={accent} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.85, -0.38]} castShadow receiveShadow>
        <boxGeometry args={[3.3, 0.6, 0.18]} />
        <Paintable color={color} accent={accent} pattern={pattern} repeat={[3, 1]} />
      </mesh>
    </group>
  )
}

export function CoffeeTable({ color, accent, pattern }: Props) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.05, 40]} />
        <meshStandardMaterial color={accent} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.45, 8]} />
        <Paintable color={color} accent={accent} pattern={pattern} repeat={[2, 1]} roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Bookshelf({ color, accent }: Props) {
  const books = useGame((s) => s.rooms[s.currentRoom]?.books ?? 0)
  return <BookshelfModel books={books} wood={color} back={accent} />
}

export function Window({ color, accent }: { color: string; accent: string }) {
  const [glass, frame] = useMemo(() => {
    const outer = horseshoeArch(1.5, 2.2)
    const inner = horseshoeArch(1.3, 2.05)
    outer.holes.push(new THREE.Path(inner.getPoints(48)))
    return [
      new THREE.ShapeGeometry(horseshoeArch(1.3, 2.05), 48),
      new THREE.ExtrudeGeometry(outer, { depth: 0.08, bevelEnabled: false, curveSegments: 48 }),
    ]
  }, [])
  const alpha = latticeTexture(3)
  return (
    <group>
      <mesh geometry={glass} position={[0, 0, 0.005]}>
        <meshStandardMaterial color="#bfe3f2" emissive="#d8f0ff" emissiveIntensity={0.9} />
      </mesh>
      {/* mashrabiya lattice over the bottom half */}
      <mesh position={[0, 0.5, 0.025]}>
        <planeGeometry args={[1.3, 1]} />
        <meshStandardMaterial color={accent} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={frame} castShadow>
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.03, 0.08]} castShadow>
        <boxGeometry args={[1.7, 0.08, 0.16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}
