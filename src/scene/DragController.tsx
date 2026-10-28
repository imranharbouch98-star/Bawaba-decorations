import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { ITEMS_BY_ID, isBook, isPaint, isPaintable } from '../game/items'
import { placementTransform, spinFor, type Vec3 } from '../game/placement'
import { isBookshelf, useGame, type PaintTarget, type Surface } from '../game/store'
import { ModelWithOutline } from './PlacedItems'

/** Pixels the pointer has to travel before a press turns into a drag. */
const DRAG_THRESHOLD = 6

interface Hit {
  position: Vec3
  normal: Vec3
  paintTarget?: PaintTarget
  /** Bookshelf (placed uid) under the pointer. */
  shelfUid?: string
}

/**
 * Handles dragging items from the inventory into the room, and moving items already placed.
 * The pointer is tracked on window so drags can start on HTML (inventory) and end on the canvas.
 */
export function DragController({ targets }: { targets: RefObject<THREE.Group | null> }) {
  const { camera, gl, raycaster } = useThree()
  const drag = useGame((s) => s.drag)
  const ghost = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const hit = useRef<Hit | null>(null)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY }
      const { drag, activateDrag } = useGame.getState()
      if (drag && !drag.active && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_THRESHOLD) {
        activateDrag()
      }
    }

    const onUp = (e: PointerEvent) => {
      const s = useGame.getState()
      const { drag } = s
      if (!drag) return
      if (!drag.active) {
        // a plain click on a placed item selects it; on a bookshelf it also opens the shelf editor
        if (drag.uid) {
          s.select(drag.uid)
          if (isBookshelf(s.rooms[s.currentRoom].placed.find((p) => p.uid === drag.uid))) s.openShelf(drag.uid)
        }
        s.endDrag()
        return
      }
      const target = document.elementFromPoint(e.clientX, e.clientY)
      const item = ITEMS_BY_ID[drag.itemId]
      if (drag.uid && target?.closest('.inventory')) {
        s.storeItem(drag.uid)
      } else if (isBook(item)) {
        if (target !== gl.domElement) {
          // dropped back on the UI: nothing to do
        } else if (!hit.current?.shelfUid) {
          useGame.setState({ toast: 'Sleep boeken naar een boekenkast' })
        } else if (!s.addBookToShelf(hit.current.shelfUid, item.id)) {
          useGame.setState({ toast: 'Deze boekenkast is vol' })
        }
      } else if (isPaint(item)) {
        if (target === gl.domElement && hit.current?.paintTarget) s.applyPaint(item.id, hit.current.paintTarget)
        else if (target === gl.domElement) useGame.setState({ toast: 'Verf kan op de muren, de vloer en meubels' })
      } else if (target === gl.domElement && hit.current) {
        const { position, normal } = hit.current
        if (drag.uid) {
          s.moveItem(drag.uid, position, normal)
          s.select(drag.uid)
        } else {
          s.placeItem(drag.itemId, position, normal)
        }
      }
      s.endDrag()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useGame.getState().endDrag()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
    }
  }, [gl])

  const ndc = new THREE.Vector2()
  const normal = new THREE.Vector3()

  useFrame(() => {
    const g = ghost.current
    if (!g) return
    hit.current = null
    g.visible = false
    if (!drag?.active || !targets.current) return

    const { x, y } = pointer.current
    if (document.elementFromPoint(x, y) !== gl.domElement) return

    const rect = gl.domElement.getBoundingClientRect()
    ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)

    for (const h of raycaster.intersectObject(targets.current, true)) {
      if (!h.face) continue
      normal.copy(h.face.normal).transformDirection(h.object.matrixWorld)
      if (normal.dot(raycaster.ray.direction) > 0) normal.negate()
      if (normal.y < -0.5) continue // undersides
      hit.current = { position: h.point.toArray(), normal: normal.toArray(), ...targetsOf(h.object) }
      break
    }
    if (!hit.current) return

    const s = useGame.getState()
    const moving = drag.uid ? s.rooms[s.currentRoom].placed.find((p) => p.uid === drag.uid) : undefined
    const t = placementTransform(ITEMS_BY_ID[drag.itemId], { ...hit.current, spin: spinFor(moving, hit.current.normal) })
    g.position.copy(t.position)
    g.quaternion.copy(t.quaternion)
    g.visible = true
  })

  return (
    <group ref={ghost} visible={false}>
      {drag?.active && <ModelWithOutline item={ITEMS_BY_ID[drag.itemId]} show color="#ffb347" />}
    </group>
  )
}

/** What a ray hit, for drops: the paintable surface or furniture, and the bookshelf it belongs to. */
function targetsOf(object: THREE.Object3D): Pick<Hit, 'paintTarget' | 'shelfUid'> {
  for (let o: THREE.Object3D | null = object; o; o = o.parent) {
    if (o.userData.surface) return { paintTarget: { surface: o.userData.surface as Surface } }
    if (o.userData.uid) {
      const s = useGame.getState()
      const placed = s.rooms[s.currentRoom].placed.find((p) => p.uid === o!.userData.uid)
      if (!placed) return {}
      return {
        paintTarget: isPaintable(ITEMS_BY_ID[placed.itemId]) ? { uid: placed.uid } : undefined,
        shelfUid: isBookshelf(placed) ? placed.uid : undefined,
      }
    }
  }
  return {}
}
