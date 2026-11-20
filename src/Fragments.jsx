// Real product UI as live HTML (not drawn illustrations): what each step actually looks like in the app.
import Sam from './Sam.jsx'

export const Paste = () => (
  <div className="rounded-lg border-2 border-ink bg-white p-3 text-sm leading-6 relative overflow-hidden h-36">
    <p>Photosynthesis happens in chloroplasts. Plants turn light, water and CO2 into glucose and oxygen. Cellular respiration breaks glucose down with oxygen to release ATP…</p>
    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
  </div>
)

export const Teach = () => (
  <div className="flex flex-col gap-2 h-36 justify-center">
    <div className="card self-end bg-white px-3 py-2 text-sm max-w-[85%]">Plants make food from sunlight, mostly in the roots.</div>
    <div className="flex items-end gap-2">
      <div className="shrink-0"><Sam mood="confused" size={44} /></div>
      <div className="card px-3 py-2 font-hand text-xl leading-6">Wait, if it’s the roots, why are the leaves green?</div>
    </div>
  </div>
)

export const Report = () => (
  <div className="flex flex-col gap-3 h-36 justify-center">
    {[['Solid', 'bg-sage', 100], ['Shaky', 'bg-gold', 55], ['Skipped', 'bg-rust', 15]].map(([t, c, w]) => (
      <div key={t}>
        <div className="font-hand text-xl leading-5">{t}</div>
        <div className="h-3.5 rounded-full border-2 border-ink bg-paper overflow-hidden"><div className={`h-full ${c}`} style={{ width: `${w}%` }} /></div>
      </div>
    ))}
  </div>
)
