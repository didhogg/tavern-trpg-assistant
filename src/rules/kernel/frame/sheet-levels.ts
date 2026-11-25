// 职业与出身单元的逐级细节（驾驶员 11-25：点职业的某一级，右边看这一级得到了什么，能取下 / 补回）。只读官方成长记录，不算规则：
//   每条成长（职业 / 子职业 / 种族 / 背景身上，按级一行）：作者 / 官方给的标题，这一级给了哪些物品（授予的特性、法术…）、哪些键（熟练、语言…）。
//   取下单项的写法 = { 来源, 成长编号, 等级, 那一项 }（frame/off.ts 同一个入口）；文字都标好来路交唯一显示出口。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { fromAuthor, fromEntry, type FrameText } from '../shown'
import { advancementRows, appliedParts } from './off'
import { nameText } from './registry-keys'
import { keyText } from './system-text'

const g = globalThis as any

export interface LevelRow {
  /** 人物身上这件条目（职业 / 子职业 / 种族 / 背景）的编号，和取下记录里的作者来源。 */
  itemId: string; ref: string
  level: number; advancement: string; type: string; title: FrameText | null
  /** 这一级授予的人物物品（名字界面按人物页统一取好的显示）；part = 取下这一件时交的写法。 */
  items: Array<{ id: string; part: string }>
  /** 这一级记下的键（熟练、语言、抗性…）与名字；value = 记录里这一键的数（属性提升：力量 +2）。 */
  keys: Array<{ key: string; label: FrameText | null; value?: number }>
}

/** 官方 / 作者的字：语言键或已翻好的字，都过显示出口（commands-fields text 同一个认法）。 */
function text(v: unknown): FrameText | null {
  if (typeof v !== 'string' || !v.trim()) return null
  return keyText(v) ?? nameText(v, null) ?? fromAuthor(v, null)
}
/** 成长标题：作者按条目写的（职业表的列名「Cantrips Known」…）先按条目原文同一位置取，取不到再按上面的认法。 */
function title(v: unknown): FrameText | null {
  if (typeof v !== 'string' || !v.trim()) return null
  return keyText(v) ?? nameText(v, null) ?? fromEntry(v, fromAuthor(v, null))
}
/** 键的名字：官方特质键（skills:prc…）用 dnd5e Trait.keyLabel；属性键（str…）用 dnd5e 属性表。 */
function keyName(key: string): FrameText | null {
  const T = g.dnd5e?.documents?.Trait
  const label = typeof T?.keyLabel === 'function' ? T.keyLabel(key) : null
  return text(label && label !== key ? label : g.CONFIG?.DND5E?.abilities?.[key]?.label ?? key)
}

export function sheetLevels(a: any): LevelRow[] {
  return advancementRows(a).map((r) => {
    const { items, keys, amounts } = appliedParts(r.adv, r.level)
    return {
      itemId: r.item.id, ref: r.key, level: r.level, advancement: r.adv.id, type: r.type, title: title(r.adv.title),
      items: items.filter((x) => a.items.has(x.id)),
      keys: [...keys.map((key) => ({ key, label: keyName(key) })), ...amounts.map((x) => ({ key: x.key, label: keyName(x.key), value: x.value }))],
    }
  })
}
