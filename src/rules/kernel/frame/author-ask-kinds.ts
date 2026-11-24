// 问答桥的转接件登记表（author-ask.ts 用）：作者每种提问一个件，键 = 作者组件类名 / InputUiUtil.<入口名>。
//   read(提问) → 题目：交编号（技能键、条目来源 + 编号、选项序号）和作者原文，中文由主线唯一显示出口按编号取；
//   write(提问, 回答) → 作者要的返回值：按作者组件自己的状态写进去，再交组件自己的 pGetFormData()（作者怎么收就怎么交）。
// '*' = 还没登记的种类：题目只带作者原样的描述，回答只接受「照作者默认」或「跳过」。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import { asData, joined, named, plugin, type FrameText } from '../shown'
import type { AskOption } from '../author-ask-types'
import { uiTextOf as ui } from './system-text'
import { plutoniumBuild } from './plutonium-build'
import { abilityIncreaseApp, abilityScoreComponent, characteristicsComponent, chooseComponent, featureOptionsComponent } from './author-ask-forms'
import { equipmentApp } from './author-ask-equipment'
import type { AskAnswer, AskQuestion } from '../author-ask-types'

export type { AskAnswer, AskQuestion } from '../author-ask-types'

export interface AskKind {
  read(subject: { comp?: any; opts: any }, kind: string): Promise<Omit<AskQuestion, 'index'>> | Omit<AskQuestion, 'index'>
  write(subject: { comp?: any; opts: any }, answer: AskAnswer): Promise<unknown> | unknown
  /** 跳过时作者要收到什么（默认 = 作者的跳过记号）。 */
  skip?(): unknown
}

const plain = (html: unknown): string => typeof html === 'string' ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''

/** 没登记的种类：原样描述 + 照作者默认（组件交它自己的表单数据；输入框交作者给的默认值）。 */
const fallback: AskKind = {
  read: ({ comp, opts }, kind) => ({
    kind,
    title: ui(comp?.modalTitle ?? opts?.title),
    note: ui(plain(opts?.htmlDescription)),
    form: { type: 'unknown' },
    skippable: !opts?.isUnskippable,
    raw: comp ? { state: Object.keys(comp._state ?? comp.__state ?? {}).slice(0, 60), props: Object.keys(comp).slice(0, 40) } : { opts: Object.keys(opts ?? {}) },
  }),
  write: ({ comp, opts }, answer) => {
    if (!comp && answer.value !== undefined) return answer.value
    if (!answer.default) throw Error('这种提问还没登记，只能照作者默认或跳过')
    return comp ? comp.pGetFormData() : opts?.default ?? null
  },
}

const g = globalThis as any
const question = (kind: string, title: FrameText | null, form: AskQuestion['form'], opts: any, note?: unknown): Omit<AskQuestion, 'index'> =>
  ({ kind, title, note: ui(plain(note ?? opts?.htmlDescription)), form, skippable: !!opts?.isSkippable || (opts && 'isUnskippable' in opts ? !opts.isUnskippable : false) })

/** 作者组件离屏画一次（不显示），读它自己画出的下拉框：选项值、文字都是作者的；回答 = 改它的下拉框、触发作者自己的 change。 */
function offscreen(comp: any): HTMLElement {
  const box = document.createElement('div')
  comp.render(plutoniumBuild!.veE(box))
  return box
}
const selectsOf = (box: HTMLElement): HTMLSelectElement[] => [...box.querySelectorAll('select')]

/** 只有下拉框的作者组件（生命值增加方式、兼职熟练方式……）：每个下拉框一组。 */
const selectComponent: AskKind = {
  read: ({ comp, opts }, kind) => {
    const sel = selectsOf(offscreen(comp))[0]
    if (!sel) return fallback.read({ comp, opts }, kind)
    return question(kind, ui(comp.modalTitle), { type: 'enum', options: [...sel.options].map((o) => ({ label: ui(o.text) ?? asData(o.text), disabled: o.disabled })), selected: sel.selectedIndex }, opts)
  },
  write: async ({ comp }, answer) => {
    if (answer.default) return comp.pGetFormData()
    const sel = selectsOf(offscreen(comp))[0]
    const ix = Number(answer.value)
    if (!sel || !Number.isInteger(ix) || ix < 0 || ix >= sel.options.length) throw Error('选项不在作者给的范围里')
    sel.selectedIndex = ix
    sel.dispatchEvent(new Event('change'))
    return comp.pGetFormData()
  },
}

/** 作者条目（职业特性 / 子职业特性）→ 按作者编号取名的出处。 */
const featureName = (f: any): FrameText => {
  const prop = f.subclassFeature || f.__prop === 'subclassFeature' || f.subclassSource ? 'subclassFeature' : 'classFeature'
  // 作者的特性标识串（"Fighting Style|Fighter||1"）用作者自己的拆法补全职业名 / 来源 / 等级，再按作者的编号写法算编号
  const uid = prop === 'subclassFeature' ? f.subclassFeature : f.classFeature
  const unpacked = typeof uid === 'string' ? g.DataUtil?.class?.[prop === 'subclassFeature' ? 'unpackUidSubclassFeature' : 'unpackUidClassFeature']?.(uid) : null
  const full = { ...(unpacked ?? {}), ...f, ...(unpacked ? { className: unpacked.className, classSource: unpacked.classSource, level: unpacked.level, source: f.source ?? unpacked.source } : {}) }
  const hash = g.UrlUtil?.URL_TO_HASH_BUILDER?.[prop]?.(full)
  const text = String(f.tableDisplayName || f.name || '')
  return hash && full.source ? named(text, { propDroppable: prop, source: full.source, hash, page: prop } as never, true) : ui(text) ?? asData(text)
}

