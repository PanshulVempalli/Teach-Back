// pdf.js is large, so it only loads when someone actually drops a PDF.
export async function pdfToText(file) {
  const [pdfjs, { default: worker }] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')])
  pdfjs.GlobalWorkerOptions.workerSrc = worker
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise
  let out = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const p = await (await pdf.getPage(i)).getTextContent()
    out += p.items.map((t) => t.str).join(' ') + '\n'
  }
  return out
}

// Ask Gemini via the server proxy; json=true parses the reply.
export async function ai(prompt, json = true) {
  // Free tier gets "high demand" spikes: retry twice with backoff before surfacing the error.
  for (let attempt = 0; ; attempt++) {
    const r = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, json }),
    })
    const d = await r.json()
    if (r.ok) return json ? JSON.parse(d.text) : d.text
    if (attempt >= 2 || ![429, 500, 503].includes(r.status)) throw new Error(d.error || 'AI request failed')
    await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)))
  }
}

// shortcut: the notes are truncated to ~24k chars (no real chunking), upgrade to retrieval for long PDFs.
export const clip = (t) => t.slice(0, 24000)
