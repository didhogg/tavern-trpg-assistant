// 从一份英文自制包里抽出“要定译名的词”，逐个查作者大译名表，生成术语单。给翻译的人（AI）当依据，不替他翻译、不替他选。
// 抽两种：① 条目名（所有 name / shortName，含嵌套的特性名、动作名；_meta.sources[].full；_copy 里引用的现成条目名不抽）
//         ② 文字里 {@标签 名字|来源|…} 引用的名字（只取作者 render.js 里属于“条目引用”的标签，见 author-tags.mjs）
// 这不是“翻译范围”：哪些值要翻，作者用翻译器的分析程序（/data/5e-translator，本机没有）判断；骰子、ID、来源码、键名一律不翻。
// 用法：node brew-terms.mjs <英文包.json> [--out=术语单.json] [--terms=术语表.json]
// 术语单里每项有 chosen: null，翻译的人选定后填上中文、写 reason；check-translation.mjs 之后按它核对译文。
import { readFile, writeFile } from 'node:fs/promises'
import { referenceTags } from './author-tags.mjs'
import { loadGlossary, lookup } from './glossary-lib.mjs'

const args = process.argv.slice(2)
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3)
const file = args.find((a) => !a.startsWith('--'))
if (!file) { console.error('用法：node brew-terms.mjs <英文包.json> [--out=术语单.json] [--terms=术语表.json]'); process.exit(2) }

let data, glossary, ref
try {
  data = JSON.parse(await readFile(file, 'utf8'))
  glossary = await loadGlossary(opt('terms'))
  ref = await referenceTags()
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exit(2) }

const uses = new Map() // en → { uses: Map<key, {kind, tag, count, where[]}> }
function add(en, kind, tag, where, topProp) {
  const text = en.trim()
  if (!text) return
  if (!uses.has(text)) uses.set(text, new Map())
  const key = `${kind}|${tag ?? ''}|${topProp ?? ''}`
  const m = uses.get(text)
  if (!m.has(key)) m.set(key, { kind, tag: tag ?? null, topProp: topProp ?? null, count: 0, where: [] })
  const u = m.get(key)
  u.count++
  if (u.where.length < 3) u.where.push(where)
}

