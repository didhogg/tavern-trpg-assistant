// 问答桥：勾选类、表格类作者组件的转接件（登记在 author-ask-kinds.ts）。
//   熟练 / 语言 / 工具（OtherProficiencySelect）、专精（ExpertiseSelect）、伤害抗性 / 免疫 / 易伤、状态免疫（ImmResVulnSelect 一族）：
//     槽和选项的读法沿用 trait-plans.ts（作者自己的选项行、作者的「选上」写法，名字按作者编号 / 熟练键取）；
//   背景个性特征（Background_Characteristics）：作者从背景条目里取出的表，每类选几行或自己写，写进作者自己的 <类>_<序号>_value。
// 回答都按序号：作者同一输入重跑出的选项顺序相同。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import type { AskAnswer, AskGroup, AskQuestion } from '../author-ask-types'
import { asData, fromEntry, joined, named, plugin, valueText, type FrameText } from '../shown'
import { registryLabels } from './trait-title'
import { plutoniumBuild } from './plutonium-build'
import { systemText, uiTextOf as ui } from './system-text'
import { expertiseSlots, proficiencySlots, resistanceSlots, type Slot } from './trait-plans'

type Read = Omit<AskQuestion, 'index'>
const g = globalThis as any

/** 一个勾选组件当前方案的槽（各自的读法）；cleanup 交回给调用方在交表后收尾。 */
async function slotsOf(comp: any, set: number): Promise<{ slots: Slot[]; cleanup: Array<() => void> }> {
  const api = plutoniumBuild!
  const cleanup: Array<() => void> = []
  if (comp instanceof api.Charactermancer_ImmResVulnSelect) return { slots: resistanceSlots(api, comp) ?? [], cleanup }
  const sets = comp._available ?? []
  const current = sets[set]
  comp._state.ixSet = set
  if (comp instanceof api.Charactermancer_ExpertiseSelect) return { slots: expertiseSlots(api, comp, current, cleanup), cleanup }
  if (current?.all?.length || current?.choose?.some((slot: any) => slot.fromFilter)) await comp.pNotRender()
  return { slots: proficiencySlots(api, comp, current ?? {}, cleanup), cleanup }
}

const groupOf = (slot: Slot): AskGroup => ({
  title: slot.hints?.length ? ui(slot.hints.join(' ')) : null,
  count: slot.count,
  options: slot.options.map((option) => ({ label: option.text ?? valueText(option.label, slot.options.map((row) => row.label), systemText(option.label)) })),
})

/** 熟练 / 专精 / 抗性一族：几套方案（ixSet）× 每套几个「选 N 项」槽。 */
export const chooseComponent = {
  async read({ comp, opts }: { comp?: any; opts: any }, kind: string): Promise<Read> {
    const count = plutoniumBuild!.Charactermancer_ImmResVulnSelect && comp instanceof plutoniumBuild!.Charactermancer_ImmResVulnSelect ? 1 : Math.max(1, (comp._available ?? []).length)
    const sets = []
    for (let i = 0; i < count; i++) {
      const { slots, cleanup } = await slotsOf(comp, i)
      try { sets.push({ label: count > 1 ? plugin('方案 {0}', asData(String(i + 1))) : null, groups: slots.map(groupOf) }) } finally { for (const done of cleanup) done() }
    }
    return { kind, title: ui(comp.modalTitle), note: null, form: { type: 'choose', sets, set: 0 }, skippable: !opts?.isUnskippable }
  },
  async write({ comp }: { comp?: any }, answer: AskAnswer): Promise<unknown> {
    if (answer.default) return comp.pGetFormData()
    const { slots, cleanup } = await slotsOf(comp, answer.set ?? 0)
    try {
      for (const [i, picks] of (answer.picks ?? []).entries()) {
        const slot = slots[i]
        if (!slot) throw Error('选项组不在作者给的范围里')
        if (picks.length > slot.count) throw Error(`这组最多选 ${slot.count} 项`)
        for (const ix of picks) { const option = slot.options[ix]; if (!option) throw Error('选项不在作者给的范围里'); option.select() }
      }
      return await comp.pGetFormData()
    } finally { for (const done of cleanup) done() }
  },
}

