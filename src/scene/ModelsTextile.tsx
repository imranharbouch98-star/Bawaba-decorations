import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { Pattern } from '../game/items'
import { patternTexture } from './textures'

/** Patterned textiles and paint buckets. Same conventions as Models.tsx. */

interface Props {
  color: string
  accent: string
  pattern: Pattern
}

const GOLD = '#d4a640'

export function Rug({ color, accent, pattern }: Props) {
  const map = patternTexture(pattern, color, accent, [2, 1.4])
  return (
    <group>
      <mesh receiveShadow position={[0, 0.006, 0]}>
        <boxGeometry args={[2.6, 0.012, 1.7]} />
        <meshStandardMaterial color={accent} roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.48, 1.6]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>
      {/* fringes */}
      {[-1.33, 1.33].map((x) =>
        Array.from({ length: 12 }, (_, i) => (
          <mesh key={`${x}${i}`} position={[x, 0.006, -0.77 + i * 0.14]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.08, 4]} />
            <meshStandardMaterial color="#f6efe2" roughness={1} />
          </mesh>
        )),
      )}
    </group>
  )
}

export function FloorCushion({ color, accent, pattern }: Props) {
  const map = patternTexture(pattern, color, accent)
  return (
    <group position={[0, 0.11, 0]}>
      <RoundedBox args={[0.8, 0.22, 0.8]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.111, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.64, 0.64]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * 0.39, 0, z * 0.39]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color={GOLD} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Folded blanket, lies on whatever it is dropped on. */
export function Throw({ color, accent, pattern }: Props) {
  const map = patternTexture(pattern, color, accent, [1, 0.5])
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.02 + i * 0.04, i * 0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.7 - i * 0.01, 0.04, 0.45]} />
          <meshStandardMaterial map={map} roughness={0.95} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-0.3 + i * 0.086, 0.04, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 4]} />
          <meshStandardMaterial color={accent} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** Pair of drapes on a brass rod; hang it on a wall or around the window. */
export function Curtain({ color, accent, pattern }: Props) {
  const map = patternTexture(pattern, color, accent, [1, 2])
  return (
    <group>
      <mesh position={[0, 2.15, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 2.1, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <group key={x} position={[x, 0, 0.04]}>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[-0.2 + i * 0.1, 1.07, Math.sin(i * 1.4) * 0.02]} castShadow>
              <cylinderGeometry args={[0.055, 0.06, 2.1, 10, 1, true]} />
              <meshStandardMaterial map={map} roughness={0.95} side={THREE.DoubleSide} />
            </mesh>
          ))}
          <mesh position={[0, 1, 0.07]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.03, 0.015, 6, 12]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Paint bucket: the band shows the paint's pattern, the top shows its color. */
export function PaintBucket({ color, accent, pattern }: { color: string; accent: string; pattern?: Pattern }) {
  const band = pattern ? patternTexture(pattern, color, accent, [3, 0.5]) : undefined
  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.28, 24]} />
        <meshStandardMaterial color="#d9d6cf" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.1525, 0.135, 0.12, 24, 1, true]} />
        <meshStandardMaterial key={pattern ?? 'plain'} color={band ? '#ffffff' : color} map={band} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.275, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.14, 24]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      {/* drip */}
      <mesh position={[0.1, 0.24, 0.1]} rotation={[0, Math.PI / 4, 0]}>
        <capsuleGeometry args={[0.015, 0.05, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.008, 6, 24, Math.PI]} />
        <meshStandardMaterial color="#8a8780" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}
