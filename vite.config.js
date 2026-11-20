import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only: serve /api/gemini with the same handler Vercel runs in prod.
const devApi = (env) => ({
  name: 'dev-api',
  configureServer(server) {
    server.middlewares.use('/api/gemini', async (req, res) => {
      process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || ''
      let body = ''
      for await (const c of req) body += c
      req.body = body ? JSON.parse(body) : {}
      res.status = (c) => ((res.statusCode = c), res)
      res.json = (o) => (res.setHeader('Content-Type', 'application/json'), res.end(JSON.stringify(o)))
      const { default: h } = await server.ssrLoadModule('/api/gemini.js')
      await h(req, res)
    })
  },
})

export default defineConfig(({ mode }) => ({
  build: { assetsDir: 'bundle' },
  plugins: [react(), tailwindcss(), devApi(loadEnv(mode, process.cwd(), ''))],
}))
