import { describe, expect, it } from 'vitest'
import { applyPluginUi, checkPlaceholders, pluginUiKeyCollisions, pluginUiRows, pluginUiStats } from '../../tools/lib/plugin-ui.mjs'
import { upstreamKey } from '../../tools/lib/upstream-messages.mjs'

const row = (text: string, translation: string, status: 'final' | 'review' = 'final', from = 'agent') => ({ lang: 'zh', package: 'plutonium', text, translation, status, from })

describe('作者界面字底稿', () => {
  it('编号沿用旧 UpstreamText：同一个函数、大小写和首尾空白不改变结果', () => {
    expect(upstreamKey('Max Prepared Spells')).toBe('TRPGAssistant.UpstreamText.53c3659f28da2e53f969f902')
    expect(upstreamKey('  Max Prepared Spells  ')).toBe(upstreamKey('Max Prepared Spells'))
  })
  it('空位个数必须一致；顺序可调', () => {
    expect(checkPlaceholders('Cantrips learned: {}/{}', '已学戏法：{}/{}')).toBe(true)
    expect(checkPlaceholders('Filter: {}', '筛选：{}')).toBe(true)
    expect(() => checkPlaceholders('Cantrips learned: {}/{}', '已学戏法：{}')).toThrow('空位个数不一致')
  })
  it('final 行进语言表，review 行不进', () => {
    const got = applyPluginUi({}, [row('Select a Class', '选择职业'), row('Mod.', '调整值', 'review')], [])
    expect(got.flat[upstreamKey('Select a Class')]).toBe('选择职业')
    expect(got.flat[upstreamKey('Mod.')]).toBeUndefined()
    expect(got.added).toHaveLength(1)
  })
  it('approved 覆盖底稿，即使底稿还是 review', () => {
    const got = applyPluginUi({}, [row('Mod.', '调整值', 'review')], [{ lang: 'zh', package: 'plutonium', text: 'Mod.', translation: '调整' }])
    expect(got.flat[upstreamKey('Mod.')]).toBe('调整')
    expect(got.approvedRows).toBe(1)
  })
  it('新行和已有 232 个键撞车：译文一样共用，不一样绝不覆盖', () => {
    const key = upstreamKey('Cost')
    const same = applyPluginUi({ [key]: '费用' }, [row('Cost', '费用')], [])
    expect(same.flat[key]).toBe('费用')
    expect(same.shared).toBe(1)
    expect(same.conflicts).toHaveLength(0)
    const different = applyPluginUi({ [key]: '花费' }, [row('Cost', '费用')], [])
    expect(different.flat[key]).toBe('花费')
    expect(different.conflicts).toHaveLength(1)
    expect(different.added).toHaveLength(0)
  })
  it('review 行和现有键撞车时单独列出，不覆盖', () => {
    const key = upstreamKey('Cost')
    const got = pluginUiKeyCollisions({ [key]: '花费' }, [row('Cost', '费用', 'review')])
    expect(got).toEqual([{ key, text: 'Cost', existing: '花费', draft: '费用', from: 'agent' }])
  })
  it('驾驶员已批的译文和现有键一样时，不算撞车', () => {
    const key = upstreamKey('Legendary')
    const approved = [{ lang: 'zh', package: 'plutonium', text: 'Legendary', translation: '传说' }]
    expect(pluginUiKeyCollisions({ [key]: '传说' }, [row('Legendary', '传奇', 'review')], approved)).toEqual([])
  })
  it('只取本语言、本包的底稿行；统计来源', () => {
    const rows = pluginUiRows([row('A', '甲'), { ...row('B', '乙'), lang: 'en' }])
    expect(rows).toHaveLength(1)
    expect(pluginUiStats(rows)).toMatchObject({ total: 1, final: 1, review: 0, byFrom: { agent: 1 } })
  })
})
