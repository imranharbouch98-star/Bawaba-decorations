import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Edges, useCursor } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { ITEMS_BY_ID, withPaint, type ItemDef } from '../game/items'
import { placementTransform, type PlacedItem } from '../game/placement'
import { useGame } from '../game/store'
import { ItemModel } from './Models'

export function PlacedItems() {
  const placed = useGame((s) => s.rooms[s.currentRoom].placed)
  const movingUid = useGame((s) => (s.drag?.active ? s.drag.uid : undefined))
  const selectedUid = useGame((s) => s.selectedUid)

  return placed.map((p) =>
    p.uid === movingUid || !ITEMS_BY_ID[p.itemId] ? null : <Placed key={p.uid} placed={p} selected={p.uid === selectedUid} />,
  )
}

function Placed({ placed, selected }: { placed: PlacedItem; selected: boolean }) {
  const base = ITEMS_BY_ID[placed.itemId]
  const item = useMemo(() => withPaint(base, placed.paint), [base, placed.paint])
  const startDrag = useGame((s) => s.startDrag)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered, 'grab')
  const { position, quaternion } = useMemo(() => placementTransform(base, placed), [base, placed])

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    startDrag({ itemId: base.id, uid: placed.uid, active: false, startX: e.clientX, startY: e.clientY })
  }

  return (
    <group
      position={position}
      quaternion={quaternion}
      userData={{ uid: placed.uid }}
      onPointerDown={onPointerDown}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}
    >
      <ModelWithOutline item={item} shelf={placed.books} show={selected || hovered} color={selected ? '#ffb347' : '#ffffff'} />
    </group>
  )
}

const ignoreRaycast = () => null

/** Renders an item with a box outline around its local bounds when `show` is set. */
export function ModelWithOutline({ item, shelf, show, color }: { item: ItemDef; shelf?: (string | null)[]; show: boolean; color: string }) {
  const model = useRef<THREE.Group>(null)
  const [bounds, setBounds] = useState<{ size: THREE.Vector3; center: THREE.Vector3 } | null>(null)

  useLayoutEffect(() => {
    if (!model.current) return
    const box = localBox(model.current)
    setBounds({ size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()) })
  }, [item.id])

  return (
    <>
      <group ref={model}>
        <ItemModel item={item} shelf={shelf} />
      </group>
      {show && bounds && (
        <mesh position={bounds.center} raycast={ignoreRaycast}>
          <boxGeometry args={[bounds.size.x + 0.04, bounds.size.y + 0.04, bounds.size.z + 0.04]} />
          <meshBasicMaterial visible={false} />
          <Edges color={color} />
        </mesh>
      )}
    </>
  )
}

/** Bounding box of all meshes under `root`, in root's local space. */
export function localBox(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true)
  const inv = root.matrixWorld.clone().invert()
  const box = new THREE.Box3()
  const tmp = new THREE.Box3()
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry.computeBoundingBox()
    tmp.copy(mesh.geometry.boundingBox!).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld))
    box.union(tmp)
  })
  return box
}
