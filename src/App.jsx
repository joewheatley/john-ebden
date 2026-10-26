import { useEffect, useState } from 'react'
import './App.css'

const baseUrl = import.meta.env.BASE_URL

const projects = [
  {
    title: 'Sky: Pause and Carry On',
    category: 'Commercial',
    image: `${baseUrl}work/sky-pause-carry-on-frame.jpg`,
    alt: 'A dusk-lit apartment living room with floor-to-ceiling windows onto the city',
  },
  {
    title: 'Ancestry',
    category: 'Commercial',
    image: `${baseUrl}work/ancestry-frame.jpg`,
    alt: 'A butcher’s counter beneath a wall of hanging sausages',
  },
  {
    title: 'Crunchy Nut',
    category: 'Commercial',
    image: `${baseUrl}work/crunchy-nut-frame.jpg`,
    alt: 'A candlelit, gilded confectioner’s shop with bowls of chocolate truffles',
  },
  {
    title: 'O2',
    category: 'Commercial',
    image: `${baseUrl}work/o2-web.jpg`,
    alt: 'A brightly dressed bedroom with green walls and a desk',
  },
  {
    title: 'Love Box',
    category: 'Film & TV',
    image: `${baseUrl}work/love-box-web.jpg`,
    alt: 'A black-and-white family scene in a period sitting room',
  },
  {
    title: 'Dreamers',
    category: 'Film & TV',
    image: `${baseUrl}work/dreamers-web.jpg`,
    alt: 'A lived-in blue hallway with coats and shoes',
  },
]

// Time between one tile starting to fade in and the next.
const REVEAL_STEP_MS = 450

function ProjectTile({ project, visible, onLoad }) {
  return (
    <article className={visible ? 'project is-visible' : 'project'}>
      <div className="project-media">
        <img src={project.image} alt={project.alt} loading="lazy" onLoad={onLoad} onError={onLoad} />
      </div>
      <div className="project-caption">
        <h3>{project.title}</h3>
        <span>{project.category}</span>
      </div>
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

function App() {
  const currentPage = new URLSearchParams(window.location.search).get('page') || 'featured'
  const pageDetails = {
    featured: { title: 'Featured', projects },
    commercial: {
      title: 'Commercial',
      projects: projects.filter((project) => project.category === 'Commercial'),
    },
    'film-tv': {
      title: 'Film & TV',
      projects: projects.filter((project) => project.category === 'Film & TV'),
    },
  }
  const currentView = pageDetails[currentPage]

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href={baseUrl} aria-label="John Ebden, home">
          <span>John Ebden,</span>
          <span className="brand-role">Production Designer</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href={baseUrl} aria-current={currentPage === 'featured' ? 'page' : undefined}>Featured</a>
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
        {currentView ? (
          <section className="section">
            <h1 className="section-title">{currentView.title}</h1>
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
        <span>Production Designer</span>
      </footer>
    </div>
  )
}

export default App
