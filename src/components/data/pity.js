// Pity rules.
//   hard      = the most pulls in a row you can go WITHOUT the prize:
//               pull number `hard` is guaranteed, then the counter restarts.
//   softStart = (optional) from this pull on, the chance starts climbing...
//   softStep  = ...by this much on every pull without the prize.
export const PITY_RULES = {
  brilliant: { hard: 10 }, // a brilliant card by pull 10 at the latest
  omg: {
    softStart: 75,   // pull 75: 0.1% + 3.5% = 3.6%, pull 80: 21.1%, pull 90: 56.1%, pull 99: 87.6%
    softStep: 0.035, // small enough that the curve stays under 100% until the hard limit
    hard: 100,       // an Ñ by pull 100 at the latest
  },
}

// Counters at the very start: no pulls made yet.
// sinceX = how many pulls in a row have NOT given X.
export const START_PITY = {
  sinceBrilliant: 0,
  sinceOmg: 0,
}
