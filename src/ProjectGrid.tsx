import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from './projects'

// World layout: cells of CELL px; a project cluster is 3x2 cells inside a 4x3 period,
// odd cluster rows shifted by 2 cells. Shader and picking share these numbers.
const CELL_W = 176
const CELL_H = 118
const PERIOD_X = 4
const PERIOD_Y = 3
const ROW_SHIFT = 2
const LENS = 0.32
// Atlas: 8 x 12 slots, one per project image; each image sits inside a gutter
// filled with its own stretched edges so mipmaps never bleed a neighbour in.
const ATLAS_COLS = 8
const ATLAS_ROWS = 12
const GUTTER = 0.04

const vertex = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

const fragmentSource = (grad: boolean) => `
#extension GL_OES_standard_derivatives : enable
${grad ? '#extension GL_EXT_shader_texture_lod : enable' : ''}
precision highp float;
uniform vec2 uRes;
uniform vec2 uOffset;
uniform float uDpr;
uniform float uZoom;
uniform float uLens;
uniform float uReveal;
uniform vec2 uHover;
uniform float uHasHover;
uniform sampler2D uAtlas;
uniform float uCount;
uniform vec2 uPointer;
uniform float uPointerOn;
const vec2 CELL = vec2(${CELL_W}.0, ${CELL_H}.0);
const vec2 GRID = vec2(${ATLAS_COLS}.0, ${ATLAS_ROWS}.0);
const float GUTTER = ${GUTTER};

vec2 toWorld(vec2 frag) {
  vec2 p = (frag - 0.5 * uRes) / (0.5 * uRes.y);
  p.y = -p.y;
  p *= 1.0 + uLens * dot(p, p);
  return p * 0.5 * uRes.y / uDpr * uZoom + uOffset;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  vec2 world = toWorld(gl_FragCoord.xy);
  vec2 g = world / CELL;
  vec2 aa = fwidth(g);
  vec2 cell = floor(g);
  vec2 local = fract(g);

  vec3 ground = vec3(0.094, 0.086, 0.086);
  vec3 col = ground;

  float cy = floor(cell.y / ${PERIOD_Y}.0);
  float shift = mod(cy, 2.0) * ${ROW_SHIFT}.0;
  float cx = floor((cell.x - shift) / ${PERIOD_X}.0);
  float lx = cell.x - shift - cx * ${PERIOD_X}.0;
  float ly = cell.y - cy * ${PERIOD_Y}.0;
  bool hovered = uHasHover > 0.5 && abs(cx - uHover.x) < 0.5 && abs(cy - uHover.y) < 0.5;

  if (lx < 3.0 && ly < 2.0) {
    float idx = mod(cx + cy * 5.0, uCount);
    float tile = idx * 6.0 + lx + ly * 3.0;
    vec2 slot = vec2(mod(tile, GRID.x), floor(tile / GRID.x));
    vec2 inner = GUTTER + local * (1.0 - 2.0 * GUTTER);
    vec2 uv = (slot + inner) / GRID;
    ${grad ? 'vec3 img = texture2DGradEXT(uAtlas, uv, dFdx(g) * (1.0 - 2.0 * GUTTER) / GRID, dFdy(g) * (1.0 - 2.0 * GUTTER) / GRID).rgb;' : 'vec3 img = texture2D(uAtlas, uv).rgb;'}
    float dim = uHasHover > 0.5 ? (hovered ? 1.0 : 0.62) : 0.9;

    // Distance to the cluster's outer edge, in cells: soft mask and hover frame.
    vec2 f = vec2(lx, ly) + local;
    vec2 edge = min(f, vec2(3.0, 2.0) - f) / aa;
    float mask = clamp(min(edge.x, edge.y), 0.0, 1.0);
    col = mix(ground, img * dim, uReveal * mask);
    if (hovered) {
      float frame = 1.0 - smoothstep(1.0, 2.2, min(edge.x, edge.y));
      col = mix(col, vec3(1.0, 0.22, 0.19), frame * mask);
    }
  }

  vec2 line = abs(fract(g - 0.5) - 0.5) / aa;
  float l = 1.0 - min(min(line.x, line.y), 1.0);
  // Rules near the pointer light up red, fading with distance (in world px).
  vec2 dp = (world - uPointer) / 340.0;
  float glow = uPointerOn * exp(-dot(dp, dp) * 1.6);
  vec3 rule = mix(vec3(1.0, 0.992, 0.859), vec3(1.0, 0.22, 0.19), glow);
  // Near the pointer the rule also thickens a little so the colour reads.
  float lw = 1.0 - min(min(line.x, line.y) / (1.0 + glow * 0.8), 1.0);
  col = mix(col, rule, max(l * 0.16, lw * glow * 0.95));

  float r = length(p * vec2(0.82, 1.0));
  float fade = smoothstep(1.55, 0.55, r);
  col = mix(ground * 0.6, col, fade);
  gl_FragColor = vec4(col, 1.0);
}
`

