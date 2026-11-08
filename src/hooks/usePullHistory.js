import { useEffect, useState } from "react"
import { START_PITY } from "../components/data/pity.js"

// Everything is saved in the browser (localStorage), so history and pity
// counters survive a page refresh. "v1" lets us change the format later
// without reading old, incompatible data.
const STORAGE_KEY = "rng-card-game:history:v1"
const MAX_SAVED_PACKS = 50 // only the most recent packs are kept in the list

const EMPTY_HISTORY = {
  totalPacks: 0,
  totalCards: 0,
  rarityCounts: {},                    // { common: 12, rare: 7, ... }
  brilliantCount: 0,
  // How many times pity helped: omg = hard pity (guaranteed), omgSoft = soft pity (boosted)
  pityTriggers: { brilliant: 0, ultra: 0, omg: 0, omgSoft: 0 },
  omgPulls: [],                        // every Ñ: { pullNumber, pity: false | "soft" | "hard" }
  pity: START_PITY,                    // current counters
  pityEnabled: true,
  recentPacks: [],                     // newest first: { packNumber, cards }
}

// Reading storage can fail (private mode, blocked storage), so always fall back.
// Nested objects are merged too, so history saved by an older version of the
// app still gets any counters that were added later.
function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return EMPTY_HISTORY
    const data = JSON.parse(saved)
    return {
      ...EMPTY_HISTORY,
      ...data,
      pity: { ...EMPTY_HISTORY.pity, ...data.pity },
      pityTriggers: { ...EMPTY_HISTORY.pityTriggers, ...data.pityTriggers },
    }
  } catch {
    return EMPTY_HISTORY
  }
}

// A custom hook: keeps the pull history in state and saves it on every change.
export function usePullHistory() {
  // Passing the function (not calling it) means it only runs on the first render.
  const [history, setHistory] = useState(loadHistory)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {
      // Storage full or blocked: the app still works, it just won't remember.
    }
  }, [history])

  // Adds one opened pack to the history and stores the new pity counters.
  function recordPack(cards, newPity) {
    setHistory((h) => {
      const rarityCounts = { ...h.rarityCounts }
      const pityTriggers = { ...h.pityTriggers }
      const omgPulls = [...h.omgPulls]
      let brilliantCount = h.brilliantCount

      cards.forEach((card, i) => {
        rarityCounts[card.rarity] = (rarityCounts[card.rarity] ?? 0) + 1
        if (card.brilliant) brilliantCount++
        if (card.pity.omg === "hard") pityTriggers.omg++
        if (card.pity.omg === "soft") pityTriggers.omgSoft++
        if (card.pity.brilliant) pityTriggers.brilliant++
        if (card.pity.ultra) pityTriggers.ultra++
        if (card.rarity === "omg") {
          omgPulls.push({ pullNumber: h.totalCards + i + 1, pity: card.pity.omg })
        }
      })

      const packNumber = h.totalPacks + 1
      return {
        ...h,
        totalPacks: packNumber,
        totalCards: h.totalCards + cards.length,
        rarityCounts,
        brilliantCount,
        pityTriggers,
        omgPulls,
        pity: newPity,
        recentPacks: [{ packNumber, cards }, ...h.recentPacks].slice(0, MAX_SAVED_PACKS),
      }
    })
  }

  function setPityEnabled(enabled) {
    setHistory((h) => ({ ...h, pityEnabled: enabled }))
  }

  // Clears everything except the pity ON/OFF choice.
  function resetHistory() {
    setHistory((h) => ({ ...EMPTY_HISTORY, pityEnabled: h.pityEnabled }))
  }

  return { history, recordPack, setPityEnabled, resetHistory }
}
