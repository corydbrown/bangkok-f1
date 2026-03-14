import { useFetch } from "../../hooks/useFetch"

const URL = "https://www.reddit.com/r/formuladank/top.json?limit=30&t=week"
const IMG  = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i

function isImg(post) {
  if (post.post_hint === "image") return true
  if (post.url && IMG.test(post.url)) return true
  if (post.preview?.images?.[0]?.source?.url) return true
  return false
}

function getUrl(post) {
  if (post.url && IMG.test(post.url)) return post.url
  return (post.preview?.images?.[0]?.source?.url ?? "").replace(/&amp;/g, "&")
}

function fmtScore(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export default function MemesSection({ compact = false }) {
  const { data, loading, error } = useFetch(URL)

  const posts = (data?.data?.children ?? [])
    .map(c => c.data)
    .filter(p => !p.stickied && isImg(p))
    .slice(0, compact ? 8 : 24)

  if (loading) return <p className="status">Loading memes...</p>
  if (error)   return <p className="status status--error">Could not load memes.</p>
  if (!posts.length) return <p className="status">No memes found. The grid is silent.</p>

  return (
    <>
      {!compact && (
        <div className="section-header">
          <h2 className="section-title">Meme Garage</h2>
          <span className="section-bg-num" aria-hidden="true">DRS</span>
        </div>
      )}
      <div className={compact ? "memes-grid memes-grid--compact" : "memes-grid"}>
        {posts.map(post => (
          <a
            key={post.id}
            href={`https://reddit.com${post.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="meme-item"
            style={{ display: "block", textDecoration: "none" }}
          >
            <img
              src={getUrl(post)}
              alt={post.title}
              loading="lazy"
              onError={e => { e.currentTarget.closest(".meme-item").style.display = "none" }}
            />
            <p className="meme-item__caption">
              ▲ {fmtScore(post.score)} · {post.title.length > 72 ? post.title.slice(0, 72) + "…" : post.title}
            </p>
          </a>
        ))}
      </div>
    </>
  )
}
