// P5.5 C2–C7 双语自制（驾驶员 2026-11-13 定，方案 §16）。照作者中文版的规矩：一个双语包 = 中文、英文两个作者自制文件，
// 同一组来源编号；条目一一对应，中文条目用 ENG_name 记英文名。中文自制、英文自制是两套存储（cn-brew / en-brew）。
// 配对、条目对应都用现有的（brew-pairing.ts：来源编号有交集、唯一对上；counterpart.ts：同一位置 → 英文名），这里不另立规则。
// C8 / C9 的纯计算在 lang-fill.ts。
import type { BrewPairs } from './brew-pairing'
import type { Counterparts } from './counterpart'
import type { CustomLibrary } from './custom'
import type { MyPack } from './custom-packs'
import { fillFrom, fillPlan, neutralMismatches, type Lang } from './lang-fill'
import type { LibraryService } from './service'
import { SOURCES, type SourceEntry } from './sources'

type Ent = Record<string, unknown>
type Files = Array<{ name: string; text: string }>

const brewOf = (lang: Lang): SourceEntry => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.lang === lang)
  if (!s) throw new Error(`没有登记${lang === 'zh' ? '中文' : '英文'}自制数据集`)
  return s
}
const langOf = (codeSet: string): Lang => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s?.lang) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  return s.lang as Lang
}
const otherLang = (l: Lang): Lang => (l === 'zh' ? 'en' : 'zh')
const codeSetOf = (l: Lang): string => brewOf(l).codeSet

/** 一个作者自制文件是中文还是英文（作者中文版规矩：中文文件条目带 ENG_name，包头可能有译者名单 translators）。 */
export function languageOfBrew(json: unknown): Lang {
  if (!json || typeof json !== 'object') return 'en'
  const body = json as Record<string, unknown>
  if (Array.isArray((body._meta as { translators?: unknown } | undefined)?.translators)) return 'zh'
  for (const [k, v] of Object.entries(body)) {
    if (k.startsWith('_') || !Array.isArray(v)) continue
    if (v.some((e) => e && typeof e === 'object' && typeof (e as Ent).ENG_name === 'string')) return 'zh'
  }
  return 'en'
}

export interface PackPair {
  /** 包的身份（两边一样，来源编号组合）。 */
  id: string
  zh: MyPack | null
  en: MyPack | null
}

export interface OtherEntry {
  /** found：另一语言有这一条；none：还没有（编辑另一边就是新建）；ambiguous：对上好几条。 */
  state: 'found' | 'none' | 'ambiguous'
  entity: Ent | null
  /** 另一边的作者编号（found 时）。 */
  hash: string | null
  reason: string | null
}

export class BilingualLibrary {
  constructor(private readonly custom: CustomLibrary, private readonly lib: Pick<LibraryService, 'frameOf' | 'brewImport'>, private readonly brewPairs: Pick<BrewPairs, 'installed'>, private readonly counterparts: Pick<Counterparts, 'counterpart'>) {}

  /** C2【我的库】的包按中英配对：一对一行（只有一边的，另一边为 null）。 */
  async packs(): Promise<PackPair[]> {
    const [zh, en] = await Promise.all([this.custom.packs(codeSetOf('zh')), this.custom.packs(codeSetOf('en'))])
    const zhBy = new Map(zh.map((p) => [p.docIdLocal, p]))
    const enBy = new Map(en.map((p) => [p.docIdLocal, p]))
    const out: PackPair[] = []
    const seen = new Set<MyPack>()
    // 配上了、而且两边都是【我的库】的包 → 一行；别的（只有一边、歧义、另一边是下载的包）各自一行
    for (const row of await this.brewPairs.installed(brewOf('zh').id)) {
      const a = row.zh ? zhBy.get(row.zh.docIdLocal) : undefined
      const b = row.en ? enBy.get(row.en.docIdLocal) : undefined
      if (row.status !== 'paired' || !a || !b) continue
      out.push({ id: a.id, zh: a, en: b })
      seen.add(a).add(b)
    }
    for (const p of zh) if (!seen.has(p)) out.push({ id: p.id, zh: p, en: null })
    for (const p of en) if (!seen.has(p)) out.push({ id: p.id, zh: null, en: p })
    return out
  }

  /** C3 加另一语言版：在另一套里建同一组来源编号的空包（包头照这个包：来源、版本风格）。已经有了就直接返回。 */
  async addLanguage(fromCodeSet: string, id: string): Promise<{ codeSet: string; id: string }> {
    const to = codeSetOf(otherLang(langOf(fromCodeSet)))
    if ((await this.custom.packs(to)).some((p) => p.id === id)) return { codeSet: to, id }
    const src = (await this.custom.exportPack(fromCodeSet, id)) as { filename: string | null; body: { _meta?: Ent } }
    const meta = src.body._meta ?? {}
    const ts = Math.round(Date.now() / 1000)
    const header = { _meta: { sources: meta.sources, ...(meta.edition ? { edition: meta.edition } : {}), dateAdded: ts, dateLastModified: ts } }
    const r = await this.lib.brewImport(brewOf(langOf(to)).id, [{ name: src.filename ?? `${id}.json`, text: JSON.stringify(header) }])
    if (!r.ok) throw new Error(`作者没有收下另一语言的包：${r.errors.join('；')}`)
    return { codeSet: to, id }
  }

