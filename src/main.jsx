import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Card } from './components/cards.jsx'



const root = createRoot(document.getElementById('root'))

root.render(

  <article className = "grid grid-cols-5">
  <Card />
  <Card />
  <Card />
  <Card />
  <Card />
  </article>
)

