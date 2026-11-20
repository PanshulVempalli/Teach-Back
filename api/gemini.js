// Vercel serverless function; vite.config.js mounts the same handler in dev. Key stays server-side.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set' })
  const { prompt, json } = req.body || {}
  if (typeof prompt !== 'string' || prompt.length > 60000) return res.status(400).json({ error: 'bad prompt' })
  // Fastest first; fall through to the next model when one is overloaded (429/503) or times out.
  let r, d
  for (const model of ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash']) {
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      signal: AbortSignal.timeout(20000), // a stalled model must not hang the user
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: json ? { responseMimeType: 'application/json' } : {},
      }),
      })
      d = await r.json()
    } catch { r = { ok: false, status: 504 }; d = { error: 'Gemini timed out' }; continue }
    if (![429, 503].includes(r.status)) break
  }
  if (!r.ok) return res.status(r.status).json({ error: d.error?.message || d.error || 'gemini error' })
  res.json({ text: d.candidates?.[0]?.content?.parts?.[0]?.text ?? '' })
}
