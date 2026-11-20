import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Sam from './Sam.jsx'

const META = {
  solid: { label: 'Solid', color: 'bg-sage', tint: 'bg-sage/25', w: 100 },
  shaky: { label: 'Shaky', color: 'bg-gold', tint: 'bg-gold/35', w: 55 },
  skipped: { label: 'Skipped', color: 'bg-rust', tint: 'bg-rust/20', w: 12 },
}

export function grade(rows) {
  const s = rows.reduce((a, r) => a + (r.status === 'solid' ? 1 : r.status === 'shaky' ? 0.5 : 0), 0) / Math.max(rows.length, 1)
  if (s >= 0.85) return ['A', 'text-sage', 'enlightened', 'You could teach this class.']
  if (s >= 0.65) return ['B', 'text-sage', 'enlightened', 'Strong. A couple of ideas to firm up.']
  if (s >= 0.45) return ['C', 'text-gold', 'curious', 'Getting there. Revise the shaky ones tonight.']
  return ['D', 'text-rust', 'confused', 'Lots left to teach. That’s what this is for!']
}

export default function Report({ concepts, status, traps, onQuiz, onRestart }) {
  const root = useRef()
  const rows = concepts.map((c) => ({ ...c, ...(status[c.id] || { status: 'skipped' }) }))
  const order = { skipped: 0, shaky: 1, solid: 2 }
  const sorted = [...rows].sort((a, b) => order[a.status] - order[b.status]) // weakest first: that's what to revise
  const count = (s) => rows.filter((r) => r.status === s).length
  const [letter, color, mood, verdict] = grade(rows)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from('.stat', { y: 30, opacity: 0, stagger: 0.12, duration: 0.6, ease: 'back.out(1.8)' })
      gsap.utils.toArray('.num').forEach((el) => gsap.from(el, { textContent: 0, snap: { textContent: 1 }, duration: 1, ease: 'power2.out' }))
      gsap.from('.stamp', { scale: 3.5, opacity: 0, rotate: 25, duration: 0.5, delay: 0.7, ease: 'power4.in' })
      gsap.from('.row', { y: 30, opacity: 0, stagger: 0.08, duration: 0.5, delay: 0.4, ease: 'power3.out' })
      gsap.from('.bar', { scaleX: 0, transformOrigin: 'left', stagger: 0.08, duration: 0.9, delay: 0.6, ease: 'power2.out' })
    })
    return () => mm.revert()
  }, { scope: root })

  return (
    <div ref={root} className="max-w-4xl mx-auto px-4 py-10 sm:py-14 flex flex-col gap-8">
      <div className="flex flex-wrap items-end gap-6 justify-between">
        <div>
          <p className="font-hand text-3xl text-rust">here’s what you really know</p>
          <h1 className="font-display font-black text-5xl sm:text-6xl tracking-tight leading-none">Your Gap Report</h1>
          <p className="text-lg text-ink/70 mt-3">{verdict}</p>
        </div>
        <div className="flex items-center gap-3">
          <Sam mood={mood} size={110} />
          <span className={`stamp text-6xl ${color}`}>{letter}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(META).map(([k, m]) => (
          <div key={k} className={`stat card p-4 sm:p-5 text-center ${m.tint}`}>
            <div className="num font-display font-black text-5xl sm:text-6xl">{count(k)}</div>
            <div className="font-hand text-2xl">{m.label}</div>
          </div>
        ))}
      </div>

      {traps.caught + traps.missed > 0 && (
        <div className="card p-4 flex items-center gap-4 bg-cream">
          <span className="text-3xl">🕵️</span>
          <p className="text-lg">Sam slipped in <b>{traps.caught + traps.missed}</b> deliberate {traps.caught + traps.missed === 1 ? 'mistake' : 'mistakes'}. You caught <b className="hl">{traps.caught}</b>.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-display font-semibold text-2xl">Idea by idea <span className="text-base font-sans font-normal text-ink/60">(weakest first)</span></h2>
        {sorted.map((r) => (
          <div key={r.id} className="row card p-4 sm:p-5">
            <div className="flex justify-between items-baseline gap-4">
              <span className="font-display font-semibold text-xl">{r.name}</span>
              <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border-2 border-ink ${META[r.status].tint}`}>{META[r.status].label}</span>
            </div>
            <div className="h-3 bg-paper rounded-full border-2 border-ink overflow-hidden mt-3">
              <div className={`bar h-full ${META[r.status].color}`} style={{ width: `${META[r.status].w}%` }} />
            </div>
            {r.note && r.status !== 'solid' && <p className="mt-3 text-ink/80"><span className="font-hand text-xl text-rust mr-1">Sam noticed:</span>{r.note}</p>}
            {r.status === 'skipped' && <p className="mt-3 text-ink/70"><span className="font-hand text-xl text-rust mr-1">You never explained:</span>{r.fact}</p>}
          </div>
        ))}
      </div>

      <div className="card p-6 bg-ink text-paper flex flex-wrap items-center gap-5 justify-between">
        <div>
          <h3 className="font-display font-black text-2xl">Now test the weak spots</h3>
          <p className="text-paper/70">A quiz where the wrong answers are your own misconceptions.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn !border-paper !shadow-[4px_4px_0_#f6efe0]" onClick={() => onQuiz(rows)}>Misconception quiz →</button>
          <button className="btn btn-ghost !border-paper !shadow-[4px_4px_0_#f6efe0]" onClick={onRestart}>New notes</button>
        </div>
      </div>
    </div>
  )
}
