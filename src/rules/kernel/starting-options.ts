// 建卡「起始装备」给界面的结果：小窗算出的分组（英文名、作者编号）→ 对上本战役【库】里看得见的条目，补引用和显示名（中文战役显示中文名）。
// 本战役看不见的物品（书 / 包 / 单条被停用，或库里没有）一律去掉，列在 excluded 里；看得见的以战役范围的查询为准（和库页同一套，P5 B-19）。
// 对应 Plutonium 的黑名单（UtilItemExcludedSimple）：它读作者的全局屏蔽表，插件不用这张表（设计 §2.2），改用战役范围。
import type { KernelRef } from '../../schemas/kernel'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { ScopedLibrary } from '../../library/scoped'
import { refKey } from '../../core/saves/split'
import { namerFor, type Namer } from './naming'
import type { EquipCandidate, EquipEntryView, EquipSection, StartingPreview, StartingSelection } from './frame/commands-equipment'
import type { EntryPair } from './locale'
import { authorTextFor } from './author-text'
import type { LibraryService } from '../../library/service'
import { display } from './display'
import { fromLibrary, type Displayed, type FrameText } from './shown'
import { kernelDataSource } from '../../library/sources'

export type { StartingSelection }
/** 看得见的物品：库里的引用 + 显示名（显示名就是物品名，经显示出口按编号取本战役库里的名字）。 */
export interface Labeled { ref: KernelRef; label: FrameText }
type LabeledCandidate = EquipCandidate & Labeled
type LabeledEntryFrame = Omit<EquipEntryView, 'candidates'> & Partial<Labeled> & { candidates?: LabeledCandidate[] }
/** 给界面的一条起始装备（文字都是 Shown）。 */
export type LabeledEntry = Displayed<LabeledEntryFrame>
type SectionFrame = Omit<EquipSection, 'groups'> & {
  /** 起始金币的单位名（作者币种表，中文战役即中文）；没有金币选项 = null。 */
  goldUnit: FrameText | null
  groups: Array<{ index: number; choices: Array<{ key: string; entries: LabeledEntryFrame[] }> }>
  /** 本战役看不到、已去掉的物品（作者的 名字|来源）；固定给的被停用 = 不给，候选被停用 = 不能选。 */
  excluded: string[]
}
/** 给界面的一段起始装备：文字都是过了显示出口的 Shown。 */
export type StartingSection = Displayed<SectionFrame>

/** 名字统一走起名出口（naming.ts）：作者编号 → 存档同一个换算 → 本战役看得见的库条目名。看不见 = 去掉、记进 excluded。 */
export async function labelSections(sections: EquipSection[], namer: Namer, currencies: Record<string, string> = {}): Promise<SectionFrame[]> {
  const out: SectionFrame[] = []
  for (const s of sections) {
    const excluded: string[] = []
    const label = async (c: { uid: string; source: string; hash: string; name: FrameText }): Promise<Labeled | null> => {
      const named = await namer({ propDroppable: 'item', source: c.source, hash: c.hash })
      if (!named) { excluded.push(c.uid); return null }
      return { ref: named.ref, label: c.name }
    }
    const groups: SectionFrame['groups'] = []
    for (const g of s.groups) {
      const choices: SectionFrame['groups'][number]['choices'] = []
      for (const c of g.choices) {
        const entries: LabeledEntryFrame[] = []
        for (const e of c.entries) {
          const { candidates, ...rest } = e
          if (e.uid && e.name) { const l = await label({ uid: e.uid, source: e.source ?? '', hash: e.hash ?? '', name: e.name }); if (!l) continue; entries.push({ ...rest, ...l }); continue }
          if (!candidates) { entries.push(rest); continue }
          const kept = (await Promise.all(candidates.map(async (k) => { const l = await label(k); return l ? [{ ...k, ...l }] : [] }))).flat()
          if (kept.length) entries.push({ ...rest, candidates: kept })
        }
        if (entries.length) choices.push({ key: c.key, entries })
      }
      if (choices.length) groups.push({ index: g.index, choices })
    }
    out.push({ ...s, groups, excluded: [...new Set(excluded)], goldUnit: s.goldCoin ? fromLibrary(currencies[s.goldCoin] ?? s.goldCoin) : null })
  }
  return out
}

