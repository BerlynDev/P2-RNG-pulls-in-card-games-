import { rarities, BRILLIANT_CHANCE } from "../data/rarities.js"

// Chance of a brilliant Ñ on one pull without pity: both things must happen
// on the same pull, so the chances multiply: 0.1% × 10% = 0.01% (1 in 10,000).
const BASE_CHANCE = rarities.omg * BRILLIANT_CHANCE

// A showcase slot for the rarest card in the game. Empty (dashed outline)
// until you pull one; then it shows the card, how many you have and when
// you got the first one.
export function BrilliantOmgSlot({ omgPulls }) {
  const found = omgPulls.filter((omg) => omg.brilliant)
  const owned = found.length > 0

  return (
    <div className="mt-4 flex items-center gap-4 rounded-lg bg-indigo-900/60 p-3">
      {owned ? (
        <div className="relative flex h-24 w-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(90deg,#f472b6,#fde047,#67e8f9,#a78bfa,#f472b6)] bg-[length:200%_100%] text-4xl font-bold text-black ring-4 ring-yellow-300 animate-omg motion-reduce:animate-none">
          Ñ
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine motion-reduce:hidden" />
        </div>
      ) : (
        <div className="flex h-24 w-[4.25rem] shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-indigo-400/60 text-4xl font-bold text-indigo-400/40">
          Ñ
        </div>
      )}

      <div className="text-sm">
        <p className="font-semibold">✨ Brilliant Ñ</p>
        {owned ? (
          <>
            <p className="text-yellow-300">
              Owned ×{found.length}
            </p>
            <p className="text-xs text-indigo-200">
              First at pull {found[0].pullNumber}
              {found.length > 1 && ` · latest at pull ${found.at(-1).pullNumber}`}
            </p>
          </>
        ) : (
          <p className="text-indigo-300">Not pulled yet</p>
        )}
        <p className="mt-1 text-xs text-indigo-300">
          Base chance {(BASE_CHANCE * 100).toFixed(2)}% per pull (1 in {Math.round(1 / BASE_CHANCE).toLocaleString()})
        </p>
      </div>
    </div>
  )
}
