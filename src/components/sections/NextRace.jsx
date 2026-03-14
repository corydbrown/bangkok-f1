import { useState, useEffect } from 'react'
import { useFetch } from '../../hooks/useFetch'

const FLAGS = {
  'Australia': '🇦🇺', 'China': '🇨🇳', 'Japan': '🇯🇵',
  'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'USA': '🇺🇸',
  'United States': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
  'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Austria': '🇦🇹',
  'UK': '🇬🇧', 'Great Britain': '🇬🇧', 'Belgium': '🇧🇪',
  'Hungary': '🇭🇺', 'Netherlands': '🇳🇱', 'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
  'UAE': '🇦🇪', 'Qatar': '🇶🇦',
}

function pad(n) { return String(n).padStart(2, '0') }

function getCountdown(raceDate) {
  const diff = raceDate - new Date()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  }
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
  })
}

function ScheduleView({ races, nextRace }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return (
    <div className="schedule-list">
      {races.map(r => {
        const raceDate = new Date(r.date + 'T00:00:00')
        const isPast   = raceDate < today
        const isNext   = r.round === nextRace?.round
        const flag     = FLAGS[r.Circuit?.Location?.country] ?? '🏁'
        return (
          <div
            key={r.round}
            className={`schedule-row${isPast ? ' past' : ''}${isNext ? ' next' : ''}`}
          >
            <span className="schedule-round">R{r.round}</span>
            <span className="schedule-flag">{flag}</span>
            <span className="schedule-name">
              {r.raceName.replace(' Grand Prix', ' GP')}
            </span>
            <span className="schedule-date">{fmtShort(r.date)}</span>
            <span className="schedule-badge">
              {isPast ? '✓' : isNext ? 'NEXT' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function NextRace() {
  const { data, loading, error } = useFetch(
    'https://api.jolpi.ca/ergast/f1/2026/races.json'
  )
  const [countdown, setCountdown] = useState(null)
  const [view,      setView]      = useState('countdown')

  const races  = data?.MRData?.RaceTable?.Races ?? []
  const today  = new Date(); today.setHours(0, 0, 0, 0)
  const nextRace = races.find(r => new Date(r.date + 'T00:00:00') >= today)

  useEffect(() => {
    if (!nextRace) return
    const raceDate = new Date(nextRace.date + 'T00:00:00')
    const tick = () => setCountdown(getCountdown(raceDate))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [nextRace?.date])

  if (loading) return <p className="status">Loading race schedule...</p>
  if (error)   return <p className="status status--error">Could not load schedule.</p>

  return (
    <>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem', width: '100%' }}>
          <h2 className="section-title">2026 Season</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.65rem' }}>
            <div className="rivals-view-btns" style={{ marginBottom: 0 }}>
              <button className={`rivals-view-btn${view === 'countdown' ? ' active' : ''}`} onClick={() => setView('countdown')}>Countdown</button>
              <button className={`rivals-view-btn${view === 'schedule'  ? ' active' : ''}`} onClick={() => setView('schedule')}>Schedule</button>
            </div>
            <a
              href="webcal://files.f1calendar.com/f1calendar.ics"
              className="cal-link"
              title="Opens your calendar app to subscribe to the 2026 F1 schedule"
            >
              📅 Subscribe
            </a>
          </div>
        </div>
        <span className="section-bg-num" aria-hidden="true">26</span>
      </div>

      {view === 'countdown' ? (
        nextRace ? (
          <div className="countdown-block">
            <p className="countdown-label">Next Race</p>
            <p className="countdown-race">
              {nextRace.raceName}
              <small>{nextRace.Circuit.circuitName} — {formatDate(nextRace.date)}</small>
            </p>
            {countdown ? (
              <div className="countdown-timer">
                {[['days','Days'],['hours','Hrs'],['minutes','Mins'],['seconds','Secs']].map(([k, label]) => (
                  <div className="countdown-unit" key={k}>
                    <span className="countdown-num">{pad(countdown[k])}</span>
                    <span className="countdown-unit-label">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent)' }}>
                Race day — lights out!
              </p>
            )}
          </div>
        ) : (
          <div className="season-complete">2026 Season — No upcoming races scheduled</div>
        )
      ) : (
        <ScheduleView races={races} nextRace={nextRace} />
      )}
    </>
  )
}
