import { useState } from "react"
import { Card } from "./components/homepage/cards.jsx"
import { RollButtom } from "./components/homepage/roll-buttom.jsx"
import { pulling_cards_function } from "./components/homepage/pulling_cards_function.js"
import { cardPool } from "./components/data/card-pool.js"
import { rarities } from "./components/data/rarities.js"

const PACK_SIZE = 5

export function App() {
  // null = pack not opened yet, so every card shows its back.
  const [pulledCards, setPulledCards] = useState(null)
  // Counts opened packs. Used in each card's `key`: a new key makes React
  // create the card from scratch, so the flip animation plays again.
  const [packNumber, setPackNumber] = useState(0)

  function openPack() {
    setPulledCards(pulling_cards_function(PACK_SIZE, cardPool, rarities))
    setPackNumber((n) => n + 1)
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
    </div>
  )
}
