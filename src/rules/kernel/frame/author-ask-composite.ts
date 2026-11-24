// 问答桥：组合组件与选法术 / 选体型 / 选专长的转接件（登记在 author-ask-kinds.ts）。
//   组合组件（FeatureOptionsSelect：专长、职业特性的「附带选择」）：作者自己的窗口里，先选选项（战斗风格……），选中的那条
//     再按它的数据长出小组件（技能、语言、额外法术、抗性……，_subCompManagers[*]._subComps）。这里照作者把它离屏画出来，
//     收集长出的小组件，每个用它自己类名登记的转接件出一道小题，合成一道「组合题」（form parts）；有选项时先问选项、再追问组合题（FollowUp）。
//   额外法术（AdditionalSpellsSelect）：照作者 getFormData 的读法——几套里选一套（ixSet）、按条件任选一条（state[flat.key]，
//     候选 = 作者法术筛选窗自己的 getEntitiesMatchingFilterExpression）、列表里选 N 条（propBase 多选）、施法属性（state.ability）。
//   选体型（Race_SizeSelect）：作者的 _sizes 里选一个（state.size）。
//   背景特性（Background_Features）：先选作者的三种用法（mode）；选「另一个背景的特性」再追问哪个背景（ixBackgroundOther = 作者背景表位置），
//     选「自定义特性」再追问名称和内容（manualEntryMetas）。
//   选专长（AdditionalFeatsSelect）：几套里选一套；「任选 N 个」/「某类里任选 N 个」的候选 = 作者专长筛选窗按类别匹配，选中写作者 feat_<n>_<类型>_ixFeat。
// 名字都按作者编号取（主线唯一显示出口出中文）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import type { AskAnswer, AskForm, AskGroup, AskPart } from '../author-ask-types'
import { asData, fromEntry, joined, named, plugin, type FrameText } from '../shown'
import { plutoniumBuild } from './plutonium-build'
import { uiTextOf as ui } from './system-text'
import { abilityText, entityName, featureOptionsComponent, spellName } from './author-ask-forms'
import { FollowUp, NO_AUTO, type AskKind } from './author-ask-kinds'

const g = globalThis as any
const box = () => plutoniumBuild!.veE(document.createElement('div'))

/** 一道题有没有真要玩家选的（没有的小组件不出题）。 */
function hasChoice(form: AskForm): boolean {
  if (form.type === 'choose') return form.sets.length > 1 || form.sets.some((set) => set.groups.some((grp) => grp.count > 0 && grp.options.length > 0))
  if (form.type === 'enum') return form.options.length > 1
  return true
}

// ---- 组合组件 ----
/** 作者有「选选项」这一步（optionsMeta = 这组选项叫什么、选几个）。 */
const choosesOptions = (comp: any): boolean => !!comp._isChooseOptionsFeatures?.() && !!comp._optionsSet?.[0]?.optionsMeta
const drawn = new WeakSet<object>()
/** 照作者画一次（离屏）：按当前选中的选项长出小组件。 */
async function draw(comp: any, force = false): Promise<void> {
  if (drawn.has(comp) && !force) return
  drawn.add(comp)
  await comp.pRender(box())
}

export function compositeKinds(lookup: () => Record<string, AskKind>): Record<string, AskKind> {
  /** 长出的小组件里要问的那些（顺序 = 作者的小组件管理器顺序，重跑相同）。 */
  async function partsOf(comp: any): Promise<Array<{ sub: any; kind: string; part: AskPart }>> {
    const out = []
    for (const manager of comp._subCompManagers ?? []) {
      for (const sub of manager._subComps ?? []) {
        if (!sub) continue
        const kind = sub.constructor?.name ?? '?'
        const adapter = lookup()[kind] ?? lookup()['*']
        const part = await adapter.read({ comp: sub, opts: {} }, kind)
        if (hasChoice(part.form)) out.push({ sub, kind, part })
      }
    }
    return out
  }
  const parts: AskKind = {
    read: async ({ comp }, kind) => {
      await draw(comp)
      const list = await partsOf(comp)
      // 标题 = 这条特性 / 专长的名字（按作者编号取中文；选了选项的取选中的那条）
      const first = comp._getSelectedLoadeds?.()?.[0] ?? comp._optionsSet?.[0]
      return { kind, title: first ? entityName(first) : ui(comp.modalTitle), note: null, form: { type: 'parts', parts: list.map((x) => x.part) }, skippable: false }
    },
    write: async ({ comp }, answer) => {
      await draw(comp)
      const list = await partsOf(comp)
      for (const [i, { sub, kind }] of list.entries()) await (lookup()[kind] ?? lookup()['*']).write({ comp: sub, opts: {} }, answer.parts?.[i] ?? { default: true })
      return comp.pGetFormData()
    },
  }
  const PARTS = 'Charactermancer_FeatureOptionsSelect.parts'
  const featureOptions: AskKind = {
    // 没有选项、长出的小组件也都不用选：作者自己的表单数据
    auto: async ({ comp }) => {
      if (choosesOptions(comp)) return NO_AUTO
      await draw(comp)
      return (await partsOf(comp)).length ? NO_AUTO : comp.pGetFormData()
    },
    read: async (subject, kind) => choosesOptions(subject.comp) ? featureOptionsComponent.read(subject as any, kind) : { ...(await parts.read(subject, PARTS)), kind },
    write: async (subject, answer) => {
      const { comp } = subject
      if (!choosesOptions(comp)) return parts.write(subject, answer)
      if (answer.default) return comp.pGetFormData()
      await featureOptionsComponent.select(comp, answer)
      await draw(comp, true)
      return (await partsOf(comp)).length ? new FollowUp(PARTS, { comp, opts: {} }) : comp.pGetFormData()
    },
  }
  return { Charactermancer_FeatureOptionsSelect: featureOptions, [PARTS]: parts }
}

