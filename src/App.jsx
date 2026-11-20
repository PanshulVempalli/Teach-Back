import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Landing from './Landing.jsx'
import Setup from './Setup.jsx'
import Teach from './Teach.jsx'
import Report from './Report.jsx'
import Quiz from './Quiz.jsx'
import { sound, setMuted } from './sound.js'

export default function App() {
  const [view, setView] = useState('landing')
  const [ctx, setCtx] = useState(null) // {notes, concepts}
  const [status, setStatus] = useState({})
  const [rows, setRows] = useState([])
  const [muted, setM] = useState(sound.muted)
  const stage = useRef()

  // Fade-and-rise between screens (opacity/transform only).
  useGSAP(() => { gsap.from(stage.current, { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out' }) }, { dependencies: [view] })

  let page
  if (view === 'landing') page = <Landing onStart={() => setView('setup')} />
  else if (view === 'setup') page = <Setup onReady={(c) => { setCtx(c); setView('teach') }} />
  else if (view === 'teach') page = <Teach {...ctx} onDone={(s) => { setStatus(s); setView('report') }} />
  else if (view === 'report') page = <Report concepts={ctx.concepts} status={status} onQuiz={(r) => { setRows(r); setView('quiz') }} onRestart={() => setView('setup')} />
  else page = <Quiz rows={rows} onBack={() => setView('report')} />

  return (
    <>
      <button className="fixed top-3 right-3 z-50 card px-3 py-1 text-sm cursor-pointer" aria-pressed={muted}
        onClick={() => { setMuted(!muted); setM(!muted) }}>{muted ? '🔇 Sound off' : '🔊 Sound on'}</button>
      <div ref={stage}>{page}</div>
    </>
  )
}