function walk(node, path, topProp) {
  if (typeof node === 'string') {
    for (const m of node.matchAll(/\{@(\w+) ([^{}]*)\}/g)) {
      if (ref.tags.has(m[1])) add(m[2].split('|')[0], '标签引用', m[1], path, topProp)
    }
  } else if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${path}/${i}`, topProp))
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === '_copy') continue // 引用的是现成条目，名字要保持原样
      if ((k === 'name' || k === 'shortName' || k === 'full') && typeof v === 'string') add(v, '条目名', null, `${path}/${k}`, topProp)
      else walk(v, `${path}/${k}`, topProp)
    }
  }
}
for (const [k, v] of Object.entries(data)) {
  if (k === '_meta') walk(v?.sources ?? [], '/_meta/sources', '_meta')
  else if (Array.isArray(v)) v.forEach((e, i) => walk(e, `/${k}/${i}`, k))
}

const hasCategory = (c) => glossary.byEn && [...glossary.byEn.values()].some((items) => items.some((i) => i.category === c))
const categoryKnown = new Map()
const known = (c) => { if (!categoryKnown.has(c)) categoryKnown.set(c, hasCategory(c)); return categoryKnown.get(c) }

const entries = [...uses.entries()].map(([en, m]) => {
  const useList = [...m.values()]
  const r = lookup(glossary, en)
  // 提示类别：标签名与术语表分类同名的（spell、creature、item…）；条目名按所在类别（race、feat…）。只是提示，不过滤
  const hints = new Set(useList.map((u) => u.tag ?? u.topProp).filter((c) => c && known(c)))
  const candidates = r.candidates.map((c) => ({ ...c, inHint: hints.has(c.category) }))
  const distinct = new Set(candidates.filter((c) => c.match === '精确').map((c) => c.cn))
  const status = !candidates.length ? '没查到' : distinct.size > 1 || (!distinct.size && new Set(candidates.map((c) => c.cn)).size > 1) ? '多个候选' : '候选唯一'
  return { en, status, uses: useList, hintCategories: [...hints], candidates, chosen: null, reason: null }
})
const order = { 多个候选: 0, 没查到: 1, 候选唯一: 2 }
entries.sort((a, b) => order[a.status] - order[b.status] || a.en.localeCompare(b.en))

// 第三方作品判断材料（作者 homebrew-workflow 的 Third-party IP terminology gate：至少看文件名和资源标题、_meta 来源信息、署名、有代表性的条目名）。
// 只摆材料，是否涉及别的作品由翻译的人判断（“只是类型相似”不算，认得出的作品名 / 角色 / 地点 / 生物 / 物品 / 引用的作品才算）。
const signals = {
  fileName: file.split('/').pop(),
  sources: (data._meta?.sources ?? []).map((s) => ({ json: s.json, full: s.full, authors: s.authors, convertedBy: s.convertedBy, url: s.url })),
  categories: Object.fromEntries(Object.entries(data).filter(([k, v]) => !k.startsWith('_') && !k.startsWith('$') && Array.isArray(v)).map(([k, v]) => [k, { count: v.length, sampleNames: v.map((e) => e?.name).filter((n) => typeof n === 'string').slice(0, 8) }])),
}
// ip：翻译的人填。involved 必须是 true / false；false 也要在 notes 里写一句依据；true 要有 evidence（每项带 URL 和依据类别）
const ip = { involved: null, ip: null, notes: '', evidence: [] }
const sheet = { source: file, terms: glossary.file, tagsFrom: ref.from, ipSignals: signals, ip, summary: Object.fromEntries(Object.keys(order).map((s) => [s, entries.filter((e) => e.status === s).length])), entries }
if (opt('out')) await writeFile(opt('out'), `${JSON.stringify(sheet, null, '\t')}\n`)

console.log(`英文包：${file}\n术语表：${glossary.file}；引用标签名单取自作者 render.js（${ref.tags.size} 种）\n共抽出 ${entries.length} 个词：${Object.entries(sheet.summary).map(([k, v]) => `${k} ${v}`).join('，')}\n`)
for (const status of Object.keys(order)) {
  const list = entries.filter((e) => e.status === status)
  if (!list.length) continue
  console.log(`## ${status}（${list.length}）${status === '没查到' ? '——原创名 / 术语表没有：按作者习惯自己译，并在 ENG_name 保留英文；不要假装查到过' : status === '多个候选' ? '——按上下文选，并记 reason' : ''}`)
  for (const e of list) {
    const where = e.uses.map((u) => `${u.kind}${u.tag ? ` @${u.tag}` : ''}${u.topProp ? `（${u.topProp}）` : ''}×${u.count}`).join('、')
    console.log(`- ${e.en}   ← ${where}`)
    // 同一个中文（同一种匹配）合并成一行；组内任一条记录的分类与所在类别相符就打 ★，相符的排前面
    const groups = new Map()
    for (const c of e.candidates) {
      const k = `${c.match}|${c.cn}`
      if (!groups.has(k)) groups.set(k, { ...c, cats: [], hint: false })
      const g = groups.get(k)
      const cat = c.category || '无分类'
      if (!g.cats.includes(cat)) g.cats.push(cat)
      if (c.inHint) g.hint = true
    }
    const rank = (g) => (g.match === '精确' ? 0 : 2) + (g.hint ? 0 : 1)
    for (const g of [...groups.values()].sort((a, b) => rank(a) - rank(b))) {
      console.log(`    ${g.match === '精确' ? '●' : '○'} ${g.cn}   [${g.cats.join('、')}]${g.hint ? ' ★与所在类别相符' : ''}${g.match === '精确' ? '' : `  ← 变体：${g.matchedEn}`}`)
    }
  }
  console.log('')
}
console.log(`## 第三方作品判断材料（作者要求翻译前先判断；详见 SKILL.md「第三方作品译名」）
- 文件名：${signals.fileName}
- 来源：${signals.sources.map((s) => `${s.json}｜${s.full ?? ''}｜作者 ${(s.authors ?? []).join('、')}${s.url ? `｜${s.url}` : ''}`).join('；') || '（无）'}
${Object.entries(signals.categories).map(([k, v]) => `- ${k}（${v.count}）：${v.sampleNames.join('、')}${v.count > v.sampleNames.length ? '…' : ''}`).join('\n')}
→ 判断后在术语单的 ip 栏填写：involved（true / false）、notes（依据）；涉及时还要 ip（作品名）和 evidence（译名 + 依据类别 + URL）\n`)
if (opt('out')) console.log(`术语单已写入 ${opt('out')}（每项 chosen: null，由翻译的人填）`)
