// 5etools 中英站「同一文件、同一位置」的字串配对。只按出处逐位对齐，不按相似度猜。
// 中文站有些位置改成了 I18nUtil.get('键')，按 locale-data.js 的 zh_CN 换成中文再配对。
// 读的是仓库里锁定的 vendor/en/js 与 vendor/cn/js；结果只给底稿工具用，不进运行时。
import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('../..', import.meta.url))
const VENDOR = join(root, 'vendor')

const norm = (text) => String(text ?? '').replace(/\s+/g, ' ').trim()
const splitHtml = (text) => text.split(/(<[^>]*>)/).filter((part) => part && !part.startsWith('<')).map(norm).filter(Boolean)

async function files(dir, base = '') {
  const out = []
  for (const name of await readdir(join(dir, base))) {
    const path = join(base, name)
    if ((await stat(join(dir, path))).isDirectory()) out.push(...await files(dir, path))
    else if (name.endsWith('.js')) out.push(path)
  }
  return out
}

/** 一个 JS 文件里的字串顺序：普通字串、模板按静态段拼 {}、I18nUtil.get 记成 @@键。 */
async function literals(path) {
  const sf = ts.createSourceFile(path, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const out = []
  const walk = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) out.push(node.text)
    else if (ts.isTemplateExpression(node)) out.push([node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('{}'))
    else if (ts.isCallExpression(node) && node.expression.getText(sf) === 'I18nUtil.get' && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) {
      out.push(`@@${node.arguments[0].text}`)
      return
    }
    ts.forEachChild(node, walk)
  }
  walk(sf)
  return out
}

async function locale() {
  const source = await readFile(join(VENDOR, 'cn/js/locale-data.js'), 'utf8')
  const data = Function(`const globalThis={};${source};return globalThis.__I18N_PRELOADED_TRANSLATIONS`)()
  return data.zh_CN ?? {}
}

/**
 * 读全站配对。返回：
 *   pairs      英文（小写）→ { zh, from }；同一英文有多个不同中文时不放进来
 *   ambiguous  同一英文有多个不同中文时的候选
 *   files      参与配对的英文文件数
 *   localeKeys 中文站 locale-data 的键数
 */
export async function loadSitePairs() {
  const zhLocale = await locale()
  const pairMap = new Map()
  const ambiguous = new Map()
  const add = (en, zh, from) => {
    const key = norm(en).toLowerCase()
    const value = norm(zh)
    if (!key || !value) return
    const row = pairMap.get(key)
    if (!row) { pairMap.set(key, { zh: value, from }); return }
    if (row.zh === value) return
    const list = ambiguous.get(key) ?? [row]
    if (!list.some((item) => item.zh === value)) list.push({ zh: value, from })
    ambiguous.set(key, list)
    pairMap.delete(key)
  }
  let count = 0
  for (const file of await files(join(VENDOR, 'en/js'))) {
    let en, zh
    try {
      en = await literals(join(VENDOR, 'en/js', file))
      zh = await literals(join(VENDOR, 'cn/js', file))
    } catch {
      continue
    }
    count++
    // 最长公共子序列：只取两边之间夹着、数量相同的替换段，逐段配对。
    const n = en.length
    const m = zh.length
    if (n * m > 4e7) continue
    const dp = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = en[i] === zh[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
    let i = 0
    let j = 0
    let left = []
    let right = []
    const flush = () => {
      if (left.length && left.length === right.length) {
        left.forEach((source, index) => {
          let target = right[index]
          if (target.startsWith('@@')) target = zhLocale[target.slice(2)] ?? ''
          if (!/[\u4e00-\u9fff]/.test(target)) return
          const a = splitHtml(source)
          const b = splitHtml(target)
          if (a.length !== b.length) return
          a.forEach((part, k) => {
            if (/[A-Za-z]/.test(part) && /[\u4e00-\u9fff]/.test(b[k])) add(part, b[k], `5etools 中文站 js/${file}`)
          })
        })
      }
      left = []
      right = []
    }
    while (i < n && j < m) {
      if (en[i] === zh[j]) { flush(); i++; j++ } else if (dp[i + 1][j] >= dp[i][j + 1]) left.push(en[i++]); else right.push(zh[j++])
    }
    left.push(...en.slice(i))
    right.push(...zh.slice(j))
    flush()
  }
  return { pairs: pairMap, ambiguous, files: count, localeKeys: Object.keys(zhLocale).length }
}
