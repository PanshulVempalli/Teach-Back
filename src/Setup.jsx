import { useState } from 'react'
import { pdfToText, ai, clip } from './lib.js'

export default function Setup({ onReady }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const onFile = async (f) => {
    if (!f) return
    setErr('')
    try { setText(f.type === 'application/pdf' ? await pdfToText(f) : await f.text()) }
    catch { setErr('Could not read that file.') }
  }

  const go = async () => {
    setBusy(true); setErr('')
    try {
      const notes = clip(text)
      const concepts = await ai(`From these study notes, list the 5-8 key concepts a student must understand.
Return JSON: [{"id":"c1","name":"short name","fact":"1-2 sentence correct statement from the notes"}]
NOTES:\n${notes}`)
      onReady({ notes, concepts })
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 pt-16 flex flex-col gap-4">
      <h2 className="font-display text-4xl font-extrabold">What are you studying?</h2>
      <textarea className="card p-4 h-64" placeholder="Paste your notes here…" value={text} onChange={(e) => setText(e.target.value)} />
      <input type="file" accept=".pdf,.txt,.md" onChange={(e) => onFile(e.target.files[0])} />
      {err && <p className="text-rust">{err}</p>}
      <button className="btn self-start" disabled={busy || text.trim().length < 80} onClick={go}>
        {busy ? 'Sam is skimming your notes…' : 'Meet Sam →'}
      </button>
    </div>
  )
}
