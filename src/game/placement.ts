import * as THREE from 'three'
import type { ItemDef } from './items'

export type Vec3 = [number, number, number]

export interface PlacedItem {
  uid: string
  itemId: string
  /** Point on the surface the item was dropped on. */
  position: Vec3
  /** World normal of that surface. */
  normal: Vec3
  /** User rotation: around the vertical axis on floors, around the wall normal on walls. */
  spin: number
  /** Paint item applied to this piece (paintable furniture only). */
  paint?: string
}

const X = new THREE.Vector3(1, 0, 0)
const Y = new THREE.Vector3(0, 1, 0)
const Z = new THREE.Vector3(0, 0, 1)

export const isWallNormal = (n: { y: number }) => Math.abs(n.y) < 0.5

/** Turns a drop point + surface normal into the item's world transform. */
export function placementTransform(item: ItemDef, p: Pick<PlacedItem, 'position' | 'normal' | 'spin'>) {
  const n = new THREE.Vector3(...p.normal)
  const position = new THREE.Vector3(...p.position)
  const quaternion = new THREE.Quaternion()

  if (isWallNormal(n)) {
    // face away from the wall, spin around the wall normal
    quaternion
      .setFromAxisAngle(Y, Math.atan2(n.x, n.z))
      .multiply(new THREE.Quaternion().setFromAxisAngle(Z, p.spin))
    if (item.flat) {
      quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(X, Math.PI / 2))
      position.addScaledVector(n, 0.01)
    } else {
      // center the item on the cursor and push it out so its back touches the wall
      position.add(new THREE.Vector3(0, -item.height / 2, 0).applyQuaternion(quaternion))
      position.addScaledVector(n, item.back)
    }
  } else {
    quaternion.setFromAxisAngle(Y, p.spin)
  }

  return { position, quaternion }
}

/** Default rotation for a fresh drop: floor items face the camera. */
export const defaultSpin = (normal: Vec3) => (isWallNormal({ y: normal[1] }) ? 0 : Math.PI / 4)

/** Keeps the rotation when moving between surfaces of the same kind, resets it otherwise. */
export const spinFor = (prev: Pick<PlacedItem, 'normal' | 'spin'> | undefined, normal: Vec3) =>
  prev && isWallNormal({ y: prev.normal[1] }) === isWallNormal({ y: normal[1] }) ? prev.spin : defaultSpin(normal)
