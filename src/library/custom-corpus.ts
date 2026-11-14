// 自制书 / 冒险的新建、编辑、删除（驾驶员 2026-11-14 定：目录自动算、编号自动建议、只做自制包里的）。
// 作者格式里一本 = 目录（book / adventure）+ 正文（bookData / adventureData），两边 id 相同（UrlUtil._PAGE_TO_PROPS_CORPUS）。
// 这里把两半当一件事：一起取、一起存（目录按正文算，corpus-contents.ts）、一起删；存还是走单条保存那条路（persist），撤销照常记。
import { blankEntry } from './custom-new'
import { chaptersWithoutName, corpusContents } from './corpus-contents'
import { persist, remove, type EntryDeps } from './custom-entries'
import { docIdOf, listPacks, type PackDeps } from './custom-packs'
import { formatOfCodeSet } from './formats'
import type { AuthorFrame } from './runtime/host'

export interface CorpusDeps {
  entry: EntryDeps
  pack: PackDeps
  frame: (codeSet: string) => Promise<AuthorFrame>
}

type Ent = Record<string, unknown>
/** 编辑中的一本：目录那一半（contents 保存时算）+ 正文那一半（data = 各章）；was = 打开时的编号（改已有的一本时有）。 */
export interface CorpusDraft { head: Ent; body: Ent; was?: string }

async function pairOf(f: AuthorFrame, prop: string): Promise<{ head: string; body: string }> {
  const pair = (await f.call('corpusPairs')).find((p) => p.head === prop)
  if (!pair) throw new Error(`作者没有「${prop}」这种书 / 冒险类别`)
  return pair
}

/** 这套资料里已经用掉的书 / 冒险编号（官方书目 + 所有自制，小写）。 */
async function takenIds(f: AuthorFrame): Promise<Set<string>> {
  const out = new Set<string>()
  for (const l of (await f.call('loaders')).filter((x) => x.kind === 'corpus' && x.index && x.page)) {
    for (const r of await f.call('corpusList', l.index as string, l.props[0], l.page as string)) out.add(String(r.id).toLowerCase())
  }
  const pairs = await f.call('corpusPairs')
  for (const doc of await f.call('brewRaw', null)) for (const p of pairs) for (const e of doc.body?.[p.head] ?? []) if (e?.id) out.add(String(e.id).toLowerCase())
  return out
}

