import { useFetch } from '../../hooks/useFetch'

const URL =
  'https://www.reddit.com/r/formula1/search.json?q=irl+OR+personal+OR+%22off+track%22+OR+lifestyle+OR+girlfriend+OR+family&sort=top&t=week&restrict_sr=1&limit=30'

function timeAgo(utc) {
  const diff = Math.floor(Date.now() / 1000) - utc
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function fmtScore(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

function getImg(post) {
  const preview = post.preview?.images?.[0]?.source?.url
  if (preview) return preview.replace(/&amp;/g, '&')
  if (post.thumbnail?.startsWith('https')) return post.thumbnail
  return null
}

function FeaturedPost({ post }) {
  const img = getImg(post)
  return (
    <a
      href={`https://reddit.com${post.permalink}`}
      target="_blank"
      rel="noopener noreferrer"
      className="gossip-featured"
    >
      {img && <img src={img} alt={post.title} className="gossip-featured__img" />}
      <div className="gossip-featured__body">
        {post.link_flair_text && (
          <span className="gossip-featured__flair">[{post.link_flair_text}]</span>
        )}
        <p className="gossip-featured__title">{post.title}</p>
        {post.selftext && (
          <p className="gossip-featured__excerpt">
            {post.selftext.slice(0, 240)}{post.selftext.length > 240 ? '\u2026' : ''}
          </p>
        )}
        <div className="gossip-featured__footer">
          <span className="vote-chip">\u25b2 {fmtScore(post.score)}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {post.num_comments} comments \u00b7 {timeAgo(post.created_utc)}
          </span>
        </div>
      </div>
    </a>
  )
}

function GossipCard({ post }) {
  const img = getImg(post)
  return (
    <a
      href={`https://reddit.com${post.permalink}`}
      target="_blank"
      rel="noopener noreferrer"
      className="gossip-card"
      style={{ textDecoration: 'none' }}
    >
      {img && <img src={img} alt="" className="gossip-card__thumb" onError={e => { e.currentTarget.style.display = 'none' }} />}
      <div className="gossip-card__body">
        <p className="card__meta" style={{ marginBottom: '0.3rem' }}>
          {post.link_flair_text && (
            <span style={{ color: 'var(--accent2)', marginRight: '0.4rem' }}>[{post.link_flair_text}]</span>
          )}
          {timeAgo(post.created_utc)}
        </p>
        <p className="card__title" style={{ fontSize: '0.88rem', marginBottom: '0.4rem' }}>{post.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className="vote-chip">\u25b2 {fmtScore(post.score)}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            {post.num_comments} comments
          </span>
        </div>
      </div>
    </a>
  )
}

export default function GossipSection() {
  const { data, loading, error } = useFetch(URL)

  const posts = (data?.data?.children ?? [])
    .map(c => c.data)
    .filter(p => !p.stickied)
    .slice(0, 7)   // 1 featured + 6 grid

  if (loading) return (
    <>
      <div className="section-header">
        <h2 className="section-title">Paddock Gossip</h2>
        <span className="section-bg-num" aria-hidden="true">r/f1</span>
      </div>
      <p className="status">Loading gossip...</p>
    </>
  )
  if (error) return (
    <>
      <div className="section-header">
        <h2 className="section-title">Paddock Gossip</h2>
        <span className="section-bg-num" aria-hidden="true">r/f1</span>
      </div>
      <p className="status status--error">Could not load gossip.</p>
    </>
  )
  if (!posts.length) return (
    <>
      <div className="section-header">
        <h2 className="section-title">Paddock Gossip</h2>
        <span className="section-bg-num" aria-hidden="true">r/f1</span>
      </div>
      <p className="status">Nothing juicy right now.</p>
    </>
  )

  const [featured, ...rest] = posts

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Paddock Gossip</h2>
        <span className="section-bg-num" aria-hidden="true">r/f1</span>
      </div>

      <FeaturedPost post={featured} />

      {rest.length > 0 && (
        <div className="gossip-grid">
          {rest.map(post => (
            <GossipCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
