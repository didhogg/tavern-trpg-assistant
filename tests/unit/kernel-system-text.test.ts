import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { systemText, displaySystemTexts } from '../../src/rules/kernel/frame/system-text'

const g = globalThis as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const saved = { game: g.game, foundry: g.foundry }
beforeEach(() => {
  const translations = { DND5E: { WeaponImprov: '临时武器', Skills: '技能', Tools: '工具' } }
  const fallback = { DND5E: { WeaponImprov: 'Improvised', Skills: 'Skills', Tools: 'Tools', Missing: 'English only' } }
  const get = (obj: unknown, key: string): unknown => key.split('.').reduce<any>((value, k) => value?.[k], obj) // eslint-disable-line @typescript-eslint/no-explicit-any
  g.foundry = { utils: { getProperty: get } }
  g.game = { i18n: { lang: 'zh', translations, _fallback: fallback, has: (key: string) => !!(get(translations, key) ?? get(fallback, key)),
    localize: (key: string) => get(translations, key) ?? get(fallback, key) ?? key } }
})
afterEach(() => Object.assign(g, saved))

describe('语言包身份', () => {
  it('作者原文按真实语言字典定位键，出口重新取本语言的字', () => {
    const text = systemText('Improvised')
    expect(text).toEqual({ $t: 'system', text: 'Improvised', key: 'DND5E.WeaponImprov' })
    expect(displaySystemTexts(['DND5E.WeaponImprov']).result).toEqual(['临时武器'])
  })
  it('物品原名没有语言键时保留待解析状态，不能冒充已本地化', () => {
    expect(systemText('Longsword').$t).toBe('author')
  })
  it('复合分组的每一段都保留实际语言键', () => {
    expect(systemText('技能、工具')).toMatchObject({ $t: 'join', parts: [{ key: 'DND5E.Skills' }, { key: 'DND5E.Tools' }] })
  })
  it('当前语言缺键时能识别英文回退，英文战役仍可正常读取', () => {
    expect(displaySystemTexts(['DND5E.Missing']).result).toEqual([null])
    g.game.i18n.lang = 'en'
    expect(displaySystemTexts(['DND5E.Missing']).result).toEqual(['English only'])
  })
})
