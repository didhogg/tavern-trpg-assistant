import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib, type Lib, type Row } from './consumer/load'
import { has5etools, raw5e } from './consumer/ref5etools'
import { arr, fold, rec, str, strs } from './consumer/util'

interface Join { from: Row; to: string; level?: number; as: string; replaces?: string; pool?: string }
const joinsOf = (l: Lib): Join[] => l.rows.flatMap((r) => arr(r.data.joins).map(rec).map((j) => ({ from: r, to: str(j.to), level: typeof j.level === 'number' ? j.level : undefined, as: str(j.as), replaces: str(j.replaces) || undefined, pool: str(j.pool) || undefined })))

/** 读法（人物模块照这个读）：某职业/子职业某级的可选特性 = 登记指向它、as=optional、等级相同的特性 */
export const optionalAt = (l: Lib, target: string, level: number): Row[] => joinsOf(l).filter((j) => j.to === target && j.as === 'optional' && j.level === level).map((j) => j.from)
/** 某选择池的选项 = 池里原有的 + as=option 指向该子职业的特性 */
export function optionsAt(l: Lib, subclass: string, level: number): string[] {
  const own = arr(l.need(subclass).data.advancement).map(rec).filter((a) => a.kind === 'itemChoice' && a.level === level).flatMap((a) => strs(a.pool))
  return [...new Set([...own, ...joinsOf(l).filter((j) => j.to === subclass && j.as === 'option' && j.level === level).map((j) => j.from.id)])]
}

describe('G2a 跨包登记 joins（a11）', () => {
  it('塔莎的可选职业特性与子职业变体、剑湾的图腾选项，与 5etools 原始数据对得上', () => {
    const l = lib()
    const rec2 = new Recorder('g2a-joins')
    const js = joinsOf(l)
    rec2.stat('a11', 'joins.optional', js.filter((j) => j.as === 'optional').length)
    rec2.stat('a11', 'joins.option', js.filter((j) => j.as === 'option').length)
    // 每条登记的目标都存在（G1 的安装校验也查，这里是读取器自己再查一遍）
    expect(js.filter((j) => !l.get(j.to)).map((j) => j.from.id)).toEqual([])
    if (has5etools()) {
      const classNameToId = new Map(l.of('class').map((c) => [c.name, c.id]))
      const missing: string[] = []
      let want = 0
      for (const f of ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard']) {
        const d = rec(raw5e(`class/class-${f}.json`))
        for (const cf of arr(d.classFeature).map(rec)) {
          if (!cf.isClassFeatureVariant) continue
          want++
          const cid = classNameToId.get(str(cf.className))
          const hit = js.find((j) => j.to === cid && j.as === 'optional' && j.level === cf.level && fold(j.from.nameEn ?? '') === fold(str(cf.ENG_name)))
          if (!hit) missing.push(`${str(cf.className)} ${cf.level}级 ${str(cf.name)}`)
        }
        // 子职业变体：只看我们收录的书（PSA 不在其中）
        const seen = new Set<string>()
        for (const x of arr(d.subclassFeature).map(rec)) {
          if (!x.isClassFeatureVariant || !['PHB', 'XGE', 'SCAG', 'TCE', 'DMG'].includes(str(x.subclassSource))) continue
          const k = `${str(x.className)}|${str(x.subclassShortName)}|${str(x.subclassSource)}`
          if (seen.has(k)) continue
          seen.add(k)
          want++
          const sub = l.of('subclass').find((s) => s.name.startsWith(str(x.subclassShortName)) && str(rec(s.data.src).book) === str(x.subclassSource) && classNameToId.get(str(x.className)) === s.data.classId)
          if (!sub || !js.some((j) => j.to === sub.id && j.as === 'optional' && j.level === x.level)) missing.push(`${k} ${x.level}级 ${str(x.name)}`)
        }
      }
      rec2.stat('a11', 'expectedOptional', want)
      if (missing.length) rec2.find({ id: 'a11-optional-missing', check: 'a11', kind: 'data-defect', fixSource: 'import-5etools', entries: missing, expected: '5etools 原始数据（isClassFeatureVariant，对应 TCE 可选职业特性与子职业变体）', note: '原始数据里有、但没有被登记到对应职业/子职业该级的可选特性' })
    }
    // 剑湾图腾：图腾武者 3/6/14 级的选择池 = 熊、鹰、狼（PHB）+ 麋鹿、猛虎（SCAG）
    const totem = 'subclass.barbarian-path-of-the-totem-warrior.phb'
    const bad: string[] = []
    for (const lv of [3, 6, 14]) {
      const got = optionsAt(l, totem, lv).map((id) => fold(l.get(id)?.nameEn ?? id))
      const need = ['bear', 'eagle', 'wolf', 'elk', 'tiger']
      if (!need.every((n) => got.some((g) => g.includes(n)))) bad.push(`图腾武者 ${lv}级 现有：${got.join(',')}`)
    }
    rec2.stat('a11', 'totemLevels', 3)
    if (bad.length) rec2.find({ id: 'a11-totem', check: 'a11', kind: 'data-defect', fixSource: 'self-structure', entries: bad, expected: 'PHB 图腾武者 + SCAG 麋鹿与猛虎', note: '图腾武者某级的选择池读不出五种图腾' })
    expect(rec2.settle()).toEqual([])
  })
})
