import backside_cards from "../../assets/backside_cards.webp"

// Look of each rarity (Tailwind classes): colors plus a glow that gets
// stronger the rarer the card is.
const rarityStyles = {
  common: "bg-slate-200 text-slate-800",
  rare: "bg-sky-300 text-sky-950 shadow-[0_0_15px_rgb(56_189_248/0.6)]",
  super: "bg-violet-400 text-violet-950 shadow-[0_0_20px_rgb(167_139_250/0.8)]",
  ultra: "bg-amber-300 text-amber-950 shadow-[0_0_30px_rgb(252_211_77/0.9)]",
  omg: "bg-[linear-gradient(90deg,#f472b6,#fde047,#67e8f9,#a78bfa,#f472b6)] bg-[length:200%_100%] text-black animate-omg motion-reduce:animate-none",
}

// Delay between each card flipping, so they turn over one after another.
const FLIP_STAGGER_MS = 200

// One card. Both sides exist at the same time, stacked on top of each other:
// the back faces the viewer, the face is turned around (rotate-y-180).
// When `card` has a value, the inner box spins 180deg so the face shows.
export function Card({ card, index = 0 }) {
  return (
    <article className="bg-indigo-950 flex justify-center p-5">
      <div className="w-full perspective-distant transition duration-300 hover:scale-105">
        <div
          className={`grid transform-3d ${card ? "animate-flip-reveal motion-reduce:animate-none motion-reduce:rotate-y-180" : ""}`}
          style={card ? { animationDelay: `${index * FLIP_STAGGER_MS}ms` } : undefined}
        >
          {/* Back of the card */}
          <div className="[grid-area:1/1] backface-hidden rounded-xl bg-white p-2 shadow-xl">
            <img src={backside_cards} alt="Backside of the card" className="p-2" />
          </div>

          {/* Face of the card (only rendered once a card was pulled) */}
          {card && (
            <div
              className={`[grid-area:1/1] backface-hidden rotate-y-180 relative flex flex-col items-center justify-center overflow-hidden rounded-xl ${rarityStyles[card.rarity]} ${card.brilliant ? "ring-4 ring-yellow-300" : ""}`}
            >
              <span className="text-7xl font-bold">{card.name}</span>
              <span className="mt-2 text-sm font-semibold uppercase tracking-widest">
                {card.rarity}
              </span>
              {card.brilliant && <span className="mt-1 text-xs">✨ brilliant</span>}

              {/* Tag for results pity helped with: forced (PITY) or boosted (SOFT PITY) */}
              {(card.pity?.omg === "hard" || card.pity?.brilliant || card.pity?.ultra) && (
                <span className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-yellow-300">
                  PITY
                </span>
              )}
              {card.pity?.omg === "soft" && !card.pity?.brilliant && !card.pity?.ultra && (
                <span className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-pink-300">
                  SOFT PITY
                </span>
              )}

              {/* Light sweep for brilliant cards */}
              {card.brilliant && (
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine motion-reduce:hidden" />
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
