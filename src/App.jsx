import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Landing from './Landing.jsx'
import Setup from './Setup.jsx'
import Teach from './Teach.jsx'
import Report from './Report.jsx'
import Quiz from './Quiz.jsx'
import Backdrop from './Backdrop.jsx'
import { sound, setMuted } from './sound.js'

export default function App() {
  const [view, setView] = useState('landing')
  const [ctx, setCtx] = useState(null) // {notes, concepts}
  const [status, setStatus] = useState({})
  const [rows, setRows] = useState([])
  const [traps, setTraps] = useState({ caught: 0, missed: 0 })
  const [muted, setM] = useState(sound.muted)
  const stage = useRef()

  // Fade-and-rise between app screens (opacity/transform only); the landing has its own entrance.
  useGSAP(() => { if (view !== 'landing') gsap.from(stage.current, { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out', clearProps: 'transform,opacity' }) }, { dependencies: [view] })

  // The landing is its own page (kit CSS); index.css keeps the paper, grain and margin for the app screens only.
  useLayoutEffect(() => { document.body.classList.toggle('is-landing', view === 'landing') }, [view])

  let page
  if (view === 'landing') page = <Landing onStart={() => setView('setup')} />
  else if (view === 'setup') page = <Setup onReady={(c) => { setCtx(c); setView('teach') }} />
  else if (view === 'teach') page = <Teach {...ctx} onDone={(s, t) => { setStatus(s); setTraps({ ...t }); setView('report') }} />
  else if (view === 'report') page = <Report concepts={ctx.concepts} status={status} traps={traps} onQuiz={(r) => { setRows(r); setView('quiz') }} onRestart={() => setView('setup')} />
  else page = <Quiz rows={rows} onBack={() => setView('report')} />

  return (
    <>
      {view !== 'landing' && (
        <button className="fixed top-3 right-3 z-50 card px-3 min-h-11 text-sm cursor-pointer" aria-pressed={muted}
          onClick={() => { setMuted(!muted); setM(!muted) }}>{muted ? 'Sound off' : 'Sound on'}</button>
      )}
      {view !== 'landing' && <Backdrop />}
      <div ref={stage}>{page}</div>
    </>
  )
}
