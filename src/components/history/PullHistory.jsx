import { rarities, BRILLIANT_CHANCE } from "../data/rarities.js"

// Small colored chip per card in the history list.
const chipStyles = {
  common: "bg-slate-200 text-slate-800",
  rare: "bg-sky-300 text-sky-950",
  super: "bg-violet-400 text-violet-950",
  ultra: "bg-amber-300 text-amber-950",
  omg: "bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 text-black",
}

const RECENT_PACKS_SHOWN = 10

const percent = (count, total) => (total === 0 ? "—" : `${((count / total) * 100).toFixed(1)}%`)

export function PullHistory({ history, onReset }) {
  const { totalPacks, totalCards, rarityCounts, brilliantCount, pityTriggers, omgPulls, recentPacks } = history

  if (totalCards === 0) {
    return (
      <section className="mx-auto mt-6 w-full max-w-xl rounded-xl bg-indigo-950 p-4 text-center text-indigo-200">
        No pulls yet. Open a pack to start your history.
      </section>
    )
  }

  return (
    <section className="mx-auto my-6 w-full max-w-xl rounded-xl bg-indigo-950 p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Pull history</h2>
        <button
          onClick={() => {
            if (window.confirm("Delete all pull history and reset pity counters?")) onReset()
          }}
          className="rounded-lg border border-indigo-400 px-3 py-1 text-xs text-indigo-200 hover:bg-indigo-900"
        >
          Reset
        </button>
      </div>

      <p className="mb-3 text-sm text-indigo-200">
        {totalPacks} packs · {totalCards} cards
      </p>

      {/* Your rates vs the base odds */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-indigo-300">
            <th className="py-1 font-medium">Rarity</th>
            <th className="py-1 text-right font-medium">Count</th>
            <th className="py-1 text-right font-medium">Your rate</th>
            <th className="py-1 text-right font-medium">Base odds</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(rarities).map(([rarity, chance]) => (
            <tr key={rarity} className="border-t border-indigo-900">
              <td className="py-1 capitalize">{rarity === "omg" ? "OMG (Ñ)" : rarity}</td>
              <td className="py-1 text-right tabular-nums">{rarityCounts[rarity] ?? 0}</td>
              <td className="py-1 text-right tabular-nums">{percent(rarityCounts[rarity] ?? 0, totalCards)}</td>
              <td className="py-1 text-right tabular-nums text-indigo-300">{(chance * 100).toFixed(1)}%</td>
            </tr>
          ))}
          <tr className="border-t border-indigo-900">
            <td className="py-1">✨ Brilliant</td>
            <td className="py-1 text-right tabular-nums">{brilliantCount}</td>
            <td className="py-1 text-right tabular-nums">{percent(brilliantCount, totalCards)}</td>
            <td className="py-1 text-right tabular-nums text-indigo-300">{(BRILLIANT_CHANCE * 100).toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-sm text-indigo-200">
        Pity forced {pityTriggers.brilliant} brilliant{pityTriggers.brilliant === 1 ? "" : "s"} and {pityTriggers.omg} Ñ
        {" "}(hard pity). Soft pity helped with {pityTriggers.omgSoft} Ñ.
      </p>

      {/* Every Ñ ever pulled */}
      {omgPulls.length > 0 && (
        <div className="mt-3">
          <h3 className="text-sm font-semibold">Ñ pulls</h3>
          <ul className="mt-1 flex flex-wrap gap-2 text-xs">
            {omgPulls.map((omg, i) => (
              <li key={omg.pullNumber} className="rounded bg-indigo-900 px-2 py-1">
                #{i + 1} at pull {omg.pullNumber}
                {i > 0 && ` (+${omg.pullNumber - omgPulls[i - 1].pullNumber})`}
                {/* true = hard pity saved by an older version of the app */}
                {(omg.pity === "hard" || omg.pity === true) && <span className="ml-1 font-bold text-yellow-300">PITY</span>}
                {omg.pity === "soft" && <span className="ml-1 font-bold text-pink-300">SOFT PITY</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Most recent packs, newest first */}
      <h3 className="mt-4 text-sm font-semibold">Recent packs</h3>
      <ul className="mt-1 space-y-1">
        {recentPacks.slice(0, RECENT_PACKS_SHOWN).map((pack) => (
          <li key={pack.packNumber} className="flex items-center gap-2">
            <span className="w-12 text-xs text-indigo-300 tabular-nums">#{pack.packNumber}</span>
            {pack.cards.map((card, i) => (
              <span
                key={i}
                title={`${card.rarity}${card.brilliant ? ", brilliant" : ""}${card.pity?.omg || card.pity?.brilliant ? ", forced by pity" : ""}`}
                className={`flex h-7 w-7 items-center justify-center rounded text-sm font-bold ${chipStyles[card.rarity]} ${card.brilliant ? "ring-2 ring-yellow-300" : ""} ${card.pity?.omg || card.pity?.brilliant ? "outline-2 outline-offset-2 outline-dashed outline-yellow-300" : ""}`}
              >
                {card.name}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </section>
  )
}
