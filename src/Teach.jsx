import { useRef, useState, useEffect } from 'react'
import Sam from './Sam.jsx'
import { ai } from './lib.js'
import { cue } from './sound.js'
import { gradePrompt, normalizeGrade, samPrompt, normalizeSam, shouldTrap, tooShort } from './teachLogic.js'

export default function Teach({ concepts, onDone }) {
  const [msgs, setMsgs] = useState([{ who: 'sam', text: "Hi! I'm Sam. I've never seen this topic. Pick anything from your notes and explain it to me?" }])
  const [mood, setMood] = useState('curious')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const status = useRef({}) // concept id -> {status, note, misconception}
  const turns = useRef(0) // successful turns only
  const fails = useRef(0)
  const trap = useRef(null) // Sam's pending wrong claim
  const traps = useRef({ caught: 0, missed: 0 })
  const end = useRef()
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs])

  const send = async () => {
    const said = input.trim()
    if (!said) return
    setInput(''); setErr('')
    const next = [...msgs, { who: 'you', text: said }]
    cue.send()
    if (tooShort(said)) { // one-word answers give nothing to grade
      setMsgs([...next, { who: 'sam', text: 'Hmm, can you say a bit more? I need a sentence or two to follow you!' }])
      setMood('confused')
      return
    }
    setMsgs(next); setBusy(true)
    try {
      const g = normalizeGrade(await ai(gradePrompt({ concepts, status: status.current, msgs: next, pendingTrap: trap.current })), concepts)
      for (const t of g.touched) status.current[t.id] = t // latest grade wins
      const pending = trap.current
      trap.current = null
      const doTrap = shouldTrap(turns.current + 1, g)
      let r
      try {
        r = normalizeSam(await ai(samPrompt({ concepts, status: status.current, msgs: next, g: { ...g, caughtTrap: pending ? g.caughtTrap : null }, trap: doTrap })))
      } catch (e) { trap.current = pending; throw e }
      if (pending && g.caughtTrap !== null) traps.current[g.caughtTrap ? 'caught' : 'missed']++ // only once Sam's reply succeeded
      if (doTrap && r.wrongClaim) trap.current = r.wrongClaim
      turns.current++; fails.current = 0
      setMsgs((m) => [...m, { who: 'sam', text: r.reply }])
      setMood(r.mood)
      if (r.mood === 'enlightened') cue.aha()
    } catch (e) {
      console.error(e)
      fails.current++
      setMsgs(msgs); setInput(said) // give the message back, never lose it
      setErr(fails.current >= 3
        ? "Sam's brain keeps freezing (the AI is busy). Wait a minute, or finish now with what you've covered."
        : "Sam's brain froze for a second. Your message is back in the box, so press Explain again.")
    }
    setBusy(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-4 h-screen">
      <div className="flex items-center gap-4">
        <Sam mood={mood} size={90} />
        <h2 className="font-display text-3xl font-extrabold flex-1">Teach Sam</h2>
        <button className="btn" disabled={turns.current < 2 || busy} onClick={() => onDone(status.current, traps.current)}>Finish → Gap Report</button>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {msgs.map((m, i) => (
          <div key={i} className={`card p-3 max-w-[85%] ${m.who === 'you' ? 'self-end bg-white' : 'font-hand text-2xl'}`}>{m.text}</div>
        ))}
        {busy && <div className="font-hand text-2xl opacity-60">Sam is thinking…</div>}
        <div ref={end} />
      </div>
      {err && <p className="text-rust" role="alert">{err}</p>}
      <div className="flex gap-2 pb-2">
        <textarea className="card p-3 flex-1 h-20" value={input} placeholder="Explain it in your own words…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!busy) send() } }} />
        <button className="btn" disabled={busy} onClick={send}>Explain</button>
      </div>
    </div>
  )
}
