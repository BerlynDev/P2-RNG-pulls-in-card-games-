// Pulls a large number of cards and compares how often each rarity appeared
// with the chance set in rarities.js. Run it with:  pnpm odds
//
// With enough pulls, "Got" should land very close to "Expected".
// If a row is far off, the pull logic has a bug.

import { pulling_cards_function } from "../src/components/homepage/pulling_cards_function.js"
import { cardPool } from "../src/components/data/card-pool.js"
import { rarities, BRILLIANT_CHANCE } from "../src/components/data/rarities.js"

const PULLS = 1_000_000

const cards = pulling_cards_function(PULLS, cardPool, rarities)

const counts = {}
let brilliant = 0
for (const card of cards) {
  counts[card.rarity] = (counts[card.rarity] ?? 0) + 1
  if (card.brilliant) brilliant++
}

const pct = (n) => `${((n / PULLS) * 100).toFixed(2)}%`

const rows = Object.entries(rarities).map(([rarity, chance]) => ({
  Rarity: rarity,
  Expected: `${(chance * 100).toFixed(2)}%`,
  Got: pct(counts[rarity] ?? 0),
  Count: counts[rarity] ?? 0,
}))
rows.push({
  Rarity: "brilliant",
  Expected: `${(BRILLIANT_CHANCE * 100).toFixed(2)}%`,
  Got: pct(brilliant),
  Count: brilliant,
})

const total = Object.values(rarities).reduce((a, b) => a + b, 0)
console.log(`${PULLS.toLocaleString()} pulls · rarity chances add up to ${(total * 100).toFixed(2)}%`)
console.table(rows)
