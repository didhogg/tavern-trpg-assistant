// P5.5 第 5 步：字段中文名表。只从作者中文版和作者中文术语资料自动取，不手写翻译。
//   1. 作者中文版自制编辑器（makebrew）：类别专用的字段标签，优先级最高。
//   4. 作者中文站列表页的表头（例 adventures.html 的 data-sort="storyline">故事情节）：按作者 utils.js 登记的「页面 → 类别」对到字段，只补前面都没有中文名的。
//   2. 作者中文界面词表（locale-data.js）：中英同键的普通词。
//   3. 作者中文站大译名表：过滤专名类别和待讨论项，给普通字段补名。
// 输出 vendor/brew-schema/field-labels.js。嵌套字段按“类别 + 路径”保存，避免顶层 name 的叫法污染 action[].name。
// 作者没有的字段不在这里；另由翻译补在 src/library/field-labels.json，都没有就显示英文原名。
// 作者中文版换版本后重跑：npm run gen:field-labels
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const cn = join(root, 'vendor/cn/js')
const fields = (await import(join(root, 'vendor/brew-schema/fields.js'))).default

const termsDefault = '/Users/xxx/tavern-trpg-data-next/_upstream/cn/docs/terms-20261015-105551.json'
const termsArg = process.argv.find((arg) => arg.startsWith('--terms='))?.slice('--terms='.length)
const termsPath = termsArg || process.env.TAVERN_TERMS_FILE || termsDefault

// 结构定义里出现过的全部字段名（顶层 + 往下拆出来的），界面词表只收对得上的。
const known = new Set()
const walk = (s) => {
  if (!s || typeof s !== 'object') return
  for (const p of s.props ?? []) { known.add(p.name); walk(p.shape) }
  walk(s.of)
  for (const b of s.branches ?? []) walk(b.shape)
}
for (const f of Object.values(fields.props)) for (const x of f.fields) { known.add(x.name); walk(x.shape) }
for (const d of Object.values(fields.defs ?? {})) walk(d)

const resolveShape = (s) => {
  let x = s
  const seen = new Set()
  while (x && typeof x === 'object' && 'ref' in x && !seen.has(x.ref)) {
    seen.add(x.ref)
    x = fields.defs?.[x.ref]
  }
  return x && typeof x === 'object' && !('ref' in x) ? x : null
}

const pathsOf = (prop) => {
  const out = new Set()
  const visit = (shape, path, depth = 0) => {
    if (!shape || depth > 12) return
    const s = resolveShape(shape)
    if (!s) return
    if (s.c === 'group') for (const p of s.props ?? []) {
      const next = `${path}.${p.name}`
      out.add(next)
      visit(p.shape, next, depth + 1)
    }
    else if (s.c === 'list') visit(s.of, `${path}[]`, depth + 1)
    else if (s.c === 'map') visit(s.of, `${path}{}`, depth + 1)
    else if (s.c === 'pick') for (const b of s.branches ?? []) visit(b.shape, path, depth + 1)
  }
  for (const f of fields.props?.[prop]?.fields ?? []) { out.add(f.name); visit(f.shape, f.name) }
  return out
}

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
const callText = (src, open) => { let d = 0; let i = open; for (; i < src.length; i++) { if (src[i] === '(') d++; else if (src[i] === ')' && --d === 0) break } return src.slice(open, i + 1) }

