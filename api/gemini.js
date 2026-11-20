// Vercel serverless function; vite.config.js mounts the same handler in dev. Key stays server-side.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set' })
  const { prompt, json } = req.body || {}
  if (typeof prompt !== 'string' || prompt.length > 60000) return res.status(400).json({ error: 'bad prompt' })
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: json ? { responseMimeType: 'application/json' } : {},
      }),
    }
  )
  const d = await r.json()
  if (!r.ok) return res.status(r.status).json({ error: d.error?.message || 'gemini error' })
  res.json({ text: d.candidates?.[0]?.content?.parts?.[0]?.text ?? '' })
}