/** 背景个性特征：作者从背景条目里取出的表（_tables）；每类 count 条，选表里的行（作者自己的「复制这一格」）或自己写。 */
export const characteristicsComponent = {
  read({ comp, opts }: { comp?: any; opts: any }, kind: string): Read {
    const C = comp.constructor
    const groups = C._PROP_METAS.map((meta: any) => {
      const tbl = comp._tables[meta.prop]
      return {
        title: ui(C._PROP_TO_FULL?.[meta.prop]),
        count: meta.count || 1,
        custom: true,
        options: (tbl?.rows ?? []).map((row: any) => ({ label: fromEntry(g.Renderer.stripTags(String(row?.[1] ?? ''))) })),
      }
    })
    return { kind, title: ui(comp.modalTitle), note: null, form: { type: 'texts', groups }, skippable: !opts?.isUnskippable }
  },
  write({ comp }: { comp?: any }, answer: AskAnswer): unknown {
    if (answer.default) return comp.pGetFormData()
    const C = comp.constructor
    C._PROP_METAS.forEach((meta: any, i: number) => {
      const count = meta.count || 1
      const texts = [
        ...(answer.picks?.[i] ?? []).map((ix) => C._getCpyTableCell(comp._tables[meta.prop], ix)),
        ...(answer.texts?.[i] ?? []).map((t) => String(t).trim()),
      ].filter(Boolean)
      if (texts.length > count) throw Error(`这一类最多 ${count} 条`)
      for (let n = 0; n < count; n++) comp._state[C._getProps(meta.prop, n).propValue] = texts[n] ?? null
    })
    return comp.pGetFormData()
  },
}

/** 作者条目（页面 + 来源 + 编号）→ 按作者编号取名。 */
function entityName(v: any): FrameText {
  const text = String(v?.entity?.name ?? v?.name ?? '')
  const prop = g.UrlUtil?.PAGE_TO_PROPS?.[v?.page]?.[0]
  return prop && v?.hash && v?.source ? named(text, { propDroppable: prop, source: v.source, hash: v.hash, page: v.page } as never) : fromEntry(text)
}
const abilityText = (ab: string): FrameText => systemText(registryLabels('abilities')[ab] ?? ab)

/** 特性选项（战斗风格、祈唤、战技……）：作者自己的多选（ixsChosen，必选项 ixsRequired），回答 = 选上第几个。 */
export const featureOptionsComponent = {
  read({ comp, opts }: { comp?: any; opts: any }, kind: string): Read {
    const { count, required } = comp._getOptionsNameAndCount()
    const options = comp._optionsSet.map((v: any, i: number) => ({ label: entityName(v), disabled: required.includes(i) }))
    const name = comp._optionsSet[0]?.optionsMeta?.name
    const title = plugin(comp._level != null ? '{0}（{1} 级）' : '{0}', fromEntry(String(name ?? '')), asData(String(comp._level ?? '')))
    return { kind, title, note: null, form: { type: 'choose', sets: [{ label: null, groups: [{ title: null, count: count - required.length, options }] }], set: 0 }, skippable: !opts?.isUnskippable }
  },
  async write({ comp }: { comp?: any }, answer: AskAnswer): Promise<unknown> {
    if (answer.default) return comp.pGetFormData()
    const { count, required } = comp._getOptionsNameAndCount()
    const meta = plutoniumBuild!.ComponentUiUtil.getMetaWrpMultipleChoice(comp, 'ixsChosen', { values: comp._optionsSet, ixsRequired: required, count, fnDisplay: () => '' })
    try {
      const picks = answer.picks?.[0] ?? []
      if (picks.length > count - required.length) throw Error(`最多选 ${count - required.length} 项`)
      for (const ix of picks) { const row = meta.rowMetas[ix]; if (!row) throw Error('选项不在作者给的范围里'); comp._state[row.propIsActive] = true }
      return await comp.pGetFormData()
    } finally { meta.cleanup?.() }
  },
}

/** 种族属性加值：几套方案（ixSet）；每套 = 固定加值 +「选 N 项各加 amount」（race_asiChoice）或「按权重分配」（weight_ability_<属性>_<权重>）。 */
export const abilityScoreComponent = {
  read({ comp, opts }: { comp?: any; opts: any }, kind: string): Read {
    const C = comp.constructor
    const sets = comp._ability.map((set: any, i: number) => {
      const fixed = Object.keys(registryLabels('abilities')).filter((ab) => set[ab]).map((ab) => plugin('{0} {1}', abilityText(ab), asData(`${set[ab] > 0 ? '+' : ''}${set[ab]}`)))
      const groups = []
      if (set.choose?.from) groups.push({ title: plugin('选 {0} 项，各 +{1}', asData(String(set.choose.count || 1)), asData(String(set.choose.amount || 1))), count: set.choose.count || 1, options: set.choose.from.map((ab: string) => ({ label: abilityText(ab) })) })
      else if (set.choose?.weighted) {
        const from = C._getSortedWeightedFrom(set)
        for (const w of C._getSortedWeights(set)) groups.push({ title: plugin('+{0}', asData(String(w))), count: 1, options: from.map((ab: string) => ({ label: abilityText(ab) })) })
      }
      return { label: fixed.length ? joined(fixed, '，') : (comp._ability.length > 1 ? plugin('方案 {0}', asData(String(i + 1))) : null), groups }
    })
    return { kind, title: ui(comp.modalTitle), note: null, form: { type: 'choose', sets, set: 0 }, skippable: !opts?.isUnskippable }
  },
  async write({ comp }: { comp?: any }, answer: AskAnswer): Promise<unknown> {
    if (answer.default) return comp.pGetFormData()
    const set = answer.set ?? 0
    const ability = comp._ability[set]
    if (!ability) throw Error('方案不在作者给的范围里')
    comp._state.ixSet = set
    comp.render(plutoniumBuild!.veE(document.createElement('div'))) // 作者按这一套画出多选（race_asiChoice）/ 权重勾选
    if (ability.choose?.from) {
      const rows = comp._lastMeta?.rowMetas ?? []
      for (const ix of answer.picks?.[0] ?? []) { if (!rows[ix]) throw Error('选项不在作者给的范围里'); comp._state[rows[ix].propIsActive] = true }
    } else if (ability.choose?.weighted) {
      for (const [ixWeight, picks] of (answer.picks ?? []).entries()) for (const ixAb of picks) comp._state[comp._getWeightedProps(ixAb, ixWeight).propWeightAbility] = true
    }
    return comp.pGetFormData()
  },
}