// ---- 额外法术 ----
type SpellGroup = { group: AskGroup; apply: (comp: any, picks: number[]) => void }
const uidSpell = (uid: string): any => g.DataUtil.proxy.unpackUid('spell', uid, 'spell')
function spellGroups(comp: any, ix: number): SpellGroup[] {
  const out: SpellGroup[] = []
  const flats = comp._getFlatSpellsInRange(ix).filter((f: any) => !f.isExpanded)
  // 按条件任选（作者的筛选窗按同一条件匹配）；同一条件的几条（例：两条戏法）合成一组「任选 N 条」，选中的依次写进各条
  const byExpr = new Map<string, any[]>()
  for (const flat of flats.filter((f: any) => f.type !== 'all' && f.filterExpression != null && !f.chooseFromGroup)) byExpr.set(flat.filterExpression, [...(byExpr.get(flat.filterExpression) ?? []), flat])
  // 组的顺序：按候选法术的环数从低到高（戏法在前）；写入只看各组自己记着的条目，顺序不影响
  const matched = [...byExpr].map(([filterExpression, same]) => ({ same, ents: comp._modalFilterSpells.getEntitiesMatchingFilterExpression({ filterExpression }).slice().sort((a: any, b: any) => String(a.name).localeCompare(String(b.name))) }))
    .sort((a, b) => Math.min(...a.ents.map((e: any) => Number(e.level))) - Math.min(...b.ents.map((e: any) => Number(e.level))))
  for (const { same, ents } of matched) {
    // 组名按候选法术的环数：全是 0 环 = 戏法
    const levels = [...new Set(ents.map((e: any) => Number(e.level)))]
    const what = levels.length === 1 ? (levels[0] === 0 ? plugin('戏法') : plugin('{0} 环法术', asData(String(levels[0])))) : plugin('法术')
    out.push({
      group: { title: plugin('{1}任选 {0} 条', asData(String(same.length)), what), count: same.length, options: ents.map((e: any) => ({ label: spellName(e) })) },
      apply: (c, picks) => picks.forEach((p, n) => { const e = ents[p]; if (!e || !same[n]) throw Error('法术不在作者给的候选里'); c._state[same[n].key] = g.DataUtil.proxy.getUid('spell', e) }),
    })
  }
  // 列表里选 N 条（作者 getFormData：按 chooseFromGroup 分组，组内顺序 = 范围内条目顺序）
  const groups = new Map<string, any[]>()
  for (const flat of flats.filter((f: any) => f.chooseFromGroup)) groups.set(flat.chooseFromGroup, [...(groups.get(flat.chooseFromGroup) ?? []), flat])
  for (const [groupUid, from] of groups) {
    const count = from[0].chooseFromCount ?? 1
    out.push({
      group: { title: plugin('选 {0} 条法术', asData(String(count))), count, options: from.map((f: any) => ({ label: spellName(uidSpell(f.uid)) })) },
      apply: (c, picks) => {
        const { propBase } = c._getProps_chooseFrom({ groupUid })
        const meta = plutoniumBuild!.ComponentUiUtil.getMetaWrpMultipleChoice(c, propBase, { values: from.map((f: any) => f.uid), count, fnDisplay: () => '' })
        for (const p of picks) { const row = meta.rowMetas[p]; if (!row) throw Error('法术不在作者给的候选里'); c._state[row.propIsActive] = true }
      },
    })
  }
  // 施法属性
  const abilities: string[] = comp._additionalSpellsFlat[ix]?.meta?.ability?.choose ?? []
  if (abilities.length) {
    out.push({
      group: { title: ui('Spellcasting Ability'), count: 1, options: abilities.map((ab) => ({ label: abilityText(ab) })) },
      apply: (c, picks) => { if (picks.length) { const ab = abilities[picks[0]]; if (!ab) throw Error('属性不在作者给的范围里'); c._state.ability = ab } },
    })
  }
  return out
}
/** 几套里的一套：名字是条目数据里写的（按条目对照取中文），没有就叫方案 n。 */
const setLabel = (n: number, i: number, name?: unknown): FrameText | null => (n > 1 ? (typeof name === 'string' && name ? fromEntry(name) : plugin('方案 {0}', asData(String(i + 1)))) : null)

