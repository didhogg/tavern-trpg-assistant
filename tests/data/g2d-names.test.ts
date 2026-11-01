import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str } from './consumer/util'

/** 名字表（d3）：供 U6.2 加入人物时按种族（和性别）随机起名。 */
const GENDER: Array<[RegExp, string]> = [[/女/, 'female'], [/男/, 'male']]
const NAME_TITLE = /名字|姓名|名称|姓氏/

describe('G2d 名字表（d3）', () => {
  it('哪些种族有名字表、性别怎么读', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-names')
    const T = l.of('table')
    const names = T.filter((t) => t.data.kind === 'names')
    const nameLike = T.filter((t) => NAME_TITLE.test(t.name))
    rec2.stat('d3', 'namesKindTables', names.length)
    rec2.stat('d3', 'nameLikeTables', nameLike.length)
    const byRace = new Map<string, typeof T>()
    for (const t of nameLike) {
      const p = str(rec(t.data.parent).id)
      if (p.startsWith('race.')) byRace.set(p, [...(byRace.get(p) ?? []), t])
    }
    const races = l.of('race')
    const playable = races.filter((r) => !r.id.endsWith('.dmg') || true)
    rec2.stat('d3', 'races', races.length)
    rec2.stat('d3', 'racesWithNameTables', byRace.size)
    const withoutTables = playable.filter((r) => !byRace.has(r.id))
    // 性别：只写在表名里（“女性”“男性”“成年女性”“男性成人”），没有结构化字段
    let tagged = 0
    let unknownGender: string[] = []
    for (const ts of byRace.values()) for (const t of ts) {
      const g = GENDER.find(([re]) => re.test(t.name))
      if (g) tagged++
      else unknownGender.push(`${t.id} ${t.name}`)
    }
    rec2.stat('d3', 'raceNameTablesWithGenderInTitle', tagged)
    // 名字表的行：单列、每行一个名字，随机一行即可
    const multiCol = names.filter((t) => arr(t.data.cols).length !== 1)
    const emptyRows = names.filter((t) => arr(t.data.rows).some((r) => !String(arr(rec(r).cells)[0] ?? '').trim()))
    // 人类名字表有 34 张（按文化与性别）；半精灵没有自己的名字表（书上说用人类或精灵的）
    const humanTables = byRace.get('race.human.phb')?.length ?? 0
    rec2.stat('d3', 'humanNameTables', humanTables)
    unknownGender = unknownGender.filter((x) => !/氏族|家族|家庭|姓|族$|灰矮人族|暂借美善|称号|儿童|儿|名$/.test(x))
    rec2.find({ id: 'd3-races-without-name-table', check: 'd3', kind: 'decision', fixSource: 'decision', entries: withoutTables.map((r) => `${r.id} ${r.name}`), expected: 'PHB 第 2 章各种族“名字”小节（半精灵用人类或精灵的）；VGM、MPMM 各种族', note: `名字表只关联到 ${byRace.size} 个种族（PHB 的 9 个中 8 个，外加阿斯莫）；其余 ${withoutTables.length} 个种族（含 SCAG、VGM、MTF、MPMM 的种族和半精灵）没有名字表。加入人物时这些种族无法随机起名，推荐：没有名字表的种族回退到“人类”或其亲缘种族的名字表，不新增数据（从简）` })
    rec2.find({ id: 'd3-gender-in-title', check: 'd3', kind: 'decision', fixSource: 'decision', entries: ['性别只写在表名里（“女性”“男性”“成年女性”“男性成人”“氏族”“家庭”），没有结构化字段'], expected: '各名字表标题', note: '随机起名要“按性别取一行”时，读取器只能按表名里的“女/男”字判断；推荐：约定读取规则（表名含“女”= 女性、含“男”= 男性、其余 = 姓氏/氏族），不加字段（从简）' })
    if (multiCol.length) rec2.find({ id: 'd3-names-multi-col', check: 'd3', kind: 'data-defect', fixSource: 'self-structure', entries: multiCol.map((t) => `${t.id} ${t.name}`), expected: '名字表', note: '名字表不是单列' })
    if (emptyRows.length) rec2.find({ id: 'd3-names-empty-row', check: 'd3', kind: 'data-defect', fixSource: 'self-structure', entries: emptyRows.map((t) => `${t.id} ${t.name}`), expected: '名字表', note: '名字表里有空行' })
    if (unknownGender.length) rec2.find({ id: 'd3-title-unclear', check: 'd3', kind: 'decision', fixSource: 'decision', entries: unknownGender, expected: '各名字表标题', note: '表名读不出是男名、女名还是姓氏' })
    expect(rec2.settle()).toEqual([])
  })
})
