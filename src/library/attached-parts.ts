// 附属部分（驾驶员 2026-11-14 批准）：作者把一类条目的一部分另存在别的类别里、同 id 一对一。
// 现在作者登记的是书 / 冒险的正文（book → bookData、adventure → adventureData，UrlUtil._PAGE_TO_PROPS_CORPUS，小窗 corpusPairs）。
// 它不是另一种条目：新建、取、存、删、撤销都走普通条目那一套（custom-new / custom-entries），只在里面顺带带上这一部分。
// 哪一类有附属部分、两边共用哪几个字段（id、source），全按作者登记表和结构定义算，不写类别名单。
import type { BrewField } from './brew-validate'
import { blankEntry } from './custom-new'
import { chaptersWithoutName, corpusContents } from './corpus-contents'
import { formatOfCodeSet } from './formats'
import type { AuthorFrame } from './runtime/host'

type Ent = Record<string, unknown>

export interface AttachedInfo {
  /** 附属部分存在哪一类（bookData / adventureData）。 */
  prop: string
  /** 两边共用、跟着主条目走的字段（结构定义里两边都有的，书是 id、source）；编辑器不显示，保存时从主条目抄过去。 */
  linked: string[]
}

const fieldsOf = async (codeSet: string, prop: string): Promise<BrewField[] | null> => (await formatOfCodeSet(codeSet).fields(prop))?.fields ?? null

/** 这一类有没有附属部分（作者登记表），有的话在哪一类、共用哪几个字段。 */
export async function attachedInfo(f: AuthorFrame, codeSet: string, prop: string): Promise<AttachedInfo | null> {
  const pair = (await f.call('corpusPairs')).find((p) => p.head === prop)
  if (!pair) return null
  const [head, body] = await Promise.all([fieldsOf(codeSet, prop), fieldsOf(codeSet, pair.body)])
  if (!head || !body) return null
  const own = new Set(head.map((x) => x.name))
  return { prop: pair.body, linked: body.map((x) => x.name).filter((n) => own.has(n)) }
}

/** 这一类已经用掉的编号（官方书目 + 所有自制，小写）。作者按 id 认这一类（阅读器、{@book} 标签），同类不能重复。 */
async function takenIds(f: AuthorFrame, prop: string): Promise<Set<string>> {
  const out = new Set<string>()
  for (const l of (await f.call('loaders')).filter((x) => x.kind === 'corpus' && x.index && x.page && x.props[0] === prop)) {
    for (const r of await f.call('corpusList', l.index as string, prop, l.page as string)) out.add(String(r.id).toLowerCase())
  }
  for (const doc of await f.call('brewRaw', null)) for (const e of doc.body?.[prop] ?? []) if (e?.id) out.add(String(e.id).toLowerCase())
  return out
}

/** 新条目的默认值（blankEntry 给了包时）：编号 = 包的来源编号，用掉了加 -2、-3；分组「自制」、出版日期今天（结构定义有这两项时）。 */
export async function startDefaults(f: AuthorFrame, codeSet: string, prop: string, own: string): Promise<Ent> {
  const taken = await takenIds(f, prop)
  let id = own
  for (let n = 2; taken.has(id.toLowerCase()); n++) id = `${own}-${n}`
  const fields = (await fieldsOf(codeSet, prop)) ?? []
  const group = fields.find((x) => x.name === 'group')
  return {
    id,
    ...(group?.enum?.includes('homebrew') ? { group: 'homebrew' } : {}),
    ...(fields.some((x) => x.name === 'published') ? { published: new Date().toISOString().slice(0, 10) } : {}),
  }
}

/**
 * 存之前：附属部分每一章要有章名；编号要填、不能和同类别的撞（was = 改之前的编号，自己不算撞）；
 * 目录（contents）按附属部分的正文算（导入的书保留作者手选的小节，corpus-contents.ts）。返回改好的主条目。
 */
export async function prepareHead(f: AuthorFrame, prop: string, head: Ent, body: Ent, was: string | null): Promise<Ent> {
  const data = Array.isArray(body.data) ? body.data : []
  const missing = chaptersWithoutName(data)
  if (missing.length) throw new Error(`第 ${missing.join('、')} 章没有章名`)
  const id = String(head.id ?? '').trim()
  if (!id) throw new Error('编号没填')
  if ((!was || was.toLowerCase() !== id.toLowerCase()) && (await takenIds(f, prop)).has(id.toLowerCase())) throw new Error(`编号 ${id} 已经有同类的条目在用，换一个`)
  return { ...head, id, contents: corpusContents(data, head.contents) }
}

/** 附属部分跟着主条目的那几个字段（id、source）从主条目抄过去。 */
export const withLinked = (body: Ent, head: Ent, info: AttachedInfo): Ent => ({ ...body, ...Object.fromEntries(info.linked.filter((k) => head[k] !== undefined).map((k) => [k, head[k]])) })

/** 编辑器里不显示的共用字段去掉。 */
export const withoutLinked = (body: Ent, info: AttachedInfo): Ent => Object.fromEntries(Object.entries(body).filter(([k]) => !info.linked.includes(k)))

/** 主条目里按附属部分自动算的字段（目录，prepareHead 算）：表单里不出现。 */
export const COMPUTED_FIELDS = ['contents']

/**
 * 表单安排（formPlanOf）要的：有附属部分的主条目 → 藏自动算的目录，并告诉编辑器多画一节附属部分；
 * 附属部分本身那一类 → 藏跟着主条目走的字段（id、来源）。都不是 → 什么都不加。
 */
export async function attachedPlan(f: AuthorFrame, codeSet: string, prop: string): Promise<{ hide: string[]; attached: AttachedInfo | null }> {
  const own = await attachedInfo(f, codeSet, prop)
  if (own) return { hide: COMPUTED_FIELDS, attached: own }
  const pair = (await f.call('corpusPairs')).find((p) => p.body === prop)
  const head = pair ? await attachedInfo(f, codeSet, pair.head) : null
  return { hide: head?.linked ?? [], attached: null }
}

/** 新条目的空白：结构定义的必填（自动算的目录不放）+ 按包给的默认值（编号建议等）。这一类没有附属部分就原样返回。 */
export async function blankWithAttached(f: AuthorFrame, codeSet: string, prop: string, blank: Ent, own: string): Promise<Ent> {
  if (!(await attachedInfo(f, codeSet, prop))) return blank
  const rest = Object.fromEntries(Object.entries(blank).filter(([k]) => !COMPUTED_FIELDS.includes(k)))
  return { ...rest, ...(await startDefaults(f, codeSet, prop, own)) }
}

/**
 * 编辑器要的附属部分：包里这一条（key）的附属部分原文，去掉跟着主条目走的字段；新条目（不给 key）或还没有附属部分时给空白。
 * 这一类没有附属部分 → null。
 */
export async function attachedPartOf(f: AuthorFrame, codeSet: string, prop: string, doc: string | null, key: { uniqueId?: string; hash?: string } | null): Promise<(AttachedInfo & { entity: Ent }) | null> {
  const info = await attachedInfo(f, codeSet, prop)
  if (!info) return null
  const blank = withoutLinked((await blankEntry(codeSet, info.prop)) ?? {}, info)
  const head = doc && key ? await f.call('packEntity', doc, prop, key) : null
  const body = head?.entity?.id ? await f.call('packEntity', doc!, info.prop, { id: String(head.entity.id) }) : null
  return { ...info, entity: body ? withoutLinked(body.entity as Ent, info) : blank }
}
