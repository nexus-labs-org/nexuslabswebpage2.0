import { useEffect, useRef, type ReactNode } from 'react'

// A word the pointer "paints": colour appears only right under the cursor, in a small soft
// brush, fills the letters from side to side as the pointer sweeps, builds up stronger with each
// pass over the same spot, and fades slowly back to cream. Nothing outside the word changes.
//
// The coloured copy of the word sits over the cream one and is revealed through a mask made of
// the recent brush dabs (radial gradients); overlapping dabs add up, which gives the build-up.

const MAX_DABS = 140
const RADIUS = 30
const SPACING = 8
const FADE_MS = 2800

// Each new hover takes the next colour, as in the reference.
const COLOURS = ['#8B35FF', '#3FBF6B', '#FF3831', '#2F6BFF']
let colourIndex = -1

type Dab = { x: number; y: number; t: number; a: number }

export default function PaintWord({ children, className = '', logo = false }: { children?: ReactNode; className?: string; logo?: boolean }) {
  const root = useRef<HTMLSpanElement>(null)
  const paint = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = root.current!
    const layer = paint.current!
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const dabs: Dab[] = []
    let frame = 0
    let last: { x: number; y: number } | null = null

    const render = () => {
      frame = 0
      const now = performance.now()
      while (dabs.length && now - dabs[0].t > FADE_MS) dabs.shift()
      const mask = dabs.length
        ? dabs.map(d => {
          const k = 1 - (now - d.t) / FADE_MS
          const a = (d.a * Math.pow(k, 1.2)).toFixed(3)
          return `radial-gradient(circle ${RADIUS}px at ${d.x.toFixed(1)}px ${d.y.toFixed(1)}px, rgba(0,0,0,${a}), rgba(0,0,0,0))`
        }).join(',')
        : 'linear-gradient(transparent, transparent)'
      layer.style.maskImage = mask
      layer.style.setProperty('-webkit-mask-image', mask)
      if (dabs.length) frame = requestAnimationFrame(render)
    }

    const enter = () => {
      colourIndex = (colourIndex + 1) % COLOURS.length
      layer.style.setProperty('--paint', COLOURS[colourIndex])
      last = null
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      const p = { x: e.clientX - r.left, y: e.clientY - r.top }
      // Lay dabs evenly along the path so a fast sweep still paints a continuous stroke.
      const from = last ?? p
      const steps = Math.max(1, Math.floor(Math.hypot(p.x - from.x, p.y - from.y) / SPACING))
      const now = performance.now()
      for (let i = 1; i <= steps; i++) {
        dabs.push({ x: from.x + ((p.x - from.x) * i) / steps, y: from.y + ((p.y - from.y) * i) / steps, t: now, a: 0.55 })
      }
      while (dabs.length > MAX_DABS) dabs.shift()
      last = p
      if (!frame) frame = requestAnimationFrame(render)
    }
    const leave = () => { last = null }

    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return <span ref={root} className={`paint-word ${logo ? 'paint-logo' : ''} ${className}`}>
    {logo ? <span className="logo-mask" aria-hidden="true" /> : children}
    <span ref={paint} className="paint-layer" aria-hidden="true">{logo ? null : children}</span>
  </span>
}
