import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { Pattern } from '../game/items'
import { useGraphics } from '../ui/graphics'
import { BookshelfModel } from './Bookshelf'
import { fabric, woodGrain } from './materials'
import { horseshoeArch, normalizeUVs } from './shapes'
import { latticeTexture, patternTexture, rosetteTexture } from './textures'

/** Room furniture. Same conventions as Models.tsx; `color` is the paintable part. */

interface Props {
  color: string
  accent: string
  pattern?: Pattern
}

/** Woven upholstery in the piece's color, or the painted-on pattern over the same weave. */
export function Upholstery({ color, accent, pattern, repeat = 1 }: Props & { repeat?: number | [number, number] }) {
  const simple = useGraphics((s) => s.simple)
  const map = pattern ? patternTexture(pattern, color, accent, repeat) : simple ? undefined : fabric(color)
  return <meshStandardMaterial key={`${pattern ?? 'plain'}${simple}`} color={map ? '#ffffff' : color} map={map} roughness={0.95} />
}

export function Wood({ color, repeat = [1, 1] }: { color: string; repeat?: [number, number] }) {
  const simple = useGraphics((s) => s.simple)
  return simple ? <meshStandardMaterial color={color} roughness={0.7} /> : <meshStandardMaterial map={woodGrain(color, repeat)} roughness={0.62} />
}

const brass = (color: string) => <meshStandardMaterial color={color} metalness={0.9} roughness={0.28} />

export function Sofa({ color, accent, pattern }: Props) {
  const fabricProps = { color, accent, pattern, repeat: [1, 1] as [number, number] }
  return (
    <group>
      {/* wooden plinth on brass feet */}
      <RoundedBox args={[3.3, 0.12, 0.88]} radius={0.03} position={[0, 0.12, 0]} castShadow receiveShadow>
        <Wood color="#6b4429" repeat={[3, 1]} />
      </RoundedBox>
      {[-1.55, 1.55].flatMap((x) =>
        [-0.36, 0.36].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.03, z]} castShadow>
            <cylinderGeometry args={[0.035, 0.025, 0.06, 16]} />
            {brass(accent)}
          </mesh>
        )),
      )}
      {/* frame */}
      <RoundedBox args={[3.4, 0.2, 0.95]} radius={0.06} smoothness={4} position={[0, 0.28, 0]} castShadow receiveShadow>
        <Upholstery {...fabricProps} />
      </RoundedBox>
      <RoundedBox args={[3.4, 0.62, 0.2]} radius={0.08} smoothness={4} position={[0, 0.66, -0.375]} castShadow receiveShadow>
        <Upholstery {...fabricProps} />
      </RoundedBox>
      {[-1.62, 1.62].map((x) => (
        <RoundedBox key={x} args={[0.2, 0.36, 0.95]} radius={0.08} smoothness={4} position={[x, 0.52, 0]} castShadow receiveShadow>
          <Upholstery {...fabricProps} />
        </RoundedBox>
      ))}
      {/* seat and back cushions */}
      {[-1.02, 0, 1.02].map((x) => (
        <group key={x}>
          <RoundedBox args={[1, 0.17, 0.78]} radius={0.075} smoothness={5} position={[x, 0.465, 0.07]} castShadow receiveShadow>
            <Upholstery {...fabricProps} />
          </RoundedBox>
          <RoundedBox
            args={[0.98, 0.5, 0.17]}
            radius={0.08}
            smoothness={5}
            position={[x, 0.8, -0.2]}
            rotation={[-0.14, 0, 0]}
            castShadow
            receiveShadow
          >
            <Upholstery {...fabricProps} />
          </RoundedBox>
        </group>
      ))}
    </group>
  )
}

export function CoffeeTable({ color, accent, pattern }: Props) {
  const stand = useMemo(() => {
    const profile = [
      [0, 0], [0.42, 0], [0.42, 0.04], [0.3, 0.07], [0.22, 0.14], [0.18, 0.26], [0.2, 0.34], [0.26, 0.4], [0.34, 0.44], [0.36, 0.47], [0, 0.47],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(profile, 48)
  }, [])
  const tray = rosetteTexture('#c9a24a', '#8a6a2a', '#f0d27a')
  return (
    <group>
      <mesh position={[0, 0.49, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.66, 0.64, 0.04, 64]} />
        <meshStandardMaterial attach="material-0" color={accent} metalness={0.9} roughness={0.28} />
        <meshStandardMaterial attach="material-1" map={tray} color={accent} metalness={0.85} roughness={0.3} />
        <meshStandardMaterial attach="material-2" color={accent} metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.515, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.655, 0.018, 12, 96]} />
        {brass(accent)}
      </mesh>
      <mesh geometry={stand} castShadow receiveShadow>
        {pattern ? <Upholstery color={color} accent={accent} pattern={pattern} repeat={[3, 1]} /> : <Wood color={color} repeat={[2, 1]} />}
      </mesh>
    </group>
  )
}

export function Bookshelf({ color, accent, books }: Props & { books?: (string | null)[] }) {
  return <BookshelfModel books={books} wood={color} back={accent} />
}

const skyTexture = (() => {
  let tex: THREE.CanvasTexture | undefined
  return () => {
    if (tex) return tex
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#9ccbf0')
    g.addColorStop(0.65, '#d9ecfa')
    g.addColorStop(1, '#f5efe0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 256)
    tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }
})()

export function Window({ color, accent }: { color: string; accent: string }) {
  const [glass, frame, reveal] = useMemo(() => {
    const outer = horseshoeArch(1.56, 2.24)
    const inner = horseshoeArch(1.3, 2.05)
    outer.holes.push(new THREE.Path(inner.getPoints(64)))
    const revealShape = horseshoeArch(1.34, 2.08)
    revealShape.holes.push(new THREE.Path(horseshoeArch(1.3, 2.05).getPoints(64)))
    return [
      normalizeUVs(new THREE.ShapeGeometry(horseshoeArch(1.3, 2.05), 64)),
      new THREE.ExtrudeGeometry(outer, { depth: 0.1, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3, curveSegments: 64 }),
      new THREE.ExtrudeGeometry(revealShape, { depth: 0.05, bevelEnabled: false, curveSegments: 64 }),
    ]
  }, [])
  const alpha = latticeTexture(3)
  return (
    <group>
      <mesh geometry={glass} position={[0, 0, 0.004]}>
        <meshStandardMaterial map={skyTexture()} emissiveMap={skyTexture()} emissive="#ffffff" emissiveIntensity={1.1} roughness={0.1} />
      </mesh>
      <mesh geometry={reveal} position={[0, 0, 0.004]}>
        <meshStandardMaterial color="#e9e2d6" roughness={0.8} />
      </mesh>
      {/* lattice over the bottom half */}
      <mesh position={[0, 0.5, 0.03]}>
        <planeGeometry args={[1.3, 1]} />
        <meshStandardMaterial color={accent} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
      <mesh geometry={frame} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <RoundedBox args={[1.8, 0.07, 0.2]} radius={0.02} position={[0, -0.02, 0.1]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.5} />
      </RoundedBox>
    </group>
  )
}
