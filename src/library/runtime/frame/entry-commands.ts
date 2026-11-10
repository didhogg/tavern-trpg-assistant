// 小窗里：条目显示名、条目 / 行内标签的显示文字、内嵌怪物块的指向（P5-1 B-39、B-40）。
// 全部转调作者自己的函数，不在界面里手写翻译：作者怎么取名、怎么拼"豁免 DC = 8 + …"、{@atk mw} 显示成什么、
// 内嵌块指向哪条，都是作者代码（render.js）的事。哪个类别名字要特殊取是这里的登记表，加一类 = 加一行。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'

/** 没有 name 字段的类别：作者怎么取显示名（作者列表 / 详情自己用的函数）。 */
const NAME_RULES: Record<string, (item: any) => unknown> = {
  itemProperty: (it) => A.Renderer.itemProperty.getItemPropertyRenderableEntriesMeta(it).entryFaux.name,
}

/** 条目的显示名：先问作者的取名规则（登记表），没有登记就用条目自己的 name。取不到返回 null，由界面决定怎么显示。 */
export async function displayName(prop: string, item: any): Promise<string | null> {
  await init()
  const rule = NAME_RULES[prop]
  const v = rule ? rule(item) : item?.name
  return typeof v === 'string' && v ? v : null
}

/** 作者渲染器把一段带 {@标签} 的文字、或一个条目块，渲染成纯文字（去掉 HTML）：{@atk mw} → 近战武器攻击:，{@dc 18} → DC 18，abilityDc 块 → 豁免 DC = 8 + … */
export async function renderText(input: string | Record<string, unknown>): Promise<string> {
  await init()
  const html: string = A.Renderer.get().render(input)
  const box = document.createElement('div')
  box.innerHTML = html
  return (box.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export interface StatblockMeta {
  /** 作者给的类别（如 monster、monsterFluff）。 */
  prop: string
  /** 要打开的条目所在的类别：背景描述（xxxFluff）指向它的主条目，类别名去掉 Fluff。 */
  target: string
  source: string | null
  hash: string | null
  displayName: string | null
  isFluff: boolean
}

/** 内嵌块（{type:"statblock", prop, source, name}）指向哪一条：转调作者的 Renderer.utils.getStatblockEntryMeta。 */
export async function statblockMeta(entry: Record<string, unknown>): Promise<StatblockMeta> {
  await init()
  const m = A.Renderer.utils.getStatblockEntryMeta(entry)
  const prop = String(m.prop ?? '')
  const isFluff = !!m.isFluff
  return { prop, target: isFluff ? prop.replace(/Fluff$/, '') : prop, source: m.source ?? null, hash: m.hash ?? null, displayName: m.displayName ?? null, isFluff }
}

/** 正文不在 entries 里的类别：作者怎么把它的字段拼成正文条目（作者自己的 getSummaryEntry）。传奇组：巢穴动作 / 区域效应 / 神话遭遇。加一类 = 加一行。 */
const SUMMARY_RULES: Record<string, (item: any) => unknown> = {
  legendaryGroup: (it) => A.Renderer.legendaryGroup.getSummaryEntry(it),
}

/** 这一条的"作者拼出来的正文条目"（没有登记的类别、或作者说没有内容时返回 null）。 */
export async function summaryEntry(prop: string, item: any): Promise<Record<string, unknown> | null> {
  await init()
  const rule = SUMMARY_RULES[prop]
  return (rule ? (rule(item) as Record<string, unknown> | null) : null) ?? null
}
