import { cardPool } from "../components/data/card-pool.js"

// Every pull is saved as a short piece of text, so even 100,000 pulls fit in
// the browser's storage:
//   "h"     = a rare h, nothing special
//   "H"     = brilliant (uppercase already says it)
//   "Ñ:s"   = Ñ that came during soft pity
//   "X:bu"  = brilliant pity + ultra-or-better pity forced this one
// Pity letters after ":" -> b = brilliant, u = ultra or better, s = Ñ soft, h = Ñ hard
export function encodePull(card) {
  let flags = ""
  if (card.pity.brilliant) flags += "b"
  if (card.pity.ultra) flags += "u"
  if (card.pity.omg === "soft") flags += "s"
  if (card.pity.omg === "hard") flags += "h"
  return flags ? `${card.name}:${flags}` : card.name
}

const FLAG_NAMES = { b: "brilliant", u: "ultra-or-better", s: "omg-soft", h: "omg-hard" }

// Turns a saved entry back into readable fields.
// normalize("NFC") makes "ñ" always one character. Some keyboards and files
// write it as two (n + a combining ~), which looks the same but isn't equal.
export function decodePull(entry) {
  const [rawName, flags = ""] = entry.split(":")
  const name = rawName.normalize("NFC")
  const rarity = cardPool.find((card) => card.name.normalize("NFC") === name.toLowerCase())?.rarity ?? "unknown"
  return {
    card: name,
    rarity,
    brilliant: name !== name.toLowerCase(),
    pity: [...flags].map((f) => FLAG_NAMES[f]),
  }
}
