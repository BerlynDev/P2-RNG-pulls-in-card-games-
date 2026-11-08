import { PACK_SIZE } from "../components/data/pack.js"
import { decodePull } from "./pullLog.js"

// Makes the browser download `content` as a file, without any server:
// 1. wrap the text in a Blob (a file that lives in memory)
// 2. give it a temporary URL
// 3. click a hidden <a download="..."> link pointing to it
// 4. free the URL again
export function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Today's date as YYYY-MM-DD, for file names.
const today = () => new Date().toISOString().slice(0, 10)

// One row per pull. Opens in Excel, Google Sheets, etc.
export function exportCsv(history) {
  const rows = [["pull", "pack", "card", "rarity", "brilliant", "pity"]]
  history.pullLog.forEach((entry, i) => {
    const pull = history.pullLogStart + i
    const { card, rarity, brilliant, pity } = decodePull(entry)
    rows.push([pull, Math.ceil(pull / PACK_SIZE), card, rarity, brilliant ? "yes" : "no", pity.join(" + ")])
  })
  // "\uFEFF" at the start tells Excel the file is UTF-8, so Ñ shows correctly.
  const csv = "\uFEFF" + rows.map((row) => row.join(",")).join("\r\n")
  downloadFile(`rng-pulls-${today()}.csv`, csv, "text/csv;charset=utf-8")
}

// Everything: stats, pity counters, Ñ log, recent packs and the full pull log.
// Useful as a backup or to analyse in code.
export function exportJson(history) {
  const data = { exportedAt: new Date().toISOString(), ...history }
  downloadFile(`rng-history-${today()}.json`, JSON.stringify(data, null, 2), "application/json")
}
