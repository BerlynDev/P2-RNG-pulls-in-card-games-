// Pulls a large number of cards twice, once WITHOUT pity and once WITH pity,
// and compares how often each result appeared. Run it with:  pnpm odds
//
// Without pity, "Got" should land very close to the base odds.
// With pity, rare results come out MORE often than the base odds; the
// "Predicted" column is the rate the pity math says to expect.

import { pulling_cards_function, pityChance } from "../src/components/homepage/pulling_cards_function.js"
import { cardPool } from "../src/components/data/card-pool.js"
import { rarities, BRILLIANT_CHANCE } from "../src/components/data/rarities.js"
import { PITY_RULES, START_PITY, ULTRA_OR_BETTER } from "../src/components/data/pity.js"

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

// Expected rate with a pity rule. Walk through pulls 1, 2, 3... up to the
// hard limit. `stillWaiting` is the chance you haven't got the prize yet:
//   chance it arrives exactly on pull n = stillWaiting × (chance on pull n)
// Adding n × that over every n gives the average wait; the rate is 1 / wait.
// (For hard pity only this equals the formula p / (1 - (1 - p)^N).)
function predictedRate(baseChance, rule) {
  let stillWaiting = 1
  let averageWait = 0
  for (let n = 1; n <= rule.hard; n++) {
    const chance = pityChance(baseChance, n, rule)
    averageWait += n * stillWaiting * chance
    stillWaiting *= 1 - chance
  }
  return 1 / averageWait
}

const pct = (x) => `${(x * 100).toFixed(2)}%`
const noPity = simulate(null)
const withPity = simulate(PITY_RULES)

const rows = Object.entries(rarities).map(([rarity, chance]) => ({
  Rarity: rarity,
  "Base odds": pct(chance),
  "Got (no pity)": pct((noPity[rarity] ?? 0) / PULLS),
  "Got (pity)": pct((withPity[rarity] ?? 0) / PULLS),
  "Predicted (pity)": rarity === "omg" ? pct(predictedRate(chance, PITY_RULES.omg)) : "",
}))
// Ultra or better is a group, so add up its rarities. The prediction is
// approximate (≈): Ñ soft pity also adds a few extra Ñ to this group.
const ultraOrBetterBase = ULTRA_OR_BETTER.reduce((sum, r) => sum + rarities[r], 0)
const groupCount = (counts) => ULTRA_OR_BETTER.reduce((sum, r) => sum + (counts[r] ?? 0), 0)
rows.push({
  Rarity: "ultra or better",
  "Base odds": pct(ultraOrBetterBase),
  "Got (no pity)": pct(groupCount(noPity) / PULLS),
  "Got (pity)": pct(groupCount(withPity) / PULLS),
  "Predicted (pity)": `≈ ${pct(predictedRate(ultraOrBetterBase, PITY_RULES.ultraOrBetter))}`,
})
rows.push({
  Rarity: "brilliant",
  "Base odds": pct(BRILLIANT_CHANCE),
  "Got (no pity)": pct(noPity.brilliant / PULLS),
  "Got (pity)": pct(withPity.brilliant / PULLS),
  "Predicted (pity)": pct(predictedRate(BRILLIANT_CHANCE, PITY_RULES.brilliant)),
})

const total = Object.values(rarities).reduce((a, b) => a + b, 0)
const { omg } = PITY_RULES
console.log(`${PULLS.toLocaleString()} pulls per run · rarity chances add up to ${(total * 100).toFixed(2)}%`)
console.log(`Pity: brilliant by pull ${PITY_RULES.brilliant.hard} · ultra or better by pull ${PITY_RULES.ultraOrBetter.hard} · Ñ soft pity from pull ${omg.softStart} (+${(omg.softStep * 100).toFixed(1)}% per pull), hard pity at ${omg.hard}`)
console.table(rows)
console.log("Note: pity boosts Ñ, so with pity on the other rarities shrink slightly to make room.")
