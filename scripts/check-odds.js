// Pulls a large number of cards twice, once WITHOUT pity and once WITH pity,
// and compares how often each result appeared. Run it with:  pnpm odds
//
// Without pity, "Got" should land very close to the base odds.
// With pity, rare results come out MORE often than the base odds; the
// "Predicted" column is the rate the pity math says to expect.

import { pulling_cards_function } from "../src/components/homepage/pulling_cards_function.js"
import { cardPool } from "../src/components/data/card-pool.js"
import { rarities, BRILLIANT_CHANCE } from "../src/components/data/rarities.js"
import { PITY_RULES, START_PITY } from "../src/components/data/pity.js"

const PULLS = 1_000_000

function simulate(rules) {
  const { cards } = pulling_cards_function(PULLS, cardPool, rarities, START_PITY, rules)
  const counts = { brilliant: 0 }
  for (const card of cards) {
    counts[card.rarity] = (counts[card.rarity] ?? 0) + 1
    if (card.brilliant) counts.brilliant++
  }
  return counts
}

// Hard pity math: with chance p per pull and a guarantee at pull N,
// the average wait is (1 - (1 - p)^N) / p pulls, so the rate is 1 / that.
const pityRate = (p, n) => p / (1 - (1 - p) ** n)

const pct = (x) => `${(x * 100).toFixed(2)}%`
const noPity = simulate(null)
const withPity = simulate(PITY_RULES)

const rows = Object.entries(rarities).map(([rarity, chance]) => ({
  Rarity: rarity,
  "Base odds": pct(chance),
  "Got (no pity)": pct((noPity[rarity] ?? 0) / PULLS),
  "Got (pity)": pct((withPity[rarity] ?? 0) / PULLS),
  "Predicted (pity)": rarity === "omg" ? pct(pityRate(chance, PITY_RULES.omg)) : "",
}))
rows.push({
  Rarity: "brilliant",
  "Base odds": pct(BRILLIANT_CHANCE),
  "Got (no pity)": pct(noPity.brilliant / PULLS),
  "Got (pity)": pct(withPity.brilliant / PULLS),
  "Predicted (pity)": pct(pityRate(BRILLIANT_CHANCE, PITY_RULES.brilliant)),
})

const total = Object.values(rarities).reduce((a, b) => a + b, 0)
console.log(`${PULLS.toLocaleString()} pulls per run · rarity chances add up to ${(total * 100).toFixed(2)}%`)
console.log(`Pity: brilliant by pull ${PITY_RULES.brilliant}, Ñ by pull ${PITY_RULES.omg}`)
console.table(rows)
console.log("Note: pity forces Ñ, so with pity on the other rarities shrink slightly to make room.")
