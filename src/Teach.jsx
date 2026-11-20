import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Sam from './Sam.jsx'
import { ai } from './lib.js'
import { cue } from './sound.js'
import { gradePrompt, normalizeGrade, samPrompt, normalizeSam, shouldTrap, tooShort } from './teachLogic.js'

const DOT = { solid: 'bg-sage', shaky: 'bg-gold' }

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
  const list = useRef()
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [msgs, busy]) // braces: scrollIntoView can return a Promise, which React would treat as a cleanup
  useGSAP(() => { gsap.from('.bubble:last-child', { y: 12, opacity: 0, scale: 0.97, duration: 0.35, ease: 'back.out(1.6)' }) }, { scope: list, dependencies: [msgs.length] })

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
      setMsgs((m) => [...m, { who: 'sam', text: r.reply, caught: pending && g.caughtTrap === true }])
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

  const covered = concepts.filter((c) => status.current[c.id]).length
  const canFinish = turns.current >= 2 && !busy

  return (
    <div className="max-w-5xl mx-auto px-4 grid lg:grid-cols-[250px_1fr] gap-6 h-[calc(100dvh-4rem)] py-4">
      {/* Sam + concept checklist */}
      <aside className="hidden lg:flex flex-col gap-4 overflow-y-auto scroll-thin pb-2">
        <div className="card p-4 flex flex-col items-center text-center bg-sky/50">
          <Sam mood={mood} size={150} />
          <div className="font-hand text-2xl -mt-1">Sam is {mood === 'enlightened' ? 'getting it!' : mood}</div>
        </div>
        <div className="card p-4">
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-display font-semibold">Ideas to teach</span>
            <span className="text-sm text-ink/60">{covered}/{concepts.length}</span>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {concepts.map((c) => {
              const s = status.current[c.id]?.status
              return (
                <li key={c.id} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full border-2 border-ink shrink-0 transition-colors ${DOT[s] || 'bg-cream'}`} />
                  <span className={s ? '' : 'text-ink/60'}>{c.name}</span>
                </li>
              )
            })}
          </ul>
          <div className="flex gap-3 mt-4 pt-3 border-t-2 border-dashed border-ink/15 text-xs text-ink/60">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sage border border-ink" />solid</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gold border border-ink" />shaky</span>
          </div>
        </div>
        <p className="card !shadow-none !border-dashed px-3 py-2 font-hand text-xl text-ink/80 leading-6 bg-gold/20 -rotate-1">Tip: every few turns Sam repeats something back wrong. Correct him!</p>
      </aside>

      {/* conversation */}
      <section className="card flex flex-col min-h-0">
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b-2 border-dashed border-ink/15">
          <div className="lg:hidden"><Sam mood={mood} size={48} /></div>
          <div className="flex-1">
            <h1 className="font-display font-black text-2xl leading-tight">Teach Sam</h1>
            <p className="text-sm text-ink/60">{covered} of {concepts.length} ideas covered</p>
          </div>
          <button className="btn !py-2 text-sm" disabled={!canFinish} title={canFinish ? '' : 'Teach Sam a couple of things first'} onClick={() => onDone(status.current, traps.current)}>Finish → Report</button>
        </div>
        <div ref={list} className="flex-1 overflow-y-auto scroll-thin flex flex-col gap-3 p-4 sm:p-5">
          {msgs.map((m, i) => (
            <div key={i} className={`bubble max-w-[85%] ${m.who === 'you' ? 'self-end' : 'self-start'}`}>
              {m.who === 'you'
                ? <div className="bg-ink text-paper rounded-2xl rounded-br-sm px-4 py-2.5 leading-relaxed whitespace-pre-wrap">{m.text}</div>
                : <div className="relative bg-paper rounded-2xl rounded-bl-sm border-2 border-ink px-4 py-2 font-hand text-[1.6rem] leading-7">
                    {m.text}
                    {m.caught && <span className="absolute -top-3 -right-2 rotate-6 bg-sage text-white text-xs font-sans font-semibold px-2 py-0.5 rounded-full">you caught his mistake!</span>}
                  </div>}
            </div>
          ))}
          {busy && <div className="bubble self-start typing flex gap-1.5 px-4 py-3 rounded-2xl border-2 border-ink/30" aria-label="Sam is thinking"><span /><span /><span /></div>}
          <div ref={end} />
        </div>
        {err && <p className="text-rust px-5 pb-2 text-sm font-medium" role="alert">{err}</p>}
        <div className="flex gap-2 p-3 sm:p-4 border-t-2 border-dashed border-ink/15">
          <textarea className="flex-1 h-20 resize-none rounded-xl border-2 border-ink bg-white p-3 leading-relaxed" value={input} placeholder="Explain it in your own words…  (Enter to send)"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!busy) send() } }} />
          <button className="btn self-end" disabled={busy || !input.trim()} onClick={send}>Explain</button>
        </div>
      </section>
    </div>
  )
}
