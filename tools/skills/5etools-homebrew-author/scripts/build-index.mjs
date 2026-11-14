// 生成 references/类别索引.json 和 类别索引.md：每个自制类别对应哪个作者结构定义文件、必填字段、作者 wiki 页、作者样例文件。
// 全部从作者的东西读，不手写任何名单：
//   类别 → 结构定义文件   vendor/brew-schema/schema/homebrew.json 里每个类别的 $ref（"races.json#/properties/race"）
//   必填字段             vendor/brew-schema/fields.js（tools/build-brew-fields.mjs 从同一份结构定义生成）
//   wiki 页 / 样例        作者 wiki 的 Homebrew__TableOfReference.txt 那张「类别—样例文件—结构定义」表；
//                        表里没有的类别（法术、怪物等）用作者自制仓库里 "Sample - Giddy; …" 样例文件含有的类别补上
// 用法：node build-index.mjs   （结构定义换版本、或本机作者副本更新后重跑）
import { existsSync } from 'node:fs'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { brewPool, fieldsPath, indexJson, schemaDir, skillDir, wikiDir } from './paths.mjs'

const readJson = async (p) => JSON.parse(await readFile(p, 'utf8'))
const root = await readJson(join(schemaDir, 'homebrew.json'))
const fields = (await import(pathToFileURL(fieldsPath).href)).default
const source = await readJson(join(schemaDir, '../SOURCE.json'))

// 作者 wiki 的对照表：Name (/en/Homebrew/TableOfReference/Name) | (示例文件网址) | (结构定义网址)
const tableText = existsSync(join(wikiDir, 'Homebrew__TableOfReference.txt')) ? await readFile(join(wikiDir, 'Homebrew__TableOfReference.txt'), 'utf8') : ''
const tableSample = new Map()
for (const m of tableText.matchAll(/^([A-Za-z_]+) \(\/en\/Homebrew\/TableOfReference\/[A-Za-z_]+\) \|\s+\(\S*?\/blob\/master\/([^)\s]+\.json)\)/gm)) {
  tableSample.set(m[1].toLowerCase(), decodeURIComponent(m[2]))
}
const wikiPages = existsSync(wikiDir) ? new Set(await readdir(wikiDir)) : new Set()

// 作者自制仓库里的 "Sample - Giddy; …" 样例文件含有哪些类别
const sampleByProp = new Map()
if (existsSync(brewPool)) {
  for (const dir of (await readdir(brewPool, { withFileTypes: true })).filter((d) => d.isDirectory() && !/^[_.]/.test(d.name) && d.name !== 'node_modules')) {
    for (const f of (await readdir(join(brewPool, dir.name))).filter((x) => x.startsWith('Sample') && x.endsWith('.json')).sort()) {
      const data = await readJson(join(brewPool, dir.name, f))
      for (const key of Object.keys(data)) if (!key.startsWith('_') && !key.startsWith('$') && !sampleByProp.has(key)) sampleByProp.set(key, `${dir.name}/${f}`)
    }
  }
  // 对照表指向的文件（职业、子职等）里附带的类别（classFeature、subclassFeature…）也算有样例；Sample 文件优先
  for (const rel of tableSample.values()) {
    if (!existsSync(join(brewPool, rel))) continue
    for (const key of Object.keys(await readJson(join(brewPool, rel)))) if (!key.startsWith('_') && !key.startsWith('$') && !sampleByProp.has(key)) sampleByProp.set(key, rel)
  }
}

