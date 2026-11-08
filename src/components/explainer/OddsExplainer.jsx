import { cardPool } from "../data/card-pool.js"
import { rarities, BRILLIANT_CHANCE } from "../data/rarities.js"
import { PITY_RULES, ULTRA_OR_BETTER } from "../data/pity.js"
import { PACK_SIZE } from "../data/pack.js"
import { pityChance } from "../homepage/pulling_cards_function.js"
import { TRACKED_RATES, percent, oneIn } from "../../utils/rates.js"

// Everything on this page is calculated from the same data files the game
// uses, so if the odds or pity rules change, the explanation updates itself.

const RARITY_NAMES = { common: "Common", rare: "Rare", super: "Super", ultra: "Ultra", omg: "OMG" }
const lettersOf = (rarity) => cardPool.filter((c) => c.rarity === rarity).map((c) => c.name.toUpperCase()).join(" ")
const n = (value) => value.toLocaleString("en-US")
// "1 in N" with one decimal for common things (40% = 1 in 2.5, not 1 in 3)
const oneInText = (chance) => {
  const v = 1 / chance
  return v < 10 ? String(Number(v.toFixed(1))) : n(oneIn(chance))
}

// For the soft pity table: the Ñ chance on a few pulls along the way.
const omgRule = PITY_RULES.omg
const softPityRows = [
  { label: `1 to ${omgRule.softStart - 1}`, chance: rarities.omg },
  ...[omgRule.softStart, 80, 85, 90, 95, omgRule.hard - 1, omgRule.hard].map((pull) => ({
    label: String(pull),
    chance: pityChance(rarities.omg, pull, omgRule),
  })),
]

// Where the Ñ usually lands with soft pity: walk through pulls 1..hard and
// add up the chance the Ñ arrives on each one.
function omgArrivalShare(from, to) {
  let stillWaiting = 1
  let share = 0
  for (let pull = 1; pull <= omgRule.hard; pull++) {
    const chance = pityChance(rarities.omg, pull, omgRule)
    if (pull >= from && pull <= to) share += stillWaiting * chance
    stillWaiting *= 1 - chance
  }
  return share
}
const mainWindowEnd = omgRule.softStart + 9
const mainWindowShare = omgArrivalShare(omgRule.softStart, mainWindowEnd)

// Typical spread of your rate after N pulls: about ± 2 × √(p × (1 − p) ÷ N).
// (Pity actually makes results a bit steadier than this, so it's a safe guess.)
const brilliantRate = TRACKED_RATES.brilliant.withPity
const spreadRows = [100, 1000, 10000].map((pulls) => {
  const wobble = 2 * Math.sqrt((brilliantRate * (1 - brilliantRate)) / pulls)
  return { pulls, low: Math.max(0, brilliantRate - wobble), high: brilliantRate + wobble }
})

const ultraShareInGroup = rarities.ultra / ULTRA_OR_BETTER.reduce((sum, r) => sum + rarities[r], 0)

// Reusable bits of styling
const th = "py-1 pr-3 text-left font-medium text-indigo-300"
const td = "py-1 pr-3 border-t border-indigo-900"

function Topic({ title, children, open = false }) {
  return (
    <details open={open} className="group border-t border-indigo-900 py-3 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
        {title}
        <span className="text-indigo-300 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
      </summary>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-indigo-100">{children}</div>
    </details>
  )
}

