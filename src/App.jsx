import { useState } from "react"
import { Card } from "./components/homepage/cards.jsx"
import { RollButtom } from "./components/homepage/roll-buttom.jsx"
import { pulling_cards_function } from "./components/homepage/pulling_cards_function.js"
import { cardPool } from "./components/data/card-pool.js"
import { rarities } from "./components/data/rarities.js"
import { PITY_RULES } from "./components/data/pity.js"
import { PityPanel } from "./components/history/PityPanel.jsx"
import { PullHistory } from "./components/history/PullHistory.jsx"
import { usePullHistory } from "./hooks/usePullHistory.js"
import { PACK_SIZE } from "./components/data/pack.js"

export function App() {
  // null = no pack opened since the page loaded, so every card shows its back.
  const [pulledCards, setPulledCards] = useState(null)
  // Counts opened packs. Used in each card's `key`: a new key makes React
  // create the card from scratch, so the flip animation plays again.
  const [packNumber, setPackNumber] = useState(0)
  // Saved history + pity counters (kept in the browser between visits).
  const { history, recordPack, setPityEnabled, resetHistory } = usePullHistory()

  function openPack() {
    const rules = history.pityEnabled ? PITY_RULES : null
    const { cards, pity } = pulling_cards_function(PACK_SIZE, cardPool, rarities, history.pity, rules)
    setPulledCards(cards)
    setPackNumber((n) => n + 1)
    recordPack(cards, pity)
  }

  return (
    <div>
      <article className="p-10 grid grid-cols-5">
        {Array.from({ length: PACK_SIZE }, (_, i) => (
          <Card key={`${packNumber}-${i}`} index={i} card={pulledCards?.[i]} />
        ))}
      </article>
      <div className="flex justify-center">
        <RollButtom onClick={openPack}>Open All Packs</RollButtom>
      </div>
      <PityPanel pity={history.pity} enabled={history.pityEnabled} onToggle={setPityEnabled} />
      <PullHistory history={history} onReset={resetHistory} />
    </div>
  )
}
