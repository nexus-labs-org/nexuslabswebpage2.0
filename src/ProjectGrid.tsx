import { useEffect, useRef, useState } from 'react'
import { projects, type Project } from './projects'
import type { TileRect } from './ProjectView'

// World layout, measured from the reference: a project cluster is 4 x 2 cells (a wide tile and
// two single tiles on top, two single tiles and a wide tile below) inside a 6 x 4 period, so
// clusters are two cells apart sideways and two rows apart vertically. Shader and picking share
// these numbers.
const CELL_W = 176
const CELL_H = 160
const PERIOD_X = 6
const PERIOD_Y = 4
// The world is a plane seen from above at an angle: rows shrink toward the top (TILT) and the
// far rows bow down at the sides (DOME), like the surface of a planet.
const TILT = 0.21
const DOME = 0.02
// A cell at the centre of the screen is this fraction of half the stage height wide.
const CELL_SCREEN = 0.322
// Pointer trail: recent pointer positions light the nearby rules and fade out.
const TRAIL = 24
const TRAIL_MS = 650
// Atlas: 8 x 12 slots, one per project image; each image sits inside a gutter
// filled with its own stretched edges so mipmaps never bleed a neighbour in.
const ATLAS_COLS = 8
const ATLAS_ROWS = 12
const GUTTER = 0.04
const IMAGE_ASPECT = 1.5
// Video atlas: one 480 x 320 slot per project, 4 x 3, filled with posters until frames arrive.
const VIDEO_COLS = 4
const VIDEO_ROWS = 3
const VIDEO_W = 480
const VIDEO_H = 320

// Accent the rules glow with; it changes each time the pointer reaches a new project.
const ACCENTS: [number, number, number][] = [
  [1, 0.22, 0.19],
  [0.231, 0.357, 1],
  [0.478, 0.361, 1],
  [0.247, 0.749, 0.42],
]

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
uniform float uReveal;
uniform vec2 uHover;
uniform float uFrame;
uniform sampler2D uAtlas;
uniform float uCount;
uniform vec3 uTrail[${TRAIL}];
uniform vec3 uAccent;
uniform sampler2D uVideo;
uniform float uVideoOn;
const vec2 CELL = vec2(${CELL_W}.0, ${CELL_H}.0);
const vec2 GRID = vec2(${ATLAS_COLS}.0, ${ATLAS_ROWS}.0);
const float GUTTER = ${GUTTER};