export function OddsExplainer() {
  return (
    <section id="how-the-odds-work" className="mx-auto my-6 w-full max-w-xl rounded-xl bg-indigo-950 p-4 text-white">
      <h2 className="text-lg font-bold">How the odds work</h2>
      <p className="mt-1 text-sm text-indigo-200">
        Plain-language answers, no math background needed. One <b>pull</b> = one card; one <b>pack</b> = {PACK_SIZE} cards.
      </p>

      <div className="mt-2">
        <Topic title="What can I pull, and how often?" open>
          <p>
            Every card is rolled on its own, like throwing a 1,000-sided die: {n(rarities.common * 1000)} sides
            are Common, {n(rarities.rare * 1000)} are Rare, {n(rarities.super * 1000)} are Super,{" "}
            {n(rarities.ultra * 1000)} are Ultra and just {n(rarities.omg * 1000)} side is the Ñ. Then a card of
            that rarity is picked at random.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr><th className={th}>Rarity</th><th className={th}>Letters</th><th className={th}>Chance</th><th className={th}>About</th></tr>
            </thead>
            <tbody>
              {Object.entries(rarities).map(([rarity, chance]) => (
                <tr key={rarity}>
                  <td className={td}>{RARITY_NAMES[rarity]}</td>
                  <td className={td}>{lettersOf(rarity)}</td>
                  <td className={`${td} tabular-nums`}>{percent(chance)}</td>
                  <td className={`${td} tabular-nums`}>1 in {oneInText(chance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-indigo-300">
            Each card in a pack is rolled separately: getting a rare card doesn&apos;t make the next one more or less likely.
          </p>
        </Topic>

        <Topic title="What is a brilliant card?">
          <p>
            After the rarity, there&apos;s a second, separate roll: <b>1 in {oneIn(BRILLIANT_CHANCE)}</b> cards (
            {percent(BRILLIANT_CHANCE)}) come out <b>brilliant</b>, shown in UPPERCASE with a gold ring. Any letter can
            be brilliant, from a common A to an Ñ.
          </p>
        </Topic>

        <Topic title="How rare is a brilliant Ñ?">
          <p>
            It needs two things on the <i>same</i> pull: an Ñ (1 in {oneInText(rarities.omg)}) <b>and</b> a brilliant
            roll (1 in {oneIn(BRILLIANT_CHANCE)}). When two separate things must both happen, you multiply their
            chances:
          </p>
          <p className="rounded-lg bg-indigo-900/60 px-3 py-2 text-center tabular-nums">
            1 in {oneInText(rarities.omg)} × 1 in {oneIn(BRILLIANT_CHANCE)} = <b>1 in {oneInText(TRACKED_RATES.brilliantOmg.base)}</b>
          </p>
          <p>That&apos;s why it gets its own showcase slot in the history.</p>
        </Topic>

        <Topic title="What is pity?">
          <p>
            Pity is <b>bad-luck protection</b>. Without it, the game has no memory: you could, in theory, go
            thousands of pulls without an Ñ. With pity, the game counts how many pulls in a row you&apos;ve gone
            <i> without</i> something, and if you reach the limit, that pull is <b>guaranteed</b> to give it. Then
            the count starts again from zero.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr><th className={th}>Prize</th><th className={th}>Guaranteed by</th></tr>
            </thead>
            <tbody>
              <tr><td className={td}>✨ Brilliant</td><td className={td}>pull {PITY_RULES.brilliant.hard}</td></tr>
              <tr><td className={td}>Ultra or better</td><td className={td}>pull {PITY_RULES.ultraOrBetter.hard}</td></tr>
              <tr><td className={td}>Ñ</td><td className={td}>pull {omgRule.hard} (with soft pity from pull {omgRule.softStart})</td></tr>
            </tbody>
          </table>
          <p>
            The meters in the <b>Pity</b> panel show where each counter is. Getting the prize by luck also resets
            its counter. Cards that pity forced get a <b>PITY</b> tag.
          </p>
        </Topic>

        <Topic title="What is soft pity?">
          <p>
            A guarantee at exactly pull {omgRule.hard} would feel mechanical. So for the Ñ, the chance starts
            climbing <b>before</b> that: from pull {omgRule.softStart}, every pull without an Ñ adds{" "}
            {percent(omgRule.softStep, 1)} to the chance of the next one.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr><th className={th}>Pulls since your last Ñ</th><th className={th}>Ñ chance on that pull</th></tr>
            </thead>
            <tbody>
              {softPityRows.map((row) => (
                <tr key={row.label}>
                  <td className={`${td} tabular-nums`}>{row.label}</td>
                  <td className={`${td} tabular-nums`}>{row.chance === 1 ? "100% (guaranteed)" : percent(row.chance, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Result: about <b>{Math.round(mainWindowShare * 100)}%</b> of Ñ arrive between pulls {omgRule.softStart} and{" "}
            {mainWindowEnd}, and reaching pull {omgRule.hard} almost never happens. Ñ boosted this way get a{" "}
            <b>SOFT PITY</b> tag.
          </p>
        </Topic>

        <Topic title="What is ultra-or-better pity?">
          <p>
            A smaller, more frequent guarantee: in every {PITY_RULES.ultraOrBetter.hard} pulls you get at least one
            Ultra or Ñ. When it&apos;s forced, the game still keeps their usual proportion, so the forced card is an
            Ultra {Math.round(ultraShareInGroup * 100)} times out of 100 and an Ñ {100 - Math.round(ultraShareInGroup * 100)}{" "}
            time. It keeps something good coming while you wait for the big one.
          </p>
        </Topic>

        <Topic title="Base odds vs what you really get">
          <p>
            The <b>base odds</b> are the chance on any single pull. Because pity rescues your unlucky streaks, over
            many pulls the rare results come out <b>more often</b> than that. Games call this the{" "}
            <b>consolidated rate</b>:
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr><th className={th}>Result</th><th className={th}>Base odds</th><th className={th}>Real rate with pity</th></tr>
            </thead>
            <tbody>
              {Object.entries(TRACKED_RATES).map(([key, rate]) => (
                <tr key={key}>
                  <td className={td}>{rate.label}</td>
                  <td className={`${td} tabular-nums`}>{percent(rate.base)} <span className="text-indigo-300">(1 in {oneInText(rate.base)})</span></td>
                  <td className={`${td} tabular-nums`}>{percent(rate.withPity)} <span className="text-indigo-300">(1 in {oneInText(rate.withPity)})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-indigo-300">
            With pity on, the commoner rarities shrink a little to make room. Turn pity OFF and your rates head
            back to the base odds.
          </p>
        </Topic>

        <Topic title="Why doesn't my rate match exactly?">
          <p>
            Because it&apos;s random. Flip a coin 10 times and getting 7 heads is completely normal, even though
            the chance is 50%. The more you flip, the closer you get to 50%. Your pulls work the same way: early on
            your rates jump around, and they settle as you pull more. The chart shows this happening.
          </p>
          <p>For example, for brilliant cards with pity on ({percent(brilliantRate)} in the long run), your rate is usually:</p>
          <table className="w-full text-sm">
            <thead>
              <tr><th className={th}>After</th><th className={th}>Usually between</th></tr>
            </thead>
            <tbody>
              {spreadRows.map((row) => (
                <tr key={row.pulls}>
                  <td className={`${td} tabular-nums`}>{n(row.pulls)} pulls</td>
                  <td className={`${td} tabular-nums`}>{percent(row.low, 1)} and {percent(row.high, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-indigo-300">Ten times more pulls makes the range about three times narrower.</p>
        </Topic>

        <Topic title="Is it really random?">
          <p>
            It uses the browser&apos;s built-in random number generator (<code>Math.random()</code>). It isn&apos;t
            truly random like dice, it&apos;s a formula that produces numbers that look random, but for a game it
            behaves the same: nobody can predict or influence the next pull. The odds were checked by simulating a
            million pulls, and the results match these numbers.
          </p>
        </Topic>
      </div>
    </section>
  )
}
