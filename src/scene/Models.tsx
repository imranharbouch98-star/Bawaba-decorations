import { useMemo } from 'react'
import * as THREE from 'three'
import type { ItemDef } from '../game/items'
import {
  Basket, Bowl, Cactus, CandleLantern, Candles, Chest, Clock, Dallah, Herb, LatticePanel, MosaicLamp, Palm,
  SideTable, TrayTable, Vase, WallArch, WallShelf,
} from './ModelsExtra'
import { BookMesh } from './Books'
import { Bookshelf, CoffeeTable, Sofa, Window } from './ModelsFurniture'
import { Curtain, FloorCushion, PaintBucket, Rug, Throw } from './ModelsTextile'
import { horseshoeArch, normalizeUVs, pillowGeometry } from './shapes'
import { berberTexture, kilimTexture, latticeTexture, mirrorGlassTexture, patternTexture, rosetteTexture, zelligeTexture } from './textures'
import type { Pattern } from '../game/items'

/**
 * Placeholder decoration models built from primitives; swap for GLTF assets later.
 * Conventions: origin at bottom-center, front faces +Z. Flat items (rugs) are centered.
 * Only geometric and floral motifs: no figures or faces.
 */
/** `shelf` is the book in each slot when the item is a bookshelf. */
export function ItemModel({ item, shelf }: { item: ItemDef; shelf?: (string | null)[] }) {
  const { color: c, accent: a, pattern: p } = item
  switch (item.model) {
    case 'sofa': return <Sofa color={c} accent={a} pattern={p} />
    case 'coffee-table': return <CoffeeTable color={c} accent={a} pattern={p} />
    case 'bookshelf': return <Bookshelf color={c} accent={a} pattern={p} books={shelf} />
    case 'book': return <BookMesh book={item} />
    case 'window': return <Window color={c} accent={a} />
    case 'rug': return <Rug color={c} accent={a} pattern={p ?? 'kilim'} />
    case 'floor-cushion': return <FloorCushion color={c} accent={a} pattern={p ?? 'kilim'} />
    case 'throw': return <Throw color={c} accent={a} pattern={p ?? 'stripes'} />
    case 'curtain': return <Curtain color={c} accent={a} pattern={p ?? 'stripes'} />
    case 'paint': return <PaintBucket color={c} accent={a} pattern={p} />
    case 'rug-berber': return <RugBerber color={c} line={a} />
    case 'rug-kilim': return <RugKilim color={c} accent={a} />
    case 'rug-round': return <RugRound color={c} accent={a} />
    case 'cushion': return <Cushion color={c} accent={a} pattern={p} />
    case 'pouf': return <Pouf color={c} accent={a} pattern={p} />
    case 'teapot': return <Teapot color={c} />
    case 'tea-glasses': return <TeaGlasses color={c} />
    case 'tagine': return <Tagine color={c} accent={a} />
    case 'incense': return <Incense color={c} />
    case 'lantern': return <Lantern color={c} glow={a} />
    case 'plant': return <Plant pot={c} leaf={a} />
    case 'screen': return <Screen color={c} />
    case 'mirror': return <Mirror color={c} />
    case 'plate': return <Plate color={c} accent={a} />
    case 'zellige-panel': return <ZelligePanel color={c} accent={a} />
    case 'tapestry': return <Tapestry color={c} accent={a} pattern={p} />
    case 'vase': return <Vase variant={item.variant} color={c} accent={a} />
    case 'cactus': return <Cactus pot={c} green={a} />
    case 'palm': return <Palm pot={c} leaf={a} />
    case 'herb': return <Herb pot={c} foliage={a} />
    case 'candle-lantern': return <CandleLantern color={c} glow={a} />
    case 'mosaic-lamp': return <MosaicLamp color={c} accent={a} />
    case 'dallah': return <Dallah color={c} />
    case 'bowl': return <Bowl variant={item.variant} color={c} accent={a} />
    case 'basket': return <Basket color={c} accent={a} />
    case 'side-table': return <SideTable color={c} accent={a} />
    case 'chest': return <Chest color={c} accent={a} />
    case 'tray-table': return <TrayTable color={c} accent={a} />
    case 'clock': return <Clock color={c} accent={a} />
    case 'wall-shelf': return <WallShelf color={c} accent={a} />
    case 'wall-arch': return <WallArch color={c} accent={a} />
    case 'candles': return <Candles color={c} accent={a} />
    case 'lattice-panel': return <LatticePanel color={c} accent={a} />
  }
}