/** 建卡前检查玩家的类别槽选择：必须是这个条目的候选里看得见的物品；交回要告诉小窗「不给」的物品（按条目键）。 */
export function checkStarting(sections: StartingSection[], selection: Record<string, StartingSelection>): { error?: string; excluded: Record<string, string[]> } {
  const excluded: Record<string, string[]> = {}
  for (const s of sections) {
    excluded[s.refKey] = s.excluded
    const allowed = new Set(s.groups.flatMap((g) => g.choices.flatMap((c) => c.entries.flatMap((e) => (e.candidates ?? []).map((k) => k.uid)))))
    for (const uid of Object.values(selection[s.refKey]?.pick ?? {})) {
      if (!allowed.has(uid)) return { error: `「${uid}」不在本战役的资料范围里（书 / 包 / 这一条被停用），不能作为起始装备`, excluded }
    }
  }
  return { excluded }
}

/** 预演结果：每个条目会给的物品（显示名、数量、杂项标记、改名）+ 合计的钱（币种已换好）。 */
type PreviewFrame = { sections: Array<{ refKey: string; items: Array<{ label: FrameText; quantity: number; special?: boolean; rename?: FrameText }> }>; currency: Record<string, number> | null }
export type StartingPreviewView = Displayed<PreviewFrame>
/** currencies = 作者币种编号 → 名字（作者 Parser 的币种表，经本战役作者小窗：中文战役即中文），界面显示钱时按它取名字。
 *  untranslated：显示出口没取到本战役语言、显示了原文的文字（语言审计按它数）。 */
export interface StartingResult { status: string; error?: string; sections?: StartingSection[]; preview?: StartingPreviewView; currencies?: Displayed<Record<string, FrameText>>; untranslated?: string[] }

interface Deps {
  rows: Array<{ ref: EntryRef; entry: unknown }>
  /** 显示文字的中英对照（条目 + 同编号补充记录，sidecar.ts），条目原文按它换成本战役语言（显示出口 display.ts）。 */
  pairs: EntryPair[]
  call: (fn: string, ...args: unknown[]) => Promise<{ status: string; error?: string; result?: any }> // eslint-disable-line @typescript-eslint/no-explicit-any -- 小窗命令结果原样
  scoped: ScopedLibrary
  library: CampaignLibrary
  /** 本战役的作者小窗来源（币种名按作者币种表取，author-text.ts）。 */
  service: Pick<LibraryService, 'frameOf'>
}

/** 起始装备选项（有选择时再带预演）：职业 / 背景写着的起始装备 → 每组选项、类别候选、金币骰式，只留本战役看得见的；文字只经显示出口。 */
export async function startingOptions(d: Deps, starting?: Record<string, StartingSelection>): Promise<StartingResult> {
  const sent = d.rows.filter((r) => (r.entry as { startingEquipment?: unknown })?.startingEquipment).map((r) => ({ prop: r.ref.prop, refKey: refKey(r.ref), entry: r.entry }))
  const out = await d.call('startingEquipment', sent)
  if (out.status !== 'complete') return { status: out.status, error: out.error ?? `起始装备状态：${out.status}` }
  const namer = await namerFor(d.scoped, d.library)
  const author = authorTextFor(d.service, d.library.codeSet)
  const coinNames = await author.labels((out.result.coins ?? []) as string[])
  const framed = await labelSections(out.result.sections as EquipSection[], namer, coinNames)
  const currencyFrame = Object.fromEntries(Object.entries(coinNames).map(([k, v]) => [k, fromLibrary(v)]))
  const ctx = { translate: d.library.codeSet !== kernelDataSource().codeSet, pairs: d.pairs, namer, author }
  const shown = await display({ sections: framed, currencies: currencyFrame }, ctx)
  const { sections, currencies } = shown.value
  const untranslated = (more: string[] = []) => { const all = [...new Set([...shown.missed, ...more])]; return all.length ? { untranslated: all } : {} }
  if (!starting) return { status: 'complete', sections, currencies, ...untranslated() }
  const checked = checkStarting(sections, starting)
  if (checked.error) return { status: 'invalid', error: checked.error, sections }
  const run = await d.call('startingPreview', sent, starting, checked.excluded)
  if (run.status !== 'complete') return { status: run.status, error: run.error ?? `起始装备预演状态：${run.status}`, sections }
  const raw = run.result as StartingPreview
  const previewFrame: PreviewFrame = {
    currency: raw.currency,
    sections: raw.sections.map((s) => ({ refKey: s.refKey, items: s.granted.map((g) => ({ label: g.name, quantity: g.quantity, ...(g.special ? { special: true } : {}), ...(g.displayName ? { rename: g.displayName } : {}) })) })),
  }
  const preview = await display(previewFrame, ctx)
  return { status: 'complete', sections, currencies, preview: preview.value, ...untranslated(preview.missed) }
}
