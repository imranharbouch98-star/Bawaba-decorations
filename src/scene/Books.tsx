import { useMemo } from 'react'
import * as THREE from 'three'
import type { ItemDef } from '../game/items'

/** Books: leather-look covers with gold tooling, the Arabic word and the title on the spine. */

const PAGES = '#efe4cc'

/** Stable per-book proportions, so the same book always looks the same. */
export function bookSize(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const r1 = (h % 1000) / 1000
  const r2 = ((h >>> 10) % 1000) / 1000
  return { thickness: 0.11 + r1 * 0.07, height: 0.5 + r2 * 0.18, depth: 0.32 }
}

const cache = new Map<string, THREE.CanvasTexture>()

function canvasTexture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  cache.set(key, tex)
  return tex
}

function leather(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, 'rgba(0,0,0,0.28)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.08)')
  g.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function lozenge(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x, y - r)
  ctx.lineTo(x + r * 0.7, y)
  ctx.lineTo(x, y + r)
  ctx.lineTo(x - r * 0.7, y)
  ctx.closePath()
}

function spineTexture(book: ItemDef) {
  return canvasTexture(`spine:${book.id}`, 128, 512, (ctx) => {
    const gold = book.accent
    leather(ctx, 128, 512, book.color)
    ctx.strokeStyle = gold
    ctx.fillStyle = gold
    // raised bands
    ctx.lineWidth = 3
    for (const y of [40, 56, 456, 472]) {
      ctx.beginPath()
      ctx.moveTo(8, y)
      ctx.lineTo(120, y)
      ctx.stroke()
    }
    // Arabic word
    ctx.font = 'bold 40px "Segoe UI", "Geeza Pro", "Noto Naskh Arabic", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = 'rtl'
    ctx.fillText(book.script ?? '', 64, 104, 112)
    ctx.direction = 'ltr'
    lozenge(ctx, 64, 150, 12)
    ctx.fill()
    // title, running up the spine
    ctx.save()
    ctx.translate(64, 300)
    ctx.rotate(-Math.PI / 2)
    let size = 30
    ctx.font = `italic 600 ${size}px Georgia, serif`
    while (ctx.measureText(book.name).width > 250 && size > 14) {
      size -= 1
      ctx.font = `italic 600 ${size}px Georgia, serif`
    }
    ctx.fillText(book.name, 0, 0)
    ctx.restore()
    lozenge(ctx, 64, 420, 9)
    ctx.stroke()
  })
}

function coverTexture(book: ItemDef) {
  return canvasTexture(`cover:${book.id}`, 256, 384, (ctx) => {
    const gold = book.accent
    leather(ctx, 256, 384, book.color)
    ctx.strokeStyle = gold
    ctx.lineWidth = 3
    ctx.strokeRect(18, 18, 220, 348)
    ctx.lineWidth = 1.5
    ctx.strokeRect(28, 28, 200, 328)
    // central eight-fold medallion
    ctx.save()
    ctx.translate(128, 170)
    for (let i = 0; i < 2; i++) {
      ctx.rotate(Math.PI / 4)
      ctx.strokeRect(-46, -46, 92, 92)
    }
    ctx.restore()
    ctx.beginPath()
    ctx.arc(128, 170, 30, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = gold
    ctx.font = 'bold 34px "Segoe UI", "Geeza Pro", "Noto Naskh Arabic", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.direction = 'rtl'
    ctx.fillText(book.script ?? '', 128, 172, 56)
    ctx.direction = 'ltr'
    // corner fleurons
    for (const [x, y] of [[44, 44], [212, 44], [44, 340], [212, 340]]) {
      lozenge(ctx, x, y, 8)
      ctx.fill()
    }
  })
}

const pagesTexture = () =>
  canvasTexture('pages', 64, 64, (ctx) => {
    ctx.fillStyle = PAGES
    ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = 'rgba(120,90,50,0.18)'
    for (let y = 2; y < 64; y += 3) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(64, y)
      ctx.stroke()
    }
  })

/** A standing book, origin bottom-center, spine facing +Z. */
export function BookMesh({ book }: { book: ItemDef }) {
  const { thickness, height, depth } = bookSize(book.id)
  const materials = useMemo(() => {
    const cover = new THREE.MeshStandardMaterial({ map: coverTexture(book), roughness: 0.7 })
    const pages = new THREE.MeshStandardMaterial({ map: pagesTexture(), roughness: 0.9 })
    const spine = new THREE.MeshStandardMaterial({ map: spineTexture(book), roughness: 0.6 })
    // box faces: +x, -x, +y, -y, +z (spine), -z (fore-edge)
    return [cover, cover, pages, pages, spine, pages]
  }, [book])
  return (
    <mesh position={[0, height / 2, 0]} material={materials} castShadow receiveShadow>
      <boxGeometry args={[thickness, height, depth]} />
    </mesh>
  )
}
