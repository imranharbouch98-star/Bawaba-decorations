import * as THREE from 'three'
import type { Pattern } from '../game/items'

/**
 * Procedural pattern textures (geometric and floral only) drawn on a 2D canvas.
 * Cached by key so every item using the same pattern shares one texture.
 */
const cache = new Map<string, THREE.CanvasTexture>()

export type Repeat = number | [number, number]

function make(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, s: number) => void, repeat: Repeat = 1, color = true) {
  const k = `${key}|${repeat}`
  const hit = cache.get(k)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  draw(canvas.getContext('2d')!, size)
  const tex = new THREE.CanvasTexture(canvas)
  if (color) tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  const [rx, ry] = typeof repeat === 'number' ? [repeat, repeat] : repeat
  tex.repeat.set(rx, ry)
  tex.anisotropy = 16
  cache.set(k, tex)
  return tex
}

/** Eight-pointed star (two overlapping squares). */
function star8(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const inner = r * 0.765
  ctx.beginPath()
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2
    const rad = i % 2 ? inner : r
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
}

export function zelligeTexture(colors: string[], repeat: Repeat = 1) {
  return make(`zellige:${colors.join()}`, 512, (ctx, s) => {
    ctx.fillStyle = '#f6efe2'
    ctx.fillRect(0, 0, s, s)
    const cell = s / 2
    ctx.lineWidth = 3
    ctx.strokeStyle = '#3b3330'
    for (let y = 0; y <= 2; y++) {
      for (let x = 0; x <= 2; x++) {
        // small stars on the grid corners
        star8(ctx, x * cell, y * cell, cell * 0.26)
        ctx.fillStyle = colors[1]
        ctx.fill()
        ctx.stroke()
      }
    }
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const cx = x * cell + cell / 2
        const cy = y * cell + cell / 2
        star8(ctx, cx, cy, cell * 0.44)
        ctx.fillStyle = colors[0]
        ctx.fill()
        ctx.stroke()
        star8(ctx, cx, cy, cell * 0.2)
        ctx.fillStyle = colors[2]
        ctx.fill()
        ctx.stroke()
      }
    }
  }, repeat)
}

export function kilimTexture(base: string, accent: string, dark = '#3b3330', repeat: Repeat = 1) {
  return make(`kilim:${base}${accent}${dark}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    // stripes
    for (const y of [0.06, 0.9]) {
      ctx.fillStyle = dark
      ctx.fillRect(0, y * s, s, s * 0.04)
    }
    // row of diamonds
    const n = 4
    const w = s / n
    for (let i = 0; i < n; i++) {
      const cx = i * w + w / 2
      for (const [r, c] of [[0.36, accent], [0.24, dark], [0.12, base]] as const) {
        ctx.beginPath()
        ctx.moveTo(cx, s / 2 - s * r)
        ctx.lineTo(cx + w * r * 1.1, s / 2)
        ctx.lineTo(cx, s / 2 + s * r)
        ctx.lineTo(cx - w * r * 1.1, s / 2)
        ctx.closePath()
        ctx.fillStyle = c
        ctx.fill()
      }
    }
    // small zig-zag borders
    ctx.strokeStyle = accent
    ctx.lineWidth = 4
    for (const y0 of [0.15, 0.85]) {
      ctx.beginPath()
      for (let x = 0; x <= 16; x++) ctx.lineTo((x * s) / 16, y0 * s + (x % 2 ? -6 : 6))
      ctx.stroke()
    }
  }, repeat)
}

export function berberTexture(base: string, line: string, repeat: Repeat = 1) {
  return make(`berber:${base}${line}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = line
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    // diamond lattice
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * (s / 2), 0)
      ctx.lineTo(i * (s / 2) + s, s)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(i * (s / 2) + s, 0)
      ctx.lineTo(i * (s / 2), s)
      ctx.stroke()
    }
    ctx.fillStyle = line
    for (const [x, y] of [[0.5, 0.25], [0.25, 0.5], [0.75, 0.5], [0.5, 0.75]]) {
      ctx.beginPath()
      ctx.arc(x * s, y * s, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, repeat)
}

/** Circular rosette for plates and round rugs. */
export function rosetteTexture(base: string, ink: string, gold = '#d4a640') {
  return make(`rosette:${base}${ink}${gold}`, 512, (ctx, s) => {
    const c = s / 2
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.lineWidth = 10
    for (const [r, col] of [[0.47, ink], [0.4, gold], [0.2, ink]] as const) {
      ctx.strokeStyle = col
      ctx.beginPath()
      ctx.arc(c, c, s * r, 0, Math.PI * 2)
      ctx.stroke()
    }
    // eight petals
    for (let i = 0; i < 8; i++) {
      ctx.save()
      ctx.translate(c, c)
      ctx.rotate((i * Math.PI) / 4)
      ctx.beginPath()
      ctx.ellipse(0, -s * 0.3, s * 0.045, s * 0.085, 0, 0, Math.PI * 2)
      ctx.fillStyle = ink
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, -s * 0.435, s * 0.018, 0, Math.PI * 2)
      ctx.fillStyle = gold
      ctx.fill()
      ctx.restore()
    }
    star8(ctx, c, c, s * 0.14)
    ctx.fillStyle = gold
    ctx.fill()
    star8(ctx, c, c, s * 0.07)
    ctx.fillStyle = ink
    ctx.fill()
  })
}

/** Small irregular glass tiles for mosaic lamps. */
export function mosaicTexture(a: string, b: string) {
  return make(`mosaic:${a}${b}`, 512, (ctx, s) => {
    const palette = [a, b, '#e6a83a', '#f6efe2', a]
    ctx.fillStyle = '#3b2a1e'
    ctx.fillRect(0, 0, s, s)
    const n = 12
    const c = s / n
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        ctx.fillStyle = palette[Math.floor(rnd() * palette.length)]
        ctx.fillRect(x * c + 2, y * c + 2, c - 4, c - 4)
      }
    }
  })
}

