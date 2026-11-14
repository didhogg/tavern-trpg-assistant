// 作者中文站「大译名表」的读取与查词（glossary.mjs、brew-terms.mjs、check-translation.mjs 共用）。
// 表是作者的（terms-<日期>.json：{ version, count, items: [{ en, cn, category, source, note, to_be_discussed, … }] }），这里只读不改。
// 和字段名翻译（tools/build-field-labels.mjs）的区别：那边为了不把 Fly 译成「飞行术」要排除法术、种族等专名类；
// 翻条目内容时专名正是要查的，所以这里**不过滤任何分类**，每个候选都带分类标记，选哪个由翻译的人按上下文定。
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { termsPath } from './paths.mjs'

const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ')

export async function loadGlossary(path = termsPath) {
  if (!existsSync(path)) throw new Error(`找不到术语表文件：${path}\n（作者中文站大译名表，15 MB 不进仓库；用环境变量 TAVERN_TERMS_FILE 或 --terms= 指定）`)
  const raw = JSON.parse(await readFile(path, 'utf8'))
  if (!Array.isArray(raw.items)) throw new Error(`术语表格式不对（没有 items 数组）：${path}`)
  const byEn = new Map()
  for (const item of raw.items) {
    if (typeof item.en !== 'string' || typeof item.cn !== 'string') continue
    const key = norm(item.en)
    if (!byEn.has(key)) byEn.set(key, [])
    byEn.get(key).push(item)
  }
  const file = path.split('/').pop()
  return { byEn, file, version: raw.version, count: raw.count, generatedAt: raw.max_modified_at }
}

/** 整句匹配 + 单复数变体（+s / 去 s / +es / 去 es，P5.5 文档 §4.1）。精确匹配在前。 */
function variantsOf(key) {
  const out = []
  const add = (v) => { if (v && v !== key && !out.includes(v)) out.push(v) }
  add(`${key}s`)
  if (key.endsWith('s')) add(key.slice(0, -1))
  add(`${key}es`)
  if (key.endsWith('es')) add(key.slice(0, -2))
  return out
}

const toCandidate = (item, match) => ({
  cn: item.cn,
  category: item.category || '',
  source: item.source || '',
  status: item.to_be_discussed ? '待讨论' : '已确定',
  note: item.note || '',
  matchedEn: item.en,
  match,
})

/**
 * 查一个英文说法。返回 { en, candidates, conflict }：
 *   candidates  先精确、后单复数变体；每个带分类、来源、是否待讨论
 *   conflict    精确匹配里有几个不同的中文（同一英文多种译法，要按上下文选）
 * category：只要这一类（例 spell）；没有这一类的候选时返回空，不回退到别的类。
 */
export function lookup(glossary, en, { category } = {}) {
  const key = norm(en)
  const exact = (glossary.byEn.get(key) ?? []).map((i) => toCandidate(i, '精确'))
  const variant = variantsOf(key).flatMap((v) => (glossary.byEn.get(v) ?? []).map((i) => toCandidate(i, '单复数变体')))
  let candidates = [...exact, ...variant]
  if (category) candidates = candidates.filter((c) => c.category === category)
  const distinct = new Set(candidates.filter((c) => c.match === '精确').map((c) => c.cn))
  return { en, candidates, conflict: distinct.size > 1 }
}
