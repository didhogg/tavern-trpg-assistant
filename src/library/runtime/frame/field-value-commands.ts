// P5.5 C10 下拉 / 建议值的显示名：在作者的对照表（Parser 上「代号 → 显示名」的表，例 Parser.SP_TIME_TO_FULL：action → 动作）
// 里找一张「这组值全都是它的键」的表，用它的值显示。几张都对得上时，取写了中文的那张（中文版小窗里），再取最小的（最贴切）。
// 一张都对不上就不给（界面显示原值）。不手写对照表。
import { A, init } from './author'

const HAN = /[㐀-鿿]/

let maps: Array<{ name: string; map: Record<string, string> }> | null = null
function authorMaps(): Array<{ name: string; map: Record<string, string> }> {
  if (maps) return maps
  maps = []
  for (const [name, v] of Object.entries(A.Parser as Record<string, unknown>)) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue
    const entries = Object.entries(v as Record<string, unknown>)
    if (entries.length < 2 || !entries.every(([, x]) => typeof x === 'string')) continue
    maps.push({ name, map: v as Record<string, string> })
  }
  return maps
}

/** 每组值给一张「值 → 显示名」（对不上的组给 null）。 */
export async function valueLabels(lists: string[][]): Promise<Array<Record<string, string> | null>> {
  await init()
  const all = authorMaps()
  return lists.map((values) => {
    if (!values.length) return null
    const hits = all.filter(({ map }) => values.every((v) => v in map))
    if (!hits.length) return null
    hits.sort((a, b) => Number(Object.values(b.map).some((x) => HAN.test(x))) - Number(Object.values(a.map).some((x) => HAN.test(x))) || Object.keys(a.map).length - Object.keys(b.map).length)
    const best = hits[0].map
    return Object.fromEntries(values.map((v) => [v, best[v]]))
  })
}
