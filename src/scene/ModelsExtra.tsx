import { useMemo } from 'react'
import * as THREE from 'three'
import { horseshoeArch } from './shapes'
import { berberTexture, latticeTexture, mosaicTexture, rosetteTexture, zelligeTexture } from './textures'

/** Models for the extended collection. Same conventions as Models.tsx. */

const GOLD = '#d4a640'
const brass = (color: string) => <meshStandardMaterial color={color} metalness={0.85} roughness={0.3} />

function useLathe(profile: number[][]) {
  const key = JSON.stringify(profile)
  return useMemo(
    () => new THREE.LatheGeometry((JSON.parse(key) as number[][]).map(([x, y]) => new THREE.Vector2(x, y)), 32),
    [key],
  )
}

const VASE_PROFILES: Record<string, number[][]> = {
  amphora: [[0, 0], [0.08, 0], [0.09, 0.03], [0.16, 0.18], [0.17, 0.3], [0.12, 0.44], [0.06, 0.5], [0.06, 0.55], [0.09, 0.6], [0.08, 0.6]],
  bulb: [[0, 0], [0.1, 0], [0.18, 0.08], [0.2, 0.18], [0.16, 0.28], [0.07, 0.33], [0.06, 0.37], [0.08, 0.4], [0.07, 0.4]],
  tall: [[0, 0], [0.1, 0], [0.12, 0.05], [0.13, 0.3], [0.1, 0.6], [0.07, 0.72], [0.1, 0.8], [0.09, 0.8]],
}

export function Vase({ variant = 'bulb', color, accent }: { variant?: string; color: string; accent: string }) {
  const profile = VASE_PROFILES[variant] ?? VASE_PROFILES.bulb
  const geometry = useLathe(profile)
  const bandY = profile[Math.floor(profile.length / 2) - 1][1]
  const bandR = profile[Math.floor(profile.length / 2) - 1][0]
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={color} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, bandY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[bandR + 0.004, 0.012, 8, 40]} />
        <meshStandardMaterial color={accent} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Pot({ color, r = 0.18, h = 0.3 }: { color: string; r?: number; h?: number }) {
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r * 0.75, h, 20]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.02, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function Cactus({ pot, green }: { pot: string; green: string }) {
  const mat = <meshStandardMaterial color={green} roughness={0.7} />
  return (
    <group>
      <Pot color={pot} r={0.16} h={0.22} />
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 6, 12]} />
        {mat}
      </mesh>
      <mesh position={[0.12, 0.5, 0]} rotation={[0, 0, -0.5]} castShadow>
        <capsuleGeometry args={[0.04, 0.1, 6, 10]} />
        {mat}
      </mesh>
      <mesh position={[-0.11, 0.42, 0]} rotation={[0, 0, 0.6]} castShadow>
        <capsuleGeometry args={[0.035, 0.08, 6, 10]} />
        {mat}
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#f2a7c3" />
      </mesh>
    </group>
  )
}

export function Palm({ pot, leaf }: { pot: string; leaf: string }) {
  const map = zelligeTexture([pot, '#f6efe2', GOLD], 2)
  return (
    <group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.2, 0.44, 24]} />
        <meshStandardMaterial map={map} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.07, 0.8, 8]} />
        <meshStandardMaterial color="#8a6a45" roughness={0.9} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <group key={i} position={[0, 1.2, 0]} rotation={[0, a, 0]}>
            <mesh position={[0.32, -0.06, 0]} rotation={[0, 0, -0.45]} scale={[0.38, 0.04, 0.09]} castShadow>
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial color={leaf} roughness={0.7} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function Herb({ pot, foliage }: { pot: string; foliage: string }) {
  return (
    <group>
      <Pot color={pot} r={0.12} h={0.16} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2
        const r = (i % 3) * 0.04
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.22 + (i % 3) * 0.04, Math.sin(a) * r]} castShadow>
            <sphereGeometry args={[0.06, 10, 10]} />
            <meshStandardMaterial color={i % 2 ? foliage : '#6f9a5e'} roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

export function CandleLantern({ color, glow }: { color: string; glow: string }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.18, 0.04, 0.18]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.14, 0.26, 0.14]} />
        <meshStandardMaterial color="#fff8e6" transparent opacity={0.35} roughness={0.05} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x * 0.075, 0.17, z * 0.075]} castShadow>
          <boxGeometry args={[0.02, 0.28, 0.02]} />
          {brass(color)}
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 12]} />
        <meshStandardMaterial color="#f6efe2" />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.012, 0.035, 8]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <coneGeometry args={[0.12, 0.14, 4]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <torusGeometry args={[0.025, 0.007, 6, 12]} />
        {brass(color)}
      </mesh>
      <pointLight position={[0, 0.17, 0]} color={glow} intensity={0.6} distance={1.5} />
    </group>
  )
}