  /** C4 导入前按语言分开：每组交给那一套的导入预览（custom.previewImport）。 */
  async previewImport(files: Files) {
    const out = []
    for (const [lang, group] of this.split(files)) out.push({ lang, codeSet: codeSetOf(lang), preview: await this.custom.previewImport(codeSetOf(lang), group) })
    return out
  }

  /** C4 按语言放进对应那一套。 */
  async importFiles(files: Files) {
    const out = []
    for (const [lang, group] of this.split(files)) out.push({ lang, codeSet: codeSetOf(lang), result: await this.lib.brewImport(brewOf(lang).id, group) })
    return out
  }

  private split(files: Files): Map<Lang, Files> {
    const by = new Map<Lang, Files>()
    for (const f of files) {
      let lang: Lang
      try { lang = languageOfBrew(JSON.parse(f.text)) } catch { lang = 'en' } // 不是 JSON 的交给预览报「不是 JSON」
      by.set(lang, [...(by.get(lang) ?? []), f])
    }
    return by
  }

  /** C5 导出双语包：两边各一个作者格式文件（只有一边的就一个）。 */
  async exportBoth(id: string): Promise<Array<{ lang: Lang; filename: string | null; body: unknown }>> {
    const out = []
    for (const lang of ['zh', 'en'] as const) {
      if (!(await this.custom.packs(codeSetOf(lang))).some((p) => p.id === id)) continue
      out.push({ lang, ...((await this.custom.exportPack(codeSetOf(lang), id)) as { filename: string | null; body: unknown }) })
    }
    return out
  }

  /** C6 这一条在另一语言里的原文（配对包同一位置 → 英文名对上）。另一边还没有就是 none（编辑另一边 = 新建）。 */
  async otherEntry(codeSet: string, pack: string, prop: string, key: { uniqueId?: string; hash?: string }): Promise<OtherEntry> {
    const mine = await this.custom.packEntry(codeSet, pack, prop, key)
    if (!mine?.hash) return { state: 'none', entity: null, hash: null, reason: 'not-found' }
    const set = brewOf(langOf(codeSet))
    const c = await this.counterparts.counterpart({ set: set.id, prop, hash: mine.hash })
    const refs = (c as { refs?: Array<{ hash: string; docIdLocal?: string }> }).refs ?? []
    if (!refs.length) return { state: 'none', entity: null, hash: null, reason: (c as { reason?: string | null }).reason ?? null }
    if (refs.length > 1) return { state: 'ambiguous', entity: null, hash: null, reason: null }
    const ref = refs[0]
    const to = codeSetOf(otherLang(set.lang as Lang))
    const f = await this.lib.frameOf(to)
    const docId = ref.docIdLocal ?? (await f.call('brewDocIndex')).find((d) => !d.isEditable && (d.props[prop] ?? []).includes(ref.hash))?.docIdLocal
    const got = docId ? await f.call('packEntity', docId, prop, { hash: ref.hash }) : null
    return got ? { state: 'found', entity: got.entity as Ent, hash: got.hash, reason: null } : { state: 'none', entity: null, hash: null, reason: 'not-found' }
  }

  /** C7 存另一语言：那一套里还没有这个包就先建同编号的包，再按平常的保存走（custom.saveEntry）。 */
  async saveInLanguage(codeSet: string, pack: string, prop: string, ent: Ent, opts: { replaceHash?: string; rule?: string } = {}) {
    if (!(await this.custom.packs(codeSet)).some((p) => p.id === pack)) {
      const from = codeSetOf(otherLang(langOf(codeSet)))
      await this.addLanguage(from, pack)
    }
    return this.custom.saveEntry(codeSet, prop, ent, { ...opts, pack })
  }

  /** C8 从另一语言填入：两种填法各会改哪几项。codeSet = 正在编辑的这一边。 */
  fillPlan(codeSet: string, current: Ent, other: Ent) {
    return fillPlan(current, other, langOf(codeSet))
  }

  /** C8 按选的填法填好（还没存，界面放回表单；能用编辑器的撤销退回）。 */
  fill(codeSet: string, current: Ent, other: Ent, mode: 'onlyEmpty' | 'all'): Ent {
    return fillFrom(current, other, langOf(codeSet), mode)
  }

  /** C9 两边都填了、但不一样的「不用翻译的字段」（数字、开关、下拉、多选）。 */
  async mismatches(codeSet: string, prop: string, a: Ent, b: Ent): Promise<string[]> {
    const t = await this.custom.fields(codeSet, prop)
    return t ? neutralMismatches(a, b, t.fields, t.defs) : []
  }
}
