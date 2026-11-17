// 建卡「起始装备」给界面的结果：小窗算出的分组（英文名、作者编号）→ 对上本战役【库】里看得见的条目，补引用和显示名（中文战役显示中文名）。
// 本战役看不见的物品（书 / 包 / 单条被停用，或库里没有）一律去掉，列在 excluded 里；看得见的以战役范围的查询为准（和库页同一套，P5 B-19）。
// 对应 Plutonium 的黑名单（UtilItemExcludedSimple）：它读作者的全局屏蔽表，插件不用这张表（设计 §2.2），改用战役范围。
import type { KernelRef } from '../../schemas/kernel'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { ScopedLibrary } from '../../library/scoped'
import { refKey } from '../../core/saves/split'
import { namerFor, type Namer } from './naming'
import type { EquipCandidate, EquipEntryView, EquipSection, StartingPreview, StartingSelection } from './frame/commands-equipment'
import { localizeAll, type EntryPair } from './locale'
import { authorTextFor } from './author-text'
import type { LibraryService } from '../../library/service'

export type { StartingSelection }
export interface Labeled { ref: KernelRef; label: string }
export type LabeledCandidate = EquipCandidate & Labeled
export type LabeledEntry = Omit<EquipEntryView, 'candidates'> & Partial<Labeled> & { candidates?: LabeledCandidate[] }
export type StartingSection = Omit<EquipSection, 'groups'> & {
  /** 起始金币的单位名（作者币种表，中文战役即中文）；没有金币选项 = null。 */
  goldUnit: string | null
  groups: Array<{ index: number; choices: Array<{ key: string; entries: LabeledEntry[] }> }>
  /** 本战役看不到、已去掉的物品（作者的 名字|来源）；固定给的被停用 = 不给，候选被停用 = 不能选。 */
  excluded: string[]
}

/** 名字统一走起名出口（naming.ts）：作者编号 → 存档同一个换算 → 本战役看得见的库条目名。看不见 = 去掉、记进 excluded。 */
export async function labelSections(sections: EquipSection[], namer: Namer, currencies: Record<string, string> = {}): Promise<StartingSection[]> {
  const out: StartingSection[] = []
  for (const s of sections) {
    const excluded: string[] = []
    const label = async (c: { uid: string; source: string; hash: string; name: string }): Promise<Labeled | null> => {
      const named = await namer({ propDroppable: 'item', source: c.source, hash: c.hash })
      if (!named) { excluded.push(c.uid); return null }
      return { ref: named.ref, label: named.label || c.name }
    }
    const groups: StartingSection['groups'] = []
    for (const g of s.groups) {
      const choices: StartingSection['groups'][number]['choices'] = []
      for (const c of g.choices) {
        const entries: LabeledEntry[] = []
        for (const e of c.entries) {
          const { candidates, ...rest } = e
          if (e.uid) { const l = await label({ uid: e.uid, source: e.source ?? '', hash: e.hash ?? '', name: e.name ?? '' }); if (!l) continue; entries.push({ ...rest, ...l }); continue }
          if (!candidates) { entries.push(rest); continue }
          const kept = (await Promise.all(candidates.map(async (k) => { const l = await label(k); return l ? [{ ...k, ...l }] : [] }))).flat()
          if (kept.length) entries.push({ ...rest, candidates: kept })
        }
        if (entries.length) choices.push({ key: c.key, entries })
      }
      if (choices.length) groups.push({ index: g.index, choices })
    }
    out.push({ ...s, groups, excluded: [...new Set(excluded)], goldUnit: s.goldCoin ? currencies[s.goldCoin] ?? s.goldCoin : null })
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

/** 预演结果给界面：每个条目会给的物品（显示名、数量、杂项标记、改名）+ 合计的钱（币种已换好）。 */
export interface StartingPreviewView { sections: Array<{ refKey: string; items: Array<{ label: string; quantity: number; special?: boolean; rename?: string }> }>; currency: Record<string, number> | null }
/** currencies = 作者币种编号 → 名字（作者 Parser 的币种表，经本战役作者小窗：中文战役即中文），界面显示钱时按它取名字。 */
export interface StartingResult { status: string; error?: string; sections?: StartingSection[]; preview?: StartingPreviewView; currencies?: Record<string, string> }

interface Deps {
  rows: Array<{ ref: EntryRef; entry: unknown }>
  /** 显示文字的中英对照（条目 + 同编号补充记录，sidecar.ts），小窗吐出的文字统一按它换回中文（locale.ts localizeAll）。 */
  pairs: EntryPair[]
  call: (fn: string, ...args: unknown[]) => Promise<{ status: string; error?: string; result?: any }> // eslint-disable-line @typescript-eslint/no-explicit-any -- 小窗命令结果原样
  scoped: ScopedLibrary
  library: CampaignLibrary
  /** 本战役的作者小窗来源（币种名按作者币种表取，author-text.ts）。 */
  service: Pick<LibraryService, 'frameOf'>
}

/** 起始装备选项（有选择时再带预演）：职业 / 背景写着的起始装备 → 每组选项、类别候选、金币骰式，只留本战役看得见的。 */
export async function startingOptions(d: Deps, starting?: Record<string, StartingSelection>): Promise<StartingResult> {
  const sent = d.rows.filter((r) => (r.entry as { startingEquipment?: unknown })?.startingEquipment).map((r) => ({ prop: r.ref.prop, refKey: refKey(r.ref), entry: r.entry }))
  const out = await d.call('startingEquipment', sent)
  if (out.status !== 'complete') return { status: out.status, error: out.error ?? `起始装备状态：${out.status}` }
  const namer = await namerFor(d.scoped, d.library)
  const currencies = await authorTextFor(d.service, d.library.codeSet).labels((out.result.coins ?? []) as string[])
  const sections = await labelSections(localizeAll(out.result.sections as EquipSection[], d.pairs), namer, currencies)
  if (!starting) return { status: 'complete', sections, currencies }
  const checked = checkStarting(sections, starting)
  if (checked.error) return { status: 'invalid', error: checked.error, sections }
  const shown = await d.call('startingPreview', sent, starting, checked.excluded)
  if (shown.status !== 'complete') return { status: shown.status, error: shown.error ?? `起始装备预演状态：${shown.status}`, sections }
  const view = localizeAll(shown.result as StartingPreview, d.pairs)
  return {
    status: 'complete', sections, currencies,
    preview: {
      currency: view.currency,
      sections: await Promise.all(view.sections.map(async (s) => ({
        refKey: s.refKey,
        items: await Promise.all(s.granted.map(async (g) => {
          const named = g.hash && g.source ? await namer({ propDroppable: 'item', source: g.source, hash: g.hash }) : null
          return { label: named?.label || g.name, quantity: g.quantity, ...(g.special ? { special: true } : {}), ...(g.displayName ? { rename: g.displayName } : {}) }
        })),
      }))),
    },
  }
}
