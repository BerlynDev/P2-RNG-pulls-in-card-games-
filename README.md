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

| Prize | Type | Guaranteed by |
|---|---|---|
| ✨ Brilliant | hard pity | pull 10 |
| Ultra or better (Ultra or Ñ) | hard pity | pull 10 |
| Ñ (OMG) | soft + hard pity | soft pity from pull 75, guaranteed at pull 100 |

- **Hard pity:** the chance stays the same until the limit, then the prize is guaranteed.
- **Soft pity (Ñ):** from pull 75 the Ñ chance climbs by 3.5% on every miss: 3.6% at pull 75, 21.1% at 80, 56.1% at 90, 87.6% at 99. Most Ñ arrive between pulls 75 and 84, and the hard limit at 100 is a safety net.
- **Ultra-or-better pity:** the forced pull can only be Ultra or Ñ, in their usual proportion (99% Ultra, 1% Ñ). During Ñ soft pity, the boosted Ñ chance carries over to it.
- The counters carry over between packs. One pull = one card, so a pack of 5 is 5 pulls.
- Cards forced by pity get a **PITY** tag, and Ñ boosted by soft pity get **SOFT PITY**.
- Pity can be switched **ON/OFF** to compare. The counters keep counting either way.
- Because of pity, rare results come out more often than their base odds:

| | Base odds | With pity |
|---|---|---|
| Ñ | 0.10% | about 1.3% |
| Ultra or better | 10% | about 15.9% |
| Brilliant | 10% | about 15.3% |
| Brilliant Ñ | 0.01% | about 0.2% |

### Pull history

The page keeps a history of everything you've pulled:
- your rate for each rarity next to the base odds
- a **showcase slot for the brilliant Ñ**, the rarest card (an Ñ that's also brilliant: 1 in 10,000 pulls without pity)
- how many results pity forced or boosted
- a log of every Ñ, with how many pulls since the previous one
- the last 10 packs

It's saved in your browser (localStorage), so a page refresh doesn't reset your history or your pity. Use **Reset** to start over.

### Export

- **Export CSV:** one row per pull (`pull, pack, card, rarity, brilliant, pity`), ready for Excel or Google Sheets. Keeps the last 100,000 pulls.
- **Export JSON:** the whole history, as a backup or to analyse in code.

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
| Pity limits, soft pity start and step | `src/components/data/pity.js` |
| Which letter has which rarity | `src/components/data/card-pool.js` |
| Cards per pack | `src/components/data/pack.js` |

After changing anything, run `pnpm odds` to check the results match.

## Project structure

```
src/
├── App.jsx                         # page layout and "open pack" logic
├── main.jsx                        # starts React
├── styles.css                      # Tailwind + custom animations
├── hooks/
│   └── usePullHistory.js           # history + pity counters, saved in localStorage
├── utils/
│   ├── pullLog.js                  # compact format for every pull ("a", "H:b", "Ñ:s")
│   └── exportHistory.js            # CSV / JSON export and file download
└── components/
    ├── data/                       # card pool, odds, pity rules and pack size
    ├── homepage/
    │   ├── pulling_cards_function.js   # the RNG: rarity roll, brilliant roll, soft and hard pity
    │   ├── cards.jsx                   # card with flip animation and rarity effects
    │   └── roll-buttom.jsx             # "Open All Packs" button
    └── history/
        ├── PityPanel.jsx               # pity meters and ON/OFF switch
        ├── PullHistory.jsx             # stats, export buttons, Ñ log and recent packs
        └── BrilliantOmgSlot.jsx        # showcase slot for the brilliant Ñ
scripts/
└── check-odds.js                   # the `pnpm odds` simulation
```

## To do

- [x] The RNG code on JS
- [x] The visuals of the packs
- [x] Pull history
- [x] Pity system (hard pity)
- [x] Soft pity: the Ñ chance climbs with every miss after pull 75
- [x] Pity for ultra or better every 10 pulls
- [x] Export history (CSV / JSON)
- [x] Showcase slot for the brilliant Ñ
