import { useEffect, useState } from 'react'
import { ai } from './lib.js'
import { cue } from './sound.js'

export default function Quiz({ rows, onBack }) {
  const [qs, setQs] = useState(null)
  const [i, setI] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const [err, setErr] = useState('')

  useEffect(() => {
    const weak = rows.filter((r) => r.status !== 'solid')
    const src = (weak.length ? weak : rows)
      .map((r) => `${r.name}: ${r.fact}\n  student's own misconception: ${r.misconception || 'none recorded'}`).join('\n')
    ai(`Write one multiple-choice question per concept below. Exactly 4 options. The correct answer comes from the fact.
Wrong options must be plausible MISCONCEPTIONS: use the student's own misconception where given, otherwise invent a realistic one. Never silly distractors.
Return JSON: [{"q":"...","options":["..","..","..",".."],"answer":0-3,"why":"short explanation"}]\n${src}`)
      .then(setQs).catch((e) => setErr(e.message))
  }, [rows])

  if (err) return <p className="p-6 text-rust">{err}</p>
  if (!qs) return <p className="p-6 font-hand text-3xl text-center pt-24">Writing questions from your own mistakes…</p>
  if (i >= qs.length) return (
    <div className="max-w-xl mx-auto p-6 pt-24 text-center flex flex-col gap-4 items-center">
      <h2 className="font-display text-5xl font-extrabold">{score}/{qs.length}</h2>
      <button className="btn" onClick={onBack}>Back to report</button>
    </div>
  )
  const q = qs[i]
  const answer = (n) => { if (pick === null) { setPick(n); if (n === q.answer) { setScore((s) => s + 1); cue.right() } else cue.wrong() } }
  return (
    <div className="max-w-2xl mx-auto p-6 pt-12 flex flex-col gap-4">
      <p className="font-hand text-2xl">Question {i + 1} of {qs.length}</p>
      <h2 className="font-display text-3xl font-extrabold">{q.q}</h2>
      {q.options.map((o, n) => (
        <button key={n} onClick={() => answer(n)}
          className={`card card-btn p-3 text-left ${pick !== null && n === q.answer ? '!bg-sage/40' : ''} ${pick === n && n !== q.answer ? '!bg-rust/30' : ''}`}>{o}</button>
      ))}
      {pick !== null && (
        <>
          <p>{q.why}</p>
          <button className="btn self-start" onClick={() => { setI(i + 1); setPick(null) }}>Next →</button>
        </>
      )}
    </div>
  )
}
