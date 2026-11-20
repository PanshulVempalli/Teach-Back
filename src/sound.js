// Subtle Web Audio cues, C-major family. Never plays on load; user can mute (persisted).
let ctx
export const sound = { muted: (() => { try { return localStorage.getItem('pr-muted') === '1' } catch { return false } })() }
export const setMuted = (m) => { sound.muted = m; try { localStorage.setItem('pr-muted', m ? '1' : '0') } catch {} }

function play(notes, { type = 'sine', step = 0.09, len = 0.22, vol = 0.06 } = {}) {
  if (sound.muted) return
  ctx ||= new AudioContext()
  notes.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * step
    o.type = type; o.frequency.value = f
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    o.connect(g).connect(ctx.destination)
    o.start(t); o.stop(t + len + 0.02)
  })
}

export const cue = {
  send: () => play([392], { len: 0.1, vol: 0.04 }),
  aha: () => play([262, 330, 392, 523], { step: 0.1, len: 0.5 }), // Sam understands
  right: () => play([523, 659], { len: 0.25 }),
  wrong: () => play([220, 196], { type: 'triangle', step: 0.12, len: 0.3 }),
}
