import { useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { useGame } from '../game/store'
import { DragController } from './DragController'
import { PlacedItems } from './PlacedItems'
import { Room } from './Room'

export function GameCanvas() {
  const select = useGame((s) => s.select)
  const dragging = useGame((s) => s.drag !== null)
  // everything items can be dropped onto: the room and the items already in it
  const targets = useRef<THREE.Group>(null)

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [8, 6.5, 8], fov: 40 }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#fbefe2']} />
      <ambientLight intensity={0.5} color="#ffe9d1" />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.6}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      {/* local light setup for reflections; no HDR download needed */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} color="#ffe2b8" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[5, 2, 5]} scale={[4, 4, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffd59a" position={[-5, 2, -2]} scale={3} />
      </Environment>

      <group ref={targets}>
        <Room />
        <PlacedItems />
      </group>
      <DragController targets={targets} />
      <ContactShadows position={[0, 0.005, 0]} opacity={0.35} scale={10} blur={2.5} far={3} />

      <OrbitControls
        enabled={!dragging}
        target={[0, 1, -0.5]}
        enablePan={false}
        minDistance={6}
        maxDistance={16}
        minPolarAngle={0.5}
        maxPolarAngle={1.3}
        minAzimuthAngle={-0.1}
        maxAzimuthAngle={Math.PI / 2 + 0.1}
      />
    </Canvas>
  )
}
