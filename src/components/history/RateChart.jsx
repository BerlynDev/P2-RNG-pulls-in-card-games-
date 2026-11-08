import { useCallback, useMemo, useRef, useState } from "react"
import { decodePull } from "../../utils/pullLog.js"
import { TRACKED_RATES, percent } from "../../utils/rates.js"

// Chart colors (checked for contrast against the panel's bg-indigo-950).
const LINE = "#3987e5"       // your rate
const PITY_LINE = "#c3c2b7"  // expected with pity (dashed)
const BASE_LINE = "#898781"  // base odds (dotted)
const GRID = "rgba(255,255,255,0.08)"

// Drawing area. The width follows the panel (measured below), so 1 SVG unit
// is always 1 screen pixel and the text stays readable on phones too.
const H = 240
const M = { top: 14, right: 110, bottom: 30, left: 48 } // room for axis and line labels
const PLOT_H = H - M.top - M.bottom
const MAX_POINTS = 300 // long histories are sampled so the chart stays fast
const MIN_PULLS = 10

// Rounds up to a "nice" axis maximum: 1, 2, 2.5 or 5 × a power of ten.
function niceMax(value) {
  const power = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) if (step * power >= value) return step * power
  return 10 * power
}

// For each sampled pull: how many matching cards so far, and the rate so far.
function runningRate(history, matches) {
  const log = history.pullLog
  const every = Math.max(1, Math.ceil(log.length / MAX_POINTS))
  const points = []
  let count = 0
  log.forEach((entry, i) => {
    if (matches(decodePull(entry))) count++
    const pulls = i + 1
    if (pulls % every === 0 || pulls === log.length) {
      points.push({ pull: history.pullLogStart + i, pulls, count, rate: count / pulls })
    }
  })
  return points
}

