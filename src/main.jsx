import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Card } from './components/homepage/cards.jsx'
import { RollButtom } from './components/homepage/roll-buttom.jsx'


const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <div>
    <article className="p-10 grid grid-cols-5">
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </article>
      <div className="flex justify-center ">
        <RollButtom children={"Open All Packs"}/>
      </div>
    </div>
  </StrictMode>
)