type Hit = { cx: number; cy: number; project: Project }

function toWorld(sx: number, sy: number, w: number, h: number, offset: { x: number; y: number }, zoom: number) {
  let px = (sx - w / 2) / (h / 2)
  let py = (sy - h / 2) / (h / 2)
  const k = 1 + LENS * (px * px + py * py)
  px *= k
  py *= k
  return { wx: px * (h / 2) * zoom + offset.x, wy: py * (h / 2) * zoom + offset.y }
}

function pick(sx: number, sy: number, w: number, h: number, offset: { x: number; y: number }, zoom: number): Hit | null {
  const { wx, wy } = toWorld(sx, sy, w, h, offset, zoom)
  const cellX = Math.floor(wx / CELL_W)
  const cellY = Math.floor(wy / CELL_H)
  const cy = Math.floor(cellY / PERIOD_Y)
  const shift = (((cy % 2) + 2) % 2) * ROW_SHIFT
  const cx = Math.floor((cellX - shift) / PERIOD_X)
  const lx = cellX - shift - cx * PERIOD_X
  const ly = cellY - cy * PERIOD_Y
  if (lx >= 3 || ly >= 2) return null
  const n = projects.length
  const idx = (((cx + cy * 5) % n) + n) % n
  return { cx, cy, project: projects[idx] }
}

