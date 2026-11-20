import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Landing from './Landing.jsx'
import Setup from './Setup.jsx'
import Teach from './Teach.jsx'
import Report from './Report.jsx'
import Quiz from './Quiz.jsx'
import Backdrop from './Backdrop.jsx'
import Sam from './Sam.jsx'
import { sound, setMuted } from './sound.js'

const STEPS = [['setup', 'Notes'], ['teach', 'Teach'], ['report', 'Report'], ['quiz', 'Quiz']]

export default function App() {
  const [view, setView] = useState('landing')
  const [sample, setSample] = useState(false)
  const [ctx, setCtx] = useState(null) // {notes, concepts}
  const [status, setStatus] = useState({})
  const [rows, setRows] = useState([])
  const [traps, setTraps] = useState({ caught: 0, missed: 0 })
  const [muted, setM] = useState(sound.muted)
  const stage = useRef()

  useGSAP(() => {
    window.scrollTo(0, 0)
    gsap.from(stage.current, { opacity: 0, y: 18, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity' })
  }, { dependencies: [view] })

  if (view === 'landing') return <div ref={stage}><Landing onStart={(s) => { setSample(!!s); setView('setup') }} /></div>

  let page
  if (view === 'setup') page = <Setup sample={sample} onReady={(c) => { setCtx(c); setView('teach') }} />
  else if (view === 'teach') page = <Teach {...ctx} onDone={(s, t) => { setStatus(s); setTraps({ ...t }); setView('report') }} />
  else if (view === 'report') page = <Report concepts={ctx.concepts} status={status} traps={traps} onQuiz={(r) => { setRows(r); setView('quiz') }} onRestart={() => { setSample(false); setView('setup') }} />
  else page = <Quiz rows={rows} onBack={() => setView('report')} />

  const at = STEPS.findIndex(([k]) => k === view)
  return (
    <>
      <Backdrop />
      <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/75 border-b-2 border-ink/10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <button className="flex items-center gap-2 font-display font-black text-lg cursor-pointer" onClick={() => setView('landing')} aria-label="Back to home">
            <Sam mood="curious" size={30} still /><span className="hidden sm:inline">Professor Reverse</span>
          </button>
          <ol className="flex items-center gap-1 sm:gap-2 mx-auto text-sm">
            {STEPS.map(([k, label], i) => (
              <li key={k} className="flex items-center gap-1 sm:gap-2">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 transition-colors ${i === at ? 'border-ink bg-ink text-paper' : i < at ? 'border-ink/40 text-ink/70' : 'border-transparent text-ink/35'}`}>
                  <span className="font-semibold">{i < at ? '✓' : i + 1}</span><span className="hidden sm:inline">{label}</span>
                </span>
                {i < STEPS.length - 1 && <span className="w-3 sm:w-6 h-0.5 bg-ink/20" />}
              </li>
            ))}
          </ol>
          <button className="text-sm px-3 h-9 rounded-full border-2 border-ink/20 hover:border-ink cursor-pointer" aria-pressed={!muted} title="Toggle sound"
            onClick={() => { setMuted(!muted); setM(!muted) }}>{muted ? '🔇' : '🔊'}</button>
        </div>
      </header>
      <main ref={stage}>{page}</main>
    </>
  )
}