const brass = (color: string) => <meshStandardMaterial color={color} metalness={0.85} roughness={0.3} />
const GOLD = '#d4a640'

function RugBerber({ color, line }: { color: string; line: string }) {
  const map = berberTexture(color, line, 2)
  return (
    <group>
      <mesh receiveShadow position={[0, 0.006, 0]}>
        <boxGeometry args={[2.8, 0.012, 1.9]} />
        <meshStandardMaterial color={line} roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.65, 1.75]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>
    </group>
  )
}

function RugKilim({ color, accent }: { color: string; accent: string }) {
  const map = kilimTexture(color, accent)
  return (
    <group>
      <mesh receiveShadow position={[0, 0.006, 0]}>
        <boxGeometry args={[2.6, 0.012, 1.7]} />
        <meshStandardMaterial color={accent} roughness={1} />
      </mesh>
      <mesh receiveShadow position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 1.6]} />
        <meshStandardMaterial map={map} roughness={1} />
      </mesh>
    </group>
  )
}

function RugRound({ color, accent }: { color: string; accent: string }) {
  const map = rosetteTexture(accent, color)
  return (
    <mesh receiveShadow position={[0, 0.006, 0]}>
      <cylinderGeometry args={[1.1, 1.1, 0.012, 64]} />
      <meshStandardMaterial attach="material-0" color={color} roughness={1} />
      <meshStandardMaterial attach="material-1" map={map} roughness={1} />
      <meshStandardMaterial attach="material-2" color={color} roughness={1} />
    </mesh>
  )
}

