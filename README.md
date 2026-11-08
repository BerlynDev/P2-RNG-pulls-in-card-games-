# RNG Pulls in Card Games

This is a JavaScript RNG (Random Number Generator) practice: a card pack simulator that shows how "gacha" pulls work, including rarity odds, rare variants and a pity system.

Built with **Vite + React + Tailwind CSS**.

## How it works

The card pool is the entire alphabet. Each letter is a card that can be pulled by the RNG.

Click **Open All Packs** to open a pack of **5 cards**. Each card rolls its odds independently, then flips over to show what you got.

### Rarities

| Letters | Rarity | Chance per card |
|---|---|---|
| A B C D E F G | Common | 40% |
| H I J K L M | Rare | 30% |
| N O P Q R S T | Super | 20% |
| U V W X Y Z | Ultra | 9.9% |
| Ñ | OMG | 0.1% |

### Brilliant cards

Every card also has its own chance to be **brilliant**, which means uppercase instead of lowercase. **A is NOT equal to a.**

- Lowercase (a): 90%
- Uppercase / brilliant (A): 10%

### Pity system

Pity puts a ceiling on bad luck. The game counts how many pulls in a row you've gone without a prize. If you reach the limit, that pull is **guaranteed** to give it, and the counter starts again from 0.

| Prize | Guaranteed by |
|---|---|
| ✨ Brilliant | pull 10 |
| Ñ (OMG) | pull 100 |

- The counters carry over between packs. One pull = one card, so a pack of 5 is 5 pulls.
- Cards forced by pity get a **PITY** tag.
- Pity can be switched **ON/OFF** to compare. The counters keep counting either way.
- Because of pity, rare results come out more often than their base odds. With the 100-pull guarantee, Ñ shows up about **1.05%** of the time instead of 0.1%.

### Pull history

The page keeps a history of everything you've pulled:
- your rate for each rarity next to the base odds
- how many results pity forced
- a log of every Ñ, with how many pulls since the previous one
- the last 10 packs

It's saved in your browser (localStorage), so a page refresh doesn't reset your history or your pity. Use **Reset** to start over.

## Getting started

You need [Node.js](https://nodejs.org/) **20.19+ or 22.12+** and [pnpm](https://pnpm.io/).

```bash
npm install -g pnpm   # only if you don't have pnpm yet
pnpm install          # install dependencies
pnpm dev              # start the dev server, then open the URL it prints
```

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Starts the local dev server |
| `pnpm build` | Builds the production version into `dist/` |
| `pnpm preview` | Serves the production build locally |
| `pnpm lint` | Checks the code with ESLint |
| `pnpm odds` | Pulls 1,000,000 cards with and without pity and compares the results with the expected odds |

## Changing the odds

| What | Where |
|---|---|
| Rarity chances and brilliant chance | `src/components/data/rarities.js` (the rarity chances must add up to 1) |
| Pity limits | `src/components/data/pity.js` |
| Which letter has which rarity | `src/components/data/card-pool.js` |

After changing anything, run `pnpm odds` to check the results match.

## Project structure

```
src/
├── App.jsx                         # page layout and "open pack" logic
├── main.jsx                        # starts React
├── styles.css                      # Tailwind + custom animations
├── hooks/
│   └── usePullHistory.js           # history + pity counters, saved in localStorage
└── components/
    ├── data/                       # card pool, odds and pity rules
    ├── homepage/
    │   ├── pulling_cards_function.js   # the RNG: rarity roll, brilliant roll, pity
    │   ├── cards.jsx                   # card with flip animation and rarity effects
    │   └── roll-buttom.jsx             # "Open All Packs" button
    └── history/
        ├── PityPanel.jsx               # pity meters and ON/OFF switch
        └── PullHistory.jsx             # stats, Ñ log and recent packs
scripts/
└── check-odds.js                   # the `pnpm odds` simulation
```

## To do

- [x] The RNG code on JS
- [x] The visuals of the packs
- [x] Pull history
- [x] Pity system (hard pity)
- [ ] Soft pity: the Ñ chance climbs with every miss after a certain pull
- [ ] Pity for ultra or better every 10 pulls
