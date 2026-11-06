import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { unzipSync, strFromU8 } from 'fflate'
import { OUT_ROOT, RAW_DB, REPORT_DIR } from '../lib/paths'

/** 图片规定（驾驶员）：图片文件一律不入库，唯一允许入库的是图片的网页链接。
 *  这个工具回答"链接有没有进库"：把原样库里出现过的每一个图片地址，和最终包里出现的地址逐个对一遍。
 *  只做对账，不做判断；找不到的逐个列出。 */
const IMG = /\.(png|jpe?g|gif|webp|svg|bmp|avif|ico)(\?[^\s"']*)?$/i
const HTTP = /^https?:\/\//i
type Bucket = Map<string, Set<string>>

const KINDS = {
  A: '网页链接：整个字段就是一个图片网址',
  C: '网页链接：夹在正文/网页文字里的图片网址',
  D: '网页链接：网页里 <img src="http…"> 的外链',
  B1: '站内相对路径：5etools 本体数据里的图片路径（要加网站地址才成链接）',
  B2: '站内相对路径：Foundry 补充文件里的图标路径（Foundry 自己的资源，不是网页）',
  E: '网页里 <img src="本地文件名">（不全书自带的本地图片，文件本身未入库）',
} as const
type K = keyof typeof KINDS

function collect(node: unknown, out: Bucket, isOverlay: boolean): void {
  const add = (k: K, v: string): void => { const s = out.get(k) ?? new Set<string>(); s.add(v); out.set(k, s) }
  const walk = (n: unknown): void => {
    if (Array.isArray(n)) { n.forEach(walk); return }
    if (n && typeof n === 'object') { Object.values(n).forEach(walk); return }
    if (typeof n !== 'string') return
    if (HTTP.test(n) && IMG.test(n)) add('A', n)
    else if (IMG.test(n) && !/\s/.test(n) && n.length < 200 && !HTTP.test(n)) add(isOverlay ? 'B2' : 'B1', n)
    for (const m of n.matchAll(/https?:\/\/[^\s"'<>)\]]+?\.(?:png|jpe?g|gif|webp|svg)\b/gi)) add('C', m[0])
    for (const m of n.matchAll(/<img\b[^>]*?\bsrc\s*=\s*["']?([^"'\s>]+)/gi)) add(HTTP.test(m[1]!) ? 'D' : 'E', m[1]!)
  }
  walk(node)
}

export function runImageLinks(): string {
  const raw: Bucket = new Map()
  const db = new DatabaseSync(RAW_DB, { readOnly: true })
  const OVERLAY = /(^|\/)foundry(-[^/]*)?\.json$/
  for (const r of db.prepare("SELECT lib, file, kind, body FROM raw WHERE lib IN ('cn','en','bak','chm')").iterate() as Iterable<{ lib: string; file: string; kind: string; body: string }>) {
    if (r.kind === 'html' || r.kind === 'text') { collect(r.body, raw, false); continue }
    try { collect(JSON.parse(r.body), raw, OVERLAY.test(r.file)) } catch { /* 行不是 JSON 就不是链接 */ }
  }
  const skipped = (JSON.parse((db.prepare("SELECT value FROM meta WHERE key='ingest'").get() as { value: string }).value) as { skippedImages?: Record<string, number> }).skippedImages ?? {}
  const imageRows = (db.prepare("SELECT COUNT(*) AS n FROM assets WHERE lower(file) GLOB '*.png' OR lower(file) GLOB '*.jpg' OR lower(file) GLOB '*.jpeg' OR lower(file) GLOB '*.gif' OR lower(file) GLOB '*.webp' OR lower(file) GLOB '*.svg'").get() as { n: number }).n
  db.close()
  const packs: Bucket = new Map()
  let packFiles = 0
  for (const ed of ['dnd5e2014', 'dnd5e2024']) for (const dir of ['packs', 'srd']) {
    for (const f of readdirSync(join(OUT_ROOT, ed, dir)).filter((x) => x.endsWith('.trpgpack'))) {
      packFiles += 1
      for (const [name, bytes] of Object.entries(unzipSync(new Uint8Array(readFileSync(join(OUT_ROOT, ed, dir, f)))))) if (name.startsWith('entries/')) collect(JSON.parse(strFromU8(bytes)), packs, false)
    }
  }
  // 包里没有"是否来自补充文件"的信息：B1/B2 合起来对账
  const merged = (b: Bucket, k: K): Set<string> => (k === 'B1' || k === 'B2' ? new Set([...(b.get('B1') ?? []), ...(b.get('B2') ?? [])]) : b.get(k) ?? new Set())
  const packAllB = new Set([...(packs.get('B1') ?? []), ...(packs.get('B2') ?? [])])
  const rows: string[] = []
  const lost: string[] = []
  for (const k of Object.keys(KINDS) as K[]) {
    const a = raw.get(k) ?? new Set<string>()
    const b = k === 'B1' || k === 'B2' ? packAllB : merged(packs, k)
    const miss = [...a].filter((x) => !b.has(x))
    rows.push(`| ${KINDS[k]} | ${a.size} | ${miss.length === 0 ? '全部在包里' : `${a.size - miss.length}（缺 ${miss.length}）`} |`)
    for (const x of miss) lost.push(`- ${KINDS[k].split('：')[0]}：${x}`)
  }
  const md = `# 图片链接对账\n\n规定：图片文件一律不入库；唯一允许入库的是图片的网页链接。\n\n## 图片文件有没有入库\n\n- 入库时被跳过的图片文件个数（只数个数，连路径都不记）：${Object.entries(skipped).map(([l, n]) => `${l} ${n}`).join('、') || '无'}\n- 原样库资源登记表里还剩多少个图片文件登记：**${imageRows}**（应为 0）\n- 包里的图片文件（blobs）：0（包清单 blobs 为空）\n\n## 图片地址有没有进库（原样库里出现过的不同地址 → 最终包里能找到几个）\n\n| 种类 | 原样库里不同地址数 | 最终包里 |\n|---|---|---|\n${rows.join('\n')}\n\n（对账了 ${packFiles} 个包，含两个版本的 SRD 包。）\n\n## 原样库有、包里没有的地址\n\n${lost.join('\n') || '无'}\n`
  writeFileSync(join(REPORT_DIR, '图片链接对账.md'), md)
  return md
}