function Cushion({ color, accent, pattern }: { color: string; accent: string; pattern?: Pattern }) {
  const geometry = useMemo(() => pillowGeometry(0.6, 0.6, 0.22), [])
  const map = pattern ? patternTexture(pattern, color, accent) : kilimTexture(color, accent)
  return (
    <group position={[0, 0.3, 0]}>
      <mesh geometry={geometry} position={[0, 0, 0.11]} castShadow receiveShadow>
        <meshStandardMaterial map={map} roughness={0.92} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => (
        <mesh key={`${x}${y}`} position={[x * 0.285, y * 0.285, 0.11]} rotation={[0, 0, Math.atan2(y, x) - Math.PI / 2]}>
          <coneGeometry args={[0.025, 0.07, 10]} />
          <meshStandardMaterial color={GOLD} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Pouf({ color, accent, pattern }: { color: string; accent: string; pattern?: Pattern }) {
  const map = pattern ? patternTexture(pattern, color, accent, [3, 1]) : undefined
  return (
    <group>
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.38, 0.38, 32]} />
        <meshStandardMaterial key={pattern ?? 'plain'} color={map ? '#ffffff' : color} map={map} roughness={0.7} />
      </mesh>
      {[0.02, 0.36].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[y < 0.1 ? 0.38 : 0.36, 0.015, 8, 48]} />
          <meshStandardMaterial color={accent} roughness={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.372, 0.19, Math.sin(a) * 0.372]} rotation={[0, -a, Math.PI / 4]}>
            <boxGeometry args={[0.005, 0.1, 0.1]} />
            <meshStandardMaterial color={accent} roughness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

function Teapot({ color }: { color: string }) {
  const [body, spout] = useMemo(() => {
    const pts = [
      [0, 0], [0.09, 0], [0.1, 0.02], [0.15, 0.08], [0.16, 0.14], [0.13, 0.2],
      [0.07, 0.24], [0.06, 0.27], [0.08, 0.29], [0, 0.29],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.12, 0.1, 0),
      new THREE.Vector3(0.22, 0.17, 0),
      new THREE.Vector3(0.28, 0.27, 0),
      new THREE.Vector3(0.32, 0.3, 0),
    ])
    return [new THREE.LatheGeometry(pts, 32), new THREE.TubeGeometry(curve, 20, 0.018, 8)]
  }, [])
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      <mesh geometry={body} castShadow>{brass(color)}</mesh>
      <mesh geometry={spout} castShadow>{brass(color)}</mesh>
      <mesh position={[-0.15, 0.17, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.07, 0.014, 8, 16, Math.PI]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <coneGeometry args={[0.06, 0.08, 16]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <sphereGeometry args={[0.018, 12, 12]} />
        {brass(color)}
      </mesh>
    </group>
  )
}

function TeaGlasses({ color }: { color: string }) {
  const glass = ['#2f7f7a', '#b5432f', '#e6a83a', '#2d5c9e']
  return (
    <group>
      <mesh position={[0, 0.0125, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.3, 0.025, 40]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.012, 8, 48]} />
        {brass(color)}
      </mesh>
      {glass.map((g, i) => {
        const a = (i / glass.length) * Math.PI * 2 + 0.4
        return (
          <group key={g} position={[Math.cos(a) * 0.17, 0.025, Math.sin(a) * 0.17]}>
            <mesh position={[0, 0.06, 0]} castShadow>
              <cylinderGeometry args={[0.048, 0.038, 0.12, 20]} />
              <meshStandardMaterial color={g} roughness={0.1} metalness={0.1} transparent opacity={0.75} />
            </mesh>
            <mesh position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.046, 0.006, 6, 24]} />
              <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.25} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Tagine({ color, accent }: { color: string; accent: string }) {
  return (
    <group>
      <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.24, 0.07, 40]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.07 + 0.17, 0]} castShadow>
        <coneGeometry args={[0.25, 0.34, 40]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[0.12, 0.22].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25 * (1 - (y - 0.07) / 0.34) + 0.004, 0.01, 6, 40]} />
          <meshStandardMaterial color={i ? GOLD : accent} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.43, 0]} castShadow>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={accent} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Incense({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.18, 0.04, 0.18]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.08, 4]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.17, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.07, 0.1, 4]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <coneGeometry args={[0.02, 0.06, 8]} />
        {brass(color)}
      </mesh>
    </group>
  )
}

function Lantern({ color, glow }: { color: string; glow: string }) {
  const alpha = latticeTexture(2)
  return (
    <group>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.1, 6]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.78, 6]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.8, 6, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.35} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.32, 0.3, 6]} />
        {brass(color)}
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16]} />
        {brass(color)}
      </mesh>
      <pointLight position={[0, 0.5, 0]} color={glow} intensity={3} distance={4} />
    </group>
  )
}

