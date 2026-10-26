import { useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { create } from 'zustand'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { ITEMS } from '../game/items'
import { ItemModel } from './Models'
import { localBox } from './PlacedItems'

/** Item id → rendered thumbnail (data URL). Built once per page load. */
export const useThumbs = create<{ urls: Record<string, string>; done: boolean }>(() => ({ urls: {}, done: false }))

const SIZE = 160

/** Renders every item once in a hidden canvas and captures it as an image. */
export function ThumbnailBaker() {
  const done = useThumbs((s) => s.done)
  if (done) return null
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: SIZE, height: SIZE, opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
      <Canvas dpr={1} gl={{ preserveDrawingBuffer: true, alpha: true }} camera={{ fov: 30 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 4, 3]} intensity={1.6} />
        <Environment resolution={64}>
          <Lightformer form="rect" intensity={2} color="#ffe2b8" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#ffffff" position={[3, 2, 5]} scale={[4, 4, 1]} />
        </Environment>
        <Baker />
      </Canvas>
    </div>
  )
}

function Baker() {
  const { gl, scene, camera } = useThree()
  const [index, setIndex] = useState(0)
  const group = useRef<THREE.Group>(null)
  const frames = useRef(0)
  const item = ITEMS[index]

  useLayoutEffect(() => {
    if (!group.current || !item) return
    frames.current = 0
    const box = localBox(group.current)
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const dir = item.flat ? new THREE.Vector3(0.3, 1.4, 1) : new THREE.Vector3(0.55, 0.4, 1)
    const cam = camera as THREE.PerspectiveCamera
    const dist = sphere.radius / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2)) * 1.05
    cam.position.copy(sphere.center).addScaledVector(dir.normalize(), dist)
    cam.near = dist / 20
    cam.far = dist * 4
    cam.lookAt(sphere.center)
    cam.updateProjectionMatrix()
  }, [item, camera])

  useFrame(() => {
    if (!item) return
    // give textures a couple of frames to upload
    if (++frames.current < 3) return
    gl.render(scene, camera)
    const url = gl.domElement.toDataURL('image/webp', 0.85)
    useThumbs.setState((s) => ({ urls: { ...s.urls, [item.id]: url } }))
    if (index + 1 >= ITEMS.length) useThumbs.setState({ done: true })
    else setIndex(index + 1)
  })

  if (!item) return null
  return (
    <group ref={group} key={item.id}>
      <ItemModel item={item} />
    </group>
  )
}
