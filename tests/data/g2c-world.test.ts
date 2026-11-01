import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str, strs } from './consumer/util'
import { DAMAGE } from './consumer/codes'

describe('G2c 怪物部件、危害、疾病、物件、载具（c7 c9 c10）', () => {
  it('怪物部件、危害、疾病、物件载具的可读程度', () => {
    const l = lib()
    const rec2 = new Recorder('g2c-world')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    // c7 怪物部件：DMG 的“自定义怪物”特质/动作碎片，带文字效应、每回合伤害（dpr）与示例怪物；没有行动结构
    const parts = l.of('monsterPart')
    rec2.stat('c7', 'monsterParts', parts.length)
    const kinds = new Map<string, number>()
    for (const p of parts) { const k = str(p.data.partKind); kinds.set(k, (kinds.get(k) ?? 0) + 1) }
    for (const [k, n] of kinds) rec2.stat('c7', `partKind.${k}`, n)
    const withDpr = parts.filter((p) => p.data.dpr !== undefined)
    rec2.stat('c7', 'withDpr', withDpr.length)
    const noAct = parts.filter((p) => arr(p.data.activities).length === 0 && (p.data.partKind === 'action'))
    // 引用的怪物：名字括号里的怪物名要在库里
    const monsterNames = new Set(l.of('monster').map((m) => m.name))
    const refMon = parts.filter((p) => /[（(]([^）)]+)[）)]$/.test(p.name))
    rec2.stat('c7', 'partsNamedAfterMonster', refMon.length)
    rec2.stat('c7', 'partsReferencingKnownMonster', refMon.filter((p) => monsterNames.has(/[（(]([^）)]+)[）)]$/.exec(p.name)![1])).length)
    // c9 危害、疾病
    const hazards = l.of('hazard')
    rec2.stat('c9', 'hazards', hazards.length)
    // 危险等级（轻微/危险/致命）是陷阱才有的概念（DMG 第 5 章陷阱）；自然危害（霉菌、流沙等）书上本来就没有
    const traps = hazards.filter((h) => h.data.hazardKind === 'trap')
    const noRating = traps.filter((h) => !arr(h.data.rating).length)
    rec2.stat('c9', 'traps', traps.length)
    rec2.stat('c9', 'hazardsWithRating', hazards.length - hazards.filter((h) => !arr(h.data.rating).length).length)
    rec2.stat('c9', 'hazardsWithTrigger', hazards.filter((h) => h.data.trigger !== undefined).length)
    rec2.stat('c9', 'hazardsWithCountermeasures', hazards.filter((h) => h.data.countermeasures !== undefined).length)
    const diseases = l.of('disease')
    rec2.stat('c9', 'diseases', diseases.length)
    const diseaseNoEffects = diseases.filter((d) => !arr(d.data.effects).length)
    // c10 物件、载具
    const objs = [...l.of('object'), ...l.of('vehicle')]
    rec2.stat('c10', 'objectsAndVehicles', objs.length)
    const noStats = objs.filter((o) => typeof o.data.ac !== 'number' || typeof o.data.hp !== 'number')
    const badImmune = objs.filter((o) => strs(o.data.immune).some((x) => !DAMAGE.includes(x)))
    const withActionsNoAct = objs.filter((o) => arr(o.data.actions).length && !arr(o.data.actions).map(rec).some((a) => arr(a.activities).length))
    rec2.stat('c10', 'objectsWithTextOnlyActions', withActionsNoAct.length)
    for (const [id, arrx] of Object.entries({
      'c7-part-action-text-only': noAct.map((p) => `${p.id} ${p.name}`),
      'c9-hazard-no-rating': noRating.map((h) => `${h.id} ${h.name}`),
      'c9-disease-no-effects': diseaseNoEffects.map((d) => `${d.id} ${d.name}`),
      'c10-object-no-stats': noStats.map((o) => `${o.id} ${o.name}`),
      'c10-object-immune-text': badImmune.map((o) => `${o.id} ${o.name}`),
      'c10-object-actions-text-only': withActionsNoAct.map((o) => `${o.id} ${o.name}`),
    })) if (arrx.length) add(id, arrx.join('\u0000')) // 占位，下面展开
    void bad
    const out: Record<string, string[]> = {
      'c7-part-action-text-only': noAct.map((p) => `${p.id} ${p.name}`),
      'c9-hazard-no-rating': noRating.map((h) => `${h.id} ${h.name}`),
      'c9-disease-no-effects': diseaseNoEffects.map((d) => `${d.id} ${d.name}`),
      'c10-object-no-stats': noStats.map((o) => `${o.id} ${o.name}`),
      'c10-object-immune-text': badImmune.map((o) => `${o.id} ${o.name}`),
      'c10-object-actions-text-only': withActionsNoAct.map((o) => `${o.id} ${o.name}`),
    }
    const NOTE: Record<string, string> = {
      'c7-part-action-text-only': '怪物部件里的“动作”只有文字效应与每回合伤害估值（dpr），没有结构化行动；用于 A10 DM 工具（怪物制作）时才需要，现在当文字查阅用',
      'c9-hazard-no-rating': '陷阱没有危险等级（轻微/危险/致命 + 等级段）：塌方、落网、喷火雕像、陷坑、毒镖、毒针陷阱、滚石、湮灭法球共 8 个；遭遇预算算不出（自然危害书上本来就没有等级，不算）', 'c9-disease-no-effects': '疾病的效果只有文字（不少是“检定劣势”，可映射到优势/劣势效果）',
      'c10-object-no-stats': '物件/载具缺护甲等级或生命值（星界帆船、星界快艇、位面掠夺者的载具数据在别处）', 'c10-object-immune-text': '物件/载具免疫写成了文字', 'c10-object-actions-text-only': '物件/载具的攻击（弩炮、投石机等）只有文字，没有结构化行动，战斗里无法一键攻击',
    }
    const KIND: Record<string, 'data-defect' | 'decision'> = { 'c7-part-action-text-only': 'decision', 'c9-disease-no-effects': 'decision' }
    for (const [k, ids] of Object.entries(out)) if (ids.length) rec2.find({ id: k, check: /^c\d+/.exec(k)![0], kind: KIND[k] ?? 'data-defect', fixSource: KIND[k] ? 'decision' : 'self-structure', entries: ids, expected: 'DMG、MM、GoS 各条目原文', note: NOTE[k] })
    expect(rec2.settle()).toEqual([])
  })
})
