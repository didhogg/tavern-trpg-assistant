import { describe, expect, it } from 'vitest'
import { derive, multiclassCasterLevel } from './consumer/derive'
import { FULL } from './consumer/expected/slots'
import { SAMPLES } from './consumer/expected/samples'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { readSpellcasting } from './consumer/classSheet'

/** 样卡（b1）：用包里的数据加书上的通用规则，算出护甲等级、生命值、先攻、速度、豁免、技能、被动察觉、法术位、法术豁免难度，与按 PHB 手算的结果比。 */
describe('G2b 样卡（b1）', () => {
  it('19 张样卡逐项对照手算', () => {
    const l = lib()
    const rec2 = new Recorder('g2b-sample')
    const bad: Record<string, string[]> = {}
    let checks = 0
    for (const s of SAMPLES) {
      const got = derive(l, s.in) as unknown as Record<string, unknown>
      for (const [k, want] of Object.entries(s.want)) {
        const has = got[k]
        if (want && typeof want === 'object' && !Array.isArray(want)) {
          for (const [kk, w] of Object.entries(want as Record<string, number>)) {
            checks++
            const g = (has as Record<string, number>)[kk]
            if (g !== w) (bad[`${k}.${kk}`] ??= []).push(`${s.in.name}：读出 ${g} / 手算 ${w}`)
          }
        } else {
          checks++
          if (JSON.stringify(has) !== JSON.stringify(want)) (bad[k] ??= []).push(`${s.in.name}：读出 ${JSON.stringify(has)} / 手算 ${JSON.stringify(want)}`)
        }
      }
    }
    rec2.stat('b1', 'samples', SAMPLES.length)
    rec2.stat('b1', 'checks', checks)
    const NOTE: Record<string, string> = {
      ac: '护甲等级算不对：无甲防御、龙族韧性等的公式或条件读不出（效果的条件只是文字，或公式没结构化）', hp: '生命值上限算不对（矮人坚韧、龙族韧性的每级加成是 0 占位等）',
      speed: '速度算不对（快速移动、无甲移动的加成是 0 占位）', initiative: '先攻算不对', passivePerception: '被动察觉算不对', darkvision: '黑暗视觉不对',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `b1-${k}`, check: 'b1', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: 'PHB 规则手算（每张样卡的算式写在 expected/samples.ts）', note: NOTE[k] ?? `样卡“${k}”读出与手算不符` })
    expect(rec2.settle()).toEqual([])
  })

  it('兼职施法者的法术位：牧师 3 / 法师 3 → 施法者等级 6', () => {
    const l = lib()
    expect(multiclassCasterLevel([{ kind: 'full', level: 3 }, { kind: 'full', level: 3 }])).toBe(6)
    expect(FULL[5]).toEqual([4, 3, 3, 0, 0, 0, 0, 0, 0])
    // 圣武士 4 / 游侠 4 → 一半 = 2+2 = 4 级
    expect(multiclassCasterLevel([{ kind: 'half', level: 4 }, { kind: 'half', level: 4 }])).toBe(4)
    // 奥法骑士战士 6 / 法师 4：三分之一 2 + 4 = 6
    expect(multiclassCasterLevel([{ kind: 'third', level: 6 }, { kind: 'full', level: 4 }])).toBe(6)
    // 奇械师向上取整：奇械师 3 → 2
    expect(multiclassCasterLevel([{ kind: 'artificer', level: 3 }])).toBe(2)
    // 数据里的全施法职业表 6 级就是 4/3/3
    expect(readSpellcasting(l.need('class.wizard.phb'))!.slots[5]).toEqual(FULL[5])
  })
})
