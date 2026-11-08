import { BRILLIANT_CHANCE } from "../data/rarities.js"
import { START_PITY } from "../data/pity.js"

// Picks a rarity using its weight.
// Lines the chances up one after another on a 0–1 ruler:
//   common [0, 0.40) | rare [0.40, 0.70) | super [0.70, 0.90) | ultra [0.90, 0.999) | omg [0.999, 1)
// and returns whichever segment the random roll lands in.
export function pickRarity(rarities, roll = Math.random()) {
  let cumulative = 0
  for (const [rarity, chance] of Object.entries(rarities)) {
    cumulative += chance
    if (roll < cumulative) return rarity
  }
  // Only reached if floating-point rounding leaves the total a hair under 1.
  return Object.keys(rarities).at(-1)
}

// Pulls one card.
//   pity  = current counters, e.g. { sinceBrilliant: 9, sinceOmg: 42 }
//   rules = PITY_RULES to turn pity on, or null to turn it off
// Returns the card AND the updated counters, because the next pull needs them.
export function pullCard(cardPool, rarities, pity = START_PITY, rules = null) {
  // Pity check: have we already missed (limit - 1) times in a row?
  // Then this pull is the last one allowed, so it's forced.
  const omgGuaranteed = rules !== null && pity.sinceOmg >= rules.omg - 1
  const brilliantGuaranteed = rules !== null && pity.sinceBrilliant >= rules.brilliant - 1

  // 1. Rarity: forced by pity, or the normal weighted roll.
  const rarity = omgGuaranteed ? "omg" : pickRarity(rarities)

  // 2. A random card of that rarity.
  const options = cardPool.filter((card) => card.rarity === rarity)
  const base = options[Math.floor(Math.random() * options.length)]

  // 3. Brilliant: forced by pity, or the normal 10% roll.
  const brilliant = brilliantGuaranteed || Math.random() < BRILLIANT_CHANCE

  const card = {
    ...base,
    name: brilliant ? base.name.toUpperCase() : base.name,
    brilliant,
    // Which results pity forced, so the UI can show a PITY tag.
    pity: { omg: omgGuaranteed, brilliant: brilliantGuaranteed },
  }

  // 4. Update the counters: back to 0 when we got it, otherwise one more miss.
  //    They keep counting even when pity is off, so you can see your luck.
  const nextPity = {
    sinceOmg: rarity === "omg" ? 0 : pity.sinceOmg + 1,
    sinceBrilliant: brilliant ? 0 : pity.sinceBrilliant + 1,
  }

  return { card, pity: nextPity }
}

// Pulls a whole pack. Each card rolls independently, but the pity counters
// carry from one card to the next (and from one pack to the next).
export function pulling_cards_function(numberOfPulls, cardPool, rarities, pity = START_PITY, rules = null) {
  const cards = []
  let current = pity
  for (let i = 0; i < numberOfPulls; i++) {
    const result = pullCard(cardPool, rarities, current, rules)
    cards.push(result.card)
    current = result.pity
  }
  return { cards, pity: current }
}