void main() {
  // p: screen position in units of half the stage height, y up.
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  float py = p.y + ${DOME} * p.x * p.x * (p.y + 1.0);
  float s = 1.0 / (1.0 - py * ${TILT});
  vec2 world = vec2(p.x * s, -py * s) * 0.5 * uRes.y / uDpr * uZoom + uOffset;
  vec2 g = world / CELL;
  vec2 aa = fwidth(g);
  vec2 cell = floor(g);
  vec2 local = fract(g);

  vec3 ground = vec3(0.094, 0.086, 0.086);
  vec3 col = ground;
  float mask = 0.0;

  float cx = floor(cell.x / ${PERIOD_X}.0);
  float cy = floor(cell.y / ${PERIOD_Y}.0);
  float lx = cell.x - cx * ${PERIOD_X}.0;
  float ly = cell.y - cy * ${PERIOD_Y}.0;

  if (lx < 4.0 && ly < 2.0) {
    // Which of the cluster's six tiles this cell belongs to, where it starts and how wide it is.
    float slotIndex = 0.0;
    float start = 0.0;
    float span = 2.0;
    if (ly < 1.0) {
      if (lx >= 2.0) { slotIndex = lx - 1.0; start = lx; span = 1.0; }
    } else {
      if (lx < 2.0) { slotIndex = 3.0 + lx; start = lx; span = 1.0; }
      else { slotIndex = 5.0; start = 2.0; span = 2.0; }
    }
    vec2 tuv = vec2((lx - start + local.x) / span, local.y);
    // Cover-crop the image to the tile's shape.
    float aspect = span * CELL.x / CELL.y;
    vec2 crop = vec2(min(aspect / ${IMAGE_ASPECT}, 1.0), min(${IMAGE_ASPECT} / aspect, 1.0));
    tuv = 0.5 + (tuv - 0.5) * crop;

    float idx = mod(cx + cy * 5.0, uCount);
    float tile = idx * 6.0 + slotIndex;
    vec2 slot = vec2(mod(tile, GRID.x), floor(tile / GRID.x));
    vec2 uv = (slot + GUTTER + tuv * (1.0 - 2.0 * GUTTER)) / GRID;
    vec2 k = vec2(crop.x / span, crop.y) * (1.0 - 2.0 * GUTTER) / GRID;
    ${grad ? 'vec3 img = texture2DGradEXT(uAtlas, uv, dFdx(g) * k, dFdy(g) * k).rgb;' : 'vec3 img = texture2D(uAtlas, uv).rgb;'}
    if (uVideoOn > 0.5 && slotIndex > 4.5) {
      vec2 vgrid = vec2(${VIDEO_COLS}.0, ${VIDEO_ROWS}.0);
      vec2 vslot = vec2(mod(idx, vgrid.x), floor(idx / vgrid.x));
      vec2 texel = 0.5 / vec2(${VIDEO_W}.0, ${VIDEO_H}.0);
      img = texture2D(uVideo, (vslot + clamp(tuv, texel, 1.0 - texel)) / vgrid).rgb;
    }

    // Soft cluster edge; the keyboard's target gets a frame.
    vec2 f = vec2(lx, ly) + local;
    vec2 edge = min(f, vec2(4.0, 2.0) - f) / aa;
    mask = clamp(min(edge.x, edge.y), 0.0, 1.0);
    col = mix(ground, img, uReveal * mask);
    if (uFrame > 0.5 && abs(cx - uHover.x) < 0.5 && abs(cy - uHover.y) < 0.5) {
      float frame = 1.0 - smoothstep(1.0, 2.2, min(edge.x, edge.y));
      col = mix(col, uAccent, frame * mask);
    }
  }

  // Rules run between the clusters, not across the images.
  vec2 line = abs(fract(g - 0.5) - 0.5) / aa;
  float l = (1.0 - min(min(line.x, line.y), 1.0)) * (1.0 - mask);
  col = mix(col, vec3(1.0, 0.992, 0.859), l * 0.16);

  // Rules near the pointer and along its recent path take the accent colour.
  float glow = 0.0;
  for (int i = 0; i < ${TRAIL}; i++) {
    vec2 d = (world - uTrail[i].xy) / (CELL * vec2(1.5, 1.15));
    glow = max(glow, uTrail[i].z * exp(-dot(d, d)));
  }
  col = mix(col, uAccent, l * glow);

  // The far rows fade into the ground; the sides darken a little.
  float fade = smoothstep(1.04, 0.72, py) * (1.0 - 0.3 * smoothstep(1.3, 2.6, abs(p.x)));
  col = mix(ground, col, fade);
  gl_FragColor = vec4(col, 1.0);
}
`

type Hit = { cx: number; cy: number; project: Project }

// Same mapping as the shader, with screen y running down.
function toWorld(sx: number, sy: number, w: number, h: number, offset: { x: number; y: number }, zoom: number) {
  const px = (sx - w / 2) / (h / 2)
  const up = -(sy - h / 2) / (h / 2)
  const py = up + DOME * px * px * (up + 1)
  const s = 1 / (1 - py * TILT)
  return { wx: px * s * (h / 2) * zoom + offset.x, wy: -py * s * (h / 2) * zoom + offset.y }
}

function pick(sx: number, sy: number, w: number, h: number, offset: { x: number; y: number }, zoom: number): Hit | null {
  const { wx, wy } = toWorld(sx, sy, w, h, offset, zoom)
  const cellX = Math.floor(wx / CELL_W)
  const cellY = Math.floor(wy / CELL_H)
  const cx = Math.floor(cellX / PERIOD_X)
  const cy = Math.floor(cellY / PERIOD_Y)
  const lx = cellX - cx * PERIOD_X
  const ly = cellY - cy * PERIOD_Y
  if (lx >= 4 || ly >= 2) return null
  const n = projects.length
  const idx = (((cx + cy * 5) % n) + n) % n
  return { cx, cy, project: projects[idx] }
}

// Inverse of toWorld (ignoring the small dome term): where a world point lands on screen.
function toScreen(wx: number, wy: number, w: number, h: number, offset: { x: number; y: number }, zoom: number) {
  const a = (wy - offset.y) / ((h / 2) * zoom)
  const py = -a / (1 - a * TILT)
  const s = 1 / (1 - py * TILT)
  const px = (wx - offset.x) / ((h / 2) * zoom * s)
  return { x: px * (h / 2) + w / 2, y: h / 2 - py * (h / 2) }
}

// The six tiles of a cluster, in image order: [x, y, width] in cells.
const TILES = [[0, 0, 2], [2, 0, 1], [3, 0, 1], [0, 1, 1], [1, 1, 1], [2, 1, 2]]

function tileRects(hit: Hit, w: number, h: number, offset: { x: number; y: number }, zoom: number, left: number, top: number): TileRect[] {
  const x0 = hit.cx * PERIOD_X * CELL_W
  const y0 = hit.cy * PERIOD_Y * CELL_H
  return TILES.map(([tx, ty, tw]) => {
    const corners = [[tx, ty], [tx + tw, ty], [tx, ty + 1], [tx + tw, ty + 1]].map(([cx, cy]) => toScreen(x0 + cx * CELL_W, y0 + cy * CELL_H, w, h, offset, zoom))
    const xs = corners.map(c => c.x)
    const ys = corners.map(c => c.y)
    const x = Math.min(...xs)
    const y = Math.min(...ys)
    return { x: x + left, y: y + top, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
  })
}

// The grid draws every image small, so it reads the thumbnails in public/projects/grid/
// (made by `npm run thumbs`) and falls back to the full image when a thumbnail is missing.
const thumbOf = (src: string) => src.replace(/^\/projects\//, '/projects/grid/')

// Draws each image into the atlas as it arrives and reports progress, so the grid can show
// the work before the last image has loaded.
function loadAtlas(size: number, onProgress: (canvas: HTMLCanvasElement, loaded: number, total: number) => void): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#181616'
  ctx.fillRect(0, 0, size, size)
  const slotW = size / ATLAS_COLS
  const slotH = size / ATLAS_ROWS
  const sources = projects.flatMap(p => p.images.slice(0, 6))
  let loaded = 0
  const done = (resolve: () => void) => {
    loaded++
    onProgress(canvas, loaded, sources.length)
    resolve()
  }
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
      done(resolve)
    }
    img.onerror = () => {
      if (img.src.includes('/projects/grid/')) img.src = src
      else done(resolve)
    }
    img.src = thumbOf(src)
  }))).then(() => canvas)
}

type Props = {
  onOpen: (project: Project, from?: TileRect[]) => void
  onReady?: () => void
  // While a project fills the screen the grid stops drawing.
  paused?: boolean
}

export default function ProjectGrid({ onOpen, onReady, paused = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coordX = useRef<HTMLSpanElement>(null)
  const coordY = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const onOpenRef = useRef(onOpen)
  onOpenRef.current = onOpen
  const pausedRef = useRef(paused)
  const resumeRef = useRef<() => void>(() => {})
  const pauseRef = useRef<() => void>(() => {})
  useEffect(() => {
    pausedRef.current = paused
    if (paused) pauseRef.current()
    else resumeRef.current()
  }, [paused])
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
    const phone = matchMedia('(max-width: 760px), (hover: none)').matches
    const saveData = !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    // Touch screens have no hover, so the grid names the project at its centre instead.
    const touch = matchMedia('(hover: none)').matches

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
    const uRes = u('uRes'), uOffset = u('uOffset'), uDpr = u('uDpr'), uZoom = u('uZoom')
    const uReveal = u('uReveal'), uHover = u('uHover'), uFrame = u('uFrame'), uCount = u('uCount')
    const uTrail = u('uTrail'), uAccent = u('uAccent'), uVideo = u('uVideo'), uVideoOn = u('uVideoOn')
    gl.uniform1i(u('uAtlas'), 0)
    gl.uniform1i(uVideo, 1)
    gl.uniform1f(uVideoOn, 0)
    gl.uniform1f(uCount, projects.length)
    let accent = 0
    gl.uniform3f(uAccent, ...ACCENTS[accent])
    const trail: { x: number; y: number; t: number }[] = []
    const trailData = new Float32Array(TRAIL * 3)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([24, 22, 22, 255]))

    // Start between two rows of clusters, with one cluster centred above and one below.
    const offset = { x: CELL_W * 2, y: CELL_H * 3 }
    const velocity = { x: 0, y: 0 }
    const DRIFT_SPEED = 0.45
    const drift = { x: DRIFT_SPEED * 0.92, y: DRIFT_SPEED * 0.39 }
    // Scale follows the stage height; phones see more of the territory so a cluster fits.
    const baseZoom = () => (CELL_W / ((CELL_SCREEN * Math.max(canvas.clientHeight, 1)) / 2)) * (canvas.clientWidth < 700 ? 1.5 : 1)
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

    // The cluster whose middle is closest to the centre of the screen, even when the centre
    // falls in the gap between clusters, so the touch label never blinks off while drifting.
    const nearestHit = (): Hit => {
      const { wx, wy } = toWorld(w / 2, h / 2, w, h, offset, zoom)
      const cx = Math.round((wx / CELL_W - 2) / PERIOD_X)
      const cy = Math.round((wy / CELL_H - 1) / PERIOD_Y)
      const n = projects.length
      return { cx, cy, project: projects[(((cx + cy * 5) % n) + n) % n] }
    }

    // The label names the keyboard's target, or on touch screens the project at the centre;
    // mouse hover is shown by the rules alone.
    const showLabel = (next: Hit | null, x: number, y: number) => {
      const el = label.current
      if (!el) return
      el.dataset.show = next && !dragging && (keyboard || touch) ? 'true' : 'false'
      if (!next) return
      el.querySelector('strong')!.textContent = next.project.name
      el.querySelector('span')!.textContent = `${next.project.kind}${next.project.illustrative ? ' · exemplo ilustrativo' : ''}`
      // On touch it sits centred just above the ticker, in reach of the thumb and off the work.
      if (touch && !keyboard) {
        const ticker = canvas.closest('.stage')?.querySelector<HTMLElement>('.ticker')
        const top = ticker ? ticker.offsetTop - el.offsetHeight - 10 : h - el.offsetHeight - 96
        el.style.transform = `translate(${Math.round((w - el.offsetWidth) / 2)}px, ${Math.round(top)}px)`
      } else el.style.transform = `translate(${Math.min(x + 18, w - 260)}px, ${y + 18}px)`
    }

    const setHover = (next: Hit | null, x = 0, y = 0) => {
      const changed = next?.cx !== hover?.cx || next?.cy !== hover?.cy
      if (changed && next) {
        accent = (accent + 1) % ACCENTS.length
        gl.uniform3f(uAccent, ...ACCENTS[accent])
      }
      hover = next
      canvas.style.cursor = dragging ? 'grabbing' : next ? 'pointer' : 'grab'
      showLabel(next, x, y)
      return changed
    }

    // Recompute what the highlight should be after the territory moved under a still pointer.
    const refreshHover = () => {
      if (dragging) return false
      // The keyboard target is named at the top of the stage, clear of the clusters.
      if (keyboard) return setHover(centreHit(), w / 2 - 158, 0)
      if (pointer.inside) return setHover(pick(pointer.x, pointer.y, w, h, offset, zoom), pointer.x, pointer.y)
      if (touch) return setHover(nearestHit())
      return false
    }

    const draw = () => {
      frame = 0
      if (pausedRef.current) return
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
      // Slot 0 is the pointer itself; the rest are its recent path, fading out.
      const now = performance.now()
      trailData.fill(0)
      if (pointer.inside && !keyboard && !dragging) {
        const pw = toWorld(pointer.x, pointer.y, w, h, offset, zoom)
        trailData.set([pw.wx, pw.wy, 1], 0)
      }
      while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift()
      trail.slice(-(TRAIL - 1)).forEach((pt, i) => {
        const z = Math.pow(1 - (now - pt.t) / TRAIL_MS, 2)
        trailData.set([pt.x, pt.y, z], (i + 1) * 3)
      })
      if (trail.length) busy = true
      gl.uniform3fv(uTrail, trailData)
      uploadVideos()
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uOffset, offset.x, offset.y)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uZoom, zoom)
      gl.uniform1f(uReveal, reveal)
      gl.uniform2f(uHover, hover?.cx ?? 0, hover?.cy ?? 0)
      gl.uniform1f(uFrame, hover && (keyboard || (touch && !dragging)) ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (coordX.current) coordX.current.textContent = (offset.x / CELL_W).toFixed(6)
      if (coordY.current) coordY.current.textContent = (-offset.y / CELL_H).toFixed(6)
      if (busy) request()
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(draw) }
    let uploadVideos = () => {}
    let setVideosPlaying = (_on: boolean) => {}
    resumeRef.current = () => { setVideosPlaying(true); request() }
    pauseRef.current = () => setVideosPlaying(false)
    const openHit = (hit: Hit) => {
      const r = canvas.getBoundingClientRect()
      onOpenRef.current(hit.project, tileRects(hit, w, h, offset, zoom, r.left, r.top))
    }

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
      trail.length = 0
      setHover(null)
      request()
    }
    const move = (e: PointerEvent) => {
      const p = local(e)
      if (!dragging) {
        if (e.pointerType === 'mouse') {
          Object.assign(pointer, p, { inside: true })
          keyboard = false
          const pw = toWorld(p.x, p.y, w, h, offset, zoom)
          const lastPt = trail[trail.length - 1]
          if (!lastPt || Math.hypot(pw.wx - lastPt.x, pw.wy - lastPt.y) > CELL_W * 0.35) trail.push({ x: pw.wx, y: pw.wy, t: performance.now() })
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
        if (hit) openHit(hit)
      }
      if (e.pointerType === 'mouse') {
        Object.assign(pointer, p, { inside: true })
        setHover(pick(p.x, p.y, w, h, offset, zoom), p.x, p.y)
      } else refreshHover()
      request()
    }
    const leave = () => {
      pointer.inside = false
      if (!dragging && !keyboard && !touch) setHover(null)
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
        if (hit) openHit(hit)
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

    // Sharper tiles on dense screens when the GPU allows a 4096 atlas. Phones keep 2048: the
    // tiles are small there and a 4096 texture costs 64 MB of GPU memory.
    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
    const atlasSize = !phone && maxTexture >= 4096 && (window.devicePixelRatio || 1) >= 1.5 ? 4096 : 2048

    // Moving tiles: small looping videos uploaded into their slots as frames arrive.
    // Under reduced motion they never start and the poster stays in the main atlas.
    const videoTexture = gl.createTexture()
    const videos: { el: HTMLVideoElement; x: number; y: number; last: number }[] = []
    const startVideos = () => {
      const posters = document.createElement('canvas')
      posters.width = VIDEO_COLS * VIDEO_W
      posters.height = VIDEO_ROWS * VIDEO_H
      const pctx = posters.getContext('2d')!
      pctx.fillStyle = '#181616'
      pctx.fillRect(0, 0, posters.width, posters.height)
      const loads = projects.map((p, i) => new Promise<void>(resolve => {
        const x = (i % VIDEO_COLS) * VIDEO_W
        const y = Math.floor(i / VIDEO_COLS) * VIDEO_H
        const poster = new Image()
        poster.onload = () => { pctx.drawImage(poster, x, y, VIDEO_W, VIDEO_H); resolve() }
        poster.onerror = () => resolve()
        poster.src = p.images[5]
        if (!p.videoSmall) return
        const el = document.createElement('video')
        el.muted = true
        el.loop = true
        el.playsInline = true
        el.preload = 'auto'
        el.src = p.videoSmall
        el.play().catch(() => {})
        videos.push({ el, x, y, last: -1 })
      }))
      Promise.all(loads).then(() => {
        if (!alive) return
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, videoTexture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posters)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.activeTexture(gl.TEXTURE0)
        gl.uniform1f(uVideoOn, 1)
        request()
      })
    }
    uploadVideos = () => {
      if (!videos.length) return
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, videoTexture)
      for (const v of videos) {
        if (v.el.readyState < 2 || v.el.videoWidth !== VIDEO_W || v.el.currentTime === v.last) continue
        v.last = v.el.currentTime
        gl.texSubImage2D(gl.TEXTURE_2D, 0, v.x, v.y, gl.RGBA, gl.UNSIGNED_BYTE, v.el)
      }
      gl.activeTexture(gl.TEXTURE0)
    }
    setVideosPlaying = (on: boolean) => videos.forEach(v => { if (on) v.el.play().catch(() => {}); else v.el.pause() })
    // Phones and data-saver connections keep the still posters: twelve looping videos are
    // several megabytes and a steady decode load for a grid seen at thumbnail size.
    if (!reduce && !phone && !saveData) startVideos()

    let alive = true
    let shown = false
    let lastUpload = 0
    const upload = (atlas: HTMLCanvasElement) => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      lastUpload = performance.now()
      if (!shown) {
        shown = true
        start = performance.now()
        onReady?.()
      }
      refreshHover()
      request()
    }
    // The grid appears once a first share of the images is in, then fills in as the rest
    // arrive (uploads are spaced out so a slow connection does not re-upload on every image).
    loadAtlas(atlasSize, (atlas, loaded, total) => {
      if (!alive || loaded === total) return
      const now = performance.now()
      if (shown ? now - lastUpload > 400 : loaded >= Math.ceil(total / 3)) upload(atlas)
    }).then(atlas => { if (alive) upload(atlas) })

    return () => {
      alive = false
      videos.forEach(v => { v.el.pause(); v.el.removeAttribute('src'); v.el.load() })
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
    <p className="coord coord-left" aria-hidden="true"><span ref={coordX}>0.000000</span></p>
    <p className="coord coord-right" aria-hidden="true"><span ref={coordY}>0.000000</span></p>
    <div ref={label} className="grid-label" data-show="false" aria-hidden="true"><strong /><span /></div>
  </div>
}
