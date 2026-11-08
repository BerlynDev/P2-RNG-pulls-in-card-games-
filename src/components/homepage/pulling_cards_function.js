import { BRILLIANT_CHANCE } from "../data/rarities.js"
import { START_PITY, ULTRA_OR_BETTER } from "../data/pity.js"

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

// Returns a copy of the odds that only allows the listed rarities, keeping
// their relative weights. Everything else gets 0.
//   Example: only ultra (0.099) and omg (0.001) -> ultra 0.99, omg 0.01
export function onlyRarities(rarities, allowed) {
  const total = allowed.reduce((sum, name) => sum + rarities[name], 0)
  const limited = {}
  for (const [name, chance] of Object.entries(rarities)) {
    limited[name] = allowed.includes(name) ? chance / total : 0
  }
  return limited
}

// Pulls one card.
//   pity  = current counters, e.g. { sinceBrilliant: 9, sinceOmg: 42 }
//   rules = PITY_RULES to turn pity on, or null to turn it off
// Returns the card AND the updated counters, because the next pull needs them.
export function pullCard(cardPool, rarities, pity = START_PITY, rules = null) {
  // 1. Rarity. The Ñ chance depends on how long you've gone without one.
  const omgChance = pityChance(rarities.omg, pity.sinceOmg + 1, rules?.omg)
  let odds = withChance(rarities, "omg", omgChance)

  // Ultra-or-better pity: on the guaranteed pull, only ultra and Ñ can come
  // out, still in their usual proportion (99% ultra, 1% Ñ).
  const sinceUltraOrBetter = pity.sinceUltraOrBetter ?? 0
  const ultraGuaranteed = rules?.ultraOrBetter !== undefined && sinceUltraOrBetter + 1 >= rules.ultraOrBetter.hard
  if (ultraGuaranteed) odds = onlyRarities(odds, ULTRA_OR_BETTER)

  const rarity = pickRarity(odds)

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
    pity: { omg: omgPity, brilliant: brilliant && brilliantChance === 1, ultra: ultraGuaranteed },
  }

  // 4. Update the counters: back to 0 when we got it, otherwise one more miss.
  //    They keep counting even when pity is off, so you can see your luck.
  const nextPity = {
    ...pity,
    sinceOmg: rarity === "omg" ? 0 : pity.sinceOmg + 1,
    sinceUltraOrBetter: ULTRA_OR_BETTER.includes(rarity) ? 0 : sinceUltraOrBetter + 1,
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
