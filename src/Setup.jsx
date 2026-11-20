import { useState } from 'react'
import { pdfToText, ai, clip } from './lib.js'
import Sam from './Sam.jsx'

const SAMPLE = `Cellular respiration (Biology, Unit 4)

Cellular respiration is how cells release energy stored in glucose. The overall equation is: glucose + oxygen -> carbon dioxide + water + ATP.

1. Glycolysis happens in the cytoplasm. One glucose molecule is split into two molecules of pyruvate. It does not need oxygen. Net gain: 2 ATP and 2 NADH.

2. The link reaction: pyruvate moves into the mitochondria and is converted to acetyl-CoA, releasing carbon dioxide.

3. The Krebs cycle takes place in the mitochondrial matrix. Acetyl-CoA is broken down, releasing carbon dioxide. It produces NADH and FADH2, which carry electrons to the next stage, plus a small amount of ATP.

4. The electron transport chain is on the inner mitochondrial membrane. NADH and FADH2 donate electrons, which power pumps that move hydrogen ions across the membrane. The ions flow back through ATP synthase, making most of the ATP (around 32-34 per glucose). Oxygen is the final electron acceptor and combines with hydrogen to form water.

5. Without oxygen, cells use fermentation. In human muscle cells pyruvate becomes lactic acid; in yeast it becomes ethanol and carbon dioxide. Fermentation only yields the 2 ATP from glycolysis.`

export default function Setup({ onReady, sample }) {
  const [text, setText] = useState(sample ? SAMPLE : '')
  const [file, setFile] = useState('')
  const [drag, setDrag] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const onFile = async (f) => {
    if (!f) return
    setErr('')
    try { setText(f.type === 'application/pdf' ? await pdfToText(f) : await f.text()); setFile(f.name) }
    catch { setErr('Could not read that file. Try a PDF, .txt or .md, or paste the text.') }
  }

  const go = async () => {
    setBusy(true); setErr('')
    try {
      const notes = clip(text)
      const concepts = await ai(`From these study notes, list the 5-8 key concepts a student must understand.
Return JSON: [{"id":"c1","name":"short name","fact":"1-2 sentence correct statement from the notes"}]
NOTES:\n${notes}`)
      onReady({ notes, concepts })
    } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const ready = text.trim().length >= 80

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 grid lg:grid-cols-[1fr_260px] gap-10">
      <div className="flex flex-col gap-5">
        <div>
          <p className="font-hand text-3xl text-rust">step one</p>
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-[1]">What are we studying?</h1>
          <p className="text-ink/70 mt-3 text-lg">Drop a PDF or paste your notes. Sam will pick out the key ideas, then you teach them to him.</p>
        </div>

        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]) }}
          className={`flex items-center gap-4 rounded-2xl border-2 border-dashed p-5 cursor-pointer transition-colors ${drag ? 'border-rust bg-rust/10' : 'border-ink/40 hover:border-ink bg-cream/60'}`}>
          <span className="text-3xl">📄</span>
          <span className="flex-1">
            <span className="font-semibold block">{file ? file : 'Drop a PDF here, or click to choose'}</span>
            <span className="text-sm text-ink/60">{file ? 'Loaded. You can still edit the text below.' : 'PDF, .txt or .md · read in your browser'}</span>
          </span>
          <input type="file" className="sr-only" accept=".pdf,.txt,.md" onChange={(e) => onFile(e.target.files[0])} />
        </label>

        <div className="relative">
          <textarea className="card p-5 w-full h-72 resize-y leading-relaxed scroll-thin" placeholder="…or paste your notes here" value={text} onChange={(e) => setText(e.target.value)} />
          <span className="absolute bottom-4 right-5 text-xs text-ink/50">{words} words</span>
        </div>

        {err && <p className="text-rust font-medium" role="alert">{err}</p>}
        <div className="flex flex-wrap gap-3 items-center">
          <button className="btn btn-lg" disabled={busy || !ready} onClick={go}>
            {busy ? <>Sam is skimming your notes <span className="typing flex gap-1"><span /><span /><span /></span></> : 'Meet Sam →'}
          </button>
          {!text && <button className="btn btn-ghost" onClick={() => setText(SAMPLE)}>Use sample notes (biology)</button>}
          {text && !ready && <span className="text-sm text-ink/60">A few more sentences, please.</span>}
        </div>
      </div>

      <aside className="hidden lg:flex flex-col items-center gap-4 pt-16">
        <div className="card px-4 py-3 font-hand text-2xl leading-7 rotate-2 relative">
          {busy ? 'Reading… reading… okay I think I see the main ideas!' : ready ? 'Ooh, that looks hard. Ready when you are!' : 'Hi! I know nothing. Literally nothing. Teach me something?'}
        </div>
        <Sam mood={busy ? 'curious' : ready ? 'enlightened' : 'confused'} size={180} />
      </aside>
    </div>
  )
}
