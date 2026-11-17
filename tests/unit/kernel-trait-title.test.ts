// 熟练标题全按编号认（驾驶员 2026-11-17）：类别位置、类别位置.模式、分组编号 = dnd5e 进阶模式、混合分组按作者列出的单类分组认；都认不出才 null（调用方再用作者原标题）。
// dnd5e 的登记在这里用最小替身：只有测试要用到的几项，结构与 dnd5e CONFIG.DND5E.traits / traitModes、Trait.actorKeyPath 相同。
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { groupTitle, traitTitle } from '../../src/rules/kernel/frame/trait-title'

const g = globalThis as Record<string, unknown>
const saved = { CONFIG: g.CONFIG, game: g.game, dnd5e: g.dnd5e }
const paths: Record<string, string> = { skills: 'system.skills', languages: 'system.traits.languages', tool: 'system.tools', weapon: 'system.traits.weaponProf' }
beforeAll(() => {
  g.CONFIG = { DND5E: {
    traits: { skills: { labels: { title: 'T.skills' } }, languages: { labels: { title: 'T.languages' } }, tool: { labels: { title: 'T.tool' } }, weapon: { labels: { title: 'T.weapon' }, mastery: true } },
    traitModes: { default: { label: 'M.default' }, expertise: { label: 'M.expertise' }, mastery: { label: 'M.mastery' } },
  } }
  g.game = { i18n: { localize: (k: string) => ({ 'T.skills': '技能', 'T.languages': '语言', 'T.tool': '工具熟练', 'T.weapon': '武器熟练', 'M.expertise': '专精', 'M.mastery': '精通' } as Record<string, string>)[k] ?? k } }
  g.dnd5e = { documents: { Trait: { actorKeyPath: (type: string) => paths[type] } } }
})
afterAll(() => Object.assign(g, saved))

const single = (prop: string, path: string[]) => ({ _prop: prop, _propPathActorExistingProficiencies: path, _subComps: [{}] })
const languages = single('languageProficiencies', ['system', 'traits', 'languages'])
const tools = single('toolProficiencies', ['system', 'tools'])
const siblings = [languages, tools, single('skillProficiencies', ['system', 'skills'])]

describe('groupTitle', () => {
  it('分组写的人物位置 = 类别位置 → 类别名', () => {
    expect(groupTitle(languages, siblings)).toBe('语言')
  })
  it('位置 = 类别位置.模式，且类别登记支持这个模式 → 模式名（武器精通）', () => {
    expect(groupTitle(single('itemMasteries', ['system', 'traits', 'weaponProf', 'mastery']), siblings)).toBe('精通')
    expect(groupTitle(single('x', ['system', 'tools', 'mastery']), siblings)).toBeNull()
  })
  it('分组编号是 dnd5e 登记的进阶模式 → 模式名（专精）', () => {
    expect(groupTitle({ _prop: 'expertise', _propPathActorExistingProficiencies: null, _subComps: [{}] }, siblings)).toBe('专精')
  })
  it('混合分组：作者列出涉及哪些分组 → 同一批的单类分组 → 类别名', () => {
    const mixed = { _prop: 'skillToolLanguageProficiencies', _propPathActorExistingProficiencies: null, _subComps: [{ _getAllPossibleProps: () => ['languageProficiencies', 'toolProficiencies'] }] }
    expect(groupTitle(mixed, [mixed, ...siblings])).toBe('语言、工具熟练')
  })
  it('前面都认不出 → 按候选编号；再认不出 → null', () => {
    const bare = { _prop: 'unknown', _propPathActorExistingProficiencies: null, _subComps: [{}] }
    expect(groupTitle(bare, siblings, ['skills:ath', 'tool:art:alchemist'])).toBe('技能、工具熟练')
    expect(groupTitle(bare, siblings)).toBeNull()
  })
})

describe('traitTitle', () => {
  it('非默认模式 → 模式名；默认模式照旧按类别', () => {
    expect(traitTitle({ configuration: { mode: 'expertise', choices: [{ pool: ['skills:*'] }] } })).toBe('专精')
    expect(traitTitle({ configuration: { mode: 'default', type: 'languages' } })).toBe('语言')
  })
})
