import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { projects } from './projects'

const baseUrl = import.meta.env.BASE_URL

// Title followed by the production company in grey, like the masthead.
function ProjectName({ project }) {
  return project.company ? (
    <>
      {project.title}, <span className="project-company">{project.company}</span>
    </>
  ) : (
    project.title
  )
}

// Time between one tile starting to fade in and the next.
const REVEAL_STEP_MS = 450

function ProjectTile({ project, visible, onLoad }) {
  const content = (
    <>
      <div className="project-media">
        <img src={project.image} alt={project.alt} loading="lazy" onLoad={onLoad} onError={onLoad} />
      </div>
      <div className="project-caption">
        <h3>
          <ProjectName project={project} />
        </h3>
        {project.director && <span className="project-director">Dir: {project.director}</span>}
      </div>
    </>
  )

  return (
    <article className={visible ? 'project is-visible' : 'project'}>
      {project.slug ? (
        <a className="project-link" href={`?project=${project.slug}`}>
          {content}
        </a>
      ) : (
        content
      )}
    </article>
  )
}

function Chevron({ direction }) {
  return (
    <svg viewBox="0 0 14 28" width="14" height="28" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M13 1 1 14l12 13' : 'M1 1l12 13L1 27'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

function StillsLightbox({ stills, index, onStep, onClose }) {
  const dialogRef = useRef(null)
  const still = stills[index]

  useEffect(() => {
    dialogRef.current.showModal()
  }, [])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'ArrowLeft') onStep(-1)
      if (event.key === 'ArrowRight') onStep(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onStep])

  return (
    // Clicking the backdrop (the dialog itself, not its contents) closes it; Esc is handled natively.
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Enlarged still"
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && dialogRef.current.close()}
    >
      <img src={still.image} alt={still.alt} />
      <div className="lightbox-controls">
        {still.label && <span className="lightbox-label">{still.label}</span>}
        {stills.length > 1 && (
          <>
            <button type="button" onClick={() => onStep(-1)}>Previous</button>
            <span>{index + 1} / {stills.length}</span>
            <button type="button" onClick={() => onStep(1)}>Next</button>
          </>
        )}
        <button type="button" onClick={() => dialogRef.current.close()}>Close</button>
      </div>
    </dialog>
  )
}

const STILLS_PER_ROW = 3

// Splits stills into rows of three. A short last row is padded with empty space so its stills
// stay the same size as the rows above instead of stretching across the page.
function stillRows(stills) {
  const rows = []
  for (let start = 0; start < stills.length; start += STILLS_PER_ROW) {
    rows.push(stills.slice(start, start + STILLS_PER_ROW))
  }
  return rows
}

const aspect = (still) => still.width / still.height

function StillButton({ still, onOpen, className = 'project-still', style }) {
  return (
    <button type="button" className={className} style={style} onClick={onOpen} aria-label={`Enlarge: ${still.alt}`}>
      <img src={still.image} alt="" width={still.width} height={still.height} loading="lazy" />
      {still.label && <span className="project-still-label">{still.label}</span>}
    </button>
  )
}

