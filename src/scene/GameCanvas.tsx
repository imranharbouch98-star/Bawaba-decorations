import { useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useGame } from '../game/store'
import { useGraphics } from '../ui/graphics'
import { useTheme } from '../ui/theme'
import { DragController } from './DragController'
import { PlacedItems } from './PlacedItems'
import { Room } from './Room'

export function GameCanvas() {
  const select = useGame((s) => s.select)
  const theme = useTheme((s) => s.theme)
  const dragging = useGame((s) => s.drag !== null)
  const simple = useGraphics((s) => s.simple)
  // the full view adds reflections and bloom on top of the lights, so it needs less light to look the same
  const light = simple ? 1 : 0.7
  // everything items can be dropped onto: the room and the items already in it
  const targets = useRef<THREE.Group>(null)

  return (
    <Canvas
      // simple view needs different renderer settings, so switching recreates the canvas
      key={simple ? 'simple' : 'full'}
      shadows="percentage"
      dpr={simple ? 1 : [1, 1.75]}
      camera={{ position: [8, 6.5, 8], fov: 38, near: 0.5, far: 60 }}
      // full view tone maps in the effect chain; simple view lets the renderer do it
      gl={simple ? { antialias: true } : { antialias: false, toneMapping: THREE.NoToneMapping }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={[theme === 'dark' ? '#171a20' : '#e6e8eb']} />

      {/* sky / bounce fill, a warm key light with soft shadows, and daylight through the window */}
      <hemisphereLight args={['#fff4e6', '#8a6a4f', 0.55 * light]} />
      <directionalLight
        position={[6, 10, 5]}
        intensity={2.2 * light}
        color="#fff0dc"
        castShadow
        shadow-mapSize={simple ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={simple ? 3 : 6}
      />
      <spotLight position={[-2.4, 2.6, -3.4]} angle={0.9} penumbra={1} intensity={6 * light} distance={9} color="#dcecff" />
      <pointLight position={[2, 3.2, 1.5]} intensity={4 * light} distance={10} color="#ffe2c2" />

      {/* full view: local light setup for reflections (no HDR download); simple view: no reflections */}
      {simple ? (
        <MatteMetals />
      ) : (
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={1.6} color="#fff1dc" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
          <Lightformer form="rect" intensity={0.9} color="#ffffff" position={[6, 3, 6]} scale={[5, 4, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#cfe3ff" position={[-6, 3, -2]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
          <Lightformer form="ring" intensity={1} color="#ffd59a" position={[3, 2, -6]} scale={3} />
        </Environment>
      )}

      <group ref={targets}>
        <Room />
        <PlacedItems />
      </group>
      <DragController targets={targets} />

      <OrbitControls
        enabled={!dragging}
        target={[0, 1, -0.5]}
        enablePan={false}
        enableDamping
        minDistance={6}
        maxDistance={16}
        minPolarAngle={0.5}
        maxPolarAngle={1.3}
        minAzimuthAngle={-0.1}
        maxAzimuthAngle={Math.PI / 2 + 0.1}
      />

      {!simple && (
        <EffectComposer multisampling={0}>
          <N8AO quality="high" aoRadius={0.45} distanceFalloff={1} intensity={1.3} color="black" />
          <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.35} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.35} darkness={theme === 'dark' ? 0.55 : 0.32} />
          <SMAA />
        </EffectComposer>
      )}
    </Canvas>
  )
}

/**
 * Simple view has no environment map, so nothing reflects. Without one, metals would render
 * almost black; turn them into matte colors instead. New materials (items placed later) are
 * picked up on the next check. Switching views recreates the canvas, so nothing needs restoring.
 */
function MatteMetals() {
  const scene = useThree((s) => s.scene)
  const frame = useRef(0)
  useFrame(() => {
    if (frame.current++ % 30) return
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        const mat = m as THREE.MeshStandardMaterial
        if (!mat.isMeshStandardMaterial || mat.userData.matte) continue
        mat.userData.matte = true
        if (mat.metalness > 0) {
          mat.metalness = 0
          mat.roughness = Math.max(mat.roughness, 0.55)
          mat.needsUpdate = true
        }
      }
    })
  })
  return null
}
