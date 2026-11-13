// 小窗里：哪些字段是作者打标签程序自动写的（P5.5 §16.10 1b）。不写字段名单，实测：
// 1. 作者转换器界面类（converter.js 登记的 ConverterUi*）的 handleParse 里写着它用哪个转换器类（ConverterCreature……），
//    转换器文件的 import 行写着每个打标签类在哪个 converterutils 文件；
// 2. 转换器的后处理（static _do…PostProcess，作者每次转完都跑）顺着 this._… 往下找，只收打标签类（类名以 Tag / Tagger 结尾、
//    从 converterutils 来的）的 try… 调用——后处理里「从正文读出体型、速度」这类解析步骤不收，否则人填的字段也会被当成自动的；
// 3. 每条样本一次删掉一个字段，只跑这些打标签调用，原样写回来的记一次。是不是「自动字段」由主窗按比例判断。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { stableStringify } from '../../../core/hash'
import { init } from './author'
import { converterUis, prepareConverters } from './entry-types-commands'

const mod = (path: string): Promise<any> => import(/* @vite-ignore */ new URL(`js/${path}`, location.href).href)
const text = async (path: string): Promise<string> => (await fetch(new URL(`js/${path}`, location.href))).text()
/** 一个作者文件的 import：类名 → 文件（相对 js/ 目录）。 */
async function importsOf(path: string): Promise<Map<string, string>> {
  const dir = path.slice(0, path.lastIndexOf('/') + 1)
  const out = new Map<string, string>()
  for (const m of (await text(path)).matchAll(/import\s*\{([^}]+)\}\s*from\s*["']\.\/([\w./-]+\.js)["']/g)) {
    for (const name of m[1].split(',').map((x) => x.trim().split(/\s+as\s+/).pop()!).filter(Boolean)) out.set(name, `${dir}${m[2]}`)
  }
  return out
}

interface TagCall { cls: any; method: string; label: string }

/** 这一类的打标签调用（按作者后处理里的先后）。作者没有这一类的转换器 → 空。 */
async function tagCalls(prop: string): Promise<TagCall[]> {
  const ui = (await converterUis()).find((c) => c.prop === prop)
  if (!ui) return []
  const convName = /(Converter\w+)\.doParse/.exec(String(ui.constructor))?.[1] // 界面类源码里写着它调哪个转换器
  const uiFile = [...(await importsOf('converter.js'))].find(([cls]) => cls === ui.constructor.name)?.[1]
  if (!convName || !uiFile) return []
  const convFile = (await importsOf(uiFile)).get(convName)
  if (!convFile) return []
  const Conv = (await mod(convFile))[convName]
  const imports = await importsOf(convFile)
  // 后处理方法：作者命名 _do…PostProcess（不带后缀的那个），顺着 this._xxx( 往下找
  const names = Object.getOwnPropertyNames(Conv).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(Conv)))
  const roots = names.filter((n) => /^_do\w*PostProcess$/.test(n) && typeof Conv[n] === 'function')
  const seen = new Set<string>()
  const calls: TagCall[] = []
  const visit = async (name: string): Promise<void> => {
    if (seen.has(name) || typeof Conv[name] !== 'function') return
    seen.add(name)
    const src = String(Conv[name])
    // 打标签类：作者命名以 Tag 开头或以 Tag / Tagger / Tags 结尾（TagCondition、DamageTypeTag、SavingThrowTagger……）
    for (const m of src.matchAll(/\b(Tag\w*|[A-Z]\w*(?:Tag|Tagger|Tags))\.(try\w+)\(|\bthis\.(_\w+)\(/g)) {
      if (m[3]) { await visit(m[3]); continue }
      const file = imports.get(m[1])
      if (!file || !/converterutils/.test(file)) continue
      const cls = (await mod(file))[m[1]]
      const label = `${m[1]}.${m[2]}`
      if (typeof cls?.[m[2]] === 'function' && !calls.some((c) => c.label === label)) calls.push({ cls, method: m[2], label })
    }
  }
  for (const r of roots) await visit(r)
  return calls
}

const quiet = () => undefined
/** 一串代号不管先后（作者打标签有时按出现先后、有时按字母排）；其他照原样比。 */
const sameCodes = (a: unknown, b: unknown): boolean => {
  const flat = (x: unknown) => Array.isArray(x) && x.every((v) => typeof v !== 'object' || v === null)
  return flat(a) && flat(b) ? stableStringify([...(a as unknown[])].map(String).sort()) === stableStringify([...(b as unknown[])].map(String).sort()) : stableStringify(a) === stableStringify(b)
}

/**
 * 实测：samples 每条一次删掉一个字段（fields 里的），只跑打标签调用，看能不能原样写回来。
 * 返回每个字段：试了几次、写回来几次；以及用到的打标签调用（给报告看）。
 */
export async function autoFieldProbe(prop: string, samples: Array<Record<string, unknown>>, fields: string[], styleHint?: 'classic' | 'one'): Promise<{ calls: string[]; fields: Record<string, { tried: number; back: number }> }> {
  await init()
  const calls = await tagCalls(prop)
  if (!calls.length) return { calls: [], fields: {} }
  await prepareConverters()
  const opts = { cbWarning: quiet, cbMan: quiet, styleHint, isTagInflicted: true }
  const out: Record<string, { tried: number; back: number }> = {}
  for (const ent of samples) {
    for (const f of fields) {
      if (ent[f] === undefined) continue
      const copy: Record<string, unknown> = structuredClone(ent)
      delete copy[f]
      for (const c of calls) {
        try { c.cls[c.method](copy, opts) } catch (e) { console.debug(`[trpg-assistant] 打标签 ${c.label} 没跑通`, e) }
      }
      const r = (out[f] ??= { tried: 0, back: 0 })
      r.tried++
      if (copy[f] !== undefined && sameCodes(copy[f], ent[f])) r.back++
    }
  }
  return { calls: calls.map((c) => c.label), fields: out }
}

/**
 * 保存时写自动字段（§16.10 2a）：照作者转换器后处理只跑打标签调用（同上），只交回 fields 里这几个字段的结果（null = 打标签后没有）。
 * 别的字段打标签程序也会动（例如正文里加 {@hit} 标签），这里不交回，条目只改自动字段。
 */
export async function autoTag(prop: string, entity: Record<string, unknown>, fields: string[], styleHint?: 'classic' | 'one'): Promise<Record<string, unknown>> {
  await init()
  const calls = await tagCalls(prop)
  if (!calls.length || !fields.length) return {}
  await prepareConverters()
  const copy: Record<string, unknown> = structuredClone(entity)
  for (const f of fields) delete copy[f]
  const opts = { cbWarning: quiet, cbMan: quiet, styleHint, isTagInflicted: true }
  for (const c of calls) {
    try { c.cls[c.method](copy, opts) } catch (e) { console.debug(`[trpg-assistant] 打标签 ${c.label} 没跑通`, e) }
  }
  return Object.fromEntries(fields.map((f) => [f, copy[f] ?? null]))
}
