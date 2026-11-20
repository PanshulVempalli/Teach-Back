// Hand-drawn spot illustrations (inline SVG, wobble filter from Landing). Sam is the protagonist in each.
const INK = '#2b2118', RUST = '#c4552d', SAGE = '#5e8c61', GOLD = '#d9a72e'
const line = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }

function SamFace({ x, y, s = 1, mouth = 'M-12 12 Q0 18 12 12', browL = 0, browR = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -32C25 -32 35 -13 34 8 33 29 18 36 0 36 -18 36 -33 29 -34 8 -35 -13 -25 -32 0 -32Z" {...line} fill="#e3c46b" />
      {[-11, 11].map((cx) => (
        <g key={cx}><circle cx={cx} cy={-2} r={7} {...line} fill="#fff" strokeWidth={2} /><circle cx={cx + 1} cy={-1} r={3} fill={INK} /></g>
      ))}
      <path d={`M-19 ${-14 + browL} L-5 ${-14 - browL}`} {...line} strokeWidth={2.5} />
      <path d={`M5 ${-14 - browR} L19 ${-14 + browR}`} {...line} strokeWidth={2.5} />
      <path d={mouth} {...line} strokeWidth={2.5} />
    </g>
  )
}

const Frame = ({ children, label }) => (
  <svg viewBox="0 0 200 140" role="img" aria-label={label} className="w-full h-auto" style={{ filter: 'url(#wobble)' }}>{children}</svg>
)

export const Paste = () => (
  <Frame label="Sam reading a page of notes">
    <g transform="rotate(-5 60 70)">
      <rect x="22" y="18" width="78" height="100" rx="4" {...line} fill="#fffaf0" />
      {[38, 54, 70, 86].map((y, i) => <path key={y} d={`M32 ${y} q10 -4 20 0 t20 0 ${i === 3 ? '' : 't10 0'}`} {...line} strokeWidth={2} />)}
    </g>
    <path d="M108 70 q14 -12 28 -2" stroke={RUST} {...line} style={{ stroke: RUST }} />
    <path d="M130 58 l8 8 -11 5" style={{ stroke: RUST }} {...line} />
    <SamFace x={160} y={66} s={0.85} mouth="M-10 12 Q0 14 10 12" />
  </Frame>
)

export const Teach = () => (
  <Frame label="Sam asking a confused question">
    <SamFace x={52} y={86} s={0.95} mouth="M-11 14 Q0 8 11 14" browL={4} browR={4} />
    <path d="M92 20 h92 a6 6 0 0 1 6 6 v42 a6 6 0 0 1 -6 6 h-62 l-16 14 v-14 h-14 a6 6 0 0 1 -6 -6 v-42 a6 6 0 0 1 6 -6z" {...line} fill="#fffaf0" />
    <text x="138" y="62" textAnchor="middle" fontFamily="Caveat, cursive" fontSize="24" fontWeight="600" fill={RUST}>wait, why?</text>
  </Frame>
)

export const Report = () => (
  <Frame label="Sam peeking at a bar chart of solid, shaky and skipped ideas">
    {[['solid', 84, SAGE], ['shaky', 52, GOLD], ['skipped', 22, RUST]].map(([t, w, c], i) => (
      <g key={t}>
        <text x="10" y={42 + i * 34} fontFamily="Caveat, cursive" fontSize="19" fontWeight="600" fill={INK}>{t}</text>
        <rect x="62" y={28 + i * 34} width={w} height="20" rx="5" {...line} fill={c} strokeWidth={2.5} />
      </g>
    ))}
    <SamFace x={166} y={44} s={0.6} mouth="M-8 12 Q0 18 8 12" />
  </Frame>
)
