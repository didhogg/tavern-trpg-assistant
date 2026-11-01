import { describe, expect, it } from 'vitest'
import { Recorder } from './consumer/findings'
import { lib } from './consumer/load'
import { arr, rec, str, strs } from './consumer/util'

const SCHOOLS = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation']
const RARITY = ['none', 'common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact', 'varies']
const SIZES = ['T', 'S', 'M', 'L', 'H', 'G']
const HAN = /[㐀-鿿]/

/** 全库搜索与选择器（d4–d6）：每类条目的筛选字段、中英文名、来源页码、重印旧版。 */
describe('G2d 搜索与筛选字段（d4 d5 d6）', () => {
  it('筛选字段齐全合法；中英文名；编号唯一', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-search')
    const bad: Record<string, string[]> = {}
    const add = (k: string, s: string): void => { (bad[k] ??= []).push(s) }
    rec2.stat('d4', 'entries', l.rows.length)
    // 编号全库唯一（Lib 按编号建索引，重复会互相覆盖）
    rec2.stat('d4', 'distinctIds', l.byId.size)
    if (l.byId.size !== l.rows.length) add('id-duplicate', `${l.rows.length - l.byId.size} 个编号重复`)
    let findable = 0
    let optionalNoOwner = 0
    for (const r of l.rows) {
      const tag = `${r.id} ${r.name}`
      if (!r.nameEn) add('name-en-missing', tag)
      else if (HAN.test(r.nameEn)) add('name-en-has-han', `${tag}：${r.nameEn}`)
      if (!r.summary.trim()) add('summary-missing', tag)
      // 关键词里要有英文名（系列物品的英文名带 “(Family)” 后缀，关键词里是不带后缀的，算有）
      if (r.nameEn && !r.keywords.some((k) => k === r.nameEn || r.nameEn!.startsWith(k + ' ('))) add('keywords-miss-name-en', tag)
      // 搜索：用自己的中文名、英文名都能搜到自己
      const hit = (q: string): boolean => r.name.includes(q) || (r.nameEn ?? '').toLowerCase().includes(q.toLowerCase()) || r.keywords.some((k) => k.toLowerCase().includes(q.toLowerCase()))
      if (hit(r.name) && (!r.nameEn || hit(r.nameEn))) findable++
      const d = r.data
      switch (r.type) {
        case 'spell':
          if (!(Number.isInteger(d.level) && Number(d.level) >= 0 && Number(d.level) <= 9)) add('spell-level', tag)
          if (!SCHOOLS.includes(str(d.school))) add('spell-school', tag)
          if (!strs(d.classes).length && !strs(d.subclasses).length) add('spell-no-class', tag)
          if (typeof d.ritual !== 'boolean') add('spell-ritual', tag)
          if (!arr(d.duration).length) add('spell-duration', tag)
          break
        case 'item':
          if (!str(d.category)) add('item-category', tag)
          if (!RARITY.includes(str(d.rarity))) add('item-rarity', `${tag}：${str(d.rarity)}`)
          if (typeof rec(d.attunement).required !== 'boolean') add('item-attunement', tag)
          break
        case 'monster':
          if (!Number.isFinite(typeof d.cr === 'number' ? d.cr : Number(rec(d.cr).value))) add('monster-cr', tag)
          if (!str(rec(d.creatureType).type)) add('monster-type', tag)
          if (!arr(d.size).length || !arr(d.size).every((x) => SIZES.includes(String(x)))) add('monster-size', tag)
          break
        case 'feature':
          // 可选特性（魔能祈唤、战斗风格、战技、元素之道……）不属于某个职业，靠 featureType/optionKind 筛选；其他特性必须有所属条目
          if (d.optional === true && d.owner === undefined) { if (!str(d.featureType) && !arr(d.optionKind).length) add('optional-feature-no-kind', tag); optionalNoOwner++ }
          else if (!l.get(str(rec(d.owner).id))) add('feature-owner', tag)
          break
        case 'subclass':
          if (l.get(str(d.classId))?.type !== 'class') add('subclass-class', tag)
          break
        case 'subrace':
          if (l.get(str(d.parentRace))?.type !== 'race') add('subrace-race', tag)
          break
        default:
      }
    }
    rec2.stat('d4', 'findableByOwnNames', findable)
    rec2.stat('d4', 'optionalFeaturesWithoutOwner', optionalNoOwner)
    const NOTE: Record<string, string> = {
      'id-duplicate': '条目编号重复', 'name-en-missing': '没有英文名', 'name-en-has-han': '英文名里有汉字', 'summary-missing': '没有摘要', 'keywords-miss-name-en': '关键词里没有英文名（搜英文名搜不到）',
      'spell-level': '法术环级不合法', 'spell-school': '法术学派不合法', 'spell-no-class': '法术没有任何职业', 'spell-ritual': '法术仪式标记不是布尔', 'spell-duration': '法术没有持续时间',
      'item-category': '物品没有类别', 'item-rarity': '物品稀有度不合法', 'item-attunement': '物品同调标记不是布尔', 'monster-cr': '怪物挑战等级读不出', 'monster-type': '怪物没有类型', 'monster-size': '怪物体型不合法',
      'feature-owner': '特性的所属条目不存在', 'optional-feature-no-kind': '可选特性没有 featureType/optionKind，无法按类别筛选', 'subclass-class': '子职业的职业不存在', 'subrace-race': '亚种的种族不存在',
    }
    for (const [k, ids] of Object.entries(bad)) rec2.find({ id: `d4-${k}`, check: 'd4', kind: 'data-defect', fixSource: 'self-structure', entries: ids, expected: '格式定义与条目库', note: NOTE[k], selfCheck: true })
    expect(rec2.settle()).toEqual([])
  })

  it('来源页码缺失分类（d5）', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-pages')
    const noPage = new Map<string, string[]>()
    for (const r of l.rows) {
      const src = rec(r.data.src)
      if (typeof src.page === 'number' && src.page > 0) continue
      noPage.set(r.type, [...(noPage.get(r.type) ?? []), `${r.id} ${r.name}`])
    }
    rec2.stat('d5', 'entriesWithoutPage', [...noPage.values()].reduce((a, v) => a + v.length, 0))
    for (const [t, v] of noPage) rec2.stat('d5', `withoutPage.${t}`, v.length)
    // 分类：背景描述补丁（lore）的页码就是被补充条目的页码，可继承；怪物部件来自 DMG“创建怪物”一章的表，页码在表上；书章（book）本来就没有页；规则 7 条、表 76 条需要补
    const lore = noPage.get('lore') ?? []
    const parts = noPage.get('monsterPart') ?? []
    const books = noPage.get('book') ?? []
    const tables = noPage.get('table') ?? []
    const rules = noPage.get('rule') ?? []
    rec2.find({ id: 'd5-lore-inherit', check: 'd5', kind: 'decision', fixSource: 'decision', entries: [`${lore.length} 条背景描述补丁没有页码`], expected: '补丁的目标条目的页码', note: '背景描述补丁（lore）不是独立的书页内容，页码应取被补充条目的页码；推荐：显示时继承目标的页码，不写进补丁（从简）' })
    rec2.find({ id: 'd5-monsterpart-page', check: 'd5', kind: 'decision', fixSource: 'decision', entries: [`${parts.length} 个怪物部件没有页码`], expected: 'DMG 第 9 章“创建怪物”', note: '怪物部件是 DMG“创建怪物数据卡”表格里的碎片，页码在表上（DMG 第 275 页起）；推荐：不补' })
    rec2.find({ id: 'd5-book-chapters', check: 'd5', kind: 'source-defect', fixSource: 'decision', entries: books, expected: 'R12 已知：14 个缺页章（书中该章没有页码）', note: '书的章节没有页码，来源如此' })
    if (tables.length) rec2.find({ id: 'd5-table-page', check: 'd5', kind: 'data-defect', fixSource: 'import-5etools', entries: tables, expected: '5etools 原始表格数据的 page', note: '76 张表没有页码；多数是各书“来源章节”里的表，5etools 原始数据里有页码时补上' })
    if (rules.length) rec2.find({ id: 'd5-rule-page', check: 'd5', kind: 'data-defect', fixSource: 'import-5etools', entries: rules, expected: '5etools 原始规则数据的 page', note: '7 条规则没有页码' })
    expect(rec2.settle()).toEqual([])
  })

  it('重印旧版与版本组（d6）', () => {
    const l = lib()
    const rec2 = new Recorder('g2d-versions')
    const SELECTABLE = ['spell', 'monster', 'item', 'race', 'class', 'subclass', 'feat', 'background']
    const groups = new Map<string, typeof l.rows>()
    for (const r of l.rows) { const g = str(r.data.versionGroup); if (g) groups.set(g, [...(groups.get(g) ?? []), r]) }
    rec2.stat('d6', 'versionGroups', groups.size)
    // 版本组 = 同一生物的变体（妖鬼婆及其集会形态、变形生物的各形态），不是“重印”；重印用 supersededBy
    const noOldInGroup = [...groups.values()].filter((v) => !v.some((x) => x.data.supersededBy !== undefined)).length
    rec2.stat('d6', 'versionGroupsWithoutSuperseded', noOldInGroup)
    // 同名同类型、都没标旧版：选择器默认隐藏旧版时，这些会同时出现
    const byName = new Map<string, typeof l.rows>()
    for (const r of l.rows) if (SELECTABLE.includes(r.type)) { const k = `${r.type}|${r.name}`; byName.set(k, [...(byName.get(k) ?? []), r]) }
    const ambiguous = [...byName.values()].filter((v) => v.length > 1 && v.filter((x) => x.data.supersededBy === undefined).length > 1)
    rec2.stat('d6', 'sameNameGroups', [...byName.values()].filter((v) => v.length > 1).length)
    rec2.stat('d6', 'sameNameWithoutOldMarker', ambiguous.length)
    const bySource = new Map<string, number>()
    for (const v of ambiguous) { const k = `${v[0].type}:${v.map((x) => x.id.split('.').pop()).sort().join('+')}`; bySource.set(k, (bySource.get(k) ?? 0) + 1) }
    for (const [k, n] of bySource) rec2.stat('d6', `ambiguous.${k}`, n)
    rec2.find({ id: 'd6-same-name-no-marker', check: 'd6', kind: 'data-defect', fixSource: 'import-5etools', entries: ambiguous.map((v) => `${v[0].type} ${v[0].name}：${v.map((x) => x.id).join(' / ')}`), expected: '5etools 原始数据 reprintedAs（后出版本取代前一版）', note: '同类型同名、都没有标旧版：全库搜索与选择器默认隐藏旧版时，这几对会同时出现（例：格龙蛙人 VGM 与 MPMM、万象无常牌 DMG 与 BMT）；MPMM 重印了 VGM/MTF 的怪物和种族，5etools 原始数据里 VGM 的 143 个怪物有 124 个带“重印为”，应据此把前一版标 supersededBy；物品的几对（芦笛等）原始数据没有标记，需手工核对' })
    expect(rec2.settle()).toEqual([])
  })
})
