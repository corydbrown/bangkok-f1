import { useState, useEffect } from 'react'
import { useNotionDB } from '../../hooks/useNotionDB'
import RaceCar from '../RaceCar'

const PLAYERS_DB = 'd34be59a-2681-4c90-acec-6231a63ee783'
const RESULTS_DB = '5d8670f4-b13f-4c47-96e8-3ff022071992'

const ACTIVE_FILTER  = JSON.stringify({ filter: { property: 'Active',  checkbox: { equals: true }   } })
const SEASON_FILTER  = JSON.stringify({ filter: { property: 'Season',  select:   { equals: '2026' } } })

const NOTION_COLORS = {
  red: '#e8312a', orange: '#f5a623', yellow: '#f7df1e',
  green: '#52E252', blue: '#3671C6', purple: '#9b59b6',
  pink: '#FF87BC', teal: '#27F4D2', white: '#f0e6d3',
  gray: '#9a8472', brown: '#cd7f32',
}

function getPts(rounds, upTo) {
  const cum = {}
  for (let i = 0; i <= upTo; i++) {
    Object.entries(rounds[i]?.points ?? {}).forEach(([p, v]) => {
      cum[p] = (cum[p] ?? 0) + v
    })
  }
  return cum
}

function getDisplayPoints(rounds, activeRound, mode) {
  if (!rounds.length || activeRound === null) return {}
  if (mode === 'round') return rounds[activeRound]?.points ?? {}
  return getPts(rounds, activeRound)
}

// ── Track Row ──────────────────────────────────────────────
function TrackRow({ name, color, pts, leaderPts, animated }) {
  const pct = leaderPts > 0
    ? Math.max(4, Math.min(96, (pts / leaderPts) * 96))
    : 4
  return (
    <div className="track-row">
      <span className="track-row__name" style={{ color }}>{name}</span>
      <div className="track-row__lane">
        <div
          className={`track-row__car-wrap${animated ? ' track-row__car-wrap--animated' : ''}`}
          style={{ left: animated ? `${pct}%` : '0%' }}
        >
          <RaceCar color={color} />
        </div>
      </div>
      <span className="track-row__points">
        {pts}
        <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}> pts</span>
      </span>
    </div>
  )
}

