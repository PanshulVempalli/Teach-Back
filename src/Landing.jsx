import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Sam from './Sam.jsx'

gsap.registerPlugin(ScrollTrigger)

// The scripted demo conversation: shows the trap mechanic in five beats.
const SCRIPT = [
  { who: 'you', text: 'Glycolysis splits glucose to make some energy.' },
  { who: 'sam', mood: 'confused', text: 'When you say "some energy", do you mean ATP, or heat?', gap: 'vague' },
  { who: 'you', text: 'ATP. It nets 2 ATP, and it happens in the cytoplasm.' },
  { who: 'sam', mood: 'curious', text: 'Ohh. So it happens in the mitochondria, right?', trap: true },
  { who: 'you', text: 'No! The cytoplasm. Mitochondria come later, in the Krebs cycle.' },
  { who: 'sam', mood: 'enlightened', text: 'Cytoplasm first, then mitochondria. Got it!', caught: true },
]

const MARGIN = ['why?', 'wait…', 'so it’s like…', 'huh?', 'but how?', 'what’s ATP?', 'hang on', 'say that again?']

function Logo({ dark }) {
  return (
    <span className={`flex items-center gap-2 font-display font-black text-xl tracking-tight ${dark ? 'text-paper' : ''}`}>
      <Sam mood="curious" size={34} still /> Professor Reverse
    </span>
  )
}

function Demo() {
  const root = useRef()
  const [n, setN] = useState(0)
  const [typing, setTyping] = useState(false)
  const mood = [...SCRIPT.slice(0, n)].reverse().find((m) => m.mood)?.mood || 'curious'
  const caught = SCRIPT.slice(0, n).some((m) => m.caught)
  const vague = SCRIPT.slice(0, n).some((m) => m.gap)

  useGSAP(() => {
    let timers = []
    const play = () => {
      timers.forEach(clearTimeout); timers = []
      setN(0)
      let t = 400
      SCRIPT.forEach((m, i) => {
        if (m.who === 'sam') { timers.push(setTimeout(() => setTyping(true), t)); t += 1100 }
        timers.push(setTimeout(() => { setTyping(false); setN(i + 1) }, t))
        t += m.who === 'you' ? 1500 : 1700
      })
    }
    ScrollTrigger.create({ trigger: root.current, start: 'top 70%', once: true, onEnter: play })
    root.current.__replay = play
    return () => timers.forEach(clearTimeout)
  }, { scope: root })

  useGSAP(() => {
    gsap.from('.msg:last-child', { y: 14, opacity: 0, scale: 0.97, duration: 0.4, ease: 'back.out(1.6)' })
  }, { scope: root, dependencies: [n] })

  return (
    <div ref={root} className="grid lg:grid-cols-[1fr_300px] gap-6 items-stretch">
      <div className="card p-4 sm:p-6 flex flex-col">
        <div className="flex items-center gap-3 pb-4 border-b-2 border-dashed border-ink/20">
          <Sam mood={mood} size={56} />
          <div>
            <div className="font-display font-semibold text-lg leading-tight">Sam</div>
            <div className="text-sm text-ink/60">AI student · topic: cellular respiration</div>
          </div>
          <button className="ml-auto text-sm underline decoration-dotted underline-offset-4 cursor-pointer" onClick={() => root.current.__replay?.()}>Replay ↺</button>
        </div>
        <div className="flex flex-col gap-3 pt-4 min-h-[380px]">
          {SCRIPT.slice(0, n).map((m, i) => (
            <div key={i} className={`msg max-w-[85%] ${m.who === 'you' ? 'self-end' : 'self-start'}`}>
              {m.who === 'you' ? (
                <div className="bg-ink text-paper rounded-2xl rounded-br-sm px-4 py-2.5">{m.text}</div>
              ) : (
                <div className={`relative rounded-2xl rounded-bl-sm border-2 border-ink px-4 py-2 font-hand text-[1.6rem] leading-7 ${m.trap ? 'bg-rust/15' : 'bg-cream'}`}>
                  {m.text}
                  {m.trap && <span className="absolute -top-3 -right-2 rotate-6 bg-rust text-white text-xs font-sans font-semibold px-2 py-0.5 rounded-full">deliberate mistake</span>}
                </div>
              )}
            </div>
          ))}
          {typing && <div className="typing self-start flex gap-1.5 px-4 py-3 rounded-2xl border-2 border-ink/30"><span /><span /><span /></div>}
        </div>
      </div>
      <div className="card p-5 flex flex-col gap-4 bg-sky/60">
        <div className="font-display font-semibold">Live gap report</div>
        {[
          ['Glycolysis', n >= 3 ? 'solid' : n >= 1 ? 'shaky' : null],
          ['Where it happens', n >= 5 ? 'solid' : n >= 3 ? 'shaky' : null],
          ['Krebs cycle', n >= 5 ? 'shaky' : null],
          ['Electron transport', null],
        ].map(([name, s]) => (
          <div key={name}>
            <div className="flex justify-between text-sm"><span>{name}</span><span className="font-hand text-lg leading-none">{s ? (s === 'solid' ? 'Solid' : 'Shaky') : '—'}</span></div>
            <div className="h-3 rounded-full border-2 border-ink bg-cream overflow-hidden mt-1">
              <div className={`h-full transition-all duration-700 ${s === 'solid' ? 'bg-sage' : 'bg-gold'}`} style={{ width: s === 'solid' ? '100%' : s ? '50%' : '0%' }} />
            </div>
          </div>
        ))}
        <div className="mt-auto pt-3 border-t-2 border-dashed border-ink/20 text-sm flex flex-col gap-2">
          <div className={`transition-opacity ${vague ? 'opacity-100' : 'opacity-30'}`}>⚑ Vague phrase spotted: <span className="hl">“some energy”</span></div>
          <div className={`transition-opacity ${caught ? 'opacity-100' : 'opacity-30'}`}>✓ Mistakes caught: <b>{caught ? '1 of 1' : '0'}</b></div>
        </div>
      </div>
    </div>
  )
}