const groupOf = (prop) => (/^(foundry|roll20)/.test(prop) ? '专用' : /Fluff$/.test(prop) ? '配套' : '主')
const props = {}
for (const [prop, node] of Object.entries(root.properties)) {
  if (prop.startsWith('_') || prop.startsWith('$') || prop === 'version') continue
  const ref = typeof node.$ref === 'string' ? node.$ref.split('#')[0] : null
  const table = fields.props[prop]
  const viaTable = tableSample.get(prop.toLowerCase())
  const wikiFile = `Homebrew__TableOfReference__${[...wikiPages].map((p) => /^Homebrew__TableOfReference__(.+)\.txt$/.exec(p)?.[1]).find((n) => n?.toLowerCase() === prop.toLowerCase()) ?? '\0'}.txt`
  const tableFile = viaTable && existsSync(join(brewPool, viaTable)) ? viaTable : null
  const sample = tableFile ?? sampleByProp.get(prop) ?? null
  props[prop] = {
    group: groupOf(prop),
    schemaFile: ref,
    required: (table?.fields ?? []).filter((f) => f.required).map((f) => f.name),
    requiredChoices: table?.requiredChoices?.length ?? 0,
    wikiPage: wikiPages.has(wikiFile) ? wikiFile : null,
    sample,
    sampleFrom: tableFile ? 'wiki 对照表' : sampleByProp.has(prop) ? 'Sample 样例文件' : viaTable ? '对照表里有，但本机副本找不到该文件' : null,
  }
}

const out = { generatedFrom: `${source.package}@${source.version}`, props }
await writeFile(indexJson, `${JSON.stringify(out, null, '\t')}\n`)

const cell = (v) => (v ? `\`${v}\`` : '—')
const row = (prop, p) => `| \`${prop}\` | ${cell(p.schemaFile)} | ${p.required.length ? p.required.map((r) => `\`${r}\``).join(' ') : '—'}${p.requiredChoices ? `（另有 ${p.requiredChoices} 组必填组合，见结构定义）` : ''} | ${cell(p.wikiPage?.replace(/^Homebrew__TableOfReference__|\.txt$/g, ''))} | ${cell(p.sample)}${p.sample && p.sampleFrom !== 'wiki 对照表' ? '（Sample）' : ''} |`
const head = '| 类别（顶层键） | 结构定义文件 | 必填字段 | wiki 页 | 作者样例（相对作者自制仓库副本） |\n|---|---|---|---|---|'
const main = Object.entries(props).filter(([, p]) => p.group === '主')
const fluff = Object.entries(props).filter(([, p]) => p.group === '配套')
const special = Object.entries(props).filter(([, p]) => p.group === '专用')
const md = [
  '# 自制类别索引（自动生成，不要手改）',
  '',
  `由 \`scripts/build-index.mjs\` 生成，结构定义来自 ${out.generatedFrom}（MIT，随插件带在 \`vendor/brew-schema/schema\`）。`,
  '结构定义文件路径相对 `vendor/brew-schema/schema/`；作者样例路径相对 `BREW_POOL`（作者自制仓库本地副本，默认见 `scripts/paths.mjs`）；wiki 页在 `BREW_WIKI` 目录下，文件名是 `Homebrew__TableOfReference__<名>.txt`。',
  '「必填字段」只是条目最外层的必填键；里面的嵌套要求以结构定义和校验器为准。',
  '',
  `## 主要类别（${main.length}）`,
  '',
  head,
  ...main.map(([k, p]) => row(k, p)),
  '',
  `## 配套的背景故事（${fluff.length}，名字都以 Fluff 结尾，是同名类别的故事 / 配图文字，另放一个数组）`,
  '',
  head,
  ...fluff.map(([k, p]) => row(k, p)),
  '',
  `## Foundry / Roll20 专用（${special.length}，给那两个平台用，写自制时不用管）`,
  '',
  special.map(([k]) => `\`${k}\``).join(' '),
  '',
].join('\n')
await writeFile(join(skillDir, 'references/类别索引.md'), md)
const sampleless = main.filter(([, p]) => !p.sample).map(([k]) => k)
const wikiless = main.filter(([, p]) => !p.wikiPage).map(([k]) => k)
console.log(`类别 ${Object.keys(props).length}（主 ${main.length} / 配套 ${fluff.length} / 专用 ${special.length}）`)
console.log(`主要类别里没有作者样例的：${sampleless.join(' ') || '无'}`)
console.log(`主要类别里没有 wiki 页的：${wikiless.join(' ') || '无'}`)
