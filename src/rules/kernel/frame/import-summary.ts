// 作者导入完成后「这次人物上变了什么」（驾驶员 11-25 评测：最终清单按实际落点列出属性、熟练、语言、特性、法术、装备及金币）。
//   物品（特性、法术、装备）由 commands-import.ts 的 added 列；这里只比人物本身的几块：属性值、生命上限、技能 / 工具熟练、语言、护甲 / 武器受训、钱币。
//   名字全用 dnd5e 自己的登记表和官方多语言（systemText），不写名单；比的是导入前后的人物数据，不推测。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import type { FrameText } from '../shown'
import { joined, named } from '../shown'
import { baseItemIds } from './author-classes'
import { systemText } from './system-text'
import { registryLabels } from './trait-title'
import { text as labelText } from './sheet-levels'

const g = globalThis as any
const data = (text: string | number): FrameText => ({ $t: 'data', text: String(text) })
const plugin = (text: string, ...args: FrameText[]): FrameText => ({ $t: 'plugin', text, args })
const setOf = (v: any): string[] => [...(v instanceof Set ? v : Array.isArray(v) ? v : [])].map(String)

/** 导入前记一份（只记要比的几块）。 */
export function snapshot(a: any) {
  const s = a.system ?? {}
  const traitKeys = (type: string): string[] => {
    const path = g.dnd5e?.documents?.Trait?.actorKeyPath?.(type)
    if (!path) return []
    const v = foundryGet(a, path)
    if (type === 'skills' || type === 'tool') return Object.entries<any>(v ?? {}).filter(([, x]) => Number(x?.value ?? x?.proficient ?? 0) > 0).map(([k]) => k)
    return setOf(v?.value)
  }
  return {
    abilities: Object.fromEntries(Object.entries<any>(s.abilities ?? {}).map(([k, x]) => [k, Number(x?.value ?? 0)])),
    hpMax: Number(s.attributes?.hp?.max ?? 0),
    traits: Object.fromEntries(['skills', 'tool', 'languages', 'armor', 'weapon'].map((t) => [t, traitKeys(t)])),
    currency: Object.fromEntries(Object.entries<any>(s.currency ?? {}).map(([k, v]) => [k, Number(v ?? 0)])),
  }
}
const foundryGet = (o: any, path: string): any => g.foundry?.utils?.getProperty?.(o, path) ?? path.split('.').reduce((x, k) => x?.[k], o)
type Snap = ReturnType<typeof snapshot>

/** 导入前后比一比：一行一块（标题 + 变化）。没变的块不列。 */
export async function changesSince(before: Snap, a: any): Promise<Array<{ title: FrameText; text: FrameText }>> {
  const now = snapshot(a)
  const out: Array<{ title: FrameText; text: FrameText }> = []
  const abilityName = registryLabels('abilities')
  const ab = Object.keys(now.abilities).filter((k) => now.abilities[k] !== before.abilities[k])
  if (ab.length) out.push({ title: plugin('属性值'), text: joined(ab.map((k) => plugin('{0} {1} → {2}', systemText(abilityName[k] ?? k), data(before.abilities[k] ?? 0), data(now.abilities[k]))), '、') })
  if (now.hpMax !== before.hpMax) out.push({ title: plugin('生命上限'), text: plugin('{0} → {1}', data(before.hpMax), data(now.hpMax)) })
  const Trait = g.dnd5e?.documents?.Trait
  for (const type of Object.keys(now.traits)) {
    const fresh = now.traits[type].filter((k) => !before.traits[type]?.includes(k))
    if (!fresh.length) continue
    const title = g.CONFIG?.DND5E?.traits?.[type]?.labels?.title
    // 武器 / 护甲 / 工具的具体基础物品（Club、Handaxe…）：和人物页同一张「键 → 作者编号」表（author-classes.ts baseItemIds），按编号取本战役语言
    const ids = ['weapon', 'armor', 'tool'].includes(type) ? await baseItemIds() : null
    out.push({ title: title ? systemText(g.game.i18n.localize(title), title) : data(type), text: joined(fresh.map((k) => {
      const label = String(Trait?.keyLabel?.(k, { trait: type }) ?? k)
      const id = ids?.get(k)
      return id ? named(label, id, true) : labelText(label) ?? data(label)
    }), '、') })
  }
  const coinName = registryLabels('currencies')
  const coins = Object.keys(now.currency).filter((k) => now.currency[k] !== (before.currency[k] ?? 0))
  if (coins.length) out.push({ title: plugin('钱币'), text: joined(coins.map((k) => plugin('{0} {1}', systemText(coinName[k] ?? k), data(`${now.currency[k] - (before.currency[k] ?? 0) > 0 ? '+' : ''}${now.currency[k] - (before.currency[k] ?? 0)}`))), '、') })
  return out
}
