import { useEffect, useLayoutEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import html from './landing.html?raw'
import Sam from './Sam.jsx'

// The kit's scripts are DOM-driven, so they start after this markup exists and are removed with it.
const KIT = ['/assets/system.js', '/assets/motion/motion.js', '/assets/layout/layout.js']
const HTML_MARKS = ['m-enter', 'm-enter-done', 'mo-js', 'mo-safe']

export default function Landing({ onStart }) {
  const root = useRef()
  const start = useRef(onStart)
  start.current = onStart

  // The kit's CSS and head line live in index.html (tagged data-landing) so the first paint is styled;
  // leaving the landing takes them away and the app screens get their own look back.
  useLayoutEffect(() => () => {
    document.querySelectorAll('[data-landing]').forEach((n) => n.remove())
    document.documentElement.classList.remove(...HTML_MARKS)
    for (const k of ['ready', 'momentsReady']) delete document.documentElement.dataset[k]
    document.documentElement.removeAttribute('data-moments-ready')
    for (const a of ['data-type', 'data-radius', 'data-ground', 'data-buttons', 'data-motion']) document.documentElement.removeAttribute(a)
  }, [])

  useEffect(() => {
    const el = root.current
    const sams = [...el.querySelectorAll('.sam-slot')].map((slot) => {
      const r = createRoot(slot)
      r.render(<Sam mood={slot.dataset.mood} size={+slot.dataset.size} still />)
      return r
    })
    const scripts = KIT.map((src) => {
      const s = document.createElement('script')
      s.type = 'module'
      s.src = src
      s.dataset.landing = ''
      document.body.appendChild(s)
      return s
    })
    // The main action starts the app instead of navigating (the href keeps it working as a link without script).
    const click = (e) => {
      const a = e.target.closest('[data-start]')
      if (!a) return
      e.preventDefault()
      start.current()
    }
    el.addEventListener('click', click)
    return () => {
      el.removeEventListener('click', click)
      el.querySelectorAll('[data-moment]').forEach((m) => m.__moment?.destroy?.())
      el.querySelectorAll('[data-ui]').forEach((u) => u.__ui?.destroy?.())
      scripts.forEach((s) => s.remove())
      setTimeout(() => sams.forEach((r) => r.unmount()))
    }
  }, [])

  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
}