function ProjectPage({ project }) {
  const [openStill, setOpenStill] = useState(null)
  const stepStill = useCallback(
    (step) =>
      setOpenStill((index) => (index + step + project.stills.length) % project.stills.length),
    [project.stills.length],
  )

  // Arrows cycle through the other projects in the same category, wrapping at either end.
  const siblings = projects.filter((item) => item.category === project.category)
  const position = siblings.indexOf(project)
  const previous = siblings[(position - 1 + siblings.length) % siblings.length]
  const next = siblings[(position + 1) % siblings.length]

  // Videos are on John's Vimeo, or YouTube or the BBC's own player where he has no Vimeo copy.
  const videoUrl = project.vimeoId
    ? `https://player.vimeo.com/video/${project.vimeoId}?dnt=1&title=0&byline=0&portrait=0`
    : project.youtubeId
      ? `https://www.youtube-nocookie.com/embed/${project.youtubeId}?rel=0`
      : project.bbcClipId && `https://www.bbc.co.uk/programmes/${project.bbcClipId}/player`

  // Without a video, the first still leads the page at full width.
  const heroStill = videoUrl ? null : project.stills[0]
  const gridOffset = heroStill ? 1 : 0
  const rows = stillRows(project.stills.slice(gridOffset))

  return (
    <article className="project-page">
      <header className="project-page-header">
        <h1>
          <ProjectName project={project} />
        </h1>
        {project.director && <span>Dir: {project.director}</span>}
      </header>

      <div className="project-video-row">
        {heroStill ? (
          <StillButton still={heroStill} className="project-still project-hero" onOpen={() => setOpenStill(0)} />
        ) : (
          <div className="project-video">
            <iframe
              src={videoUrl}
              title={project.title}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <a
          className="project-arrow project-arrow-previous"
          href={`?project=${previous.slug}`}
          aria-label={`Previous project: ${previous.title}`}
        >
          <Chevron direction="left" />
        </a>
        <a className="project-arrow project-arrow-next" href={`?project=${next.slug}`} aria-label={`Next project: ${next.title}`}>
          <Chevron direction="right" />
        </a>
      </div>

      {rows.length > 0 && (
        <div className="project-stills">
          {rows.map((row, rowIndex) => {
            const meanAspect = row.reduce((sum, still) => sum + aspect(still), 0) / row.length
            return (
              <div key={row[0].image} className="project-stills-row">
                {/* Each still grows in proportion to its aspect ratio, so the row shares one height. */}
                {row.map((still, index) => (
                  <StillButton
                    key={still.image}
                    still={still}
                    style={{ flexGrow: aspect(still) }}
                    onOpen={() => setOpenStill(gridOffset + rowIndex * STILLS_PER_ROW + index)}
                  />
                ))}
                {row.length < STILLS_PER_ROW && rows.length > 1 && (
                  <span
                    className="project-stills-spacer"
                    style={{ flexGrow: meanAspect * (STILLS_PER_ROW - row.length) }}
                    aria-hidden="true"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {openStill !== null && (
        <StillsLightbox
          stills={project.stills}
          index={openStill}
          onStep={stepStill}
          onClose={() => setOpenStill(null)}
        />
      )}
    </article>
  )
}

function ProjectGrid({ items, label }) {
  const [loaded, setLoaded] = useState(() => items.map(() => false))
  const [visibleCount, setVisibleCount] = useState(0)
  const nextIsLoaded = loaded[visibleCount]

  // Reveal tiles strictly in order, one at a time, each once its image has loaded.
  useEffect(() => {
    if (!nextIsLoaded) return
    const timer = setTimeout(
      () => setVisibleCount((count) => count + 1),
      visibleCount === 0 ? 0 : REVEAL_STEP_MS,
    )
    return () => clearTimeout(timer)
  }, [nextIsLoaded, visibleCount])

  const markLoaded = (index) =>
    setLoaded((current) => current.map((value, i) => value || i === index))

  return (
    <div className="project-grid" aria-label={label}>
      {items.map((project, index) => (
        <ProjectTile
          key={project.title}
          project={project}
          visible={index < visibleCount}
          onLoad={() => markLoaded(index)}
        />
      ))}
    </div>
  )
}

function HomeImage() {
  const [loaded, setLoaded] = useState(false)

  return (
    <figure className={loaded ? 'home-image is-visible' : 'home-image'}>
      <img
        src={`${baseUrl}work/carlsberg-climbers-hut.jpg`}
        alt="Carlsberg: a weathered timber climbers’ hut with a smoking chimney beneath a rocky mountainside in New Zealand"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </figure>
  )
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const currentProject = projects.find(
    (project) => project.slug && project.slug === params.get('project'),
  )
  const pageDetails = {
    commercial: {
      title: 'Commercial',
      projects: projects.filter((project) => project.category === 'Commercial'),
    },
    'film-tv': {
      title: 'Film & TV',
      projects: projects.filter((project) => project.category === 'Film & TV'),
    },
  }
  // A project page highlights its category in the nav.
  const currentPage = currentProject
    ? Object.keys(pageDetails).find((key) => pageDetails[key].title === currentProject.category)
    : params.get('page') || 'home'
  const currentView = pageDetails[currentPage]

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href={baseUrl} aria-label="John Ebden, home">
          <span>John Ebden,</span>
          <span className="brand-role">Production Designer</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="?page=commercial" aria-current={currentPage === 'commercial' ? 'page' : undefined}>
            Commercial
          </a>
          <a href="?page=film-tv" aria-current={currentPage === 'film-tv' ? 'page' : undefined}>
            Film &amp; TV
          </a>
          <a href="?page=info" aria-current={currentPage === 'info' ? 'page' : undefined}>
            Info
          </a>
        </nav>
      </header>

      <main id="top" className="page-content">
        {currentProject ? (
          <ProjectPage project={currentProject} />
        ) : currentPage === 'home' ? (
          <HomeImage />
        ) : currentView ? (
          <section className="section">
            <h1 className="visually-hidden">{currentView.title}</h1>
            <ProjectGrid items={currentView.projects} label={`${currentView.title} projects`} />
          </section>
        ) : (
          <section className="info-page">
            <h1 className="section-title">Info</h1>
            <div className="info-content">
              <p className="info-bio">
                John Ebden is a production designer whose work spans commercials, television,
                feature and short films. He has collaborated with leading directors including
                Peter Richardson, Aki Kaurismäki, Daniel Kleinman, Gary Freedman, Sara Dunlop
                and Aidan Zamiri, among others.
              </p>

              <div className="agent-list">
                <section className="agent-entry">
                  <h2 className="section-title">Agent</h2>
                  <address>
                    Andrew Naylor<br />
                    <a href="mailto:anaylor@unitedagents.co.uk">anaylor@unitedagents.co.uk</a><br />
                    <a href="tel:+442032140899">+44 (0) 203 214 0899</a>
                  </address>
                </section>

                <section className="agent-entry">
                  <h2 className="section-title">Associate Agent</h2>
                  <address>
                    Lizzie Quinn<br />
                    <a href="mailto:lquinn@unitedagents.co.uk">lquinn@unitedagents.co.uk</a><br />
                    <a href="tel:+442032140864">+44 (0) 20 3214 0864</a>
                  </address>
                </section>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} John Ebden</span>
      </footer>
    </div>
  )
}

export default App
