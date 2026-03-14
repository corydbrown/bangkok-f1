export default async function handler(req, res) {
  const { databaseId } = req.query
  if (!databaseId) return res.status(400).json({ error: 'databaseId required' })

  const response = await fetch(
    `https://api.notion.com/v1/databases/${databaseId}/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    }
  )

  const data = await response.json()
  res.status(response.status).json(data)
}