export function MosaicLamp({ color, accent }: { color: string; accent: string }) {
  const map = mosaicTexture(color, accent)
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.04, 20]} />
        {brass('#c9a24a')}
      </mesh>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.025, 0.22, 8]} />
        {brass('#c9a24a')}
      </mesh>
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.16, 24, 16]} />
        <meshStandardMaterial map={map} emissiveMap={map} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.54, 0]}>
        <coneGeometry args={[0.04, 0.05, 12]} />
        {brass('#c9a24a')}
      </mesh>
      <pointLight position={[0, 0.38, 0]} color={color} intensity={1.2} distance={2.5} />
    </group>
  )
}

export function Dallah({ color }: { color: string }) {
  const body = useLathe([[0, 0], [0.11, 0], [0.12, 0.03], [0.1, 0.13], [0.05, 0.22], [0.045, 0.28], [0.08, 0.33], [0.06, 0.36], [0.03, 0.4], [0, 0.42]])
  const spout = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.25, 0),
      new THREE.Vector3(0.12, 0.3, 0),
      new THREE.Vector3(0.18, 0.36, 0),
      new THREE.Vector3(0.23, 0.38, 0),
    ])
    return new THREE.TubeGeometry(curve, 16, 0.016, 8)
  }, [])
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <mesh geometry={body} castShadow>{brass(color)}</mesh>
      <mesh geometry={spout} castShadow>{brass(color)}</mesh>
      <mesh position={[-0.1, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.08, 0.012, 8, 16, Math.PI]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <coneGeometry args={[0.02, 0.05, 8]} />
        {brass(color)}
      </mesh>
    </group>
  )
}

export function Bowl({ variant, color, accent }: { variant?: string; color: string; accent: string }) {
  const geometry = useLathe([[0, 0], [0.09, 0], [0.1, 0.02], [0.18, 0.1], [0.2, 0.14], [0.19, 0.14], [0.17, 0.11], [0.09, 0.04], [0, 0.035]])
  const map = rosetteTexture('#f3ede0', variant === 'dates' ? GOLD : accent)
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={color} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.037, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial map={map} roughness={0.3} />
      </mesh>
      {variant === 'dates' &&
        Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2
          const r = 0.05 + (i % 2) * 0.05
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.08 + (i % 3) * 0.015, Math.sin(a) * r]} rotation={[0, a, Math.PI / 2]} castShadow>
              <capsuleGeometry args={[0.018, 0.03, 4, 8]} />
              <meshStandardMaterial color={accent} roughness={0.4} />
            </mesh>
          )
        })}
    </group>
  )
}

export function Basket({ color, accent }: { color: string; accent: string }) {
  const map = berberTexture(color, accent, 3)
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.4, 24]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <coneGeometry args={[0.26, 0.24, 24]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color={accent} roughness={0.8} />
      </mesh>
    </group>
  )
}

export function SideTable({ color, accent }: { color: string; accent: string }) {
  const tiles = zelligeTexture([accent, '#f6efe2', GOLD], 1)
  return (
    <group>
      <mesh position={[0, 0.53, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 6]} />
        <meshStandardMaterial attach="material-0" color={color} />
        <meshStandardMaterial attach="material-1" map={tiles} roughness={0.25} />
        <meshStandardMaterial attach="material-2" color={color} />
      </mesh>
      <mesh position={[0, 0.27, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.26, 0.48, 6, 1, true]} />
        <meshStandardMaterial color={color} alphaMap={latticeTexture(1)} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.03, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

export function Chest({ color, accent }: { color: string; accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.8, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.2, 0]}>
            <boxGeometry args={[0.05, 0.41, 0.51]} />
            {brass(accent)}
          </mesh>
          <mesh position={[x, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.255, 0.255, 0.05, 24, 1, true, 0, Math.PI]} />
            <meshStandardMaterial color={accent} metalness={0.85} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.33, 0.255]}>
        <boxGeometry args={[0.1, 0.12, 0.02]} />
        {brass(accent)}
      </mesh>
    </group>
  )
}

