import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Sam from './Sam.jsx'
gsap.registerPlugin(ScrollTrigger)

export default function Landing({ onStart }) {
  const root = useRef()
  // The one scroll moment: "apps that explain" gets struck out, "you explain" takes over.
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.flip', start: 'top top', end: '+=1200', scrub: 1, pin: true } })
      tl.to('.strike', { scaleX: 1, duration: 1 })
        .to('.old', { opacity: 0.25, duration: 1 })
        .fromTo('.new', { opacity: 0, y: 60, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 1.5 })
        .fromTo('.sam-big', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 })
      gsap.from('.hero > *', { y: 30, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' })
    })
    // Reduced motion: show the end state, nothing hidden or moving.
    mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set('.strike', { scaleX: 1 }); gsap.set('.new, .sam-big', { opacity: 1 }) })
    return () => mm.revert()
  }, { scope: root })

  return (
    <div ref={root}>
      <section className="hero min-h-screen flex flex-col items-center justify-center text-center gap-6 px-6">
        <Sam mood="curious" size={140} />
        <h1 className="font-display font-extrabold text-6xl md:text-8xl">Professor Reverse</h1>
        <p className="font-hand text-3xl text-rust">you teach. Sam gets confused. you find the gaps.</p>
        <button className="btn text-lg" onClick={onStart}>Start teaching →</button>
        <span className="opacity-60 text-sm">scroll ↓</span>
      </section>

      <section className="flip h-screen flex flex-col items-center justify-center text-center px-6 gap-8">
        <div className="relative inline-block">
          <h2 className="old font-display text-4xl md:text-6xl">Apps that explain</h2>
          <span className="strike absolute left-0 top-1/2 h-1.5 w-full bg-rust origin-left scale-x-0" />
        </div>
        <h2 className="new font-display font-extrabold text-6xl md:text-8xl text-rust opacity-0">You explain.</h2>
        <div className="sam-big opacity-0"><Sam mood="confused" size={110} /></div>
      </section>

      <section className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <p className="max-w-xl text-lg">Teaching exposes what you don’t actually know. Paste your notes, explain them to Sam, and see exactly where you went vague.</p>
        <button className="btn text-lg" onClick={onStart}>Upload my notes →</button>
      </section>
    </div>
  )
}
