import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BOOK_SOURCES } from '../config/books'
import { TERMS_EXTRA } from '../config/termsExtra'
import { DATA_5ETOOLS } from '../extract/load'
import { REPO_ROOT } from '../lib/io'

export interface TermDict {
  /** 英文（小写）→ 中文 */
  map: Map<string, string>
  /** 一个英文对应多个中文：不进词典，列入报告 */
  ambiguous: Map<string, string[]>
  /** 机制类术语（parser.js 对照表与手写补充）：这些才允许直接替换；数据里的译名配对只用来判断「前文是否已是同义中文」 */
  mechanical: Set<string>
  stats: { parser: number; data: number; extra: number }
}

const PARSER_JS = join(REPO_ROOT, 'reference', '5etools-cn-main（数据库）', 'js', 'parser.js')
const LATIN = /^[A-Za-z][A-Za-z' -]*$/
const HAN = /[㐀-鿿]/
/** 中文译名必须是干净的中文：不含拉丁字母、标签记号（{ } | @ < >）或空白。 */
const CLEAN_ZH = /^[^A-Za-z{}|@<>\s]+$/
const usable = (en: string, zh: string): boolean => LATIN.test(en) && HAN.test(zh) && CLEAN_ZH.test(zh)

/** 读 `Parser.<NAME> = { "k": "v", … }`：名称以 _TO_CN（键=英文）或 _TO_EN（键=中文）结尾的对象。只读文本，不执行脚本。 */
/** 机制类词汇所在的对照表：伤害类型、属性、技能、状态。其余对照表（语言、职业、怪物标签、武器属性…）里的英文词一词多义，只用来判断前文是否已是同义中文。 */
export const MECHANICAL_MAPS = new Set(['DMG_TYPE_TO_EN', 'ATB_FULL_TO_CN', 'SKILL_TO_CN', 'CONTITION_TO_EN'])

export function parserPairs(source: string): Array<[string, string, string]> {
  const out: Array<[string, string, string]> = []
  for (const match of source.matchAll(/Parser\.([A-Z0-9_]+)\s*=\s*\{([\s\S]*?)\n\}/g)) {
    const name = match[1]
    const toCn = name.endsWith('_TO_CN')
    const toEn = name.endsWith('_TO_EN')
    if (!toCn && !toEn) continue
    for (const line of match[2].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)) {
      const [en, zh] = toCn ? [line[1], line[2]] : [line[2], line[1]]
      if (usable(en, zh)) out.push([en.toLowerCase(), zh, name])
    }
  }
  return out
}

function dataPairs(): Array<[string, string]> {
  const out: Array<[string, string]> = []
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) { for (const item of value) walk(item); return }
    if (!value || typeof value !== 'object') return
    const rec = value as Record<string, unknown>
    const en = rec.ENG_name, zh = rec.name
    if (typeof en === 'string' && typeof zh === 'string' && usable(en, zh) && (typeof rec.source !== 'string' || BOOK_SOURCES.has(rec.source))) out.push([en.toLowerCase(), zh])
    for (const child of Object.values(rec)) walk(child)
  }
  for (const entry of readdirSync(DATA_5ETOOLS, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue
    const dir = entry.parentPath.slice(DATA_5ETOOLS.length)
    if (/adventure|generated|book/.test(dir)) continue
    walk(JSON.parse(readFileSync(join(entry.parentPath, entry.name), 'utf8')))
  }
  return out
}

let cached: TermDict | undefined

/** 词典优先级：手写补充 > parser.js 对照表 > 数据里的 ENG_name↔name 配对；同一层里一个英文对应多个中文则视为歧义，不收。 */
export function loadTerms(): TermDict {
  if (cached) return cached
  const tiers: Array<Map<string, Set<string>>> = [new Map(), new Map()]
  const add = (tier: Map<string, Set<string>>, en: string, zh: string): void => { const set = tier.get(en) ?? new Set<string>(); set.add(zh); tier.set(en, set) }
  const parser = parserPairs(readFileSync(PARSER_JS, 'utf8'))
  for (const [en, zh] of dataPairs()) add(tiers[0], en, zh)
  const mech = new Set<string>()
  for (const [en, zh, name] of parser) { add(tiers[1], en, zh); if (MECHANICAL_MAPS.has(name)) mech.add(`${en}|${zh}`) }
  const map = new Map<string, string>()
  const ambiguous = new Map<string, string[]>()
  const mechanical = new Set<string>()
  for (const tier of tiers) {
    for (const [en, set] of tier) {
      if (set.size === 1) { map.set(en, [...set][0]); ambiguous.delete(en) } else if (!map.has(en)) ambiguous.set(en, [...set])
    }
  }
  for (const [en, set] of tiers[1]) if (set.size === 1 && map.get(en) === [...set][0] && mech.has(`${en}|${[...set][0]}`)) mechanical.add(en)
  for (const [en, { zh }] of TERMS_EXTRA) { map.set(en, zh); ambiguous.delete(en); mechanical.add(en) }
  cached = { map, ambiguous, mechanical, stats: { parser: parser.length, data: tiers[0].size, extra: TERMS_EXTRA.size } }
  return cached
}
