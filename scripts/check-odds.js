// Pulls a large number of cards twice, once WITHOUT pity and once WITH pity,
// and compares how often each result appeared. Run it with:  pnpm odds
//
// Without pity, "Got" should land very close to the base odds.
// With pity, rare results come out MORE often than the base odds; the
// "Predicted" column is the exact long-run rate from src/utils/rates.js.
// If simulation and prediction agree, the game does what the math says.

import { pulling_cards_function } from "../src/components/homepage/pulling_cards_function.js"
import { TRACKED_RATES } from "../src/utils/rates.js"
import { cardPool } from "../src/components/data/card-pool.js"
import { rarities } from "../src/components/data/rarities.js"
import { PITY_RULES, START_PITY } from "../src/components/data/pity.js"

const PULLS = 1_000_000

function simulate(rules) {
  const { cards } = pulling_cards_function(PULLS, cardPool, rarities, START_PITY, rules)
  const counts = {}
  for (const card of cards) counts[card.rarity] = (counts[card.rarity] ?? 0) + 1
  for (const [key, rate] of Object.entries(TRACKED_RATES)) counts[key] = cards.filter(rate.matches).length
  return counts
}

const pct = (x) => `${(x * 100).toFixed(2)}%`
const noPity = simulate(null)
const withPity = simulate(PITY_RULES)

// One row per rarity...
const rows = Object.entries(rarities).map(([rarity, chance]) => ({
  Result: rarity,
  "Base odds": pct(chance),
  "Got (no pity)": pct(noPity[rarity] / PULLS),
  "Got (pity)": pct(withPity[rarity] / PULLS),
  "Predicted (pity)": rarity === "omg" ? pct(TRACKED_RATES.omg.withPity) : "",
}))
// ...plus the special results (Ñ is already a rarity row above).
for (const [key, rate] of Object.entries(TRACKED_RATES)) {
  if (key === "omg") continue
  rows.push({
    Result: rate.label,
    "Base odds": pct(rate.base),
    "Got (no pity)": pct(noPity[key] / PULLS),
    "Got (pity)": pct(withPity[key] / PULLS),
    "Predicted (pity)": pct(rate.withPity),
  })
}

const total = Object.values(rarities).reduce((a, b) => a + b, 0)
const { omg } = PITY_RULES
console.log(`${PULLS.toLocaleString()} pulls per run · rarity chances add up to ${(total * 100).toFixed(2)}%`)
console.log(`Pity: brilliant by pull ${PITY_RULES.brilliant.hard} · ultra or better by pull ${PITY_RULES.ultraOrBetter.hard} · Ñ soft pity from pull ${omg.softStart} (+${(omg.softStep * 100).toFixed(1)}% per pull), hard pity at ${omg.hard}`)
console.table(rows)
console.log("Note: pity boosts the rare results, so with pity on the common ones shrink slightly to make room.")
