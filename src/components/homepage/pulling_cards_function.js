import { BRILLIANT_CHANCE } from "../data/rarities.js"

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

// Pulls one card: roll the rarity, pick a random card of that rarity,
// then roll separately for brilliant (uppercase).
export function pullCard(cardPool, rarities) {
  const rarity = pickRarity(rarities)
  const options = cardPool.filter((card) => card.rarity === rarity)
  const card = options[Math.floor(Math.random() * options.length)]
  const brilliant = Math.random() < BRILLIANT_CHANCE

  return {
    ...card,
    name: brilliant ? card.name.toUpperCase() : card.name,
    brilliant,
  }
}

// Pulls a whole pack. Every card rolls its odds independently.
export function pulling_cards_function(numberOfPulls, cardPool, rarities) {
  const results = []
  for (let i = 0; i < numberOfPulls; i++) {
    results.push(pullCard(cardPool, rarities))
  }
  return results
}