export default function Landing({ onStart }) {
  const root = useRef()

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // hero: words rise, then the red pen strikes "explain it to you" and the handwritten fix appears
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.h-word', { yPercent: 110, opacity: 0, stagger: 0.06, duration: 0.8 })
        .fromTo('.strike-pen', { '--s': 0 }, { '--s': 1, duration: 0.45, ease: 'power2.in' }, '+=0.2')
        .from('.h-fix', { opacity: 0, y: 10, rotate: -12, duration: 0.5, ease: 'back.out(2)' })
        .from('.h-sub, .h-cta', { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.2')
        .from('.h-sam', { scale: 0.6, opacity: 0, rotate: -10, duration: 1, ease: 'elastic.out(1,0.5)' }, 0.3)
        .from('.h-bubble', { scale: 0, transformOrigin: '0% 100%', stagger: 0.25, duration: 0.5, ease: 'back.out(2.5)' }, 1.2)

      gsap.to('.h-sam', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } })
      })
      gsap.from('.step', { y: 60, opacity: 0, rotate: (i) => [-3, 2, -2][i], stagger: 0.15, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 75%' } })

      // the big flip line: "Apps explain." slides away as "You teach." arrives
      gsap.timeline({ scrollTrigger: { trigger: '.flip', start: 'top 70%', end: 'bottom 60%', scrub: 1 } })
        .from('.flip-a', { xPercent: -30, opacity: 0.1 })
        .from('.flip-b', { xPercent: 30, opacity: 0.1 }, 0)

      gsap.from('.stamp-in', { scale: 3, opacity: 0, rotate: 20, duration: 0.5, ease: 'power4.in', scrollTrigger: { trigger: '.stamp-in', start: 'top 80%' } })
    })
    return () => mm.revert()
  }, { scope: root })

  return (
    <div ref={root}>
      {/* nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/75 border-b-2 border-ink/10">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <Logo />
          <div className="hidden md:flex gap-6 ml-auto text-sm font-medium">
            <a href="#demo" className="hover:text-rust">See it work</a>
            <a href="#how" className="hover:text-rust">How it works</a>
            <a href="#why" className="hover:text-rust">Why it works</a>
          </div>
          <button className="btn ml-auto md:ml-0 !py-2 text-sm" onClick={() => onStart()}>Start teaching</button>
        </nav>
      </header>

      {/* hero */}
      <section className="hero relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-24 grid lg:grid-cols-[1.25fr_1fr] gap-10 items-center">
        <div>
          <p className="h-sub inline-flex items-center gap-2 text-sm font-medium bg-cream border-2 border-ink rounded-full px-3 py-1 mb-6">
            <span className="w-2 h-2 rounded-full bg-sage" /> The Feynman technique, with an AI student
          </p>
          <h1 className="font-display font-black text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.95] tracking-[-0.035em]">
            <span className="block overflow-hidden pb-1"><span className="h-word inline-block">Every</span> <span className="h-word inline-block">study</span> <span className="h-word inline-block">app</span></span>
            <span className="block overflow-hidden pb-2"><span className="h-word inline-block"><span className="strike-pen">explains&nbsp;it&nbsp;to&nbsp;you.</span></span></span>
            <span className="block overflow-hidden pb-2"><span className="h-word inline-block">This</span> <span className="h-word inline-block">one</span> <span className="h-word inline-block italic font-semibold">makes</span> <span className="h-word inline-block italic font-semibold">you</span> <span className="h-word inline-block hl">teach.</span></span>
          </h1>
          <p className="h-fix font-hand text-3xl text-rust -mt-1 mb-4 rotate-[-2deg]">← because that’s how you find what you don’t know</p>
          <p className="h-sub text-lg sm:text-xl text-ink/75 max-w-xl leading-relaxed">
            Paste your notes. Explain each idea to <b className="text-ink">Sam</b>, an AI student who gets confused exactly where you’re vague, and sneaks in mistakes to see if you notice.
          </p>
          <div className="h-cta flex flex-wrap gap-3 mt-8">
            <button className="btn btn-lg" onClick={() => onStart()}>Start teaching Sam →</button>
            <button className="btn btn-ghost btn-lg" onClick={() => onStart(true)}>Try with sample notes</button>
          </div>
          <p className="h-cta text-sm text-ink/60 mt-4">Free · no sign-up · works with PDFs and pasted text</p>
        </div>
        <div className="relative flex justify-center lg:justify-end pt-10">
          <div className="h-sam relative">
            <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-gold/30 blur-2xl" />
            <Sam mood="confused" size={300} />
            <div className="h-bubble absolute -top-6 -left-8 sm:-left-20 card px-4 py-2 font-hand text-2xl -rotate-6">wait… why?</div>
            <div className="h-bubble absolute top-1/2 -right-2 sm:-right-10 card px-4 py-2 font-hand text-2xl rotate-6 bg-sky">so it’s like…</div>
            <div className="h-bubble absolute -bottom-2 left-0 card px-4 py-2 font-hand text-2xl -rotate-3 bg-rust text-white">huh?!</div>
          </div>
        </div>
      </section>

      {/* margin marquee */}
      <div className="bg-ink text-paper py-4 overflow-hidden -rotate-1 border-y-2 border-ink">
        <div className="marquee font-hand text-3xl gap-10">
          {[...MARGIN, ...MARGIN, ...MARGIN, ...MARGIN].map((t, i) => <span key={i} className={`whitespace-nowrap ${i % 3 === 1 ? 'text-gold' : ''}`}>{t} <span className="opacity-40 ml-10">✱</span></span>)}
        </div>
      </div>

      {/* demo */}
      <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <div className="reveal max-w-2xl mb-10">
          <p className="font-hand text-3xl text-rust">watch a real session ↓</p>
          <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-[1]">Sam finds the holes in your understanding.</h2>
          <p className="text-lg text-ink/70 mt-4">He asks about the vague bits, and every few turns he repeats something back <i>slightly wrong</i>. Catch it, and you really know it.</p>
        </div>
        <div className="reveal"><Demo /></div>
      </section>

      {/* flip */}
      <section className="flip overflow-hidden py-12 sm:py-20 border-y-2 border-ink/10 bg-cream/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 font-display font-black tracking-[-0.04em] leading-[0.9] text-[clamp(3rem,11vw,9.5rem)]">
          <div className="flip-a text-ink/25">Apps explain.</div>
          <div className="flip-b text-right">You <span className="italic font-semibold text-rust">teach.</span></div>
        </div>
      </section>

      {/* how */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        <h2 className="reveal font-display font-black text-4xl sm:text-6xl tracking-tight mb-14">Three steps. <span className="italic font-semibold">Ten minutes.</span></h2>
        <div className="steps grid md:grid-cols-3 gap-6">
          {[
            ['1', 'Drop in your notes', 'PDF, text or Markdown. Sam pulls out the 5–8 ideas that matter.', 'bg-cream', 'curious'],
            ['2', 'Teach Sam', 'Explain in your own words. He asks the naive questions a real beginner would.', 'bg-sky', 'confused'],
            ['3', 'Get your gap report', 'Every idea marked solid, shaky or skipped, plus a quiz built from your own mistakes.', 'bg-gold/40', 'enlightened'],
          ].map(([num, t, d, bg, mood]) => (
            <div key={num} className={`step card p-6 ${bg} flex flex-col gap-3 min-h-[260px]`}>
              <div className="flex justify-between items-start">
                <span className="font-hand text-7xl leading-none text-rust">{num}</span>
                <Sam mood={mood} size={64} still />
              </div>
              <h3 className="font-display font-semibold text-2xl mt-auto">{t}</h3>
              <p className="text-ink/70">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* why + report preview */}
      <section id="why" className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 sm:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="reveal">
          <p className="font-hand text-3xl text-rust">the science bit</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight leading-[1.02]">Rereading feels like learning. <span className="hl-rust">Explaining proves it.</span></h2>
          <p className="text-lg text-ink/70 mt-5 leading-relaxed">Richard Feynman’s trick was simple: if you can’t explain it to a beginner, you don’t understand it yet. Learning researchers call the boost you get from teaching the <b className="text-ink">protégé effect</b>.</p>
          <p className="text-lg text-ink/70 mt-4 leading-relaxed">Professor Reverse gives you a beginner on demand, one who never gets bored and never pretends to understand.</p>
        </div>
        <div className="reveal relative sm:pb-28">
          <div className="card p-6 rotate-1">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display font-black text-3xl">Your Gap Report</h3>
              <span className="stamp stamp-in text-sage text-xl">B+</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[['4', 'Solid', 'bg-sage/30'], ['2', 'Shaky', 'bg-gold/40'], ['1', 'Skipped', 'bg-rust/25']].map(([v, l, c]) => (
                <div key={l} className={`rounded-xl border-2 border-ink p-3 text-center ${c}`}><div className="font-display font-black text-4xl">{v}</div><div className="font-hand text-xl">{l}</div></div>
              ))}
            </div>
            <div className="text-sm border-2 border-dashed border-ink/30 rounded-xl p-3"><b>Shaky:</b> Krebs cycle. You said it “makes energy” but not that it produces NADH and FADH₂ for the next stage.</div>
          </div>
          <div className="card p-4 -rotate-2 absolute bottom-0 right-4 sm:-right-6 w-64 z-10 bg-cream hidden sm:block">
            <div className="text-xs text-ink/60 mb-1">Quiz · from your mistakes</div>
            <div className="font-medium text-sm mb-2">Where does glycolysis happen?</div>
            <div className="text-sm rounded-lg border-2 border-ink bg-sage/30 px-2 py-1 mb-1">Cytoplasm ✓</div>
            <div className="text-sm rounded-lg border-2 border-ink/30 px-2 py-1 line-through text-ink/50">Mitochondria</div>
          </div>
        </div>
      </section>

      {/* final cta */}
      <section className="bg-ink text-paper relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="reveal">
            <h2 className="font-display font-black text-5xl sm:text-7xl tracking-tight leading-[0.95]">Sam’s ready to be <span className="italic font-semibold text-gold">confused.</span></h2>
            <p className="text-lg text-paper/70 mt-5 max-w-lg">Bring tomorrow’s exam topic. Ten minutes of teaching shows you exactly what to revise tonight.</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button className="btn btn-lg !border-paper !shadow-[4px_4px_0_#f6efe0]" onClick={() => onStart()}>Start teaching Sam →</button>
              <button className="btn btn-lg btn-ghost !border-paper !shadow-[4px_4px_0_#f6efe0]" onClick={() => onStart(true)}>Use sample notes</button>
            </div>
          </div>
          <div className="reveal justify-self-center"><Sam mood="enlightened" size={220} /></div>
        </div>
        <footer className="border-t border-paper/15">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap gap-4 justify-between items-center text-sm text-paper/60">
            <Logo dark />
            <span>Built for Build Your First AI App 2026 · Powered by Google Gemini</span>
          </div>
        </footer>
      </section>
    </div>
  )
}
