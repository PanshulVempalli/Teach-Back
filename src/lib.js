import * as pdfjs from 'pdfjs-dist'
import worker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = worker

export async function pdfToText(file) {
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
  const r = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, json }),
  })
  const d = await r.json()
  if (!r.ok) throw new Error(d.error || 'AI request failed')
  return json ? JSON.parse(d.text) : d.text
}

// shortcut: the notes are truncated to ~24k chars (no real chunking), upgrade to retrieval for long PDFs.
export const clip = (t) => t.slice(0, 24000)
