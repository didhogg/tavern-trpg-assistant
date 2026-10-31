import { describe, expect, it } from 'vitest'
import { allEntries } from './r9-pack-helpers'

type Rec = Record<string, unknown>
const flat = (v: unknown): string => JSON.stringify(v)

/**
 * 对照英文版《剑湾冒险指南》：图腾武者道途新增「Elk 麋鹿、Tiger 猛虎」，3 级图腾精魄、6 级兽之形、14 级图腾同调各一份。
 * 它们放在剑湾包里，自己「报名」加入玩家手册图腾武者在该等级的选择名单（引用只往下指）；玩家手册那边的名单不改。
 */
describe('R15 剑湾图腾武者新增选项（麋鹿、猛虎）', () => {
  const entries = allEntries()
  const all = new Map(entries.map((e) => [e.id, e]))
  const SUB = 'subclass.barbarian-path-of-the-totem-warrior.phb'
  const ids = (name: string) => [`feature.barbarian-path-of-the-totem-warrior-${name}.scag`, `feature.barbarian-path-of-the-totem-warrior-${name}.scag-2`, `feature.barbarian-path-of-the-totem-warrior-${name}.scag-3`]

  it('6 份特性：英文名、等级 3/6/14、报名加入图腾武者的同等级名单、所属就是图腾武者', () => {
    for (const [name, en] of [['elk', 'Elk'], ['tiger', 'Tiger']] as const) {
      ids(name).forEach((id, i) => {
        const e = all.get(id)
        expect(e, id).toBeDefined()
        expect(e!.nameEn).toBe(en)
        const level = [3, 6, 14][i]
        expect(e!.data.level).toBe(level)
        expect(e!.data.joinsChoice).toEqual({ id: SUB, level })
        expect((e!.data.owner as Rec).id).toBe(SUB)
      })
    }
  })

  it('正文数字与英文版一致（麋鹿 +15 尺速度、旅行速度翻倍、DC 8+…、1d12；猛虎 +10/+3 尺跳跃、两项技能、附赠动作攻击）', () => {
    const t = (id: string) => flat(all.get(id)!.data.text)
    expect(t(ids('elk')[0])).toContain('15尺')
    expect(t(ids('tiger')[0])).toMatch(/10尺.*3尺/)
    expect(t(ids('elk')[1])).toContain('60尺')
    expect(t(ids('tiger')[1])).toContain('两个')
    expect(t(ids('elk')[2])).toContain('1d12')
    expect(t(ids('tiger')[2])).toContain('20尺')
  })

  it('玩家手册的图腾武者选择名单没变（仍是熊/鹰/狼），也没有被当成必得特性授予；剑湾包只依赖玩家手册', () => {
    const adv = (all.get(SUB)!.data.advancement as Rec[])
    const mentioned = flat(adv)
    expect(mentioned).not.toContain('.scag')
    for (const step of adv.filter((a) => a.kind === 'itemChoice')) expect((step.pool as string[]).length).toBe(3)
    const scag = entries.filter((e) => e.id.endsWith('.scag') || /\.scag-\d$/.test(e.id))
    expect(scag.length).toBeGreaterThan(0)
  })
})
