import { describe, expect, it } from 'vitest'
import { getCampaignBanner, PATTERN_BANNER } from '../../src/core/banner'
import { WindowLock } from '../../src/core/windowLock'
import { buildRuleCards, buildRuleFamilies, RuleRegistry } from '../../src/rules/registry'
import { createRuleRegistry, ruleDefinitions } from '../../src/rules'
import { kernelSupports, ruleKernel } from '../../src/rules/kernel/adapters'

const dnd5e2014 = ruleDefinitions().find((r) => r.id === 'dnd5e2014')!

describe('横幅取图', () => {
  const data = {}
  const chain = [{ name: '龙骨洞', imageUrl: 'cave.png' }, { name: '风暴岛', imageUrl: 'isle.png' }]
  it('当前地点有图 → 用它', () => {
    expect(getCampaignBanner({ rule: dnd5e2014, data, providers: [() => chain] })).toEqual({ src: 'cave.png', alt: '龙骨洞', source: 'location' })
  })
  it('当前地点没图、上级有图 → 用上级的图', () => {
    expect(getCampaignBanner({ rule: dnd5e2014, data, providers: [() => [{ name: '龙骨洞' }, chain[1]]] })).toEqual({ src: 'isle.png', alt: '风暴岛', source: 'parentLocation' })
  })
  it('都没有图 → 本规则默认横幅（宽/窄屏各自的图）', () => {
    expect(getCampaignBanner({ rule: dnd5e2014, data })).toEqual({ src: 'https://a1.ax1x.com/2026/10/28/wwHs9.png', alt: 'D&D 5e 默认战役横幅', source: 'default' })
    expect(getCampaignBanner({ rule: dnd5e2014, data, narrow: true }).src).toBe('https://a1.ax1x.com/2026/10/28/wwHs9.md.png')
  })
  it('不同规则取各自的默认图；没有默认图的规则用纹样', () => {
    const coc = { id: 'coc7', name: 'CoC', nameShort: 'CoC', description: '', family: 'coc', familyName: 'CoC', versionLabel: '7', defaultBanner: { wide: 'coc.png', narrow: 'coc-s.png', alt: 'CoC 横幅' } }
    expect(getCampaignBanner({ rule: coc, data }).src).toBe('coc.png')
    expect(getCampaignBanner({ rule: { ...coc, defaultBanner: undefined }, data })).toEqual(PATTERN_BANNER)
    expect(getCampaignBanner({ rule: undefined, data })).toEqual(PATTERN_BANNER)
  })
})

describe('规则卡', () => {
  it('来自注册表：一个版本一张卡，能不能建战役按结算内核支不支持算（5.5e 还没接入 → coming）', () => {
    expect(buildRuleCards(createRuleRegistry()).map((c) => [c.id, c.versionLabel, c.status])).toEqual([['dnd5e2014', '5e', 'installed'], ['dnd5e2024', '5.5e', 'coming']])
  })
  it('按体系分组：D&D 5e 一个体系两个版本', () => {
    const f = buildRuleFamilies(createRuleRegistry())
    expect(f.map((x) => [x.family, x.name, x.versions.map((v) => v.id), x.ready])).toEqual([['dnd5e', 'D&D 5e', ['dnd5e2014', 'dnd5e2024'], true]])
  })
  it('规则定义全部来自数据（scopes.json）：结算接没接看 kernel 写的适配器登记过没有', () => {
    expect(ruleDefinitions().map((r) => r.id)).toEqual(['dnd5e2014', 'dnd5e2024'])
    expect(ruleKernel('dnd5e2014')).toEqual({ adapter: 'foundry', settings: { 'dnd5e.rulesVersion': 'legacy', 'dnd5e.firstRun': false } })
    expect([kernelSupports('dnd5e2014'), kernelSupports('dnd5e2024'), kernelSupports('nope')]).toEqual([true, false, false])
  })
  it('重复注册同一规则报错', () => {
    const r = new RuleRegistry()
    r.register(dnd5e2014)
    expect(() => r.register(dnd5e2014)).toThrow('规则已注册')
  })
})

describe('多窗口只读', () => {
  it('后打开的窗口进入只读，先打开的保持可写；关闭先开的窗口不影响已进入只读的状态', async () => {
    const name = `lock-${Math.random()}`
    const first = new WindowLock(name, () => 1, 'a')
    const second = new WindowLock(name, () => 2, 'b')
    const changes: boolean[] = []
    second.onChange((v) => changes.push(v))
    first.start()
    second.start()
    await new Promise((r) => setTimeout(r, 30))
    expect(first.readOnly).toBe(false)
    expect(second.readOnly).toBe(true)
    expect(changes).toEqual([true])
    first.stop()
    expect(second.readOnly).toBe(true)
    second.stop()
  })
  it('启动时间相同按 id 决定；单个窗口始终可写', async () => {
    const name = `lock-${Math.random()}`
    const a = new WindowLock(name, () => 5, 'a')
    const b = new WindowLock(name, () => 5, 'b')
    const alone = new WindowLock(`solo-${Math.random()}`, () => 1, 'z')
    a.start(); b.start(); alone.start()
    await new Promise((r) => setTimeout(r, 30))
    expect([a.readOnly, b.readOnly, alone.readOnly]).toEqual([false, true, false])
    a.stop(); b.stop(); alone.stop()
  })
})