/** Alpha map: white = solid wood/brass, black = holes. */
export function latticeTexture(repeat: Repeat = 1) {
  return make('lattice', 512, (ctx, s) => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = '#000'
    const cell = s / 4
    for (let y = 0; y <= 4; y++) {
      for (let x = 0; x <= 4; x++) {
        if (x < 4 && y < 4) {
          star8(ctx, x * cell + cell / 2, y * cell + cell / 2, cell * 0.36)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(x * cell, y * cell, cell * 0.12, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, repeat, false)
}

export function stripesTexture(base: string, accent: string, repeat: Repeat = 1) {
  return make(`stripes:${base}${accent}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    const bands: [number, number, string][] = [
      [0.08, 0.1, accent], [0.22, 0.03, '#3b3330'], [0.3, 0.03, accent],
      [0.58, 0.1, accent], [0.72, 0.03, '#f6efe2'], [0.8, 0.03, accent],
    ]
    for (const [y, h, c] of bands) {
      ctx.fillStyle = c
      ctx.fillRect(0, y * s, s, h * s)
    }
  }, repeat)
}

export function chevronTexture(base: string, accent: string, repeat: Repeat = 1) {
  return make(`chevron:${base}${accent}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = accent
    ctx.lineWidth = s / 14
    ctx.lineJoin = 'miter'
    for (let row = -1; row <= 4; row++) {
      ctx.beginPath()
      const y = row * (s / 4)
      for (let i = 0; i <= 4; i++) ctx.lineTo((i * s) / 4, y + (i % 2 ? s / 8 : 0))
      ctx.stroke()
    }
  }, repeat)
}

/** Moroccan trellis (quatrefoil lattice lines). */
export function trellisTexture(base: string, accent: string, repeat: Repeat = 1) {
  return make(`trellis:${base}${accent}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = accent
    ctx.lineWidth = s / 40
    const c = s / 2
    const r = c / 2
    for (let y = 0; y <= 2; y++) {
      for (let x = 0; x <= 2; x++) {
        const cx = x * c
        const cy = y * c
        // four lobes around every grid point
        for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
          ctx.beginPath()
          ctx.arc(cx + dx, cy + dy, r * 0.62, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
  }, repeat)
}

/** Arabesque: curling vines with small flowers. */
export function floralTexture(base: string, accent: string, repeat: Repeat = 1) {
  return make(`floral:${base}${accent}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    for (const y0 of [0.25, 0.75]) {
      ctx.beginPath()
      for (let x = 0; x <= s; x += 4) ctx.lineTo(x, y0 * s + Math.sin((x / s) * Math.PI * 2 + y0 * 6) * s * 0.08)
      ctx.stroke()
    }
    const flower = (x: number, y: number, r: number) => {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.7, r * 0.4, a, 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(x, y, r * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = '#d4a640'
      ctx.fill()
    }
    for (const [x, y] of [[0.25, 0.25], [0.75, 0.75], [0, 0.5], [1, 0.5], [0.5, 0], [0.5, 1]]) flower(x * s, y * s, s * 0.045)
    ctx.fillStyle = accent
    for (const [x, y] of [[0.5, 0.33], [0, 0.15], [1, 0.15], [0.25, 0.68], [0.75, 0.3]]) {
      ctx.beginPath()
      ctx.ellipse(x * s, y * s, s * 0.03, s * 0.012, 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, repeat)
}

export function checkerTexture(base: string, accent: string, repeat: Repeat = 1) {
  return make(`checker:${base}${accent}`, 512, (ctx, s) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = accent
    const n = 4
    const c = s / n
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x + y) % 2) ctx.fillRect(x * c, y * c, c, c)
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 2
    for (let i = 0; i <= n; i++) {
      ctx.beginPath(); ctx.moveTo(i * c, 0); ctx.lineTo(i * c, s); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * c); ctx.lineTo(s, i * c); ctx.stroke()
    }
  }, repeat)
}


export function patternTexture(pattern: Pattern, base: string, accent: string, repeat: Repeat = 1) {
  switch (pattern) {
    case 'kilim': return kilimTexture(base, accent, '#3b3330', repeat)
    case 'berber': return berberTexture(base, accent, repeat)
    case 'zellige': return zelligeTexture([base, accent, '#d4a640'], repeat)
    case 'stripes': return stripesTexture(base, accent, repeat)
    case 'chevron': return chevronTexture(base, accent, repeat)
    case 'trellis': return trellisTexture(base, accent, repeat)
    case 'floral': return floralTexture(base, accent, repeat)
    case 'checker': return checkerTexture(base, accent, repeat)
    case 'rosette': return rosetteTexture(base, accent)
  }
}

/** Light blue glass with white diagonal shine streaks; mirrors no longer reflect. */
export function mirrorGlassTexture() {
  return make('mirror-glass', 512, (ctx, s) => {
    const g = ctx.createLinearGradient(0, s, s, 0)
    g.addColorStop(0, '#9cc3da')
    g.addColorStop(0.5, '#c4e0ee')
    g.addColorStop(1, '#a9cde0')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, s, s)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    for (const [x, w] of [[0.38, 0.1], [0.53, 0.035]]) {
      ctx.beginPath()
      ctx.moveTo(x * s, 0)
      ctx.lineTo((x + w) * s, 0)
      ctx.lineTo((x + w - 0.45) * s, s)
      ctx.lineTo((x - 0.45) * s, s)
      ctx.closePath()
      ctx.fill()
    }
  }, 1)
}
