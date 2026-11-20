// Prompt builders + validators for Teach Mode. Pure functions so tests/teach.mjs can run them against the live API.
export const MOODS = ['confused', 'curious', 'enlightened']
const INTENTS = ['explaining', 'asking_sam', 'correcting_sam', 'stuck_or_frustrated', 'off_topic']
const line = (m) => `${m.who === 'sam' ? 'Sam' : 'Student'}: ${m.text}`
// Context retention: last 10 messages in full; everything older lives on in memory() below.
export const recent = (msgs) => msgs.slice(-10).map(line).join('\n')

export function memory(concepts, status) {
  const names = (f) => concepts.filter(f).map((c) => c.name).join(', ') || 'none'
  return `Explained solidly: ${names((c) => status[c.id]?.status === 'solid')}
Explained shakily: ${names((c) => status[c.id]?.status === 'shaky')}
Not yet covered: ${names((c) => !status[c.id])}`
}

// Step 1: one call does intent + sentiment + entity (concept) extraction + grading + trap check.
export function gradePrompt({ concepts, status, msgs, pendingTrap }) {
  const list = concepts.map((c) => `${c.id} | ${c.name}: ${c.fact}`).join('\n')
  return `You silently analyse the latest Student message in a teaching session where the student explains notes to "Sam".
CONCEPTS:\n${list}
MEMORY:\n${memory(concepts, status)}
CONVERSATION:\n${recent(msgs)}
${pendingTrap ? `In his previous turn Sam deliberately said this WRONG claim: "${pendingTrap}". Decide if the student caught it.` : ''}
Judge ONLY the latest Student message. Return JSON:
{"intent":"explaining"|"asking_sam"(student asks Sam a question)|"correcting_sam"(student responds to or corrects something Sam said)|"stuck_or_frustrated"|"off_topic",
"student_mood":"confident"|"neutral"|"frustrated",
"touched":[{"id":"c1","status":"solid"|"shaky","note":"what was vague/wrong","misconception":"the plausible wrong belief their wording implies, or empty"}],
"vague":"the exact ambiguous or hand-wavy phrase they used (e.g. 'it', 'some', 'kind of'), or empty",
"caughtTrap":${pendingTrap ? 'true|false' : 'null'},
"topGap":"the single most important vague/missing/wrong thing, or empty"}
Only mark a concept "solid" if the student's wording is correct AND specific; otherwise "shaky".`
}

export function normalizeGrade(g, concepts) {
  const ids = new Set(concepts.map((c) => c.id))
  return {
    intent: INTENTS.includes(g?.intent) ? g.intent : 'explaining',
    frustrated: g?.student_mood === 'frustrated' || g?.intent === 'stuck_or_frustrated',
    touched: (Array.isArray(g?.touched) ? g.touched : []).filter((t) => ids.has(t.id) && ['solid', 'shaky'].includes(t.status)),
    vague: typeof g?.vague === 'string' ? g.vague : '',
    caughtTrap: typeof g?.caughtTrap === 'boolean' ? g.caughtTrap : null,
    topGap: typeof g?.topGap === 'string' ? g.topGap : '',
  }
}

export const shouldTrap = (turn, g) => g.intent === 'explaining' && !g.frustrated && turn >= 2 && turn % 3 === 0

// Step 2: Sam's reply branches on what the student just did.
export function samPrompt({ concepts, status, msgs, g, trap }) {
  let task
  if (g.frustrated) task = 'The student seems stuck or frustrated. Be warm and encouraging, then ask ONE very small, easy question about something they already got partly right. No tricks.'
  else if (g.intent === 'asking_sam') task = 'The student asked YOU a question. You are the student, not the teacher: say you were hoping they could tell you, and hand it back with a guess of your own that shows what you are unsure about.'
  else if (g.intent === 'off_topic') task = 'The student drifted off topic. Gently pull back to the notes, in character.'
  else if (g.intent === 'correcting_sam' && g.caughtTrap === true) task = 'The student just caught your mistake. Show a little "ohh!" delight and restate the correct idea in your own naive words. Mood: enlightened.'
  else if (g.intent === 'correcting_sam' && g.caughtTrap === false) task = 'The student did not fix your mistake. Stay a little confused and ask them to walk through it again more carefully, without saying what was wrong.'
  else if (trap) task = 'Repeat back a SUBTLY WRONG version of what they said (plausible, differing from the true facts in one detail) and ask "so it\'s like this, right?". Put that wrong statement in "wrongClaim".'
  else if (g.vague) task = `The student was vague, the phrase "${g.vague}" in particular. Ask ONE disambiguating question in a naive tone: "when you say '${g.vague}', do you mean A or B?" with two concrete options.`
  else task = `Ask ONE short naive "why" or "how" follow-up, acting confused exactly at this gap: ${g.topGap || 'none found'}. If there is no gap, say you get it and ask the student to move on to another idea from their notes, without naming one.`
  return `You are Sam, a curious but confused student being taught by the user. Never explain things yourself and never reveal the source notes.
MEMORY (do not re-ask about solid ideas; never name anything under "Not yet covered"):\n${memory(concepts, status)}
CONVERSATION:\n${recent(msgs)}
THIS TURN: ${task}
Max 2 short sentences, casual. Return JSON: {"reply":"...","mood":"confused"|"curious"|"enlightened","wrongClaim":"only when you made a deliberate mistake, else empty"}
Use "enlightened" only if their last explanation was solid or they just caught your mistake.`
}

export function normalizeSam(r) {
  if (typeof r?.reply !== 'string' || !r.reply.trim()) throw new Error('empty Sam reply')
  return { reply: r.reply.trim(), mood: MOODS.includes(r.mood) ? r.mood : 'curious', wrongClaim: typeof r.wrongClaim === 'string' ? r.wrongClaim : '' }
}

// Fallback tier 1: don't spend an API call on a non-answer.
export const tooShort = (t) => t.trim().split(/\s+/).length < 3