export const additionalSpells: AskKind = {
  read: ({ comp, opts }, kind) => {
    const sets = comp._additionalSpellsFlat.map((block: any, i: number) => ({ label: setLabel(comp._additionalSpellsFlat.length, i, block?.meta?.name), groups: spellGroups(comp, i).map((x) => x.group) }))
    return { kind, title: ui(comp.modalTitle), note: null, form: { type: 'choose', sets, set: 0 }, skippable: !opts?.isUnskippable }
  },
  write: ({ comp }, answer: AskAnswer) => {
    if (answer.default) return comp.pGetFormData()
    const set = answer.set ?? 0
    if (!comp._additionalSpellsFlat[set]) throw Error('方案不在作者给的范围里')
    comp._state.ixSet = set
    spellGroups(comp, set).forEach((x, i) => x.apply(comp, answer.picks?.[i] ?? []))
    return comp.pGetFormData()
  },
}

// ---- 选体型 ----
export const raceSize: AskKind = {
  read: ({ comp, opts }, kind) => ({
    kind, title: ui(comp.modalTitle), note: null, skippable: !opts?.isUnskippable,
    form: { type: 'enum', options: comp._sizes.map((s: string) => { const t = g.Parser.sizeAbvToFull(s); return { label: ui(t) ?? asData(t) } }), selected: null },
  }),
  write: ({ comp }, answer) => {
    if (answer.default) return comp.pGetFormData()
    const size = comp._sizes[Number(answer.value)]
    if (!size) throw Error('体型不在作者给的范围里')
    comp._state.size = size
    return comp.pGetFormData()
  },
}

// ---- 选专长 ----
const featName = (f: any): FrameText => named(String(f.name), { propDroppable: 'feat', source: f.source, hash: g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_FEATS](f) }, true)
function featGroups(comp: any, ix: number): Array<{ group: AskGroup; type: string; ixs: number[] }> {
  const set = comp._available[ix] ?? {}
  const out: Array<{ group: AskGroup; type: string; ixs: number[] }> = []
  const pick = (type: string, count: number, filterExpression: string, title: FrameText) => {
    const hashes = new Set(comp._modalFilterFeats.getEntitiesMatchingFilterExpression({ filterExpression }).map((e: any) => g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_FEATS](e)))
    const ixs = comp._featDatas.map((f: any, i: number) => (hashes.has(f._hash) ? i : -1)).filter((i: number) => i >= 0)
      .sort((a: number, b: number) => String(comp._featDatas[a].name).localeCompare(String(comp._featDatas[b].name)))
    out.push({ type, ixs, group: { title, count, options: ixs.map((i: number) => ({ label: featName(comp._featDatas[i]) })) } })
  }
  if (set.any) pick('choose', set.any, 'Category=', plugin('任选 {0} 个专长', asData(String(set.any))))
  if (set.anyFromCategory) {
    const count = set.anyFromCategory.count || 1
    pick('chooseCategory', count, `Category=${set.anyFromCategory.category.join(';')}`, plugin('选 {0} 个专长', asData(String(count))))
  }
  return out
}
export const additionalFeats: AskKind = {
  read: ({ comp, opts }, kind) => {
    const sets = comp._available.map((set: any, i: number) => {
      const fixed = (plutoniumBuild!.StatGenUtilAdditionalFeats?.getUidsStatic?.(set) ?? []).map((uid: string) => featName(g.DataUtil.proxy.unpackUid('feat', uid, 'feat')))
      return { label: fixed.length ? plugin('固定：{0}', joined(fixed, '、')) : setLabel(comp._available.length, i), groups: featGroups(comp, i).map((x) => x.group) }
    })
    return { kind, title: ui(comp.modalTitle), note: null, form: { type: 'choose', sets, set: 0 }, skippable: !opts?.isUnskippable }
  },
  write: ({ comp }, answer) => {
    if (answer.default) return comp.pGetFormData()
    const set = answer.set ?? 0
    if (!comp._available[set]) throw Error('方案不在作者给的范围里')
    comp._state.ixSet = set
    featGroups(comp, set).forEach(({ type, ixs, group }, gi) => {
      const picks = answer.picks?.[gi] ?? []
      if (picks.length > group.count) throw Error(`最多选 ${group.count} 个`)
      picks.forEach((p, n) => { const ixFeat = ixs[p]; if (ixFeat == null) throw Error('专长不在作者给的候选里'); comp._state[comp._getProps({ ix: n, featsAdditionType: type }).propIxFeat] = ixFeat })
    })
    return comp.pGetFormData()
  },
}

