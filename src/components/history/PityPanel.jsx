import { PITY_RULES } from "../data/pity.js"

// One progress bar. `misses` = pulls in a row without the prize so far,
// so the NEXT pull is number misses + 1, and pull number `limit` is forced.
function PityMeter({ label, misses, limit, enabled }) {
  const nextPull = misses + 1
  const guaranteedNext = enabled && nextPull >= limit
  const fill = Math.min(nextPull / limit, 1) * 100

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className={guaranteedNext ? "font-bold text-yellow-300" : "text-indigo-200"}>
          {guaranteedNext
            ? "Next pull is guaranteed!"
            : enabled
              ? `Next pull: ${nextPull} / ${limit}`
              : `Next pull: ${nextPull} (pity off)`}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-indigo-900">
        <div
          className={`h-full rounded-full transition-all duration-500 ${guaranteedNext ? "bg-yellow-300" : enabled ? "bg-violet-400" : "bg-slate-500"}`}
          style={{ width: `${fill}%` }}
        />
      </div>
    </div>
  )
}

export function PityPanel({ pity, enabled, onToggle }) {
  return (
    <section className="mx-auto mt-6 w-full max-w-xl rounded-xl bg-indigo-950 p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Pity</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 accent-violet-400"
          />
          {enabled ? "ON" : "OFF"}
        </label>
      </div>
      <div className="space-y-3">
        <PityMeter label="✨ Brilliant" misses={pity.sinceBrilliant} limit={PITY_RULES.brilliant} enabled={enabled} />
        <PityMeter label="Ñ (OMG)" misses={pity.sinceOmg} limit={PITY_RULES.omg} enabled={enabled} />
      </div>
    </section>
  )
}