// 先读作者自制编辑器的类别专用标签。
const byProp = {}
const dir = join(cn, 'makebrew')
for (const file of (await readdir(dir)).filter((f) => /^makebrew-.+\.js$/.test(f))) {
  const src = await readFile(join(dir, file), 'utf8')
  const cls = src.match(/extends BuilderBase\s*{[\s\S]*?prop:\s*"(\w+)"/)
  if (!cls) continue
  const labels = {}
  const put = (field, label) => { if (field && label && !(field in labels)) labels[field] = unescape(label) }
  for (const m of src.matchAll(/getStateIpt\w*\(\s*"([^"]+)"/g)) put(callText(src, m.index + m[0].indexOf('(')).match(/"(\w+)"\s*,?\s*\)$/)?.[1], m[1])
  for (const m of src.matchAll(/getLabelledRowTuple\(\s*"([^"]+)"/g)) put(src.slice(m.index, m.index + 1500).match(/this\._state\.(\w+)/)?.[1], m[1])
  for (const m of src.matchAll(/\{\s*name:\s*"([^"]+)"[^{}]*?prop:\s*"(\w+)"/g)) put(m[2], m[1])
  byProp[cls[1]] = labels
}

// 作者中文站列表页的表头：页面 → 类别照作者 utils.js（PAGE_TO_PROPS、书 / 冒险的 _PAGE_TO_PROPS_CORPUS），表头的 data-sort 是字段名。
// 只收这一类结构定义里真有的字段（translator 这种只是页面上的列，不收）；作者编辑器已经给了中文名的不动。
const siteRoot = join(termsPath, '../..')
const pageHeaders = {}
try {
  const utils = await readFile(join(cn, 'utils.js'), 'utf8')
  const pageFile = Object.fromEntries([...utils.matchAll(/static (PG_\w+) = "([\w-]+\.html)"/g)].map((m) => [m[1], m[2]]))
  const propsOfPage = {}
  for (const m of utils.matchAll(/UrlUtil\.PAGE_TO_PROPS\[UrlUtil\.(PG_\w+)\] = \[([^\]]*)\]/g)) propsOfPage[m[1]] = [...m[2].matchAll(/"(\w+)"/g)].map((x) => x[1])
  for (const m of utils.matchAll(/UrlUtil\._PAGE_TO_PROPS_CORPUS\[UrlUtil\.(PG_\w+)\] = \{propHead: "(\w+)"/g)) propsOfPage[m[1]] = [...(propsOfPage[m[1]] ?? []), m[2]]
  // 书目 / 冒险列表页登记成阅读页的同一份（UrlUtil._PAGE_TO_PROPS_CORPUS[PG_BOOKS] = …[PG_BOOK]）
  for (const m of utils.matchAll(/UrlUtil\._PAGE_TO_PROPS_CORPUS\[UrlUtil\.(PG_\w+)\] = UrlUtil\._PAGE_TO_PROPS_CORPUS\[UrlUtil\.(PG_\w+)\]/g)) if (propsOfPage[m[2]]) propsOfPage[m[1]] = [...(propsOfPage[m[1]] ?? []), ...propsOfPage[m[2]]]
  for (const [pg, props] of Object.entries(propsOfPage)) {
    if (!pageFile[pg]) continue
    let html
    try { html = await readFile(join(siteRoot, pageFile[pg]), 'utf8') } catch { continue }
    const heads = Object.fromEntries([...html.matchAll(/data-sort="(\w+)"[^>]*>([^<]+)</g)].map((m) => [m[1], unescape(m[2].trim())]).filter(([, v]) => /[\u3400-\u9fff]/.test(v)))
    for (const prop of props) {
      const own = new Set((fields.props?.[prop]?.fields ?? []).map((f) => f.name))
      const got = Object.fromEntries(Object.entries(heads).filter(([k]) => own.has(k)))
      if (Object.keys(got).length) pageHeaders[prop] = { ...(pageHeaders[prop] ?? {}), ...got }
    }
  }
} catch (error) {
  console.warn(`没有读取作者中文站列表页：${error instanceof Error ? error.message : String(error)}`)
}
function blockOf(src, locale) {
  const marker = `"${locale}": {`
  const start = src.indexOf(marker)
  if (start < 0) return ''
  let depth = 1
  let quote = false
  let escaped = false
  for (let i = start + marker.length; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') quote = false
      continue
    }
    if (c === '"') quote = true
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) return src.slice(start + marker.length, i)
  }
  return ''
}

function parseStringMap(src) {
  const out = {}
  for (const m of src.matchAll(/"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"/g)) {
    try { out[JSON.parse(`"${m[1]}"`)] = JSON.parse(`"${m[2]}"`) } catch { /* 单条坏转义不影响其余词 */ }
  }
  return out
}

const localeSrc = await readFile(join(cn, 'locale-data.js'), 'utf8')
const zhLocale = parseStringMap(blockOf(localeSrc, 'zh_CN'))
const enLocale = parseStringMap(blockOf(localeSrc, 'en-US'))
const localeTerms = []
for (const [key, en] of Object.entries(enLocale)) {
  const zh = zhLocale[key]
  if (!zh || !en || zh === en || !/^(common|page)\./.test(key)) continue
  localeTerms.push({ en, zh, source: `作者界面词表 ${key}` })
}

const TERM_CATEGORIES = new Set(['', 'variantrule', 'normal', 'other', 'bestiary', 'creature', 'language', 'itemMastery'])
const CATEGORY_RANK = new Map(['', 'normal', 'variantrule', 'bestiary', 'creature', 'language', 'itemMastery', 'other'].map((x, i) => [x, i]))
const termCandidates = new Map()
let termsVersion = '未加载'
try {
  const raw = JSON.parse(await readFile(termsPath, 'utf8'))
  const fileName = termsPath.split('/').at(-1) ?? termsPath
  termsVersion = raw.version ? `${fileName}@${raw.version}` : fileName
  for (const item of raw.items ?? []) {
    if (item.to_be_discussed || !TERM_CATEGORIES.has(item.category ?? '') || !item.en || !item.cn) continue
    const key = String(item.en).trim().toLowerCase()
    const list = termCandidates.get(key) ?? []
    list.push({ en: item.en, zh: item.cn, category: item.category ?? '', source: `大译名表 ${item.category || '常规'}` })
    termCandidates.set(key, list)
  }
} catch (error) {
  console.warn(`没有读取作者大译名表 ${termsPath}：${error instanceof Error ? error.message : String(error)}`)
}

const phrase = (value) => String(value).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
const localeCandidates = localeTerms.map((x) => ({ ...x, key: phrase(x.en) }))
const choose = (items) => {
  if (!items.length) return null
  const bestRank = Math.min(...items.map((x) => CATEGORY_RANK.get(x.category ?? '') ?? 99))
  const best = items.filter((x) => (CATEGORY_RANK.get(x.category ?? '') ?? 99) === bestRank)
  const values = [...new Set(best.map((x) => x.zh))]
  return { label: values.length === 1 ? values[0] : null, candidates: best }
}
const lookup = (wording) => {
  const key = phrase(wording)
  if (!key) return null
  const locale = choose(localeCandidates.filter((x) => x.key === key))
  if (locale?.label) return { ...locale, source: locale.candidates[0].source }
  const terms = choose(termCandidates.get(key) ?? [])
  if (terms?.label) return { ...terms, source: terms.candidates[0].source }
  return null
}
const variants = (wording) => {
  const base = phrase(wording)
  if (!base) return []
  const words = base.split(' ')
  const last = words.at(-1)
  const out = [base]
  if (last?.endsWith('ies')) out.push([...words.slice(0, -1), `${last.slice(0, -3)}y`].join(' '))
  if (last?.endsWith('es')) out.push([...words.slice(0, -1), last.slice(0, -2)].join(' '))
  if (last?.endsWith('s')) out.push([...words.slice(0, -1), last.slice(0, -1)].join(' '))
  else out.push(`${base}s`)
  return [...new Set(out)]
}
const autoLabel = (name) => {
  // 作者结构里的三字母缩写（ac / hp / cha / uid …）不能拿大译名表里同名专词硬换，
  // 否则会把 cha 误换成“叉”这类条目名称。它们留英文，后续只在有明确上下文时由作者转换入口处理。
  if (/^[a-z]{1,3}$/.test(String(name))) return null
  for (const [i, v] of variants(name).entries()) {
    // 单词字段只接受精确说法；“formula”→“formulas”这类同义但上下文不同的专名不自动套。
    if (i > 0 && !v.includes(' ')) continue
    const direct = lookup(v)
    if (direct?.label) return direct
    if (v.includes(' ') && v === phrase(name)) {
      // 多词字段允许作者术语表的单复数变体；单词字段不做“猜一个复数”。
      const words = v.split(' ')
      const pieces = words.map((word) => lookup(word)?.label)
      if (pieces.every(Boolean)) return { label: pieces.join(''), source: '术语表逐词拼' }
    }
  }
  return null
}

// 顶层字段优先保留作者自制编辑器按类别给的叫法；没有时才从作者中英词表 / 大译名表自动补。
for (const [prop, table] of Object.entries(fields.props ?? {})) {
  const labels = byProp[prop] ?? (byProp[prop] = {})
  for (const f of table.fields ?? []) {
    // 作者某些编辑器标签仍是英文（例如 monster.skill = Skills），这不算中文标签，继续走作者中文词表。
    if (labels[f.name] && /[\u3400-\u9fff]/.test(labels[f.name])) continue
    if (labels[f.name] && /^[A-Z][A-Z0-9 /+-]*$/.test(labels[f.name])) continue
    const got = autoLabel(f.name)
    if (got?.label) labels[f.name] = got.label
  }
}

// 至少两个编辑器都有、而且一样的标签放进共用；不一致的只留各自类别。
const shared = {}
const seen = new Map()
for (const labels of Object.values(byProp)) for (const [k, v] of Object.entries(labels)) {
  const s = seen.get(k)
  seen.set(k, s ? { v: s.v === v ? v : null, n: s.n + 1 } : { v, n: 1 })
}
for (const [k, s] of seen) if (s.v && s.n > 1) shared[k] = s.v

// 列表页表头只补还没有中文名的字段，放在算共用之后：表头是那一页那一列的叫法（例 group 在书目页叫「类型」），不能变成所有类别共用。
// 同一张表单里已经有别的字段叫这个名字的不补（规则变体页把 ruleType 也叫「类型」，和 type 重名）。
for (const [prop, heads] of Object.entries(pageHeaders)) {
  const labels = byProp[prop] ?? (byProp[prop] = {})
  const own = (fields.props?.[prop]?.fields ?? []).map((f) => f.name)
  const used = new Set(own.map((f) => labels[f] ?? shared[f]).filter(Boolean))
  for (const [k, v] of Object.entries(heads)) if ((!labels[k] || !/[\u3400-\u9fff]/.test(labels[k])) && !used.has(v)) { labels[k] = v; used.add(v) }
}

// 嵌套字段按“类别 + 路径”保存。这里不复用顶层编辑器的专名，避免 name / type 等误套到所有层级。
const byPath = {}
for (const prop of Object.keys(fields.props ?? {})) {
  const nested = {}
  for (const path of pathsOf(prop)) {
    if (!path.includes('.') && !path.includes('[') && !path.includes('{')) continue
    const name = path.match(/([^.[{\]}]+)(?:\[\]|\{\})?$/)?.[1] ?? path
    const got = autoLabel(name)
    if (got?.label) nested[path] = got.label
  }
  if (Object.keys(nested).length) byPath[prop] = nested
}

const review = { conflicts: [], wordBuilt: [] }
for (const [key, candidates] of termCandidates) {
  const best = choose(candidates)
  if (best && !best.label) review.conflicts.push({ en: key, candidates: best.candidates.map((x) => ({ cn: x.zh, category: x.category })) })
}
for (const [prop, paths] of Object.entries(byPath)) for (const [path, label] of Object.entries(paths)) {
  const name = path.match(/([^.[{\]}]+)(?:\[\]|\{\})?$/)?.[1] ?? path
  if (autoLabel(name)?.source === '术语表逐词拼') review.wordBuilt.push({ prop, path, label })
}
// 同一类别里两个不同字段被自动叫成同一个中文名时列出来，不能默默替驾驶员做语义决定。
for (const [prop, labels] of Object.entries(byProp)) {
  const byLabel = new Map()
  for (const [field, label] of Object.entries(labels)) {
    const list = byLabel.get(label) ?? []
    list.push(field)
    byLabel.set(label, list)
  }
  for (const [label, fieldsForLabel] of byLabel) {
    const distinct = [...new Set(fieldsForLabel)]
    if (distinct.length > 1) review.conflicts.push({ kind: 'label', prop, label, fields: distinct })
  }
}

const out = {
  generatedFrom: `作者中文版 vendor/cn（makebrew + locale-data）+ 作者中文站列表页表头 + 大译名表 ${termsVersion}`,
  byProp,
  shared,
  byPath,
  review,
}
await writeFile(join(root, 'vendor/brew-schema/field-labels.js'), `// 自动生成，不要手改。由 tools/build-field-labels.mjs 从作者中文版（vendor/cn）生成。\nexport default ${JSON.stringify(out)}\n`)
const n = Object.values(byProp).reduce((a, l) => a + Object.keys(l).length, 0)
const p = Object.values(byPath).reduce((a, l) => a + Object.keys(l).length, 0)
console.log(`字段中文名：${Object.keys(byProp).join('、')} 共 ${n} 个；共用 ${Object.keys(shared).length} 个；按位置 ${p} 个；冲突 ${review.conflicts.length} 个（结构定义里的字段名共 ${known.size} 个）→ vendor/brew-schema/field-labels.js`)
