// Pity rules: the most pulls in a row you can go WITHOUT getting something.
// Pull number N is forced to give it, then the counter starts again from 0.
export const PITY_RULES = {
  brilliant: 10, // a brilliant card by pull 10 at the latest
  omg: 100,      // an Ñ by pull 100 at the latest
}

// Counters at the very start: no pulls made yet.
// sinceX = how many pulls in a row have NOT given X.
export const START_PITY = {
  sinceBrilliant: 0,
  sinceOmg: 0,
}