/** 编号建议：包自己的来源编号；用掉了就加 -2、-3……（一个包可以有好几本）。 */
export async function suggestCorpusId(d: CorpusDeps, codeSet: string, packId: string): Promise<string> {
  const pack = (await listPacks(d.pack, codeSet)).find((p) => p.id === packId)
  if (!pack) throw new Error(`【我的库】里没有这个包：${packId}`)
  const taken = await takenIds(await d.frame(codeSet))
  const base = pack.own.json
  if (!taken.has(base.toLowerCase())) return base
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`.toLowerCase())) return `${base}-${n}`
}

/** 新的一本的起点：结构定义的必填项（目录不放，保存时算）+ 建议的编号 + 分组「自制」+ 今天的日期；正文还没有章。 */
export async function corpusStart(d: CorpusDeps, codeSet: string, prop: string, packId: string): Promise<CorpusDraft> {
  await pairOf(await d.frame(codeSet), prop)
  const blank = await blankEntry(codeSet, prop)
  if (!blank) throw new Error(`这套资料不收这一类：${prop}`)
  const { contents: _auto, ...head } = blank
  const group = (await formatOfCodeSet(codeSet).fields(prop))?.fields.find((f) => f.name === 'group')
  return {
    head: {
      ...head,
      id: await suggestCorpusId(d, codeSet, packId),
      ...(group?.enum?.includes('homebrew') ? { group: 'homebrew' } : {}),
      ...('published' in head ? { published: new Date().toISOString().slice(0, 10) } : {}),
    },
    body: { data: [] },
  }
}

/** 包里的一本（编辑用）：按 id 取目录和正文两半。目录里的 contents 留着（保存时按它保留作者手选的小节）。 */
export async function corpusEntry(d: CorpusDeps, codeSet: string, packId: string, prop: string, id: string): Promise<CorpusDraft> {
  const f = await d.frame(codeSet)
  const pair = await pairOf(f, prop)
  const doc = await docIdOf(f, packId)
  const head = await f.call('packEntity', doc, prop, { id })
  if (!head) throw new Error(`包里找不到这一本：${id}`)
  const body = await f.call('packEntity', doc, pair.body, { id })
  return { head: head.entity as Ent, body: (body?.entity as Ent | undefined) ?? { id, data: [] }, was: String(head.entity.id ?? id) }
}

/** 存一本：每章要有章名；编号不能和别的书 / 冒险重复；目录按正文算；两半同 id、同来源。 */
export async function saveCorpus(d: CorpusDeps, codeSet: string, prop: string, draft: CorpusDraft, opts: { pack: string; rule?: string }) {
  const f = await d.frame(codeSet)
  const pair = await pairOf(f, prop)
  const data = Array.isArray(draft.body.data) ? draft.body.data : []
  const missing = chaptersWithoutName(data)
  if (missing.length) throw new Error(`第 ${missing.join('、')} 章没有章名`)
  const id = String(draft.head.id ?? '').trim()
  if (!id) throw new Error('编号没填')
  const doc = await docIdOf(f, opts.pack)
  // 原来那一本：按 uniqueId 找；导入来的没有 uniqueId，按打开时的编号找
  const before = (typeof draft.head.uniqueId === 'string' ? await f.call('packEntity', doc, prop, { uniqueId: draft.head.uniqueId }) : null)
    ?? (draft.was ? await f.call('packEntity', doc, prop, { id: draft.was }) : null)
  const was = before ? String(before.entity.id ?? '') : null
  if ((!was || was.toLowerCase() !== id.toLowerCase()) && (await takenIds(f)).has(id.toLowerCase())) throw new Error(`编号 ${id} 已经有书或冒险在用，换一个`)
  const head: Ent = { ...draft.head, id, contents: corpusContents(data, draft.head.contents) }
  // 导入来的没有 uniqueId：用打开时给的临时 uniqueId 找不到它，按作者编号换掉
  const savedHead = await persist(d.entry, codeSet, prop, head, { pack: opts.pack, rule: opts.rule, record: true, ...(before && !before.hadId && before.hash ? { replaceHash: before.hash } : {}) })
  // 正文跟着目录：同 id、同来源；导入来的正文没有 uniqueId，按原来的 id 找到换掉
  const body = { ...draft.body, id, data, ...(head.source ? { source: head.source } : {}) }
  const savedBody = await persist(d.entry, codeSet, pair.body, body, { pack: opts.pack, record: true, replaceId: was ?? id })
  return { head: savedHead, body: savedBody }
}

/** 删一本：目录和正文一起删（各记一步撤销）。导入来的没有 uniqueId：先原样存一次补上，再删。 */
export async function deleteCorpus(d: CorpusDeps, codeSet: string, packId: string, prop: string, id: string): Promise<void> {
  const pair = await pairOf(await d.frame(codeSet), prop)
  for (const p of [prop, pair.body]) {
    // 每次写入后作者小窗会换新的：每一步重新取
    const f = await d.frame(codeSet)
    const got = await f.call('packEntity', await docIdOf(f, packId), p, { id })
    if (!got) continue
    if (!got.hadId) await persist(d.entry, codeSet, p, got.entity as Ent, { pack: packId, record: false, ...(got.hash ? { replaceHash: got.hash } : { replaceId: id }) })
    await remove(d.entry, codeSet, p, [String(got.entity.uniqueId)], { record: true, pack: packId })
  }
}