export function RateChart({ history }) {
  const [metric, setMetric] = useState("omg")
  const [hover, setHover] = useState(null) // index of the highlighted point
  const [W, setW] = useState(600)            // chart width in pixels

  // Measure the chart's width, and again whenever it changes (window resized,
  // phone rotated). A "callback ref" runs when the element appears or goes away.
  const observer = useRef(null)
  const measure = useCallback((element) => {
    observer.current?.disconnect()
    if (!element) return
    observer.current = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))))
    observer.current.observe(element)
  }, [])
  const rate = TRACKED_RATES[metric]

  const points = useMemo(() => runningRate(history, rate.matches), [history, rate])

  if (history.pullLog.length < MIN_PULLS) {
    return (
      <section className="mx-auto mt-6 w-full max-w-xl rounded-xl bg-indigo-950 p-4 text-center text-sm text-indigo-200">
        Open a couple of packs to see your rates over time.
      </section>
    )
  }

  const PLOT_W = W - M.left - M.right
  const last = points.at(-1)
  // The first pulls swing wildly (1 Ñ in 3 pulls = 33%), so the axis is sized
  // from the later part of the line and the reference lines; early spikes are clipped.
  const settled = points.filter((p) => p.pulls >= Math.min(50, last.pulls / 4))
  const yMax = niceMax(Math.max(rate.withPity * 1.5, rate.base * 1.5, ...settled.map((p) => p.rate)))
  const x = (pulls) => M.left + (last.pulls === 1 ? 0 : ((pulls - 1) / (last.pulls - 1)) * PLOT_W)
  const y = (value) => M.top + PLOT_H - (Math.min(value, yMax) / yMax) * PLOT_H
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.pulls).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ")
  const yTicks = [0, yMax / 2, yMax]

  // Labels for the two reference lines, pushed apart if they'd overlap.
  let pityLabelY = y(rate.withPity)
  let baseLabelY = y(rate.base)
  if (Math.abs(pityLabelY - baseLabelY) < 14) {
    const mid = (pityLabelY + baseLabelY) / 2
    ;[pityLabelY, baseLabelY] = pityLabelY < baseLabelY ? [mid - 7, mid + 7] : [mid + 7, mid - 7]
  }

  // Hover / keyboard: find the point nearest to the pointer's x.
  function pointAt(clientX, svg) {
    const box = svg.getBoundingClientRect()
    const svgX = ((clientX - box.left) / box.width) * W
    let best = 0
    points.forEach((p, i) => {
      if (Math.abs(x(p.pulls) - svgX) < Math.abs(x(points[best].pulls) - svgX)) best = i
    })
    return best
  }
  function onKeyDown(e) {
    const current = hover ?? points.length - 1
    const moves = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: points.length - 1 }
    if (e.key in moves) {
      e.preventDefault()
      setHover(Math.max(0, Math.min(points.length - 1, moves[e.key])))
    }
  }
  const shown = hover === null ? null : points[hover]

  return (
    <section className="mx-auto mt-6 w-full max-w-xl rounded-xl bg-indigo-950 p-4 text-white">
      <h2 className="text-lg font-bold">Your {rate.label} rate over time</h2>

      {/* Which rate to show */}
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Rate to show">
        {Object.entries(TRACKED_RATES).map(([key, r]) => (
          <button
            key={key}
            onClick={() => { setMetric(key); setHover(null) }}
            aria-pressed={metric === key}
            className={`rounded-lg px-3 py-1 text-xs ${metric === key ? "bg-indigo-200 font-semibold text-indigo-950" : "border border-indigo-400 text-indigo-200 hover:bg-indigo-900"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Headline number */}
      <p className="mt-3">
        <span className="text-2xl font-bold">{percent(last.rate)}</span>
        <span className="ml-2 text-sm text-indigo-200">
          {last.count.toLocaleString()} in {last.pulls.toLocaleString()} pulls
          {history.pullLogStart > 1 && ` (since pull ${history.pullLogStart})`}
        </span>
      </p>

      <div ref={measure} className="relative mt-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 rounded"
          role="img"
          aria-label={`Line chart: your ${rate.label} rate is ${percent(last.rate)} after ${last.pulls} pulls. Expected with pity ${percent(rate.withPity)}, base odds ${percent(rate.base)}.`}
          tabIndex={0}
          onPointerMove={(e) => setHover(pointAt(e.clientX, e.currentTarget))}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(points.length - 1)}
          onBlur={() => setHover(null)}
          onKeyDown={onKeyDown}
        >
          <defs>
            <clipPath id="plot-area">
              <rect x={M.left} y={M.top} width={PLOT_W} height={PLOT_H} />
            </clipPath>
          </defs>

          {/* Grid and y axis labels */}
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + PLOT_W} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill="#a5b4fc" className="tabular-nums">
                {percent(t, t === 0 ? 0 : undefined)}
              </text>
            </g>
          ))}
          {/* x axis labels: first and last pull */}
          <text x={M.left} y={H - 8} fontSize="11" fill="#a5b4fc">pull {history.pullLogStart.toLocaleString()}</text>
          <text x={M.left + PLOT_W} y={H - 8} fontSize="11" fill="#a5b4fc" textAnchor="end">pull {last.pull.toLocaleString()}</text>

          {/* Reference lines with labels at the right end */}
          <line x1={M.left} x2={M.left + PLOT_W} y1={y(rate.withPity)} y2={y(rate.withPity)} stroke={PITY_LINE} strokeWidth="1.5" strokeDasharray="6 4" />
          <line x1={M.left} x2={M.left + PLOT_W} y1={y(rate.base)} y2={y(rate.base)} stroke={BASE_LINE} strokeWidth="1.5" strokeDasharray="2 4" />
          <text x={M.left + PLOT_W + 8} y={pityLabelY} dominantBaseline="middle" fontSize="11" fill="#e0e7ff">
            With pity {percent(rate.withPity)}
          </text>
          <text x={M.left + PLOT_W + 8} y={baseLabelY} dominantBaseline="middle" fontSize="11" fill="#a5b4fc">
            Base {percent(rate.base)}
          </text>

          {/* Your rate */}
          <path d={path} fill="none" stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" clipPath="url(#plot-area)" />

          {/* Crosshair + marker for the highlighted point */}
          {shown && (
            <g pointerEvents="none">
              <line x1={x(shown.pulls)} x2={x(shown.pulls)} y1={M.top} y2={M.top + PLOT_H} stroke="rgba(255,255,255,0.35)" />
              <circle cx={x(shown.pulls)} cy={y(shown.rate)} r="4.5" fill={LINE} stroke="#1e1b4b" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* Tooltip: the number first, then what it is */}
        {shown && (
          <div
            className="pointer-events-none absolute top-1 rounded-lg bg-indigo-900/95 px-3 py-2 text-xs shadow-lg ring-1 ring-white/10"
            style={x(shown.pulls) > W / 2 ? { right: `${((W - x(shown.pulls)) / W) * 100 + 2}%` } : { left: `${(x(shown.pulls) / W) * 100 + 2}%` }}
          >
            <p className="text-indigo-300">Pull {shown.pull.toLocaleString()}</p>
            <p className="mt-1 flex items-center gap-2">
              <span className="inline-block h-0.5 w-3" style={{ background: LINE }} />
              <span className="font-bold text-white">{percent(shown.rate)}</span>
              <span className="text-indigo-300">your rate ({shown.count} so far)</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 border-t-2 border-dashed" style={{ borderColor: PITY_LINE }} />
              <span className="font-semibold text-white">{percent(rate.withPity)}</span>
              <span className="text-indigo-300">expected with pity</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 border-t-2 border-dotted" style={{ borderColor: BASE_LINE }} />
              <span className="font-semibold text-white">{percent(rate.base)}</span>
              <span className="text-indigo-300">base odds</span>
            </p>
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-indigo-300">
        Early on the line jumps around: a few lucky or unlucky pulls move it a lot. The more you pull, the closer it
        settles to the dashed line (pity ON) or the dotted line (pity OFF).
      </p>

      {/* The same data as a table, for anyone who can't use the chart */}
      <details className="mt-2 text-xs text-indigo-200">
        <summary className="cursor-pointer">Show as table</summary>
        <table className="mt-2 w-full">
          <thead>
            <tr className="text-left text-indigo-300">
              <th className="py-1 font-medium">After pull</th>
              <th className="py-1 text-right font-medium">{rate.label} so far</th>
              <th className="py-1 text-right font-medium">Your rate</th>
            </tr>
          </thead>
          <tbody>
            {[...new Set(Array.from({ length: 8 }, (_, i) => Math.round((i / 7) * (points.length - 1))))].map((i) => (
              <tr key={i} className="border-t border-indigo-900 tabular-nums">
                <td className="py-1">{points[i].pull.toLocaleString()}</td>
                <td className="py-1 text-right">{points[i].count.toLocaleString()}</td>
                <td className="py-1 text-right">{percent(points[i].rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
