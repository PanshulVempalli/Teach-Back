import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const META = {
  solid: { label: 'Solid', color: 'bg-sage', w: 100 },
  shaky: { label: 'Shaky', color: 'bg-gold', w: 55 },
  skipped: { label: 'Skipped', color: 'bg-rust', w: 15 },
}

export default function Report({ concepts, status, onQuiz, onRestart }) {
  const root = useRef()
  const rows = concepts.map((c) => ({ ...c, ...(status[c.id] || { status: 'skipped' }) }))
  const count = (s) => rows.filter((r) => r.status === s).length
  useGSAP(() => {
    gsap.from('.row', { y: 30, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out' })
    gsap.from('.bar', { scaleX: 0, transformOrigin: 'left', stagger: 0.1, duration: 0.9, delay: 0.3, ease: 'power2.out' })
    gsap.from('.stat', { scale: 0, stagger: 0.15, ease: 'back.out(2)' })
  }, { scope: root })

  return (
    <div ref={root} className="max-w-3xl mx-auto p-6 pt-12 flex flex-col gap-6">
      <h2 className="font-display text-5xl font-extrabold">Your Gap Report</h2>
      <div className="flex gap-4">
        {Object.entries(META).map(([k, m]) => (
          <div key={k} className="stat card p-4 flex-1 text-center">
            <div className="font-display text-5xl font-extrabold">{count(k)}</div>
            <div className="font-hand text-2xl">{m.label}</div>
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.id} className="row card p-4">
          <div className="flex justify-between font-display text-xl"><span>{r.name}</span><span className="font-hand text-2xl">{META[r.status].label}</span></div>
          <div className="h-4 bg-paper rounded-full border-2 border-ink overflow-hidden mt-2">
            <div className={`bar h-full ${META[r.status].color}`} style={{ width: `${META[r.status].w}%` }} />
          </div>
          {r.note && <p className="mt-2 text-sm">{r.note}</p>}
          {r.status === 'skipped' && <p className="mt-2 text-sm opacity-70">You never explained this: {r.fact}</p>}
        </div>
      ))}
      <div className="flex gap-3">
        <button className="btn" onClick={() => onQuiz(rows)}>Misconception quiz →</button>
        <button className="btn !bg-white !text-ink" onClick={onRestart}>New notes</button>
      </div>
    </div>
  )
}