export const ASK_KINDS: Record<string, AskKind> = {
  '*': fallback,
  'InputUiUtil.pGetUserBoolean': {
    read: ({ opts }, kind) => question(kind, ui(opts.title), { type: 'boolean', yes: ui(opts.textYes ?? 'Yes'), no: ui(opts.textNo ?? 'No') }, opts),
    write: (_s, answer) => answer.default ? true : !!answer.value,
  },
  'InputUiUtil.pGetUserEnum': {
    read: ({ opts }, kind) => question(kind, ui(opts.title), {
      type: 'enum',
      options: (opts.values ?? []).map((v: any) => { const t = opts.fnDisplay ? opts.fnDisplay(v) : v; return { label: typeof t === 'string' ? ui(t) ?? asData(t) : asData(String(t)) } }),
      selected: Number.isInteger(opts.default) ? opts.default : null,
    }, opts),
    write: ({ opts }, answer) => {
      const ix = answer.default ? (opts.default ?? 0) : Number(answer.value)
      if (!Number.isInteger(ix) || ix < 0 || ix >= (opts.values ?? []).length) throw Error('选项不在作者给的范围里')
      return opts.isResolveItem ? opts.values[ix] : ix
    },
  },
  'InputUiUtil.pGetUserNumber': {
    read: ({ opts }, kind) => question(kind, ui(opts.title), { type: 'number', min: opts.min ?? null, max: opts.max ?? null, value: opts.default ?? null }, opts),
    write: ({ opts }, answer) => {
      const n = Number(answer.default ? opts.default : answer.value)
      if (!Number.isFinite(n) || (opts.min != null && n < opts.min) || (opts.max != null && n > opts.max)) throw Error('数字不在作者给的范围里')
      return opts.int ? Math.round(n) : n
    },
  },
  'InputUiUtil.pGetUserString': {
    read: ({ opts }, kind) => question(kind, ui(opts.title), { type: 'string', value: String(opts.default ?? '') }, opts),
    write: ({ opts }, answer) => String(answer.default ? opts.default ?? '' : answer.value ?? ''),
  },
  Charactermancer_Class_HpIncreaseModeSelect: selectComponent,
  Charactermancer_OtherProficiencySelect: chooseComponent,
  Charactermancer_ExpertiseSelect: chooseComponent,
  Charactermancer_DamageResistanceSelect: chooseComponent,
  Charactermancer_DamageImmunitySelect: chooseComponent,
  Charactermancer_DamageVulnerabilitySelect: chooseComponent,
  Charactermancer_ConditionImmunitySelect: chooseComponent,
  Charactermancer_Background_Characteristics: characteristicsComponent,
  Charactermancer_FeatureOptionsSelect: featureOptionsComponent,
  Charactermancer_AbilityScoreSelect: abilityScoreComponent,
  /** 背景特性：作者的下拉（用这个背景的特性 / 另一个背景的 / 自定义）。 */
  Charactermancer_Background_Features: selectComponent,
  EquipmentApp: equipmentApp,
  ActorAbilityScoreIncrease: abilityIncreaseApp,
  Charactermancer_Class_ProficiencyImportModeSelect: selectComponent,
  /** 选职业等级：作者把特性按等级分好（_featureArr）；交回和作者 pGetFormData 同形的等级序号（单选 = 从已有等级补到所选等级）。 */
  Charactermancer_Class_LevelSelect: {
    read: ({ comp, opts }, kind) => {
      const from = comp._maxPreviousLevel || 0
      const levels: AskOption[] = comp._featureArr.map((feats: any[], i: number) => ({
        label: plugin('{0} 级', asData(String(i + 1))),
        note: feats.length ? joined(feats.map(featureName), '、') : null,
        disabled: !comp._isSubclass && i < from,
      }))
      return question(kind, ui(comp.modalTitle), { type: 'levels', levels, radio: comp._isRadio, from, subclass: !!comp._isSubclass }, opts)
    },
    write: ({ comp }, answer) => {
      const from = comp._maxPreviousLevel || 0
      const picked = (Array.isArray(answer.value) ? answer.value : [answer.value]).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < comp._featureArr.length)
      if (!picked.length) throw Error('没有选等级')
      if (!comp._isRadio) return { isFormComplete: true, data: [...new Set(picked)].sort((a, b) => a - b) }
      const top = Math.max(...picked)
      if (top < from) throw Error('不能选已有的等级')
      return { isFormComplete: true, data: Array.from({ length: top - from + 1 }, (_, i) => from + i) }
    },
  },
}
