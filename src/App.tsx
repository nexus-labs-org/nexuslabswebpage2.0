import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import ProjectGrid from './ProjectGrid'
import { projects, type Project } from './projects'

const email = 'ola@nexuslab.com.br'
// Número com DDI + DDD, só dígitos (ex.: 5511999999999). Vazio esconde o botão do WhatsApp.
const whatsapp = ''

// Preencha com as URLs reais; links vazios não são exibidos.
const socials = [
  ['LinkedIn', ''],
  ['Instagram', ''],
].filter(([, href]) => href)

// Colours the header cycles through on hover: green, red, violet, cyan.
const hoverColors = ['#3FBF6B', '#FF3831', '#7A5CFF', '#00E5FF']

const interests = ['Aplicativo mobile', 'Plataforma web', 'Sistema sob medida', 'Ainda não sei']
const tickerItems = ['Arraste para explorar o trabalho', 'Apps, plataformas e sistemas sob medida', 'Para startups e empresas', 'Clique em um projeto para abrir']

type Panel = { type: 'about' } | { type: 'list' } | { type: 'contact' } | { type: 'project'; project: Project } | null

const Mark = () => <span className="mark" aria-hidden="true" />

function Drawer({ side, title, onClose, children }: { side: 'left' | 'right'; title: string; onClose: () => void; children: ReactNode }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [title])
  return <aside className={`drawer drawer-${side}`} aria-labelledby="drawer-title">
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
  const close = useCallback(() => {
    setPanel(null)
    opener.current?.focus?.()
  }, [])
  const openProject = useCallback((project: Project) => open({ type: 'project', project }), [open])
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Header hover: the zone decides which rules and tagline light up; each new hover takes the next colour.
  const [zone, setZone] = useState('')
  const [colorIndex, setColorIndex] = useState(0)
  const lightUp = (next: string) => {
    if (next === zone) return
    setColorIndex(i => (i + 1) % hoverColors.length)
    setZone(next)
  }

  const interest = panel?.type === 'project' ? panel.project.kind : interests[0]
  const [contactInterest, setContactInterest] = useState(interests[0])
  const startProject = (from?: string) => {
    setContactInterest(from && interests.includes(from) ? from : interests[0])
    open({ type: 'contact' })
  }

  return <div className="app" data-ready={ready}>
    <a className="skip" href="#conteudo">Pular para o conteúdo</a>
    <header className="masthead" data-zone={zone} style={{ '--hl': hoverColors[colorIndex] } as CSSProperties} onPointerLeave={() => setZone('')}>
      <nav className="cell-group cell-group-left" aria-label="Seções" onPointerEnter={() => lightUp('left')}>
        <button className="cell cell-link" aria-pressed={panel?.type === 'about'} onClick={() => panel?.type === 'about' ? close() : open({ type: 'about' })}>Sobre</button>
        <button className="cell cell-link" aria-pressed={panel?.type === 'list'} onClick={() => panel?.type === 'list' ? close() : open({ type: 'list' })}>Projetos</button>
      </nav>
      <div className="cell cell-mark" onPointerEnter={() => lightUp('left')}><Mark /></div>
      <div className="cell cell-blank cell-blank-l1" aria-hidden="true" />
      <p className="cell cell-tagline cell-tagline-left"><span>Apps, plataformas e sistemas</span></p>
      <div className="cell cell-blank cell-blank-l3" aria-hidden="true" />
      <h1 className="cell cell-logo" onPointerEnter={() => lightUp('logo')}>
        <span className="logo-mask" aria-hidden="true" />
        <span className="sr-only">NEXUS LABS — estúdio de produtos digitais</span>
      </h1>
      <div className="cell cell-blank cell-blank-r1" aria-hidden="true" />
      <p className="cell cell-tagline cell-tagline-right"><span>Do insight ao produto no ar</span></p>
      <div className="cell cell-blank cell-blank-r3" aria-hidden="true" />
      <nav className="cell-group cell-group-right" aria-label="Contato" onPointerEnter={() => lightUp('right')}>
        {socials.map(([label, href]) => <a key={label} className="cell cell-link" href={href} target="_blank" rel="noopener noreferrer">{label}</a>)}
        <a className="cell cell-link" href={`mailto:${email}`}>E-mail</a>
      </nav>
      <div className="cell cell-cta-wrap" onPointerEnter={() => lightUp('right')}>
        <button className="cell-cta" onClick={() => startProject()}><span>Começar um projeto</span></button>
      </div>
    </header>

    <main id="conteudo" className="stage">
      <ProjectGrid onOpen={openProject} onReady={onReady} />
      <div className="ticker" aria-label="Avisos">
        <div className="ticker-track">{[0, 1].map(copy => <p key={copy} aria-hidden={copy === 1 || undefined}>{tickerItems.map(item => <span key={item}>{item}</span>)}</p>)}</div>
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
        <button onClick={() => setPanel({ type: 'project', project: p })}>
          <img src={p.images[0]} alt="" width="96" height="64" loading="lazy" />
          <span><strong>{p.name}</strong><small>{p.kind}{p.illustrative && ' · exemplo ilustrativo'}</small></span>
        </button>
      </li>)}</ul>
    </Drawer>}

    {panel?.type === 'project' && <Drawer side="right" title={panel.project.name} onClose={close}>
      <p className="project-kind">{panel.project.kind}{panel.project.illustrative && ' · exemplo ilustrativo'}</p>
      <p className="lead">{panel.project.summary}</p>
      <div className="project-gallery">{panel.project.images.map((src, i) => <img key={src} src={src} alt={`${panel.project.name}, tela ${i + 1}`} loading="lazy" width="600" height="400" />)}</div>
      {panel.project.illustrative && <p className="form-note">Projeto e imagens ilustrativos, para mostrar o tipo de trabalho do estúdio.</p>}
      <button className="action" onClick={() => startProject(interest)}>Quero algo assim</button>
    </Drawer>}

    {panel?.type === 'contact' && <Drawer side="right" title="Começar um projeto" onClose={close}>
      <p className="lead">Conte o que você quer construir. A gente responde por e-mail.</p>
      <ContactForm interest={contactInterest} />
    </Drawer>}
  </div>
}
