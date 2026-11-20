import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

// The landing page's markup is also written into #root at build time, so the built page holds its words for
// crawlers and for the design checks; React then renders the same markup over it (src/Landing.jsx).
const landingHtml = () => ({
  name: 'landing-html',
  transformIndexHtml: (html) => html.replace('<div id="root"></div>', () => `<div id="root">${readFileSync('src/landing.html', 'utf8')}</div>`),
})

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
  // The app's bundle goes to /bundle so it can never collide with the design kit's public/assets files.
  build: { assetsDir: 'bundle' },
  plugins: [react(), tailwindcss(), landingHtml(), devApi(loadEnv(mode, process.cwd(), ''))],
}))
