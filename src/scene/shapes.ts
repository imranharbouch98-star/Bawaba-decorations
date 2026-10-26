import * as THREE from 'three'

/** Horseshoe arch outline with its base centered at the origin. */
export function horseshoeArch(width: number, height: number) {
  const r = width / 2
  const t = 0.35
  const cy = height - r
  const s = new THREE.Shape()
  s.moveTo(-r * Math.cos(t), 0)
  s.lineTo(-r * Math.cos(t), cy - r * Math.sin(t))
  s.absarc(0, cy, r, Math.PI + t, -t, true)
  s.lineTo(r * Math.cos(t), 0)
  s.closePath()
  return s
}

/** Remaps a flat geometry's UVs to 0..1 across its bounding box (ShapeGeometry uses raw coordinates). */
export function normalizeUVs<T extends THREE.BufferGeometry>(geometry: T) {
  geometry.computeBoundingBox()
  const { min, max } = geometry.boundingBox!
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) - min.x) / (max.x - min.x), (pos.getY(i) - min.y) / (max.y - min.y))
  }
  uv.needsUpdate = true
  return geometry
}
