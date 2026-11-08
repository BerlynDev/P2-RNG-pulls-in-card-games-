import backside_cards from "../../assets/backside_cards.webp"

// Colors for each rarity (Tailwind classes).
const rarityStyles = {
  common: "bg-slate-200 text-slate-800",
  rare: "bg-sky-300 text-sky-950",
  super: "bg-violet-400 text-violet-950",
  ultra: "bg-amber-300 text-amber-950",
  omg: "bg-gradient-to-br from-pink-400 via-yellow-300 to-cyan-300 text-black",
}

// Shows the back of the card until `card` has a value, then shows its face.
export function Card({ card }) {
  return (
    <article className="bg-indigo-950 flex flex-wrap justify-center p-5">
      {card ? (
        <div
          className={`flex aspect-[5/7] w-full flex-col items-center justify-center rounded-xl shadow-xl transition duration-300 hover:scale-105 ${rarityStyles[card.rarity]} ${card.brilliant ? "ring-4 ring-yellow-300" : ""}`}
        >
          <span className="text-7xl font-bold">{card.name}</span>
          <span className="mt-2 text-sm font-semibold uppercase tracking-widest">
            {card.rarity}
          </span>
          {card.brilliant && <span className="mt-1 text-xs">✨ brilliant</span>}
        </div>
      ) : (
        <div className="transform rounded-xl bg-white p-2 shadow-xl transition duration-300 hover:scale-105">
          <img src={backside_cards} alt="Backside of the card" className="p-2" />
        </div>
      )}
    </article>
  )
}
