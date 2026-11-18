// 属性提升挪回后端（驾驶员 2026-11-17 批准）：界面只交玩家加的点；固定加值合并、每项上限、点数、锁定项都由 frame/asi.ts 判；名字取 dnd5e 属性登记。
// dnd5e 登记用最小替身：结构与 CONFIG.DND5E.abilities 相同。
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { asiValue, asiView } from '../../src/rules/kernel/frame/asi'
import { registryLabels } from '../../src/rules/kernel/frame/trait-title'

const g = globalThis as Record<string, unknown>
const saved = { CONFIG: g.CONFIG, game: g.game }
beforeAll(() => {
  g.CONFIG = { DND5E: {
    abilities: { str: { label: 'A.str' }, dex: { label: 'A.dex' }, con: { label: 'A.con' } },
    currencies: { gp: { label: 'C.gp' }, sp: { label: 'C.sp' } },
  } }
  const translations = { A: { str: '力量', dex: '敏捷', con: '体质' }, C: { gp: 'GP' } }
  g.game = { i18n: { translations, has: (k: string) => ['A.str', 'A.dex', 'A.con', 'C.gp'].includes(k), localize: (k: string) => ({ 'A.str': '力量', 'A.dex': '敏捷', 'A.con': '体质', 'C.gp': 'GP' } as Record<string, string>)[k] ?? k } }
})
afterAll(() => Object.assign(g, saved))

// 变体人类式：2 点、每项最多 +1；龙裔式：固定 力量+2，另有 1 点
const variant = { configuration: { points: 2, cap: 1, fixed: {}, locked: [] } }
const fixedPlus = { configuration: { points: 1, cap: 1, fixed: { str: 2 }, locked: ['con'] } }

describe('registryLabels', () => {
  it('编号 → dnd5e 登记的名字；登记里没有译文的照登记原样', () => {
    expect(registryLabels('abilities')).toEqual({ str: '力量', dex: '敏捷', con: '体质' })
    expect(registryLabels('currencies')).toEqual({ gp: 'GP', sp: 'C.sp' })
    expect(registryLabels('nope')).toEqual({})
  })
})

describe('asiView', () => {
  it('每行带名字（标明来自 dnd5e 语言包）、固定加值、能不能加减；剩余点数按玩家已加的算', () => {
    const v = asiView(fixedPlus, { type: 'asi', chosen: { dex: 1 } }) as { left: number; rows: Array<Record<string, unknown>> }
    expect(v.left).toBe(0)
    expect(v.rows).toEqual([
      { key: 'str', label: { $t: 'system', key: 'A.str', text: '力量' }, fixed: 2, chosen: 0, canAdd: false, canRemove: false },
      { key: 'dex', label: { $t: 'system', key: 'A.dex', text: '敏捷' }, fixed: 0, chosen: 1, canAdd: false, canRemove: true },
      { key: 'con', label: { $t: 'system', key: 'A.con', text: '体质' }, fixed: 0, chosen: 0, canAdd: false, canRemove: false },
    ])
  })
  it('每项上限、锁定项：到上限或锁定就不能再加', () => {
    const v = asiView(variant, { type: 'asi', chosen: { str: 1 } }) as { left: number; rows: Array<{ key: string; canAdd: boolean }> }
    expect(v.left).toBe(1)
    expect(v.rows.map((r) => [r.key, r.canAdd])).toEqual([['str', false], ['dex', true], ['con', true]])
    const locked = asiView(fixedPlus, undefined) as { rows: Array<{ key: string; canAdd: boolean }> }
    expect(locked.rows.find((r) => r.key === 'con')?.canAdd).toBe(false)
  })
  it('没有可分配的点 = 不用玩家选', () => {
    expect(asiView({ configuration: { points: 0, fixed: { str: 2 } } }, undefined)).toBeNull()
  })
})

describe('asiValue', () => {
  it('固定加值 + 玩家加的 → 官方要的 assignments', () => {
    expect(asiValue(fixedPlus, { type: 'asi', chosen: { dex: 1 } })).toEqual({ type: 'asi', assignments: { str: 2, dex: 1 } })
    expect(asiValue(fixedPlus, { type: 'asi', chosen: { str: 1 } })).toEqual({ type: 'asi', assignments: { str: 3 } })
  })
  it('不合规（超点数、超上限、锁定项、不认识的属性、负数）→ null', () => {
    expect(asiValue(variant, { type: 'asi', chosen: { str: 1, dex: 1, con: 1 } })).toBeNull()
    expect(asiValue(variant, { type: 'asi', chosen: { str: 2 } })).toBeNull()
    expect(asiValue(fixedPlus, { type: 'asi', chosen: { con: 1 } })).toBeNull()
    expect(asiValue(variant, { type: 'asi', chosen: { luck: 1 } })).toBeNull()
    expect(asiValue(variant, { type: 'asi', chosen: { str: -1 } })).toBeNull()
  })
  it('旧写法（已带 assignments）原样交', () => {
    expect(asiValue(variant, { type: 'asi', assignments: { str: 1, dex: 1 } })).toEqual({ type: 'asi', assignments: { str: 1, dex: 1 } })
  })
})
