import * as THREE from 'three'

/**
 * Procedural surface textures, drawn once per color on a canvas and cached.
 * Kept low in contrast and free of fine noise: high-frequency detail shimmers and
 * reads as dirt once ambient occlusion is applied.
 */

const cache = new Map<string, THREE.CanvasTexture>()

/** Small deterministic random generator so textures look the same on every load. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
}

function shade(hex: string, amount: number) {
  const c = new THREE.Color(hex)
  const hsl = { h: 0, s: 0, l: 0 }
  c.getHSL(hsl)
  c.setHSL(hsl.h, hsl.s, THREE.MathUtils.clamp(hsl.l + amount, 0, 1))
  return `#${c.getHexString()}`
}

function build(key: string, size: number, repeat: [number, number], srgb: boolean, draw: (ctx: CanvasRenderingContext2D, s: number) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  draw(canvas.getContext('2d')!, size)
  const tex = new THREE.CanvasTexture(canvas)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(...repeat)
  tex.anisotropy = 16
  cache.set(key, tex)
  return tex
}

const ROWS = 8

/** Plank layout shared by the color map and the bump map, so seams line up. */
function planks(s: number, each: (x: number, y: number, w: number, h: number, rand: () => number) => void) {
  const rand = rng(42)
  const h = s / ROWS
  for (let r = 0; r < ROWS; r++) {
    // stagger each row; wrap the first board so the texture tiles seamlessly
    let x = -Math.floor(rand() * s * 0.5)
    while (x < s) {
      const w = Math.round(s * (0.35 + rand() * 0.4))
      each(x, r * h, w, h, rand)
      if (x < 0) each(x + s, r * h, w, h, rng(r + 1))
      x += w
    }
  }
}

export interface FloorTextures {
  map: THREE.CanvasTexture
  bumpMap: THREE.CanvasTexture
}

/** Floor planks: gentle tone variation and soft grain; only the seams are in the bump map. */
export function woodFloor(base: string, repeat: [number, number] = [2, 2]): FloorTextures {
  const map = build(`floor:${base}:${repeat}`, 1024, repeat, true, (ctx, s) => {
    planks(s, (x, y, w, h, rand) => {
      const tone = shade(base, (rand() - 0.5) * 0.06)
      ctx.fillStyle = tone
      ctx.fillRect(x, y, w, h)
      ctx.globalAlpha = 0.18
      for (let g = 0; g < 6; g++) {
        const gy = y + h * (0.15 + rand() * 0.7)
        ctx.strokeStyle = shade(tone, -0.05)
        ctx.lineWidth = 1.5 + rand() * 2.5
        ctx.beginPath()
        ctx.moveTo(x, gy)
        ctx.bezierCurveTo(x + w * 0.33, gy + (rand() - 0.5) * 5, x + w * 0.66, gy + (rand() - 0.5) * 5, x + w, gy)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = shade(base, -0.14)
      ctx.fillRect(x, y, 2, h)
      ctx.fillRect(x, y, w, 2)
    })
  })
  const bumpMap = build(`floor-bump:${repeat}`, 1024, repeat, false, (ctx, s) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = '#000000'
    planks(s, (x, y, w, h) => {
      ctx.fillRect(x, y, 2, h)
      ctx.fillRect(x, y, w, 2)
    })
  })
  return { map, bumpMap }
}

/** Long, soft wood grain for furniture. */
export function woodGrain(base: string, repeat: [number, number] = [1, 1]) {
  return build(`grain:${base}:${repeat}`, 512, repeat, true, (ctx, s) => {
    const rand = rng(11)
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.globalAlpha = 0.22
    for (let i = 0; i < 40; i++) {
      const y = rand() * s
      ctx.strokeStyle = shade(base, rand() > 0.35 ? -0.06 : 0.04)
      ctx.lineWidth = 2 + rand() * 4
      ctx.beginPath()
      ctx.moveTo(0, y)
      for (let x = 0; x <= s; x += 32) ctx.lineTo(x, y + Math.sin(x / 80 + i) * 4)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  })
}

/** Upholstery: a faint, wide weave in the fabric color. */
export function fabric(base: string, repeat: [number, number] = [3, 3]) {
  return build(`fabric:${base}:${repeat}`, 256, repeat, true, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.globalAlpha = 0.07
    const step = 16
    for (let i = 0; i < s; i += step) {
      ctx.fillStyle = shade(base, 0.08)
      ctx.fillRect(i, 0, step / 2, s)
      ctx.fillStyle = shade(base, -0.08)
      ctx.fillRect(0, i, s, step / 2)
    }
    ctx.globalAlpha = 1
  })
}
