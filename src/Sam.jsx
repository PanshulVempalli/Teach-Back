import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

// Mouth paths share one command shape so GSAP can tween between them.
const MOUTH = {
  confused: 'M38 78 Q50 70 62 78',
  curious: 'M40 76 Q50 78 60 76',
  enlightened: 'M34 70 Q50 92 66 70',
}
const BROW = { confused: [-14, 14], curious: [0, 0], enlightened: [10, -10] }
const COLOR = { confused: '#d98b6a', curious: '#e3c46b', enlightened: '#8fc08f' }

export default function Sam({ mood = 'curious', size = 120, still = false }) {
  const root = useRef()
  useGSAP(() => {
    gsap.to('.mouth', { attr: { d: MOUTH[mood] }, duration: 0.5, ease: 'back.out(2)' })
    gsap.to('.brow-l', { rotation: BROW[mood][0], transformOrigin: '50% 50%', duration: 0.4 })
    gsap.to('.brow-r', { rotation: BROW[mood][1], transformOrigin: '50% 50%', duration: 0.4 })
    gsap.to('.body', { fill: COLOR[mood], duration: 0.6 })
    gsap.fromTo(root.current, { scale: 0.92 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' })
  }, { scope: root, dependencies: [mood] })

  // `still` keeps the mood tweens but drops the endless bob and blink (used where nothing may move on its own).
  useGSAP(() => {
    if (still) return
    gsap.to('.blob', { y: -4, repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut' })
    gsap.timeline({ repeat: -1, repeatDelay: 3 })
      .to('.eye', { scaleY: 0.1, transformOrigin: '50% 50%', duration: 0.08 })
      .to('.eye', { scaleY: 1, duration: 0.08 })
  }, { scope: root })

  return (
    <svg ref={root} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`Sam looks ${mood}`}>
      <g className="blob">
        <path className="body" fill={COLOR.curious} stroke="#2b2118" strokeWidth="3" d="M50 8C80 8 94 32 92 58 90 84 72 94 50 94 28 94 10 84 8 58 6 32 20 8 50 8Z" />
        {[36, 64].map((cx) => (
          <g className="eye" key={cx}>
            <circle cx={cx} cy="50" r="9" fill="#fff" stroke="#2b2118" strokeWidth="2.5" />
            <circle cx={cx + 1.5} cy="51" r="4" fill="#2b2118" />
          </g>
        ))}
        <line className="brow-l" x1="26" y1="32" x2="44" y2="32" stroke="#2b2118" strokeWidth="3" strokeLinecap="round" />
        <line className="brow-r" x1="56" y1="32" x2="74" y2="32" stroke="#2b2118" strokeWidth="3" strokeLinecap="round" />
        <path className="mouth" d={MOUTH.curious} fill="none" stroke="#2b2118" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