/** 职业等级的属性提升 / 专长（ActorAbilityScoreIncrease 窗口里的 _AbilityScoreIncreaseComponent）：
 *  作者的规则：共 2 点、单项结果不超过 20 → 作者自己的人物写法（_getActorUpdate）；选专长 = 作者按编号加载专长交回，后面作者自己导入。跳过 = 作者收到 null。 */
export const abilityIncreaseApp = {
  read({ comp }: { comp?: any }, kind: string): Read {
    const c = comp._comp
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'].map((key) => ({ key, label: abilityText(key), value: Number(c._state[key] ?? 0) }))
    return { kind, title: ui('Ability Score Improvement'), note: null, form: { type: 'asi', abilities, points: 2, max: 20 }, skippable: true }
  },
  skip: () => null,
  async write({ comp }: { comp?: any }, answer: AskAnswer): Promise<unknown> {
    const c = comp._comp
    if (answer.featEntry) {
      c._state.mode = 'feat'
      c._state.feat = answer.featEntry
      return c.getFeat()
    }
    const bonus = answer.bonus ?? {}
    const total = Object.values(bonus).reduce((n, v) => n + Number(v || 0), 0)
    if (total !== 2) throw Error('属性提升要正好加 2 点')
    c._state.mode = 'ability'
    for (const key of ['str', 'dex', 'con', 'int', 'wis', 'cha']) {
      const n = Number(bonus[key] || 0)
      if (n < 0 || c._state[key] + n > 20) throw Error('单项属性不能超过 20')
      c._state[`${key}Bonus`] = n
    }
    const update = c._getActorUpdate()
    if (update) await c._actor.update(update)
    return c.getFeat()
  },
}

/**
 * 选戏法（Charactermancer_Spell_Modal：建职业时作者问的「Select Cantrips」）：
 * 候选照作者——0 环、在这个职业 / 子职业 / 扩展列表上（isAvailableClassSpell_ 等），已有的、总是会的不算；
 * 选中照作者——0 环那一组的 ix_learned_<序号> + 父组件「已学戏法数」，再交作者自己的表单数据。名字按作者法术编号取。
 */
const spellName = (sp: any): FrameText => named(String(sp.name), { propDroppable: 'spell', source: sp.source, hash: g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_SPELLS](sp) }, true)
function cantripRows(comp: any): number[] {
  const out: number[] = []
  comp._spellDatas.forEach((sp: any, i: number) => {
    if (sp.level !== 0) return
    if (!comp.isAvailableClassSpell_(sp) && !comp.isAvailableSubclassSpell_(sp) && !comp.isAvailableExpandedSpell_(sp)) return
    if (comp.isAlwaysKnownSpell_?.(sp) || comp.getExistingSpellMeta_?.(sp)) return
    out.push(i)
  })
  return out.sort((a, b) => String(comp._spellDatas[a].name).localeCompare(String(comp._spellDatas[b].name)))
}
export const cantripModal = {
  read({ comp, opts }: { comp?: any; opts: any }, kind: string): Read {
    const rows = cantripRows(comp)
    const count = Number(comp._state.maxLearnedCantrips ?? 0) - Number(comp._state.cntLearnedCantrips ?? 0)
    return { kind, title: ui(comp.modalTitle), note: null, form: { type: 'choose', sets: [{ label: null, groups: [{ title: null, count: Math.max(0, count), options: rows.map((i) => ({ label: spellName(comp._spellDatas[i]) })) }] }], set: 0 }, skippable: !opts?.isUnskippable }
  },
  async write({ comp }: { comp?: any }, answer: AskAnswer): Promise<unknown> {
    if (answer.default) return comp.pGetFormData()
    const rows = cantripRows(comp)
    const level0 = comp._compsLevel[0]
    const picks = answer.picks?.[0] ?? []
    for (const ix of picks) { const i = rows[ix]; if (i == null) throw Error('戏法不在作者给的候选里'); level0._state[level0.constructor._getProps(i).ixLearned] = true }
    comp.cntLearnedCantrips = Number(comp.cntLearnedCantrips ?? 0) + picks.length
    return comp.pGetFormData()
  },
}