// ── Table View ─────────────────────────────────────────────
function TableView({ players, displayPoints, rounds, activeRound, mode, colorMap }) {
  const sorted = [...players].sort((a, b) => (displayPoints[b] ?? 0) - (displayPoints[a] ?? 0))
  const leaderPts = displayPoints[sorted[0]] ?? 0

  function getChange(player) {
    if (mode !== 'cumulative' || activeRound === null || activeRound === 0) return null
    const prevPts    = getPts(rounds, activeRound - 1)
    const prevSorted = [...players].sort((a, b) => (prevPts[b] ?? 0) - (prevPts[a] ?? 0))
    return prevSorted.indexOf(player) - sorted.indexOf(player)
  }

  return (
    <table className="rivals-table">
      <thead>
        <tr>
          <th>Pos</th><th>Player</th><th>Points</th><th>Gap</th>
          {mode === 'cumulative' && <th>±</th>}
        </tr>
      </thead>
      <tbody>
        {sorted.map((player, i) => {
          const pts    = displayPoints[player] ?? 0
          const gap    = i === 0 ? '—' : `−${leaderPts - pts}`
          const color  = colorMap[player] ?? '#f0e6d3'
          const change = getChange(player)
          return (
            <tr key={player}>
              <td><span className={`rivals-pos${i < 3 ? ` p${i + 1}` : ''}`}>{i + 1}</span></td>
              <td>
                <span className="rivals-player" style={{ borderLeft: `3px solid ${color}`, paddingLeft: '0.5rem' }}>
                  {player}
                </span>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent2)' }}>{pts}</td>
              <td><span className="rivals-gap">{gap}</span></td>
              {mode === 'cumulative' && (
                <td>
                  {change !== null && change !== 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700,
                      color: change > 0 ? '#52E252' : '#e8312a' }}>
                      {change > 0 ? `▲${change}` : `▼${Math.abs(change)}`}
                    </span>
                  )}
                  {change === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>}
                </td>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function GridRivals() {
  const [view,         setView]         = useState('track')
  const [mode,         setMode]         = useState('cumulative')
  const [activeRound,  setActiveRound]  = useState(null)
  const [animated,     setAnimated]     = useState(false)

  const { pages: playerPages, loading: playersLoading, error: playersError } =
    useNotionDB(PLAYERS_DB, ACTIVE_FILTER)

  const { pages: resultPages, loading: resultsLoading, error: resultsError } =
    useNotionDB(RESULTS_DB, SEASON_FILTER)

  const loading = playersLoading || resultsLoading
  const error   = playersError || resultsError

  // Build player map: { pageId → { name, color } }
  const playerMap = {}
  playerPages.forEach(p => {
    const name  = p.properties.Name?.title?.[0]?.plain_text ?? ''
    const color = NOTION_COLORS[p.properties['Display Color']?.select?.name] ?? '#f0e6d3'
    if (name) playerMap[p.id] = { name, color }
  })

  const playerNames = playerPages
    .map(p => p.properties.Name?.title?.[0]?.plain_text ?? '')
    .filter(Boolean)

  const colorMap = {}
  Object.values(playerMap).forEach(({ name, color }) => { colorMap[name] = color })

  // Build per-round points map
  const roundsMap = {}
  resultPages.forEach(entry => {
    const roundNum = entry.properties.Round?.number
    const raceName = entry.properties['Race Name']?.select?.name
    const pts      = entry.properties.Points?.number ?? 0
    const relId    = entry.properties.Player?.relation?.[0]?.id
    const player   = playerMap[relId]
    if (!roundNum || !player?.name) return
    if (!roundsMap[roundNum]) roundsMap[roundNum] = { num: roundNum, name: raceName ?? `Round ${roundNum}`, points: {} }
    roundsMap[roundNum].points[player.name] = (roundsMap[roundNum].points[player.name] ?? 0) + pts
  })
  const rounds = Object.values(roundsMap).sort((a, b) => a.num - b.num)

  // Default to last round
  useEffect(() => {
    if (rounds.length > 0 && activeRound === null) setActiveRound(rounds.length - 1)
  }, [rounds.length]) // eslint-disable-line

  // Animate cars when loading completes
  useEffect(() => {
    if (loading) return
    const f1 = requestAnimationFrame(() => {
      const f2 = requestAnimationFrame(() => setAnimated(true))
      return () => cancelAnimationFrame(f2)
    })
    return () => cancelAnimationFrame(f1)
  }, [loading])

  const displayPoints = getDisplayPoints(rounds, activeRound, mode)
  const leaderPts = playerNames.length
    ? Math.max(0, ...playerNames.map(p => displayPoints[p] ?? 0))
    : 0
  const sortedByPts = [...playerNames].sort((a, b) => (displayPoints[b] ?? 0) - (displayPoints[a] ?? 0))

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Bangkok F1 WDC</h2>
        <span className="section-bg-num" aria-hidden="true">WDC</span>
      </div>

      {loading ? (
        <p className="status">Connecting to Notion...</p>
      ) : error ? (
        <p className="status status--error">
          Could not load league data.<br />
          <span style={{ fontSize: '0.72rem' }}>Check NOTION_TOKEN in .env.local and restart the dev server.</span>
        </p>
      ) : !playerNames.length ? (
        <div className="rivals-onboarding">
          <p className="rivals-onboarding__title">No Players Found</p>
          <p className="rivals-onboarding__sub">
            Add players to the <strong>GR Players</strong> database in Notion<br />
            and tick their Active checkbox to get started.
          </p>
        </div>
      ) : (
        <>
          {/* ── Toolbar ── */}
          <div className="rivals-toolbar">
            <div className="rivals-view-btns" style={{ marginBottom: 0 }}>
              <button className={`rivals-view-btn${view === 'track' ? ' active' : ''}`} onClick={() => setView('track')}>Track</button>
              <button className={`rivals-view-btn${view === 'table' ? ' active' : ''}`} onClick={() => setView('table')}>Table</button>
            </div>
            <div className="rivals-view-btns" style={{ marginBottom: 0, marginLeft: '0.5rem' }}>
              <button className={`rivals-view-btn${mode === 'cumulative' ? ' active' : ''}`} onClick={() => setMode('cumulative')}>Season</button>
              <button className={`rivals-view-btn${mode === 'round' ? ' active' : ''}`}     onClick={() => setMode('round')}>Per Round</button>
            </div>
          </div>

          {/* ── Round scrubber ── */}
          {rounds.length > 0 ? (
            <div className="rivals-scrubber">
              {rounds.map((r, i) => (
                <button
                  key={r.num}
                  className={`rivals-round-btn${activeRound === i ? ' active' : ''}`}
                  onClick={() => setActiveRound(i)}
                >
                  R{r.num}: {r.name}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No round results yet — add entries to the <em>GR Round Results</em> database in Notion.
            </p>
          )}

          {/* ── Main view ── */}
          {view === 'track' ? (
            <div className="track-container">
              {sortedByPts.map(name => (
                <TrackRow
                  key={name}
                  name={name}
                  color={colorMap[name] ?? '#f0e6d3'}
                  pts={displayPoints[name] ?? 0}
                  leaderPts={leaderPts}
                  animated={animated}
                />
              ))}
            </div>
          ) : (
            <TableView
              players={playerNames}
              displayPoints={displayPoints}
              rounds={rounds}
              activeRound={activeRound}
              mode={mode}
              colorMap={colorMap}
            />
          )}
        </>
      )}
    </>
  )
}
