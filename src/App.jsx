import { useState } from "react"
import { Card } from "./components/homepage/cards.jsx"
import { RollButtom } from "./components/homepage/roll-buttom.jsx"
import { pulling_cards_function } from "./components/homepage/pulling_cards_function.js"
import { cardPool } from "./components/data/card-pool.js"
import { rarities } from "./components/data/rarities.js"
import { PITY_RULES } from "./components/data/pity.js"
import { PityPanel } from "./components/history/PityPanel.jsx"
import { PullHistory } from "./components/history/PullHistory.jsx"
import { RateChart } from "./components/history/RateChart.jsx"
import { usePullHistory } from "./hooks/usePullHistory.js"
import { PACK_SIZE } from "./components/data/pack.js"

export function App() {
  // null = no pack opened since the page loaded, so every card shows its back.
  const [pulledCards, setPulledCards] = useState(null)
  // Counts clicks on the open buttons. Used in each card's `key`: a new key
  // makes React create the card from scratch, so the flip animation plays again.
  const [openNumber, setOpenNumber] = useState(0)
  // Saved history + pity counters (kept in the browser between visits).
  const { history, recordPack, setPityEnabled, resetHistory } = usePullHistory()

  // Opens `count` packs in a row. Each pack starts from the pity counters
  // the previous one left, exactly as if you had clicked `count` times.
  function openPacks(count) {
    const rules = history.pityEnabled ? PITY_RULES : null
    let pity = history.pity
    const allCards = []
    for (let i = 0; i < count; i++) {
      const pack = pulling_cards_function(PACK_SIZE, cardPool, rarities, pity, rules)
      recordPack(pack.cards, pack.pity)
      allCards.push(...pack.cards)
      pity = pack.pity
    }
    setPulledCards(allCards)
    setOpenNumber((n) => n + 1)
  }

  // One row of card backs before the first click; then one slot per card pulled.
  const slots = pulledCards?.length ?? PACK_SIZE
  // With more cards, flip them faster so the whole reveal still takes about a second.
  const stagger = slots > PACK_SIZE ? 120 : 200

  return (
    <div>
      <article className="p-10 grid grid-cols-5">
        {Array.from({ length: slots }, (_, i) => (
          <Card key={`${openNumber}-${i}`} index={i} stagger={stagger} card={pulledCards?.[i]} />
        ))}
      </article>
      <div className="flex flex-wrap justify-center gap-4">
        <RollButtom onClick={() => openPacks(1)}>Open 1 Pack · 5 cards</RollButtom>
        <RollButtom onClick={() => openPacks(2)}>Open 2 Packs · 10 cards</RollButtom>
      </div>
      <PityPanel pity={history.pity} enabled={history.pityEnabled} onToggle={setPityEnabled} />
      <PullHistory history={history} onReset={resetHistory} />
      <RateChart history={history} />
    </div>
  )
}
