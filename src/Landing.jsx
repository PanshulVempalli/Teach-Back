import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import Sam from './Sam.jsx'
import { Paste, Teach, Report } from './Fragments.jsx'
gsap.registerPlugin(ScrollTrigger)

const HEADING = 'Learn it by teaching an AI student.'

export default function Landing({ onStart }) {
  const root = useRef()
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Lenis is the only smooth-scroll engine; it drives ScrollTrigger and is destroyed on cleanup.
      const lenis = new Lenis({ lerp: 0.1 })
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (t) => lenis.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
      document.fonts?.ready.then(() => ScrollTrigger.refresh()) // display fonts change heights

      // Hero intro: heading word by word, then the rest.
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.word', { yPercent: 110, stagger: 0.07, duration: 0.8 })
        .from('.hero > *:not(h1)', { y: 24, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.5')

      // The one scroll moment: "apps that explain" gets struck out, "you explain" takes over.
      gsap.timeline({ scrollTrigger: { trigger: '.flip', start: 'top top', end: '+=1200', scrub: 1, pin: true } })
        .to('.strike', { scaleX: 1, duration: 1 })
        .to('.old', { opacity: 0.25, duration: 1 })
        .fromTo('.new', { opacity: 0, y: 60, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 1.5 })
        .fromTo('.sam-big', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 })

      // Magnetic CTA: pointer-only, moves a wrapper so the button keeps its own hover/press styles.
      const cleanups = []
      const magnet = root.current.querySelector('.magnet')
      if (magnet && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const xTo = gsap.quickTo(magnet, 'x', { duration: 0.4, ease: 'power3' })
        const yTo = gsap.quickTo(magnet, 'y', { duration: 0.4, ease: 'power3' })
        const move = (e) => {
          const r = magnet.getBoundingClientRect()
          xTo((e.clientX - (r.left + r.width / 2)) * 0.25)
          yTo((e.clientY - (r.top + r.height / 2)) * 0.25)
        }
        const leave = () => { xTo(0); yTo(0) }
        magnet.addEventListener('pointermove', move)
        magnet.addEventListener('pointerleave', leave)
        cleanups.push(() => { magnet.removeEventListener('pointermove', move); magnet.removeEventListener('pointerleave', leave) })
      }
      return () => { cleanups.forEach((f) => f()); gsap.ticker.remove(tick); lenis.destroy() }
    })
    // Reduced motion: no smooth scroll, no scrub, final states shown at once.
    mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('.strike', { scaleX: 1 }); gsap.set('.new, .sam-big', { opacity: 1 }) })
    return () => mm.revert()
  }, { scope: root })

  return (
    <div ref={root}>
      <section className="hero min-h-screen flex flex-col items-center justify-center text-center gap-6 px-6">
        <Sam mood="curious" size={140} />
        <p className="font-hand text-3xl text-rust">Professor Reverse</p>
        {/* Words are split for the reveal; the full sentence stays the accessible name. */}
        <h1 aria-label={HEADING} className="font-display font-extrabold text-5xl md:text-7xl max-w-4xl text-balance">
          {HEADING.split(' ').map((w, i) => (
            <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] mr-[0.25em] last:mr-0">
              <span className="word inline-block">{w}</span>
            </span>
          ))}
        </h1>
        <p className="max-w-xl text-lg">Paste notes or drop a PDF. Sam gets confused where you’re vague, then you get a gap report and a quiz built from your own mistakes.</p>
        <span className="magnet inline-block"><button className="btn text-lg" onClick={onStart}>Start teaching →</button></span>
        <p className="text-sm opacity-70">No sign-up.</p>
      </section>

      <section className="flip h-screen flex flex-col items-center justify-center text-center px-6 gap-8">
        <div className="relative inline-block">
          <h2 className="old font-display text-4xl md:text-6xl">Apps that explain</h2>
          <span className="strike absolute left-0 top-1/2 h-1.5 w-full bg-rust origin-left scale-x-0" />
        </div>
        <h2 className="new font-display font-extrabold text-6xl md:text-8xl text-rust opacity-0">You explain.</h2>
        <div className="sam-big opacity-0"><Sam mood="confused" size={110} /></div>
      </section>

      <section className="min-h-screen flex flex-col items-center justify-center gap-10 px-6 py-16">
        <h2 className="font-display font-extrabold text-4xl md:text-5xl text-center text-balance">Three steps. Sam does the confusing.</h2>
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[[Paste, 'Paste your notes', 'Text or PDF. Sam never sees the answers, only the questions.'],
            [Teach, 'Explain it to Sam', 'He asks naive questions and sometimes repeats you back wrong. Catch him.'],
            [Report, 'Read your gaps', 'Solid, shaky or skipped for every idea, then a quiz made from your own slips.']].map(([Art, h, p]) => (
            <div key={h} className="card card-btn p-5 flex flex-col gap-3">
              <h3 className="font-display text-2xl font-extrabold">{h}</h3>
              <Art />
              <p>{p}</p>
            </div>
          ))}
        </div>
        <button className="btn text-lg" onClick={onStart}>Upload my notes →</button>
      </section>
    </div>
  )
}