function loadAtlas(size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#181616'
  ctx.fillRect(0, 0, size, size)
  const slotW = size / ATLAS_COLS
  const slotH = size / ATLAS_ROWS
  const sources = projects.flatMap(p => p.images.slice(0, 6))
  return Promise.all(sources.map((src, i) => new Promise<void>(resolve => {
    const img = new Image()
    img.onload = () => {
      const x = (i % ATLAS_COLS) * slotW
      const y = Math.floor(i / ATLAS_COLS) * slotH
      ctx.save()
      ctx.beginPath()
      ctx.rect(x, y, slotW, slotH)
      ctx.clip()
      // Gutter first: the image stretched over the whole slot, then the image proper inside it.
      ctx.drawImage(img, x, y, slotW, slotH)
      const gx = slotW * GUTTER
      const gy = slotH * GUTTER
      const iw = slotW - 2 * gx
      const ih = slotH - 2 * gy
      const scale = Math.max(iw / img.naturalWidth, ih / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      ctx.beginPath()
      ctx.rect(x + gx, y + gy, iw, ih)
      ctx.clip()
      ctx.drawImage(img, x + gx + (iw - dw) / 2, y + gy + (ih - dh) / 2, dw, dh)
      ctx.restore()
      resolve()
    }
    img.onerror = () => resolve()
    img.src = src
  }))).then(() => canvas)
}

type Props = {
  onOpen: (project: Project) => void
  onReady?: () => void
}

export default function ProjectGrid({ onOpen, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coordX = useRef<HTMLSpanElement>(null)
  const coordY = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!gl || !gl.getExtension('OES_standard_derivatives')) {
      setFailed(true)
      onReady?.()
      return
    }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource(!!gl.getExtension('EXT_shader_texture_lod'))))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true)
      onReady?.()
      return
    }
    gl.useProgram(program)
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (name: string) => gl.getUniformLocation(program, name)
    const uRes = u('uRes'), uOffset = u('uOffset'), uDpr = u('uDpr'), uZoom = u('uZoom'), uLens = u('uLens')
    const uReveal = u('uReveal'), uHover = u('uHover'), uHasHover = u('uHasHover'), uCount = u('uCount')
    const uPointer = u('uPointer'), uPointerOn = u('uPointerOn')

    gl.uniform1f(uLens, LENS)
    gl.uniform1f(uCount, projects.length)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([24, 22, 22, 255]))

    // Start centred on a cluster so the first viewport opens on work, not on a gap.
    const offset = { x: CELL_W * 1.5, y: CELL_H * 1 }
    const velocity = { x: 0, y: 0 }
    const DRIFT_SPEED = 0.45
    const drift = { x: DRIFT_SPEED * 0.92, y: DRIFT_SPEED * 0.39 }
    // Phones see more of the territory per pixel so a cluster fits the screen.
    const baseZoom = () => (canvas.clientWidth < 700 ? 1.7 : 1)
    let rest = baseZoom()
    let zoom = reduce ? rest : rest * 1.55
    let reveal = reduce ? 1 : 0
    let hover: Hit | null = null
    let dragging = false
    let moved = 0
    let last = { x: 0, y: 0, t: 0, dx: 0, dy: 0 }
    // Where the mouse is (for hover during momentum), and whether the keyboard owns the grid.
    const pointer = { x: 0, y: 0, inside: false }
    let keyboard = false
    let frame = 0
    let w = 0, h = 0, dpr = 1
    let start = performance.now()

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      rest = baseZoom()
      request()
    }

    const centreHit = () => {
      const probes = [[0, 0], [-CELL_W, 0], [CELL_W, 0], [0, -CELL_H], [0, CELL_H], [-CELL_W, -CELL_H], [CELL_W, CELL_H]]
      for (const [dx, dy] of probes) {
        const hit = pick(w / 2 + dx, h / 2 + dy, w, h, offset, zoom)
        if (hit) return hit
      }
      return null
    }

    const showLabel = (next: Hit | null, x: number, y: number) => {
      const el = label.current
      if (!el) return
      el.dataset.show = next && !dragging ? 'true' : 'false'
      if (!next) return
      el.style.transform = `translate(${Math.min(x + 18, w - 260)}px, ${y + 18}px)`
      el.querySelector('strong')!.textContent = next.project.name
      el.querySelector('span')!.textContent = `${next.project.kind}${next.project.illustrative ? ' · exemplo ilustrativo' : ''}`
    }

    const setHover = (next: Hit | null, x = 0, y = 0) => {
      const changed = next?.cx !== hover?.cx || next?.cy !== hover?.cy
      hover = next
      canvas.style.cursor = dragging ? 'grabbing' : next ? 'pointer' : 'grab'
      showLabel(next, x, y)
      return changed
    }

    // Recompute what the highlight should be after the territory moved under a still pointer.
    const refreshHover = () => {
      if (dragging) return false
      if (keyboard) return setHover(centreHit(), w / 2 - 140, h / 2 + (CELL_H * 1.15) / zoom)
      if (pointer.inside) return setHover(pick(pointer.x, pointer.y, w, h, offset, zoom), pointer.x, pointer.y)
      return false
    }

    const draw = () => {
      frame = 0
      const t = performance.now() - start
      let busy = false
      if (!reduce && t < 1400) {
        const ease = 1 - Math.pow(1 - t / 1400, 4)
        zoom = rest * (1.55 - 0.55 * ease)
        reveal = Math.min(t / 700, 1)
        busy = true
      } else {
        zoom = rest
        reveal = 1
      }
      if (!dragging && !reduce) {
        // Release momentum eases into the steady drift instead of stopping.
        velocity.x += (drift.x - velocity.x) * 0.05
        velocity.y += (drift.y - velocity.y) * 0.05
        offset.x += velocity.x
        offset.y += velocity.y
        busy = true
        refreshHover()
      }
      const pw = pointer.inside && !keyboard ? toWorld(pointer.x, pointer.y, w, h, offset, zoom) : null
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uOffset, offset.x, offset.y)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uZoom, zoom)
      gl.uniform1f(uReveal, reveal)
      gl.uniform2f(uHover, hover?.cx ?? 0, hover?.cy ?? 0)
      gl.uniform1f(uHasHover, hover ? 1 : 0)
      gl.uniform2f(uPointer, pw?.wx ?? 0, pw?.wy ?? 0)
      gl.uniform1f(uPointerOn, pw ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (coordX.current) coordX.current.textContent = (offset.x / CELL_W).toFixed(2)
      if (coordY.current) coordY.current.textContent = (-offset.y / CELL_H).toFixed(2)
      if (busy) request()
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(draw) }

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const down = (e: PointerEvent) => {
      if (dragging) return
      keyboard = false
      dragging = true
      moved = 0
      velocity.x = velocity.y = 0
      last = { ...local(e), t: performance.now(), dx: 0, dy: 0 }
      canvas.setPointerCapture(e.pointerId)
      setHover(null)
      request()
    }
    const move = (e: PointerEvent) => {
      const p = local(e)
      if (!dragging) {
        if (e.pointerType === 'mouse') {
          Object.assign(pointer, p, { inside: true })
          keyboard = false
          setHover(pick(p.x, p.y, w, h, offset, zoom), p.x, p.y)
          request()
        }
        return
      }
      const now = performance.now()
      const dx = p.x - last.x
      const dy = p.y - last.y
      moved += Math.abs(dx) + Math.abs(dy)
      offset.x -= dx
      offset.y -= dy
      const dt = Math.max(now - last.t, 1)
      velocity.x = (-dx / dt) * 16
      velocity.y = (-dy / dt) * 16
      // Smoothed drag direction, so the last jittery pixel does not decide it.
      last = { ...p, t: now, dx: last.dx * 0.7 + dx * 0.3, dy: last.dy * 0.7 + dy * 0.3 }
      request()
    }
    const up = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (performance.now() - last.t > 80 || reduce) velocity.x = velocity.y = 0
      // The drag's direction becomes the drift's direction.
      const speed = Math.hypot(last.dx, last.dy)
      if (moved >= 6 && speed > 0.5) {
        drift.x = (-last.dx / speed) * DRIFT_SPEED
        drift.y = (-last.dy / speed) * DRIFT_SPEED
      }
      const p = local(e)
      if (moved < 6) {
        const hit = pick(p.x, p.y, w, h, offset, zoom)
        if (hit) onOpenRef.current(hit.project)
      }
      if (e.pointerType === 'mouse') {
        Object.assign(pointer, p, { inside: true })
        setHover(pick(p.x, p.y, w, h, offset, zoom), p.x, p.y)
      }
      request()
    }
    const leave = () => {
      pointer.inside = false
      if (!dragging && !keyboard) setHover(null)
      request()
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      offset.x += e.deltaX
      offset.y += e.deltaY
      refreshHover()
      request()
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const hit = centreHit()
        if (hit) onOpenRef.current(hit.project)
        return
      }
      const step = e.shiftKey ? CELL_W * 2 : CELL_W / 2
      const map: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
      const d = map[e.key]
      if (!d) return
      e.preventDefault()
      keyboard = true
      offset.x += d[0]
      offset.y += d[1]
      refreshHover()
      request()
    }
    // Keyboard focus lights the project Enter will open; pointer focus does not.
    const focus = () => {
      if (dragging || !canvas.matches(':focus-visible')) return
      keyboard = true
      refreshHover()
      request()
    }
    const blur = () => {
      if (!keyboard) return
      keyboard = false
      setHover(null)
      request()
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.addEventListener('pointerleave', leave)
    canvas.addEventListener('wheel', wheel, { passive: false })
    canvas.addEventListener('keydown', key)
    canvas.addEventListener('focus', focus)
    canvas.addEventListener('blur', blur)
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    // Sharper tiles on dense screens when the GPU allows a 4096 atlas.
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
    const atlasSize = maxTexture >= 4096 && (window.devicePixelRatio || 1) >= 1.5 ? 4096 : 2048

    let alive = true
    loadAtlas(atlasSize).then(atlas => {
      if (!alive) return
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      start = performance.now()
      onReady?.()
      request()
    })

    return () => {
      alive = false
      observer.disconnect()
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('wheel', wheel)
      canvas.removeEventListener('keydown', key)
      canvas.removeEventListener('focus', focus)
      canvas.removeEventListener('blur', blur)
    }
  }, [onReady])

  if (failed) {
    return <div className="grid-fallback">{projects.map(p => (
      <button key={p.slug} className="fallback-project" onClick={() => onOpen(p)}>
        <img src={p.images[0]} alt="" loading="lazy" />
        <strong>{p.name}</strong><span>{p.kind}{p.illustrative && ' · exemplo ilustrativo'}</span>
      </button>
    ))}</div>
  }

  return <div className="grid-stage">
    <canvas ref={canvasRef} className="grid-canvas" tabIndex={0} aria-label="Grade de projetos. Arraste ou use as setas para explorar; clique ou aperte Enter para abrir o projeto no centro." />
    <p className="coord coord-left" aria-hidden="true">X <span ref={coordX}>0.00</span></p>
    <p className="coord coord-right" aria-hidden="true">Y <span ref={coordY}>0.00</span></p>
    <div ref={label} className="grid-label" data-show="false" aria-hidden="true"><strong /><span /></div>
  </div>
}
