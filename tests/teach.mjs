// Live check of Teach Mode branches. Needs `npm run dev` on :5173 (or PORT=...) and a GEMINI_API_KEY.
import assert from 'node:assert/strict'
import { gradePrompt, normalizeGrade, samPrompt, normalizeSam, tooShort, shouldTrap } from '../src/teachLogic.js'

const base = `http://localhost:${process.env.PORT || 5173}/api/gemini`
const ai = async (prompt) => {
  const r = await fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, json: true }) })
  const d = await r.json(); if (!r.ok) throw new Error(d.error); return JSON.parse(d.text)
}
const concepts = [
  { id: 'c1', name: 'Photosynthesis', fact: 'Plants convert light, water and CO2 into glucose and oxygen in chloroplasts.' },
  { id: 'c2', name: 'Respiration', fact: 'Cells break glucose down with oxygen in mitochondria to release ATP.' },
  { id: 'c3', name: 'Chlorophyll', fact: 'Chlorophyll absorbs mostly red and blue light and reflects green.' },
]
const sam = (t) => ({ who: 'sam', text: t }), you = (t) => ({ who: 'you', text: t })
const run = async (name, msgs, pendingTrap = null, status = {}) => {
  const g = normalizeGrade(await ai(gradePrompt({ concepts, status, msgs, pendingTrap })), concepts)
  const r = normalizeSam(await ai(samPrompt({ concepts, status, msgs, g: { ...g, caughtTrap: pendingTrap ? g.caughtTrap : null }, trap: false })))
  console.log(`\n[${name}] intent=${g.intent} frustrated=${g.frustrated} vague=${JSON.stringify(g.vague)} caught=${g.caughtTrap}\n  touched=${g.touched.map((t) => t.id + ':' + t.status)}\n  Sam(${r.mood}): ${r.reply}`)
  return g
}
const hi = sam('Explain something to me?')

assert.ok(tooShort('ok') && !tooShort('plants make food from light'))
assert.ok(shouldTrap(3, { intent: 'explaining', frustrated: false }) && !shouldTrap(3, { intent: 'explaining', frustrated: true }) && !shouldTrap(2, { intent: 'explaining', frustrated: false }))
assert.deepEqual(normalizeGrade({ intent: 'bogus', touched: [{ id: 'zzz', status: 'solid' }] }, concepts).touched, []) // invented concept ids dropped

let g = await run('solid', [hi, you('Plants use light, water and CO2 inside chloroplasts to make glucose and oxygen.')])
assert.equal(g.intent, 'explaining'); assert.ok(g.touched.some((t) => t.id === 'c1' && t.status === 'solid'))

g = await run('vague', [hi, you('So the plant kind of does stuff with the sun and it makes some things.')])
assert.ok(g.touched.every((t) => t.status === 'shaky'))

g = await run('asks Sam', [hi, you('Wait, do you know what a chloroplast even is?')])
assert.equal(g.intent, 'asking_sam')

g = await run('frustrated', [hi, you('ugh I have no idea what to say, this is too hard')])
assert.ok(g.frustrated)

const wrong = 'Plants take in oxygen and give out carbon dioxide when they photosynthesise'
const q = [hi, you('Plants use light to make glucose.'), sam(`So ${wrong}, right?`)]
g = await run('caught trap', [...q, you('No, backwards: they take in CO2 and release oxygen.')], wrong)
assert.equal(g.caughtTrap, true)
g = await run('missed trap', [...q, you('Yeah exactly, that is right.')], wrong)
assert.equal(g.caughtTrap, false)
console.log('\nALL BRANCH CHECKS PASSED')
