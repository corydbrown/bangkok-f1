export default async function handler(req, res) {
  const segments = req.query.path || []
  const notionPath = Array.isArray(segments) ? segments.join('/') : segments
  const url = `https://api.notion.com/${notionPath}`

  const response = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
