import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Faint marginalia: the questions and half-ideas of someone mid-study. Text, kept to the edges, behind content.
const MARKS = [
  ['why?', 7, 12, -8, 'rust'], ['= ?', 90, 9, 6, 'ink'], ['wait…', 8, 38, 5, 'ink'], ['H₂O', 91, 33, -5, 'ink'],
  ['how come?', 7, 62, -6, 'rust'], ['e = mc²', 87, 58, 7, 'ink'], ['huh', 92, 80, -4, 'rust'], ['∑ ?', 9, 86, 8, 'ink'],
  ['x² + 1', 80, 90, -7, 'ink'], ['?!', 12, 24, 10, 'rust'],
]

export default function Backdrop() {
  const root = useRef()
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.mark', { y: 'random(-16, 16)', x: 'random(-8, 8)', rotation: '+=random(-4, 4)', duration: 'random(4, 7)', ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: { each: 0.3, from: 'random' } })
    })
    return () => mm.revert()
  }, { scope: root })

  return (
    <div ref={root} aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none hidden sm:block">
      {MARKS.map(([t, x, y, r, c], i) => (
        <span key={i} className={`mark absolute font-hand text-4xl md:text-6xl ${c === 'rust' ? 'text-rust/20' : 'text-ink/10'}`}
          style={{ left: `${x}%`, top: `${y}%`, rotate: `${r}deg` }}>{t}</span>
      ))}
    </div>
  )
}
