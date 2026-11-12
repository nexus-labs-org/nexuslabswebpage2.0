import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import PaintWord from './PaintWord'
import ProjectGrid from './ProjectGrid'
import ProjectView, { type TileRect } from './ProjectView'
import { projects, type Project } from './projects'

const email = 'ola@nexuslab.com.br'
// Número com DDI + DDD, só dígitos (ex.: 5511999999999). Vazio esconde o botão do WhatsApp.
const whatsapp = ''

// Preencha com as URLs reais; links vazios não são exibidos.
const socials = [
  ['LinkedIn', ''],
  ['Instagram', ''],
].filter(([, href]) => href)

const interests = ['Aplicativo mobile', 'Plataforma web', 'Sistema sob medida', 'Ainda não sei']
const touch = typeof matchMedia === 'function' && matchMedia('(hover: none)').matches
const tickerItems = ['Arraste para explorar o trabalho', 'Apps, plataformas e sistemas sob medida', 'Para startups e empresas', touch ? 'Toque em um projeto para abrir' : 'Clique em um projeto para abrir']

type Panel = { type: 'about' } | { type: 'list' } | { type: 'contact' } | null

const Mark = () => <span className="mark" aria-hidden="true" />

function Drawer({ side, title, onClose, children }: { side: 'left' | 'right'; title: string; onClose: () => void; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [title])
  // A dialog over the page; the masthead stays usable (it toggles the drawers), everything
  // behind the drawer is made inert by App while it is open.
  return <aside className={`drawer drawer-${side}`} role="dialog" aria-labelledby="drawer-title">
    <div className="drawer-bar">
      <button className="drawer-close" onClick={onClose}>Fechar<span aria-hidden="true" className="close-icon" /></button>
    </div>
    <div className="drawer-body">
      <h2 id="drawer-title" ref={heading} tabIndex={-1}>{title}</h2>
      {children}
    </div>
  </aside>
}

function ContactForm({ interest }: { interest: string }) {
  const [choice, setChoice] = useState(interest)
  useEffect(() => setChoice(interest), [interest])
  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const field = (name: string) => String(data.get(name) ?? '').trim()
    const text = [
      `Olá, NEXUS LABS! Sou ${field('nome')}${field('empresa') && ` (${field('empresa')})`}.`,
      `Interesse: ${field('interesse')}`,
      '',
      field('mensagem'),
    ].join('\n')
    const channel = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')
    if (channel === 'whatsapp') window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    else window.location.href = `mailto:${email}?subject=${encodeURIComponent(`Projeto: ${field('interesse')}`)}&body=${encodeURIComponent(text)}`
  }

  return <form className="contact-form" onSubmit={send}>
    <label>Nome<input name="nome" autoComplete="name" required /></label>
    <label><span>Empresa <small>(opcional)</small></span><input name="empresa" autoComplete="organization" /></label>
    <label>O que você quer construir<select name="interesse" value={choice} onChange={event => setChoice(event.target.value)}>
      {interests.map(item => <option key={item}>{item}</option>)}
    </select></label>
    <label>Conte sobre o projeto<textarea name="mensagem" rows={5} required /></label>
    <div className="form-actions">
      {whatsapp && <button className="action" type="submit" value="whatsapp">Enviar pelo WhatsApp</button>}
      <button className={whatsapp ? 'action action-quiet' : 'action'} type="submit" value="email">Enviar por e-mail</button>
    </div>
    <p className="form-note">Abre o seu app de e-mail com a mensagem pronta para {email}.</p>
  </form>
}

