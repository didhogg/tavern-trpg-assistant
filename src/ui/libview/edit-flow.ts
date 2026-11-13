// P5.5 新建 / 编辑条目的流程：选类型 → 选起点 → 编辑器。各起点最后都交给 openEditor（带着起点给的条目，还没存）。
import { markRaw } from 'vue'
import type { Services } from '../../core/services'
import type { EntryType } from '../../library/custom-new'
import type { EditDraft } from '../../library/manage'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { useModalStore } from '../../stores/modal'
import type { Ent } from './edit-json'
import EditorPage from './EditorPage.vue'
import NewStartPage from './NewStartPage.vue'
import NewTypePage from './NewTypePage.vue'

/** 一次编辑：改哪一类、在哪一套资料、存进哪个包、从什么开始。 */
export interface EditSession {
  codeSet: string
  prop: string
  /** 作者给这一类的显示名（中文版给中文）。 */
  typeName: string
  /** 存进的包（我的库）。 */
  pack: { id: string; name: string } | null
  /** 起点给的条目（主语言那一边）。 */
  ent: Ent
  target: EditDraft['target']
  /** 接着改的草稿。 */
  draftKey?: string
  /** 详细表单：全部字段展开（作者模板起点）；简易表单只列必填，其余折起来。 */
  detailed?: boolean
  /** 改自己包里的条目：打开时的作者编号（改名时查有几处用到它）。 */
  hash?: string
  /** 改已有的条目：作者编号（换掉这一条）。 */
  replaceHash?: string
  /** 改官方 / 下载的条目 = 房规（u7-13）：原件、在哪个战役设置下改。 */
  house?: { ref: EntryRef; base: Ent; campaign: CampaignLibrary }
  /** 存好以后（详情页重读）。 */
  onSaved?: () => void
}

/** 包里 [新建条目]：选类型（弹窗里前进一页）。 */
export function openNewEntry(codeSet: string, pack: { id: string; name: string }): void {
  useModalStore().push({ key: `new:${pack.id}`, title: '新建条目：选类型', component: markRaw(NewTypePage), variant: 'sheet', props: { codeSet, pack } })
}

export function openStart(codeSet: string, pack: { id: string; name: string } | null, type: EntryType): void {
  useModalStore().push({ key: `start:${type.prop}`, title: `新建${type.name}：从哪开始`, component: markRaw(NewStartPage), variant: 'sheet', props: { codeSet, pack, type } })
}

/** 进编辑器（u7-10）：带着起点给的条目，还没存。 */
export function openEditor(s: EditSession): void {
  // 新条目存进选的包：来源由保存时按包写（起点给的来源是原书 / 转换器的，留着会和原件同编号）
  if (s.target.kind === 'new' && 'source' in s.ent) { const { source: _drop, ...rest } = s.ent; s = { ...s, ent: rest } }
  useModalStore().push({ key: `edit:${s.prop}:${Date.now()}`, title: String(s.ent.name ?? '') || `新${s.typeName}`, component: markRaw(EditorPage), variant: 'sheet', props: { session: s } })
}

/** 作者给这一类的显示名（中文版给中文）；读不到就用类别原名。 */
async function typeNameOf(s: Services, codeSet: string, prop: string): Promise<string> {
  try { return (await s.backend.library.custom.entryTypes(codeSet)).find((t) => t.prop === prop)?.name ?? prop } catch { return prop }
}

/** 包里的 ✎：打开自己包里的一条（中文、英文两边由编辑器自己对上）。 */
export async function openEditMine(s: Services, codeSet: string, pack: { id: string; name: string }, prop: string, hash: string): Promise<void> {
  const got = await s.backend.library.custom.packEntry(codeSet, pack.id, prop, { hash })
  if (!got?.entity) throw new Error('包里找不到这一条')
  const ent = got.entity as Ent
  const uniqueId = typeof ent.uniqueId === 'string' ? ent.uniqueId : got.hash ?? hash
  openEditor({ codeSet, prop, typeName: await typeNameOf(s, codeSet, prop), pack, ent, target: { kind: 'mine', uniqueId, pack: pack.id }, hash: got.hash ?? hash, replaceHash: got.hadId ? undefined : got.hash ?? hash, detailed: true })
}

/** 我的库顶上的草稿 [继续]：回到编辑器接着改。 */
export async function openDraft(s: Services, d: { key: string; codeSet: string; prop: string; s: Ent; target: EditSession['target'] }, packName: (id: string) => string | null, c?: CampaignLibrary | null): Promise<void> {
  // 房规的草稿：重新取原件，接着在房规模式里改
  if (d.target.kind === 'house') {
    if (!c) throw new Error('要先打开库页才能接着改房规')
    const det = await s.backend.library.scoped.detail(c, d.target.ref, { browse: true })
    if (!det || 'hidden' in det) throw new Error('找不到这条房规改的那一条')
    return openHouseEditor(s, c, { ref: d.target.ref, item: det.item, base: det.base }, undefined, { ent: d.s, draftKey: d.key })
  }
  const packId = d.target.kind === 'new' ? d.target.pack : d.target.kind === 'mine' ? d.target.pack ?? null : null
  openEditor({ codeSet: d.codeSet, prop: d.prop, typeName: await typeNameOf(s, d.codeSet, d.prop), pack: packId ? { id: packId, name: packName(packId) ?? packId } : null, ent: d.s, target: d.target, draftKey: d.key, detailed: true })
}

/** 书架上的官方 / 下载的条目 ✎ → 房规（同一个编辑器，u7-13）：从这个战役里现在生效的那一份开始改，原件不动。 */
export async function openHouseEditor(s: Services, c: CampaignLibrary, d: { ref: EntryRef; item: unknown; base?: unknown }, onSaved?: () => void, from?: { ent: Ent; draftKey: string }): Promise<void> {
  const codeSet = getSource(d.ref.set).codeSet
  // 刚存过房规时详情页可能还是整理前的样子：等后台整理完，从后端重新取现在生效的那一份再开始改（免得「直接改这条」拿旧内容盖掉新的）
  if (!from) {
    await s.backend.library.brewQueue.settled()
    const det = await s.backend.library.scoped.detail(c, d.ref, { browse: true })
    if (det && !('hidden' in det)) d = { ref: d.ref, item: det.item, base: det.base }
  }
  const clean = (x: unknown): Ent => { const out: Ent = {}; for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(x ?? {})) as Ent)) if (!k.startsWith('_') && k !== 'uniqueId') out[k] = v; return out }
  openEditor({ codeSet, prop: d.ref.prop, typeName: await typeNameOf(s, codeSet, d.ref.prop), pack: null, ent: from?.ent ?? clean(d.item), target: { kind: 'house', ref: d.ref }, house: { ref: d.ref, base: clean(d.base ?? d.item), campaign: c }, detailed: true, onSaved, ...(from ? { draftKey: from.draftKey } : {}) })
}
