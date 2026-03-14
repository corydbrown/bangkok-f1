import { useState, useEffect } from 'react'
import ThemeButton from './components/ThemeButton'
import GridRivals from './components/sections/GridRivals'
import MemesSection from './components/sections/MemesSection'
import GossipSection from './components/sections/GossipSection'
import StandingsSection from './components/sections/StandingsSection'
import NextRace from './components/sections/NextRace'

const SECTIONS = [
  { id: 'bangkok-wdc', label: 'Bangkok WDC' },
  { id: 'memes',       label: 'Memes' },
  { id: 'gossip',      label: 'Gossip' },
  { id: 'standings',   label: 'Standings' },
  { id: 'next-race',   label: '2026 Season' },
]

export default function App() {
  const [activeSection, setActiveSection] = useState('bangkok-wdc')

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="header">
        <span className="header__logo">Bangkok <span>F1</span></span>
        <div className="header__actions">
          <ThemeButton />
          <span className="header__number" aria-hidden="true">1</span>
        </div>
      </header>

      <nav className="nav" aria-label="Page sections">
        <ul className="nav__list">
          {SECTIONS.map(s => (
            <li key={s.id}>
              <button
                className={`nav__btn${activeSection === s.id ? ' active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="dashboard">
        <section id="bangkok-wdc" className="section">
          <GridRivals />
        </section>

        <section id="memes" className="section">
          <MemesSection />
        </section>

        <section id="gossip" className="section">
          <GossipSection />
        </section>

        <section id="standings" className="section">
          <StandingsSection />
        </section>

        <section id="next-race" className="section">
          <NextRace />
        </section>
      </main>
    </div>
  )
}
