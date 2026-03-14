import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'

const TEAM_COLORS = {
  'Red Bull': '#3671C6', 'McLaren': '#FF8000', 'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2', 'Aston Martin': '#229971', 'Alpine': '#FF87BC',
  'Haas': '#B6BABD', 'Williams': '#64C4FF', 'RB': '#6692FF',
  'Sauber': '#52E252', 'Cadillac': '#C41E3A',
}

function teamColor(name) {
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (name?.includes(key)) return color
  }
  return 'var(--border2)'
}

function EmptyState({ loading, error }) {
  if (loading) return <p className="status" style={{ padding: '1.5rem 0' }}>Loading standings...</p>
  if (error) return (
    <p className="status" style={{ padding: '1.5rem 0' }}>
      {error.includes('404') ? '2026 standings not yet available.' : `Error: ${error}`}
    </p>
  )
  return (
    <p className="status" style={{ padding: '1.5rem 0' }}>
      Season underway —<br />
      <span style={{ fontSize: '0.7rem' }}>No results yet. Check back after Round 1.</span>
    </p>
  )
}

function Podium({ top3, getColor, getName, getPts, getSmall }) {
  // Visual order: P2 (left), P1 (centre, taller), P3 (right)
  const order = [top3[1], top3[0], top3[2]].filter(Boolean)
  const posLabels = ['p2', 'p1', 'p3']
  const posNums   = [2, 1, 3]
  return (
    <div className="podium">
      {order.map((entry, i) => {
        const visualPos  = posNums[i]
        const posLabel   = posLabels[i]
        const color      = getColor(entry)
        return (
          <div key={visualPos} className={`podium-card ${posLabel}`} style={{ borderTopColor: color }}>
            <div className={`podium-pos ${posLabel}`}>{visualPos}</div>
            <div className="podium-name">{getName(entry)}</div>
            <div className="podium-team">{getSmall(entry)}</div>
            <div className="podium-points">{getPts(entry)} <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PTS</span></div>
          </div>
        )
      })}
    </div>
  )
}

function CompactRow({ pos, primary, secondary, pts, color }) {
  return (
    <div className="standings-compact-row" style={{ borderLeftColor: color }}>
      <span className="standings-pos">{pos}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', letterSpacing: '0.05em', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {primary}
        {secondary && <small style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{secondary}</small>}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent2)', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {pts}<span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}> PTS</span>
      </span>
    </div>
  )
}

function DriversList({ data, loading, error }) {
  const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
  if (loading || error || !standings.length) return <EmptyState loading={loading} error={error} />

  const top3 = standings.slice(0, 3)
  const rest  = standings.slice(3)

  return (
    <>
      {standings.length >= 3 && (
        <Podium
          top3={top3}
          getColor={e => teamColor(e.Constructors?.[0]?.name)}
          getName={e => e.Driver.familyName.toUpperCase()}
          getSmall={e => `${e.Driver.givenName} · ${e.Constructors?.[0]?.name ?? ''}`}
          getPts={e => e.points}
        />
      )}
      {(standings.length < 3 ? standings : rest).length > 0 && (
        <div className="standings-compact">
          {(standings.length < 3 ? standings : rest).map(entry => (
            <CompactRow
              key={entry.Driver.driverId}
              pos={entry.position}
              primary={entry.Driver.familyName.toUpperCase()}
              secondary={`${entry.Driver.givenName} · ${entry.Driver.code ?? entry.Driver.permanentNumber}`}
              pts={entry.points}
              color={teamColor(entry.Constructors?.[0]?.name)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function ConstructorsList({ data, loading, error }) {
  const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []
  if (loading || error || !standings.length) return <EmptyState loading={loading} error={error} />

  const top3 = standings.slice(0, 3)
  const rest  = standings.slice(3)

  return (
    <>
      {standings.length >= 3 && (
        <Podium
          top3={top3}
          getColor={e => teamColor(e.Constructor.name)}
          getName={e => e.Constructor.name.toUpperCase()}
          getSmall={e => e.Constructor.nationality}
          getPts={e => e.points}
        />
      )}
      {(standings.length < 3 ? standings : rest).length > 0 && (
        <div className="standings-compact">
          {(standings.length < 3 ? standings : rest).map(entry => (
            <CompactRow
              key={entry.Constructor.constructorId}
              pos={entry.position}
              primary={entry.Constructor.name.toUpperCase()}
              secondary={entry.Constructor.nationality}
              pts={entry.points}
              color={teamColor(entry.Constructor.name)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default function StandingsSection() {
  const [view, setView] = useState('drivers')

  const drivers      = useFetch('https://api.jolpi.ca/ergast/f1/2026/driverstandings.json')
  const constructors = useFetch('https://api.jolpi.ca/ergast/f1/2026/constructorstandings.json')

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">WDC Standings</h2>
        <span className="section-bg-num" aria-hidden="true">PTS</span>
      </div>
      <div className="standings-toggle">
        <button className={`standings-toggle-btn${view === 'drivers'      ? ' active' : ''}`} onClick={() => setView('drivers')}>Drivers</button>
        <button className={`standings-toggle-btn${view === 'constructors' ? ' active' : ''}`} onClick={() => setView('constructors')}>Constructors</button>
      </div>

      {view === 'drivers'
        ? <DriversList      data={drivers.data}      loading={drivers.loading}      error={drivers.error} />
        : <ConstructorsList data={constructors.data} loading={constructors.loading} error={constructors.error} />
      }
    </>
  )
}
