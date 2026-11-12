import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { projects, type Project } from './projects'

export type TileRect = { x: number; y: number; w: number; h: number }

type Props = {
  project: Project
  // Where the project's six tiles sat on screen in the grid, when it was opened from there.
  from?: TileRect[]
  email: string
  onClose: () => void
  onAbout: () => void
  onStart: (project: Project) => void
  // True once the gallery has scrolled and the full masthead has folded into the pill.
  onCompact: (compact: boolean) => void
}

// Projects grouped by kind for the picker, in the order they first appear.
const groups = projects.reduce<Record<string, Project[]>>((acc, p) => {
  (acc[p.kind] ??= []).push(p)
  return acc
}, {})

const servicesOf = (p: Project) => [p.kind, 'Design de interface', 'Desenvolvimento', ...(p.illustrative ? ['Exemplo ilustrativo'] : [])]

export default function ProjectView({ project, from, email, onClose, onAbout, onStart, onCompact }: Props) {
  // Every project in one continuous scroll, starting with the one that was opened.
  const order = useMemo(() => {
    const i = projects.findIndex(p => p.slug === project.slug)
    return [...projects.slice(i), ...projects.slice(0, i)]
  }, [project])
  const [current, setCurrent] = useState(project)
  const [compact, setCompact] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const picker = useRef<HTMLDivElement>(null)
  const follower = useRef<HTMLDivElement>(null)
  const sections = useRef(new Map<string, HTMLElement>())
  const [hovered, setHovered] = useState<Project | null>(null)

  useEffect(() => { onCompact(compact) }, [compact, onCompact])
  useEffect(() => () => onCompact(false), [onCompact])
  useEffect(() => { scroller.current?.focus({ preventScroll: true }) }, [])

  // The opened project's tiles fly from their place in the grid to their place here.
  useLayoutEffect(() => {
    const first = sections.current.get(project.slug)
    if (!first || !from || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const flights: Animation[] = []
    first.querySelectorAll<HTMLElement>('.pv-gallery > *').forEach((img, i) => {
      const src = from[i]
      if (!src) return
      const r = img.getBoundingClientRect()
      const dx = src.x + src.w / 2 - (r.left + r.width / 2)
      const dy = src.y + src.h / 2 - (r.top + r.height / 2)
      flights.push(img.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${src.w / r.width}, ${src.h / r.height})`, opacity: 0.6, filter: 'brightness(0.8)' },
        { transform: 'none', opacity: 1, filter: 'none' },
      ], { duration: 820, delay: i * 35, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }))
    })
    // A re-run (React's development double-invoke) must measure the tiles at rest, not mid-flight.
    return () => flights.forEach(a => a.cancel())
  }, [project, from])

  // The picker names whichever project fills the middle of the screen.
  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) {
        const p = projects.find(x => x.slug === (e.target as HTMLElement).dataset.slug)
        if (p) setCurrent(p)
      }
    }, { root, rootMargin: '-45% 0px -45% 0px' })
    sections.current.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [order])

  // Project videos play only while on screen, and never under reduced motion.
  useEffect(() => {
    const root = scroller.current
    if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const el = e.target as HTMLVideoElement
        if (e.isIntersecting) el.play().catch(() => {})
        else el.pause()
      }
    }, { root, threshold: 0.3 })
    root.querySelectorAll('video').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [order])

  useEffect(() => {
    if (!pickerOpen) return
    const away = (e: PointerEvent) => { if (!picker.current?.contains(e.target as Node)) setPickerOpen(false) }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setPickerOpen(false) } }
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', key, true)
    return () => { window.removeEventListener('pointerdown', away); window.removeEventListener('keydown', key, true) }
  }, [pickerOpen])

  const jumpTo = useCallback((p: Project) => {
    setPickerOpen(false)
    setCardOpen(false)
    const el = sections.current.get(p.slug)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [])

  // The services pill (and the card, once opened with a click) trails the pointer over a gallery.
  const follow = (e: ReactPointerEvent, p: Project) => {
    if (e.pointerType !== 'mouse') return
    const el = follower.current
    if (!el) return
    if (hovered?.slug !== p.slug) { setHovered(p); setCardOpen(false) }
    const x = Math.min(e.clientX + 18, window.innerWidth - el.offsetWidth - 16)
    const y = Math.min(e.clientY + 18, window.innerHeight - el.offsetHeight - 16)
    el.style.transform = `translate(${x}px, ${y}px)`
  }
  const leave = () => { setHovered(null); setCardOpen(false) }

  return <section className="project-view" aria-label="Projetos" data-compact={compact}>
    <div className="pv-corner pv-corner-left" inert={!compact}>
      <button className="pv-link" onClick={onClose}>Início</button>
      <button className="pv-link" onClick={onAbout}>Sobre</button>
    </div>
    <div className="pv-corner pv-corner-right" inert={!compact}>
      <a className="pv-link" href={`mailto:${email}`}>E-mail</a>
    </div>

    <div className="pv-pill" inert={!compact}>
      <button className="pv-logo" onClick={onClose} aria-label="Voltar para a grade de projetos"><span className="logo-mask" aria-hidden="true" /></button>
      <div className="pv-picker" ref={picker}>
        <button className="pv-picker-button" aria-haspopup="true" aria-expanded={pickerOpen} onClick={() => setPickerOpen(o => !o)}>
          <span>{current.name}</span>
          <span className="pv-chevron" aria-hidden="true" />
        </button>
        {pickerOpen && <div className="pv-menu">
          {Object.entries(groups).map(([kind, list]) => <div key={kind} className="pv-group">
            <p className="pv-group-label">{kind}</p>
            {list.map(p => <button key={p.slug} className="pv-option" aria-current={p.slug === current.slug || undefined} onClick={() => jumpTo(p)}>{p.name}</button>)}
          </div>)}
        </div>}
      </div>
      <button className="pv-cta" onClick={() => onStart(current)}>Começar um projeto</button>
    </div>

    <div className="pv-scroll" ref={scroller} tabIndex={-1} aria-label="Galeria de projetos"
      onScroll={e => setCompact(e.currentTarget.scrollTop > 40)}>
      {order.map(p => <article key={p.slug} className="pv-project" data-slug={p.slug} aria-labelledby={`pv-${p.slug}`}
        ref={el => { if (el) sections.current.set(p.slug, el); else sections.current.delete(p.slug) }}>
        <div className="pv-intro">
          <h2 id={`pv-${p.slug}`}>{p.name}</h2>
          <p>{p.summary}</p>
        </div>
        <div className="pv-gallery" onPointerMove={e => follow(e, p)} onPointerLeave={leave} onClick={() => setCardOpen(o => !o)}>
          {p.images.map((src, i) => i === 5 && p.video
            ? <video key={src} src={p.video} poster={src} muted loop playsInline preload="none" width="600" height="400" aria-label={`${p.name}, demonstração em vídeo`} />
            : <img key={src} src={src} alt={`${p.name}, tela ${i + 1}`} width="600" height="400" loading={p.slug === project.slug ? 'eager' : 'lazy'} />)}
        </div>
      </article>)}
    </div>

    <div className="pv-follow" ref={follower} data-show={!!hovered} aria-hidden="true">
      {hovered && cardOpen && <div className="pv-card">
        <strong>{hovered.name}</strong>
        <p>{hovered.summary}</p>
      </div>}
      {hovered && <div className="pv-services"><div className="pv-services-track">{[0, 1].map(copy => <span key={copy}>{servicesOf(hovered).map(item => <span key={item}>{item}</span>)}</span>)}</div></div>}
    </div>

    <button className="pv-back" onClick={onClose} aria-label="Voltar para a grade de projetos"><span className="mark" aria-hidden="true" /></button>
  </section>
}
