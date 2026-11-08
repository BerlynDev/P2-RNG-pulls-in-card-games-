import { rarities, BRILLIANT_CHANCE } from "../components/data/rarities.js"
import { PITY_RULES, ULTRA_OR_BETTER } from "../components/data/pity.js"
import { pityChance, withChance, onlyRarities } from "../components/homepage/pulling_cards_function.js"

// Expected rate with a pity rule. Walk through pulls 1, 2, 3... up to the
// hard limit. `stillWaiting` is the chance you haven't got the prize yet:
//   chance it arrives exactly on pull n = stillWaiting × (chance on pull n)
// Adding n × that over every n gives the average wait; the rate is 1 / wait.
// (For hard pity only this equals the formula p / (1 - (1 - p)^N).)
export function predictedRate(baseChance, rule) {
  let stillWaiting = 1
  let averageWait = 0
  for (let n = 1; n <= rule.hard; n++) {
    const chance = pityChance(baseChance, n, rule)
    averageWait += n * stillWaiting * chance
    stillWaiting *= 1 - chance
  }
  return 1 / averageWait
}

// The exact long-run Ñ and ultra-or-better rates when BOTH their pity rules
// are on. predictedRate() looks at one rule alone, but these two affect each
// other (a forced ultra-or-better pull can be an Ñ, and Ñ soft pity adds Ñ to
// the ultra-or-better group), so here we follow both counters together.
//
// The trick: every Ñ resets BOTH counters, so the game repeats in "cycles"
// that start right after an Ñ and end with the next one. If we know
//   - how long a cycle lasts on average (in pulls), and
//   - how many ultra-or-better cards a cycle has on average,
// then the Ñ rate is 1 / (average length), and the ultra-or-better rate is
// (ultra-or-better per cycle) / (average length).
//
// To get those averages, walk through one cycle pull by pull. `stillGoing[u]`
// is the chance the cycle hasn't ended yet AND it's been u pulls since the
// last ultra or better. (Mathematicians call this renewal theory.)
export function longRunRates(rules = PITY_RULES) {
  const U = rules.ultraOrBetter.hard
  let stillGoing = new Array(U).fill(0)
  stillGoing[0] = 1 // the cycle starts right after an Ñ: both counters at 0
  let averageLength = 0
  let ultraOrBetterPerCycle = 0

  for (let pullsSinceOmg = 0; pullsSinceOmg < rules.omg.hard; pullsSinceOmg++) {
    const next = new Array(U).fill(0)
    for (let u = 0; u < U; u++) {
      const chance = stillGoing[u]
      if (chance === 0) continue
      // The same odds pullCard() would use in this situation.
      let odds = withChance(rarities, "omg", pityChance(rarities.omg, pullsSinceOmg + 1, rules.omg))
      if (u + 1 >= U) odds = onlyRarities(odds, ULTRA_OR_BETTER)

      averageLength += chance                               // this pull happens
      ultraOrBetterPerCycle += chance * (odds.omg + odds.ultra)
      next[0] += chance * odds.ultra                        // ultra: that counter resets
      if (u + 1 < U) next[u + 1] += chance * (1 - odds.omg - odds.ultra) // neither
      // odds.omg ends the cycle, so it isn't carried to `next`
    }
    stillGoing = next
  }
  return { omg: 1 / averageLength, ultraOrBetter: ultraOrBetterPerCycle / averageLength }
}

// "1 in N" for a chance, rounded: 0.001 -> 1000
export const oneIn = (chance) => Math.round(1 / chance)

// Formats 0.0123 as "1.23%". Small numbers get more decimals so they don't show as 0%.
export function percent(chance, decimals) {
  if (chance === 0) return "0%"
  const d = decimals ?? (chance >= 0.1 ? 1 : chance >= 0.01 ? 2 : chance >= 0.001 ? 2 : 3)
  return `${(chance * 100).toFixed(d)}%`
}

const ultraOrBetterBase = ULTRA_OR_BETTER.reduce((sum, r) => sum + rarities[r], 0)
const combined = longRunRates()
const brilliantWithPity = predictedRate(BRILLIANT_CHANCE, PITY_RULES.brilliant)

// The rates the chart and the explainer talk about.
//   base     = chance on any single pull, with no pity
//   withPity = long-run rate with every pity rule on (exact, not simulated)
//   matches  = does this pulled card count for the rate?
export const TRACKED_RATES = {
  omg: {
    label: "Ñ",
    base: rarities.omg,
    withPity: combined.omg,
    matches: (card) => card.rarity === "omg",
  },
  ultraOrBetter: {
    label: "Ultra or better",
    base: ultraOrBetterBase,
    withPity: combined.ultraOrBetter,
    matches: (card) => ULTRA_OR_BETTER.includes(card.rarity),
  },
  brilliant: {
    label: "Brilliant",
    base: BRILLIANT_CHANCE,
    withPity: brilliantWithPity,
    matches: (card) => card.brilliant,
  },
  brilliantOmg: {
    label: "Brilliant Ñ",
    // The brilliant roll is separate from the rarity roll, so the two
    // chances multiply, with or without pity.
    base: rarities.omg * BRILLIANT_CHANCE,
    withPity: combined.omg * brilliantWithPity,
    matches: (card) => card.rarity === "omg" && card.brilliant,
  },
}
