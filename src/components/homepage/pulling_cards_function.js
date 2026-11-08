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

// The chance of the prize on pull number `pullNumber` (1 = first pull since
// the last time you got it), following a pity rule:
//   before softStart   -> the normal base chance
//   from softStart on  -> base + softStep for every pull since softStart
//   at hard            -> 1 (guaranteed)
// With no rule (pity off) it's always the base chance.
export function pityChance(baseChance, pullNumber, rule) {
  if (!rule) return baseChance
  if (pullNumber >= rule.hard) return 1
  if (rule.softStart === undefined || pullNumber < rule.softStart) return baseChance
  return Math.min(1, baseChance + rule.softStep * (pullNumber - rule.softStart + 1))
}

// Returns a copy of the odds with one rarity set to a new chance. The other
// rarities shrink by the same proportion so the total still adds up to 1.
//   Example: omg 0.001 -> 0.241 leaves 0.759 for the rest, so each of the
//   others is multiplied by 0.759 / 0.999.
export function withChance(rarities, rarity, newChance) {
  const scale = (1 - newChance) / (1 - rarities[rarity])
  const adjusted = {}
  for (const [name, chance] of Object.entries(rarities)) {
    adjusted[name] = name === rarity ? newChance : chance * scale
  }
  return adjusted
}

// Pulls one card.
//   pity  = current counters, e.g. { sinceBrilliant: 9, sinceOmg: 42 }
//   rules = PITY_RULES to turn pity on, or null to turn it off
// Returns the card AND the updated counters, because the next pull needs them.
export function pullCard(cardPool, rarities, pity = START_PITY, rules = null) {
  // 1. Rarity. The Ñ chance depends on how long you've gone without one.
  const omgChance = pityChance(rarities.omg, pity.sinceOmg + 1, rules?.omg)
  const rarity = pickRarity(withChance(rarities, "omg", omgChance))

  // 2. A random card of that rarity.
  const options = cardPool.filter((card) => card.rarity === rarity)
  const base = options[Math.floor(Math.random() * options.length)]

  // 3. Brilliant: forced by pity, or the normal 10% roll.
  const brilliantChance = pityChance(BRILLIANT_CHANCE, pity.sinceBrilliant + 1, rules?.brilliant)
  const brilliant = Math.random() < brilliantChance

  // Did pity help? "hard" = it was guaranteed, "soft" = the chance was boosted.
  const omgPity = rarity !== "omg" ? false : omgChance === 1 ? "hard" : omgChance > rarities.omg ? "soft" : false

  const card = {
    ...base,
    name: brilliant ? base.name.toUpperCase() : base.name,
    brilliant,
    // What pity did for this card, so the UI can tag it.
    pity: { omg: omgPity, brilliant: brilliant && brilliantChance === 1 },
  }

  // 4. Update the counters: back to 0 when we got it, otherwise one more miss.
  //    They keep counting even when pity is off, so you can see your luck.
  const nextPity = {
    ...pity,
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
