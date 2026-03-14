import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/notion-query": {
          target: "https://api.notion.com",
          changeOrigin: true,
          rewrite: path => {
            const url = new URL(path, "http://localhost")
            const dbId = url.searchParams.get("databaseId")
            return `/v1/databases/${dbId}/query`
          },
          headers: {
            Authorization: `Bearer ${env.NOTION_TOKEN}`,
            "Notion-Version": "2022-06-28",
          },
        },
      },
    },
  }
})