export default function App() {
  const [panel, setPanel] = useState<Panel>(null)
  const [ready, setReady] = useState(false)
  const opener = useRef<HTMLElement | null>(null)

  const open = useCallback((next: Panel) => {
    opener.current = document.activeElement as HTMLElement
    setPanel(next)
  }, [])
  const close = useCallback(() => setPanel(null), [])
  // Focus goes back after the render that lifts `inert` from the page, or it would be refused.
  useEffect(() => {
    if (panel || !opener.current) return
    opener.current.focus?.()
    opener.current = null
  }, [panel])
  // An open project fills the screen; Sobre and Contato drawers can still open over it.
  const [viewing, setViewing] = useState<{ project: Project; from?: TileRect[] } | null>(null)
  const [compact, setCompact] = useState(false)
  const viewOpener = useRef<HTMLElement | null>(null)
  const openProject = useCallback((project: Project, from?: TileRect[]) => {
    // Opened from a drawer: the project view takes focus, and closing it returns to the button
    // that opened the drawer (the drawer itself is gone by then).
    viewOpener.current = opener.current ?? document.activeElement as HTMLElement
    opener.current = null
    setPanel(null)
    setViewing({ project, from })
  }, [])
  const closeView = useCallback(() => {
    setViewing(null)
    viewOpener.current?.focus?.()
  }, [])
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (panel) close()
      else if (viewing) closeView()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, closeView, panel, viewing])

  const [contactInterest, setContactInterest] = useState(interests[0])
  const startProject = (from?: string) => {
    setContactInterest(from && interests.includes(from) ? from : interests[0])
    open({ type: 'contact' })
  }

  return <div className="app" data-ready={ready} data-mode={viewing ? 'project' : 'grid'} data-compact={compact}>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="masthead">
      <nav className="cell-group cell-group-left" aria-label="Seções">
        <button className="cell cell-link" aria-pressed={panel?.type === 'about'} onClick={() => panel?.type === 'about' ? close() : open({ type: 'about' })}>Sobre</button>
        <button className="cell cell-link" aria-pressed={panel?.type === 'list'} onClick={() => panel?.type === 'list' ? close() : open({ type: 'list' })}>Projetos</button>
      </nav>
      <div className="cell cell-mark"><Mark /></div>
      <div className="cell cell-blank cell-blank-l1" aria-hidden="true" />
      <p className="cell cell-tagline cell-tagline-left"><PaintWord>Apps, plataformas e sistemas</PaintWord></p>
      <div className="cell cell-blank cell-blank-l3" aria-hidden="true" />
      <h1 className="cell cell-logo">
        <PaintWord logo />
        <span className="sr-only">NEXUS LABS — estúdio de produtos digitais</span>
      </h1>
      <div className="cell cell-blank cell-blank-r1" aria-hidden="true" />
      <p className="cell cell-tagline cell-tagline-right"><PaintWord>Do insight ao produto no ar</PaintWord></p>
      <div className="cell cell-blank cell-blank-r3" aria-hidden="true" />
      <nav className="cell-group cell-group-right" aria-label="Contato">
        {socials.map(([label, href]) => <a key={label} className="cell cell-link" href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}
        <a className="cell cell-link" href={`mailto:${email}`}>E-mail</a>
      </nav>
      <div className="cell cell-cta-wrap">
        <button className="cell-cta" onClick={() => startProject()}><span>Começar um projeto</span></button>
      </div>
    </header>

    <main id="conteudo" className="stage" inert={!!panel}>
      <ProjectGrid onOpen={openProject} onReady={onReady} paused={!!viewing} />
      <div className="ticker" aria-label="Avisos">
        <div className="ticker-viewport"><div className="ticker-track">{[0, 1].map(copy => <p key={copy} aria-hidden={copy === 1 || undefined}>{tickerItems.map(item => <span key={item}>{item}</span>)}</p>)}</div></div>
      </div>
    </main>

    {panel?.type === 'about' && <Drawer side="left" title="Somos a NEXUS LABS" onClose={close}>
      <p className="lead">Somos um estúdio de produtos digitais. Desenhamos e construímos aplicativos, plataformas web e sistemas sob medida, para startups e para empresas que estão criando algo novo.</p>
      <p>Esta página mostra o trabalho como ele acontece no estúdio: muitas frentes ao mesmo tempo. Arraste a grade para explorar e clique em um projeto para abrir.</p>
      <h3>O que construímos</h3>
      <ul className="service-list">
        <li>Aplicativos mobile</li>
        <li>Plataformas web</li>
        <li>Sistemas sob medida</li>
      </ul>
      <h3>Fale com a gente</h3>
      <p><a className="text-link" href={`mailto:${email}`}>{email}</a></p>
      <button className="action" onClick={() => startProject()}>Começar um projeto</button>
    </Drawer>}

    {panel?.type === 'list' && <Drawer side="left" title="Projetos" onClose={close}>
      <ul className="project-list">{projects.map(p => <li key={p.slug}>
        <button onClick={() => openProject(p)}>
          <img src={p.images[0]} alt="" width="96" height="64" loading="lazy" />
          <span><strong>{p.name}</strong><small>{p.kind}{p.illustrative && ' · exemplo ilustrativo'}</small></span>
        </button>
      </li>)}</ul>
    </Drawer>}

    {viewing && <div className="view-layer" inert={!!panel}>
      <ProjectView key={viewing.project.slug} project={viewing.project} from={viewing.from} email={email}
        onClose={closeView} onAbout={() => open({ type: 'about' })} onStart={p => startProject(p.kind)} onCompact={setCompact} />
    </div>}

    {panel?.type === 'contact' && <Drawer side="right" title="Começar um projeto" onClose={close}>
      <p className="lead">Conte o que você quer construir. A gente responde por e-mail.</p>
      <ContactForm interest={contactInterest} />
    </Drawer>}
  </div>
}
