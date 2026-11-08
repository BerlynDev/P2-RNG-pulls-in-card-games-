import { PITY_RULES } from "../data/pity.js"
import { rarities, BRILLIANT_CHANCE } from "../data/rarities.js"
import { pityChance } from "../homepage/pulling_cards_function.js"

// One progress bar. `misses` = pulls in a row without the prize so far,
// so the NEXT pull is number misses + 1, and pull number `rule.hard` is forced.
// If the rule has soft pity, a tick marks where it starts and the panel shows
// the chance for the next pull.
function PityMeter({ label, misses, rule, baseChance, enabled }) {
  const nextPull = misses + 1
  const chance = pityChance(baseChance, nextPull, enabled ? rule : null)
  const guaranteedNext = enabled && chance === 1
  const inSoftPity = enabled && rule.softStart !== undefined && nextPull >= rule.softStart && !guaranteedNext
  const fill = Math.min(nextPull / rule.hard, 1) * 100

  let status
  if (guaranteedNext) status = "Next pull is guaranteed!"
  else if (!enabled) status = `Next pull: ${nextPull} (pity off)`
  else status = `Next pull: ${nextPull} / ${rule.hard}`

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className={guaranteedNext ? "font-bold text-yellow-300" : inSoftPity ? "text-pink-300" : "text-indigo-200"}>
          {status}
        </span>
      </div>
      <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-indigo-900">
        <div
          className={`h-full rounded-full transition-all duration-500 ${guaranteedNext ? "bg-yellow-300" : inSoftPity ? "bg-pink-400" : enabled ? "bg-violet-400" : "bg-slate-500"}`}
          style={{ width: `${fill}%` }}
        />
        {/* Where soft pity starts */}
        {rule.softStart !== undefined && (
          <div
            className="absolute inset-y-0 w-0.5 bg-pink-300/80"
            style={{ left: `${((rule.softStart - 1) / rule.hard) * 100}%` }}
          />
        )}
      </div>
      {enabled && rule.softStart !== undefined && (
        <p className="mt-1 text-xs text-indigo-300">
          Chance on next pull: <span className={inSoftPity ? "font-semibold text-pink-300" : ""}>{(chance * 100).toFixed(1)}%</span>
          {" · "}soft pity from pull {rule.softStart}
        </p>
      )}
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
        <PityMeter label="✨ Brilliant" misses={pity.sinceBrilliant} rule={PITY_RULES.brilliant} baseChance={BRILLIANT_CHANCE} enabled={enabled} />
        <PityMeter label="Ñ (OMG)" misses={pity.sinceOmg} rule={PITY_RULES.omg} baseChance={rarities.omg} enabled={enabled} />
      </div>
    </section>
  )
}