export function TrayTable({ color, accent }: { color: string; accent: string }) {
  const map = rosetteTexture(color, '#8a6a2a', '#f0d27a')
  return (
    <group>
      <mesh position={[0, 0.53, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.03, 48]} />
        <meshStandardMaterial attach="material-0" color={color} metalness={0.85} roughness={0.3} />
        <meshStandardMaterial attach="material-1" map={map} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-2" color={color} metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.555, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.015, 8, 48]} />
        {brass(color)}
      </mesh>
      {[0.6, -0.6].map((r) => (
        <group key={r} rotation={[0, r + Math.PI / 4, 0]}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[0, 0.26, side * 0.16]} rotation={[side * 0.55, 0, 0]} castShadow>
              <boxGeometry args={[0.04, 0.6, 0.04]} />
              <meshStandardMaterial color={accent} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

export function Clock({ color, accent }: { color: string; accent: string }) {
  const map = zelligeTexture([color, '#f6efe2', accent], 1)
  return (
    <group position={[0, 0.3, 0.03]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 48]} />
        <meshStandardMaterial attach="material-0" color={accent} metalness={0.8} roughness={0.3} />
        <meshStandardMaterial attach="material-1" map={map} roughness={0.3} />
        <meshStandardMaterial attach="material-2" color={accent} />
      </mesh>
      <mesh position={[0, 0, 0.026]}>
        <torusGeometry args={[0.3, 0.02, 8, 48]} />
        {brass(accent)}
      </mesh>
      <mesh position={[0, 0.06, 0.035]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.015, 0.14, 0.01]} />
        <meshStandardMaterial color="#3b3330" />
      </mesh>
      <mesh position={[0.07, 0.02, 0.04]} rotation={[0, 0, -1.3]}>
        <boxGeometry args={[0.012, 0.18, 0.01]} />
        <meshStandardMaterial color="#3b3330" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <sphereGeometry args={[0.02, 10, 10]} />
        {brass(accent)}
      </mesh>
    </group>
  )
}

export function WallShelf({ color, accent }: { color: string; accent: string }) {
  const back = useMemo(() => new THREE.ExtrudeGeometry(horseshoeArch(0.6, 0.8), { depth: 0.03, bevelEnabled: false }), [])
  return (
    <group>
      <mesh geometry={back} castShadow>
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.2, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.56, 0.03, 0.17]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.24, 0.1]}>
        <cylinderGeometry args={[0.04, 0.05, 0.05, 16]} />
        <meshStandardMaterial color={accent} roughness={0.4} />
      </mesh>
      <mesh position={[0.14, 0.27, 0.1]}>
        <cylinderGeometry args={[0.03, 0.035, 0.11, 16]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function WallArch({ color, accent }: { color: string; accent: string }) {
  const [frame, inner] = useMemo(() => {
    const outer = horseshoeArch(1, 1.4)
    const hole = horseshoeArch(0.78, 1.26)
    outer.holes.push(new THREE.Path(hole.getPoints(48)))
    return [
      new THREE.ExtrudeGeometry(outer, { depth: 0.06, bevelEnabled: false, curveSegments: 48 }),
      new THREE.ShapeGeometry(hole, 48),
    ]
  }, [])
  const alpha = latticeTexture(2)
  return (
    <group>
      <mesh geometry={frame} castShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh geometry={inner} position={[0, 0, 0.02]}>
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.4} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0.04]}>
        <boxGeometry args={[1.02, 0.04, 0.08]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

export function Candles({ color, accent }: { color: string; accent: string }) {
  const candles: [number, number, number][] = [[-0.09, 0.2, 0.02], [0.02, 0.14, -0.05], [0.1, 0.1, 0.05]]
  return (
    <group>
      <mesh position={[0, 0.0125, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.025, 32]} />
        {brass(accent)}
      </mesh>
      {candles.map(([x, h, z]) => (
        <group key={x} position={[x, 0.025, z]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, h, 16]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          <mesh position={[0, h + 0.025, 0]}>
            <coneGeometry args={[0.012, 0.04, 8]} />
            <meshStandardMaterial color="#ffcf7a" emissive="#ffb347" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0.25, 0]} color="#ffcf7a" intensity={0.6} distance={1.5} />
    </group>
  )
}

export function LatticePanel({ color, accent }: { color: string; accent: string }) {
  const alpha = latticeTexture(2)
  return (
    <group position={[0, 0.5, 0]}>
      <mesh position={[0, 0, 0.02]} castShadow>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.7} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      {[[0, 0.47, 1, 0.06], [0, -0.47, 1, 0.06], [0.47, 0, 0.06, 1], [-0.47, 0, 0.06, 1]].map(([x, y, w, h]) => (
        <mesh key={`${x}${y}`} position={[x, y, 0.025]} castShadow>
          <boxGeometry args={[w, h, 0.05]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.055]}>
        <torusGeometry args={[0.12, 0.012, 8, 32]} />
        {brass(accent)}
      </mesh>
    </group>
  )
}