/** Olive tree: a zellige pot, a forked trunk and clusters of faceted foliage. */
function Plant({ pot, leaf }: { pot: string; leaf: string }) {
  const map = zelligeTexture([pot, '#f6efe2', GOLD], 2)
  const greens = [leaf, '#93a77d', '#6f8a5a', '#a7b98c']
  const branches: [number, number, number][] = [[0.25, 1.15, 0.4], [-0.6, 1.05, 0.35], [2.2, 1.2, 0.3], [3.6, 1.1, 0.38]]
  return (
    <group>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.5, 40]} />
        <meshStandardMaterial map={map} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.025, 10, 48]} />
        <meshStandardMaterial map={map} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 32]} />
        <meshStandardMaterial color="#4a3626" roughness={1} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 0.5, 10]} />
        <meshStandardMaterial color="#6b4a32" roughness={0.9} />
      </mesh>
      {branches.map(([a, y, r], i) => (
        <group key={i} rotation={[0, a, 0]}>
          <mesh position={[r / 2, (0.95 + y) / 2, 0]} rotation={[0, 0, -Math.atan2(r, y - 0.95)]} castShadow>
            <cylinderGeometry args={[0.015, 0.03, Math.hypot(r, y - 0.95), 8]} />
            <meshStandardMaterial color="#6b4a32" roughness={0.9} />
          </mesh>
          {[0, 1, 2, 3].map((k) => (
            <mesh
              key={k}
              position={[r + Math.cos(k * 1.7) * 0.12, y + (k % 2) * 0.1 - 0.02, Math.sin(k * 1.7) * 0.12]}
              rotation={[k, k * 0.7, 0]}
              castShadow
            >
              <icosahedronGeometry args={[0.13 + (k % 2) * 0.04, 1]} />
              <meshStandardMaterial color={greens[(i + k) % greens.length]} roughness={0.8} flatShading />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.38, 0]} castShadow>
        <icosahedronGeometry args={[0.18, 1]} />
        <meshStandardMaterial color={greens[1]} roughness={0.8} flatShading />
      </mesh>
    </group>
  )
}

function Screen({ color }: { color: string }) {
  const alpha = latticeTexture(1)
  const panels = [-1, 0, 1]
  return (
    <group>
      {panels.map((i) => (
        <group key={i} position={[i * 0.56, 0, i === 0 ? -0.15 : 0]} rotation={[0, i * -0.5, 0]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <planeGeometry args={[0.52, 1.6]} />
            <meshStandardMaterial color={color} roughness={0.7} alphaMap={alpha} alphaTest={0.5} side={THREE.DoubleSide} />
          </mesh>
          {[-0.27, 0.27].map((x) => (
            <mesh key={x} position={[x, 0.875, 0]} castShadow>
              <boxGeometry args={[0.04, 1.75, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          ))}
          {[0.08, 1.72].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <boxGeometry args={[0.58, 0.05, 0.05]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function Mirror({ color }: { color: string }) {
  const [frame, glass] = useMemo(
    () => [
      new THREE.ExtrudeGeometry(horseshoeArch(1, 1.6), { depth: 0.05, bevelEnabled: false }),
      normalizeUVs(new THREE.ShapeGeometry(horseshoeArch(0.82, 1.48), 32)),
    ],
    [],
  )
  return (
    <group>
      <mesh geometry={frame} castShadow>{brass(color)}</mesh>
      <mesh geometry={glass} position={[0, 0.04, 0.052]}>
        <meshStandardMaterial map={mirrorGlassTexture()} roughness={0.35} metalness={0} />
      </mesh>
    </group>
  )
}

function Plate({ color, accent }: { color: string; accent: string }) {
  const map = rosetteTexture(color, accent)
  return (
    <mesh position={[0, 0.4, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.4, 0.36, 0.04, 48]} />
      <meshStandardMaterial attach="material-0" color={accent} roughness={0.3} />
      <meshStandardMaterial attach="material-1" map={map} roughness={0.25} />
      <meshStandardMaterial attach="material-2" color={color} roughness={0.3} />
    </mesh>
  )
}

function ZelligePanel({ color, accent }: { color: string; accent: string }) {
  const map = zelligeTexture([color, accent, GOLD], 2)
  return (
    <group position={[0, 0.45, 0]}>
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.04]} />
        <meshStandardMaterial color="#7a4a2c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <planeGeometry args={[0.78, 0.78]} />
        <meshStandardMaterial map={map} roughness={0.25} />
      </mesh>
    </group>
  )
}

function Tapestry({ color, accent, pattern }: { color: string; accent: string; pattern?: Pattern }) {
  const map = pattern ? patternTexture(pattern, color, accent) : kilimTexture(color, accent)
  return (
    <group>
      <mesh position={[0, 1.42, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.05, 12]} />
        <meshStandardMaterial color="#6b4a32" />
      </mesh>
      <mesh position={[0, 0.77, 0]} castShadow>
        <planeGeometry args={[0.9, 1.3]} />
        <meshStandardMaterial map={map} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[-0.42 + i * 0.14, 0.08, 0]}>
          <cylinderGeometry args={[0.012, 0.02, 0.1, 6]} />
          <meshStandardMaterial color={accent} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
