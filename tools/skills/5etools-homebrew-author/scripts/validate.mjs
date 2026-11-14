// 校验一份或几份自制 JSON：用项目里已有的作者结构校验器（vendor/brew-schema，作者 5etools-utils 的 schema/brew 编译而成，
// 插件导入自制时检查的也是它），再补几条作者 README 写明的写法约定。不联网、不装依赖。
// 用法（在 TRPG 助手仓库根目录）：node tools/skills/5etools-homebrew-author/scripts/validate.mjs <文件.json> [更多文件…] [--no-unique] [--all]
//   --no-unique  不检查来源名（"json"）是否和作者自制仓库里已有的重名（默认检查，要扫一遍本地副本，约几秒）
//   --all        结构不过时列出校验器报的全部错误（默认只列“最可能的原因”，改一类再重跑才会看到下一类）
// 退出码：0 = 结构通过且没有约定警告；1 = 结构不过或有约定警告；2 = 用不了（找不到校验器、参数不对）。
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'json-source-map'
import { brewPool, validatorPath } from './paths.mjs'

const args = process.argv.slice(2)
const checkUnique = !args.includes('--no-unique')
const showAll = args.includes('--all')
const files = args.filter((a) => !a.startsWith('--'))
if (!files.length) { console.error('用法：node validate.mjs <文件.json> […] [--no-unique]'); process.exit(2) }
if (!existsSync(validatorPath)) { console.error(`找不到校验器：${validatorPath}\n（在 TRPG 助手仓库里 tools/skills 下用，或设环境变量 BREW_VALIDATOR / TRPG_REPO）`); process.exit(2) }
const { validateBrew } = await import(pathToFileURL(validatorPath).href)

/** 作者自制仓库里已有的来源名 → 文件（只扫一次）。 */
let pool = null
let poolSkipped = 0
async function sourcesInPool() {
  if (pool) return pool
  pool = new Map()
  if (!existsSync(brewPool)) return pool
  for (const dir of await readdir(brewPool, { withFileTypes: true })) {
    if (!dir.isDirectory() || dir.name.startsWith('_') || dir.name.startsWith('.') || dir.name === 'node_modules') continue
    for (const f of await readdir(join(brewPool, dir.name))) {
      if (!f.endsWith('.json')) continue
      try {
        const meta = JSON.parse(await readFile(join(brewPool, dir.name, f), 'utf8'))._meta
        for (const s of meta?.sources ?? []) if (s?.json) pool.set(s.json, `${dir.name}/${f}`)
      } catch {
        poolSkipped++ // 作者副本里个别文件读不了：照常查重，末尾如实说跳过了几个
      }
    }
  }
  return pool
}

/** 跟插件一样挑"最可能的原因"：先按位置深浅排；有真正的错误时去掉"不符合任何一种写法 / 缺 _copy"这两种陪衬；多于 5 条只留最深的。 */
function pick(errors) {
  const sorted = [...errors].sort((a, b) => a.instancePath.length - b.instancePath.length)
  const real = sorted.filter((e) => e.keyword !== 'anyOf' && e.keyword !== 'oneOf' && !(e.keyword === 'required' && e.params.missingProperty === '_copy'))
  const all = real.length ? real : sorted
  return all.length > 5 ? all.slice(-1) : all
}

function locate(pointers, path) {
  for (let p = path; ; p = p.slice(0, p.lastIndexOf('/'))) {
    const hit = pointers[p]
    if (hit) { const at = hit.key ?? hit.value; return `第 ${at.line + 1} 行第 ${at.column + 1} 列` }
    if (!p.includes('/')) return '位置不明'
  }
}

/** 作者 README「Conventions to Follow」写明的约定；不是结构定义，所以单独列成警告。 */
async function conventions(file, text, data) {
  const out = []
  if (text.charCodeAt(0) === 0xfeff) out.push('文件开头有 BOM，要 UTF-8 无 BOM')
  if (text.includes('\r')) out.push('有 CRLF 换行，要 LF')
  if (/^ +\S/m.test(text)) out.push('有用空格缩进的行，要用 tab 缩进')
  if (!/^[^;]+; .+\.json$/.test(basename(file))) out.push(`文件名应为「作者名; 自制名.json」，现在是「${basename(file)}」`)
  const sources = data?._meta?.sources
  if (!Array.isArray(sources) || !sources.length) out.push('_meta.sources 缺失或为空')
  else for (const s of sources) {
    if (!s?.json) out.push('某个 _meta.sources 条目没有 "json"（来源名）')
    else if (checkUnique) {
      const where = (await sourcesInPool()).get(s.json)
      // 校验的就是作者仓库里那份文件本身（同名）时不算重名
      if (where && !where.endsWith(`/${basename(file)}`)) out.push(`来源名 "${s.json}" 和作者自制仓库里 ${where} 重名，要换一个全库唯一的`)
    }
  }
  // dateAdded / dateLastModified / edition 是结构定义自己列的必填项，校验器会拦，这里不重复
  return out
}

let bad = 0
for (const file of files) {
  let text
  try { text = await readFile(file, 'utf8') } catch (error) {
    console.log(`✗ ${file}\n  读不了这个文件：${error instanceof Error ? error.message : error}`)
    bad++
    continue
  }
  let parsed
  try { parsed = parse(text) } catch (error) {
    console.log(`✗ ${file}\n  不是合法的 JSON：${error instanceof Error ? error.message : error}`)
    bad++
    continue
  }
  const ok = validateBrew(parsed.data)
  const warnings = await conventions(file, text, parsed.data)
  console.log(`${ok && !warnings.length ? '✓' : '✗'} ${file}`)
  if (!ok) {
    bad++
    const raw = validateBrew.errors ?? []
    const shown = showAll ? [...raw].sort((a, b) => a.instancePath.localeCompare(b.instancePath)) : pick(raw)
    for (const e of shown) console.log(`  结构不过 ${e.instancePath || '/'}（${locate(parsed.pointers, e.instancePath)}）：${e.keyword} ${e.message}${e.params ? ' ' + JSON.stringify(e.params) : ''}`)
    console.log(showAll ? `  （校验器一共报了 ${raw.length} 条，全部列出；oneOf / anyOf 的陪衬错误会混在里面）` : `  （校验器一共报了 ${raw.length} 条，上面是最可能的原因；改完重跑，或加 --all 看全部）`)
  }
  if (warnings.length) { if (ok) bad++; for (const w of warnings) console.log(`  约定警告：${w}`) }
}
if (checkUnique && !existsSync(brewPool)) console.log(`\n注意：没有查来源名重名——找不到作者自制仓库副本（${brewPool}，可用环境变量 BREW_POOL 指定）。`)
if (poolSkipped) console.log(`\n注意：作者自制仓库副本里有 ${poolSkipped} 个文件读不了，查来源名重名时跳过了。`)
console.log(bad ? `\n未通过 ${bad} / ${files.length}` : `\n全部通过 ${files.length} 份`)
process.exit(bad ? 1 : 0)