// ---- 背景特性 ----
const BG_OTHER = 'Charactermancer_Background_Features.other'
const BG_MANUAL = 'Charactermancer_Background_Features.manual'
const bgModes = (comp: any): number[] => {
  const C = comp.constructor
  const custom = !!plutoniumBuild!.UtilsEntityBackground?.isCustomBackground?.(comp._background)
  return [custom ? null : C._MODE_DEFAULT, C._MODE_OTHER_BACKGROUND, C._MODE_MANUAL].filter((m): m is number => m != null)
}
const bgName = (b: any): FrameText => named(String(b.name), { propDroppable: 'background', source: b.source, hash: g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_BACKGROUNDS](b) }, true)
const otherBackgrounds = (comp: any): number[] => (comp._modalFilter?.allData ?? []).map((_: any, i: number) => i)
  .filter((i: number) => comp._modalFilter.allData[i] !== comp._background && comp.constructor.getFeatureEntries(comp._modalFilter.allData[i]).length)
  .sort((a: number, b: number) => String(comp._modalFilter.allData[a].name).localeCompare(String(comp._modalFilter.allData[b].name)))
export const backgroundFeatureKinds: Record<string, AskKind> = {
  Charactermancer_Background_Features: {
    read: ({ comp, opts }, kind) => {
      const modes = bgModes(comp)
      const selected = modes.indexOf(comp._state.mode)
      return { kind, title: ui(comp.modalTitle), note: null, skippable: !opts?.isUnskippable, form: { type: 'enum', options: modes.map((m) => ({ label: ui(comp.constructor._MODE_TO_FULL[m]) ?? asData(String(m)) })), selected: selected >= 0 ? selected : null } }
    },
    write: ({ comp }, answer) => {
      if (answer.default) return comp.getFormData()
      const mode = bgModes(comp)[Number(answer.value)]
      if (mode == null) throw Error('选项不在作者给的范围里')
      comp._state.mode = mode
      const C = comp.constructor
      return mode === C._MODE_OTHER_BACKGROUND ? new FollowUp(BG_OTHER, { comp, opts: {} }) : mode === C._MODE_MANUAL ? new FollowUp(BG_MANUAL, { comp, opts: {} }) : comp.getFormData()
    },
  },
  [BG_OTHER]: {
    read: ({ comp }, kind) => ({ kind, title: ui('Choose Background'), note: null, skippable: false, form: { type: 'choose', set: 0, sets: [{ label: null, groups: [{ title: null, count: 1, options: otherBackgrounds(comp).map((i) => ({ label: bgName(comp._modalFilter.allData[i]) })) }] }] } }),
    write: ({ comp }, answer) => {
      const ix = otherBackgrounds(comp)[answer.picks?.[0]?.[0] ?? -1]
      if (ix == null) throw Error('背景不在作者给的候选里')
      comp._state.ixBackgroundOther = ix
      return comp.getFormData()
    },
  },
  [BG_MANUAL]: {
    read: (_s, kind) => ({ kind, title: plugin('自定义特性'), note: null, skippable: false, form: { type: 'texts', groups: [{ title: plugin('名称'), count: 1, custom: true, options: [] }, { title: plugin('内容'), count: 1, custom: true, options: [] }] } }),
    write: ({ comp }, answer) => {
      const name = String(answer.texts?.[0]?.[0] ?? '').trim()
      const text = String(answer.texts?.[1]?.[0] ?? '').trim()
      if (!text) throw Error('自定义特性要写内容')
      const meta = comp._getDefaultState_manualEntryMeta()
      meta.data = { name, entries: [text] }
      comp._state.manualEntryMetas = [meta]
      return comp.getFormData()
    },
  },
}
