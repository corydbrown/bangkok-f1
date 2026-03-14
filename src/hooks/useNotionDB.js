import { useState, useEffect } from "react"

/**
 * Query a Notion database via the Vite dev proxy.
 * bodyJson = JSON.stringify({ filter: {...}, sorts: [...] }) — optional
 * Returns { pages, loading, error }
 */
export function useNotionDB(databaseId, bodyJson = "{}") {
  const [pages,   setPages]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPages([])

    async function fetchAll() {
      const all = []
      let cursor

      try {
        do {
          const body = bodyJson ? JSON.parse(bodyJson) : {}
          if (cursor) body.start_cursor = cursor

          const res = await fetch(`/api/notion-query?databaseId=${databaseId}`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(body),
          })

          if (!res.ok) {
            const text = await res.text().catch(() => "")
            throw new Error(`Notion ${res.status}: ${text.slice(0, 120)}`)
          }

          const json = await res.json()
          all.push(...json.results)
          cursor = json.has_more ? json.next_cursor : undefined
        } while (cursor)

        if (!cancelled) { setPages(all); setLoading(false) }
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false) }
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [databaseId, bodyJson])

  return { pages, loading, error }
}
