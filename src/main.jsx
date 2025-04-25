import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Card } from './components/cards.jsx'
import { RollButtom } from './components/roll-buttom.jsx'



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
      <div className="">
        <RollButtom {...{name: "Abrir Todos", onclick: () => console.log("roll")}} />
      </div>
    </div>
  </StrictMode>
)


