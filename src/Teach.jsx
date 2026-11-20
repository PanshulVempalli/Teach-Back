import { useRef, useState, useEffect } from 'react'
import Sam from './Sam.jsx'
import { ai } from './lib.js'
import { cue } from './sound.js'

export default function Teach({ notes, concepts, onDone }) {
  const [msgs, setMsgs] = useState([{ who: 'sam', text: "Hi! I'm Sam. I've never seen this topic. Pick anything from your notes and explain it to me?" }])
  const [mood, setMood] = useState('curious')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const status = useRef({}) // concept id -> {status, note, misconception}
  const turns = useRef(0)
  const end = useRef()
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs])

  const send = async () => {
    const said = input.trim()
    if (!said) return
    setInput(''); setBusy(true); setErr('')
    const next = [...msgs, { who: 'you', text: said }]
    setMsgs(next)
    cue.send()
    turns.current++
    const history = next.map((m) => `${m.who === 'sam' ? 'Sam' : 'Student'}: ${m.text}`).join('\n')
    const list = concepts.map((c) => `${c.id} | ${c.name}: ${c.fact}`).join('\n')
    try {
      // Step 1: silently grade the explanation against the source.
      const g = await ai(`You grade a student's explanation against the source concepts.
CONCEPTS:\n${list}\n\nCONVERSATION:\n${history}\n
Judge ONLY the latest Student message. Return JSON:
{"touched":[{"id":"c1","status":"solid"|"shaky","note":"what was vague/wrong","misconception":"the plausible wrong belief their wording implies, or empty"}],
"topGap":"the single most important vague/missing/wrong thing, or empty"}`)
      for (const t of g.touched || []) status.current[t.id] = t // latest grade wins
      // Step 2: Sam's reply targets the gap; every 3rd turn he repeats back a subtly wrong version.
      const trap = turns.current % 3 === 0
      const r = await ai(`You are Sam, a curious but confused student being taught by the user. Never explain things yourself or reveal the source.
CONVERSATION:\n${history}\nGAP TO TARGET: ${g.topGap || 'none - ask a naive follow-up about something not yet covered'}
${trap ? 'This turn: repeat back a SUBTLY WRONG version of what they said (plausible, based on the source being different) and ask "so it\'s like this, right?"' : 'This turn: ask one short naive follow-up question, acting confused exactly at the gap.'}
Max 2 sentences. Return JSON: {"reply":"...","mood":"confused"|"curious"|"enlightened"} (enlightened only if their explanation was solid)`)
      setMsgs((m) => [...m, { who: 'sam', text: r.reply }])
      setMood(r.mood)
      if (r.mood === 'enlightened') cue.aha()
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4 h-screen">
      <div className="flex items-center gap-4">
        <Sam mood={mood} size={90} />
        <h2 className="font-display text-3xl font-extrabold flex-1">Teach Sam</h2>
        <button className="btn" disabled={turns.current < 2 || busy} onClick={() => onDone(status.current)}>Finish → Gap Report</button>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`card p-3 max-w-[85%] ${m.who === 'you' ? 'self-end bg-white' : 'font-hand text-2xl'}`}>{m.text}</div>
        ))}
        {busy && <div className="font-hand text-2xl opacity-60">Sam is thinking…</div>}
        <div ref={end} />
      </div>
      {err && <p className="text-rust">{err}</p>}
      <div className="flex gap-2 pb-2">
        <textarea className="card p-3 flex-1 h-20" value={input} placeholder="Explain it in your own words…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!busy) send() } }} />
        <button className="btn" disabled={busy} onClick={send}>Explain</button>
      </div>
    </div>
  )
}
