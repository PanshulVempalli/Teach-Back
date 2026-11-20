import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ai } from './lib.js'
import { cue } from './sound.js'
import Sam from './Sam.jsx'

export default function Quiz({ rows, onBack }) {
  const [qs, setQs] = useState(null)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const [err, setErr] = useState('')
  const root = useRef()

  useEffect(() => {
    const weak = rows.filter((r) => r.status !== 'solid')
    const src = (weak.length ? weak : rows)
      .map((r) => `${r.name}: ${r.fact}\n  student's own misconception: ${r.misconception || 'none recorded'}`).join('\n')
    ai(`Write one multiple-choice question per concept below. Exactly 4 options. The correct answer comes from the fact.
Wrong options must be plausible MISCONCEPTIONS: use the student's own misconception where given, otherwise invent a realistic one. Never silly distractors.
Return JSON: [{"q":"...","options":["..","..","..",".."],"answer":0-3,"why":"short explanation"}]\n${src}`)
      .then(setQs).catch((e) => setErr(e.message))
  }, [rows])

  useGSAP(() => {
    if (!qs) return
    gsap.from('.q-in', { y: 24, opacity: 0, stagger: 0.06, duration: 0.45, ease: 'power3.out', clearProps: 'opacity,transform' })
  }, { scope: root, dependencies: [qs, i] })

  if (err) return (
    <div className="max-w-xl mx-auto px-4 pt-24 text-center flex flex-col items-center gap-4">
      <Sam mood="confused" size={140} />
      <p className="text-rust font-medium">{err}</p>
      <button className="btn" onClick={onBack}>Back to report</button>
    </div>
  )
  if (!qs) return (
    <div className="max-w-xl mx-auto px-4 pt-24 text-center flex flex-col items-center gap-4">
      <Sam mood="curious" size={160} />
      <p className="font-hand text-3xl">Writing questions from your own mistakes…</p>
      <span className="typing flex gap-1.5"><span /><span /><span /></span>
    </div>
  )
  if (i >= qs.length) {
    const pct = score / qs.length
    return (
      <div ref={root} className="max-w-xl mx-auto px-4 pt-16 pb-20 text-center flex flex-col gap-5 items-center">
        <div className="q-in"><Sam mood={pct >= 0.7 ? 'enlightened' : pct >= 0.4 ? 'curious' : 'confused'} size={180} /></div>
        <p className="q-in font-hand text-3xl text-rust">{pct >= 0.7 ? 'Sam is impressed!' : pct >= 0.4 ? 'Not bad at all.' : 'Those gaps are real. Good to know now!'}</p>
        <h1 className="q-in font-display font-black text-8xl tracking-tight">{score}<span className="text-ink/30">/{qs.length}</span></h1>
        <div className="q-in flex gap-3">
          <button className="btn" onClick={onBack}>Back to report</button>
          <button className="btn btn-ghost" onClick={() => { setI(0); setPick(null); setScore(0) }}>Retry quiz</button>
        </div>
      </div>
    )
  }
  const q = qs[i]
  const answer = (n) => { if (pick === null) { setPick(n); if (n === q.answer) { setScore((s) => s + 1); cue.right() } else cue.wrong() } }
  const right = pick === q.answer
  return (
    <div ref={root} className="max-w-2xl mx-auto px-4 py-10 sm:py-14 flex flex-col gap-5">
      <div className="q-in flex items-center gap-4">
        <span className="font-hand text-2xl whitespace-nowrap">Question {i + 1} of {qs.length}</span>
        <div className="flex-1 h-3 rounded-full border-2 border-ink bg-cream overflow-hidden">
          <div className="h-full bg-rust transition-all duration-500" style={{ width: `${((i + (pick !== null)) / qs.length) * 100}%` }} />
        </div>
        <span className="text-sm font-semibold">{score} ✓</span>
      </div>
      <h1 className="q-in font-display font-black text-3xl sm:text-4xl tracking-tight leading-tight">{q.q}</h1>
      <div className="flex flex-col gap-3">
        {q.options.map((o, n) => {
          const isAns = pick !== null && n === q.answer
          const isWrong = pick === n && n !== q.answer
          return (
            <button key={n} onClick={() => answer(n)} disabled={pick !== null}
              className={`q-in card card-btn p-4 text-left flex gap-3 items-start ${isAns ? '!bg-sage/35' : ''} ${isWrong ? '!bg-rust/25' : ''} ${pick !== null && !isAns && !isWrong ? 'opacity-50' : ''}`}>
              <span className="w-7 h-7 shrink-0 rounded-full border-2 border-ink flex items-center justify-center text-sm font-semibold bg-paper">{isAns ? '✓' : isWrong ? '✗' : 'ABCD'[n]}</span>
              <span className="pt-0.5">{o}</span>
            </button>
          )
        })}
      </div>
      {pick !== null && (
        <div className="q-in card p-4 mt-2 flex flex-wrap sm:flex-nowrap gap-4 items-start bg-cream">
          <Sam mood={right ? 'enlightened' : 'confused'} size={56} still />
          <div className="flex-1">
            <p className="font-hand text-2xl leading-6 mb-1">{right ? 'Yes! That’s it.' : 'Ah, that’s the trap.'}</p>
            <p className="text-ink/80">{q.why}</p>
          </div>
          <button className="btn self-center" onClick={() => { setI(i + 1); setPick(null) }}>{i + 1 < qs.length ? 'Next →' : 'Finish'}</button>
        </div>
      )}
    </div>
  )
}
