// P5.5 阶段 C：字段中文名表。只从作者中文版（vendor/cn）自动取，不手写翻译：
//   1. 作者中文版自制编辑器（js/makebrew/makebrew-*.js，法术 / 怪物 / 传奇组）：
//      控件函数 getStateIpt…("中文标签", …, "字段名")；带标签的一行 getLabelledRowTuple("中文标签") 后面第一个 this._state.字段名；
//      { name: "中文标签", …, prop: "字段名" }。编辑器自己的类别 = 类定义后第一个 prop: "…"。
//   2. 作者中文界面词表（js/locale-data.js）里 common.xxx_yyy，换成 xxxYyy 后正好是某个字段名的。
// 输出 vendor/brew-schema/field-labels.js：byProp（有编辑器的类别各自的标签）+ shared（各编辑器都一致的标签 + 界面词表）。
// 作者没有的字段不在这里；另由翻译补在 src/library/field-labels.json（后端合并：作者的优先），都没有就显示英文原名。
// 作者中文版换版本后重跑：npm run gen:field-labels
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const cn = join(root, 'vendor/cn/js')
const fields = (await import(join(root, 'vendor/brew-schema/fields.js'))).default

// 结构定义里出现过的全部字段名（顶层 + 往下拆出来的），界面词表只收对得上的
const known = new Set()
const walk = (s) => {
  if (!s || typeof s !== 'object') return
  for (const p of s.props ?? []) { known.add(p.name); walk(p.shape) }
  walk(s.of)
  for (const b of s.branches ?? []) walk(b.shape)
}
for (const f of Object.values(fields.props)) for (const x of f.fields) { known.add(x.name); walk(x.shape) }
for (const d of Object.values(fields.defs ?? {})) walk(d)

const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
const callText = (src, open) => { let d = 0; let i = open; for (; i < src.length; i++) { if (src[i] === '(') d++; else if (src[i] === ')' && --d === 0) break } return src.slice(open, i + 1) }

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

// 至少两个编辑器都有、而且一样的标签（例：中文名、页码）放进共用；只有一个编辑器有的（例：time 在法术里是「施法时间」）不外推；不一致的（例：level 法术是「环节」、怪物是「等级」）只留各自的
const shared = {}
const seen = new Map()
for (const labels of Object.values(byProp)) for (const [k, v] of Object.entries(labels)) { const s = seen.get(k); seen.set(k, s ? { v: s.v === v ? v : null, n: s.n + 1 } : { v, n: 1 }) }
for (const [k, s] of seen) if (s.v && s.n > 1) shared[k] = s.v
const locale = await readFile(join(cn, 'locale-data.js'), 'utf8')
for (const m of locale.matchAll(/"common\.([a-z_]+)":\s*"([^"]+)"/g)) {
  const name = m[1].replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  if (known.has(name) && !(name in shared)) shared[name] = m[2]
}

const out = { generatedFrom: '作者中文版 vendor/cn（makebrew 编辑器 + locale-data 界面词表）', byProp, shared }
await writeFile(join(root, 'vendor/brew-schema/field-labels.js'), `// 自动生成，不要手改。由 tools/build-field-labels.mjs 从作者中文版（vendor/cn）生成。\nexport default ${JSON.stringify(out)}\n`)
const n = Object.values(byProp).reduce((a, l) => a + Object.keys(l).length, 0)
console.log(`字段中文名：有编辑器的 ${Object.keys(byProp).join('、')} 共 ${n} 个；共用 ${Object.keys(shared).length} 个（结构定义里的字段名共 ${known.size} 个）→ vendor/brew-schema/field-labels.js`)
