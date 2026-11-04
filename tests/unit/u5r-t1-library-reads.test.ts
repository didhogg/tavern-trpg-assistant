import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import type { ArchiveItem } from '../../src/ui/people/card/archive'
import { archiveHelpOf, archiveRefOf } from '../../src/ui/people/card/archiveRefs'
import { exhaustionRows, tableRefOf, type CardEntry } from '../../src/ui/people/card/cardData'

type Raw = { id: string; type: string; name: string; nameEn?: string; summary?: string; data: Record<string, unknown> }
const zip = unzipSync(new Uint8Array(readFileSync(join(process.cwd(), 'packs', 'dnd5e2014-srd.trpgpack'))))
const load = (name: string): Raw[] => JSON.parse(strFromU8(zip[`entries/${name}.json`]!)) as Raw[]
const view = (list: Raw[]): CardEntry[] => list.map((e) => ({ packId: 'dnd5e2014-srd', badge: 'SRD', entry: { ...e, keywords: [], unique: false } as unknown as CardEntry['entry'] }))
const pool = [...view(load('condition')), ...view(load('language')), ...view(load('rule'))]
const item = (group: ArchiveItem['group'], key: string, extra: Partial<ArchiveItem> = {}): ArchiveItem => ({ id: `${group}:${key}`, label: key, source: '手动添加', group, ...extra })

describe('T1：档案项对应库条目（取自真实 SRD 包）', () => {
  it('状态免疫、语言、感官都能找到库条目；写法不同（中文 / 英文旧写法）也认', () => {
    expect(archiveRefOf(item('condition', 'charmed'), pool)).toBe('condition.charmed.phb')
    expect(archiveRefOf(item('languages', 'common'), pool)).toBe('language.common.phb')
    expect(archiveRefOf(item('senses', '黑暗视觉 60 尺'), pool)).toBe('rule.sense-darkvision.phb')
    expect(archiveRefOf(item('senses', 'darkvision 60 ft.'), pool)).toBe('rule.sense-darkvision.phb')
    expect(archiveRefOf(item('senses', 'truesight 120 ft.'), pool)).toBe('rule.sense-truesight.phb')
  })
  it('找不到的返回 undefined，不编；武器直接用自带的条目编号', () => {
    expect(archiveRefOf(item('condition', 'nonexistent'), pool)).toBeUndefined()
    expect(archiveRefOf(item('resist', 'fire'), pool)).toBeUndefined()
    expect(archiveRefOf(item('weapons', 'x', { ref: 'item.longsword.phb' }), pool)).toBe('item.longsword.phb')
  })
  it('护甲按条目英文名对应物品类型规则；工具按英文名找物品；速查入口按英文名找 quickref', () => {
    const rule = (id: string, nameEn: string, category: string): CardEntry => ({ packId: 'p', badge: '', entry: { id, type: 'rule', name: nameEn, nameEn, keywords: [], unique: false, summary: '', data: { category } } as unknown as CardEntry['entry'] })
    const rules = [rule('rule.item-type-light-armor.phb', 'Light Armor', 'itemType'), rule('rule.item-type-shield.phb', 'Shield', 'itemType'), rule('rule.quickref-damage-and-healing.phb', 'Damage and Healing', 'quickref')]
    expect(archiveRefOf(item('armor', 'light'), rules)).toBe('rule.item-type-light-armor.phb')
    expect(archiveRefOf(item('armor', 'shield'), rules)).toBe('rule.item-type-shield.phb')
    const tool = { packId: 'p', badge: '', entry: { id: 'item.thieves-tools.phb', type: 'item', name: '盗贼工具', nameEn: "Thieves' Tools", keywords: [], unique: false, summary: '', data: {} } } as unknown as CardEntry
    expect(archiveRefOf(item('tools', "thieves' tools"), rules, [tool])).toBe('item.thieves-tools.phb')
    expect(archiveHelpOf('resist', rules)?.entry.id).toBe('rule.quickref-damage-and-healing.phb')
    expect(archiveHelpOf('tools', rules)).toBeUndefined()
  })
})

describe('T1：力竭每一级的文字取自库里的力竭表', () => {
  it('条件条目正文引用力竭表；表的每一行就是一级', () => {
    const cond = load('condition').find((e) => e.nameEn === 'Exhaustion')!
    const id = tableRefOf(cond.data.text)
    expect(id).toBe('table.exhaustion.phb')
    const table = load('table').find((e) => e.id === id)!
    const rows = exhaustionRows(table.data.rows)
    expect(rows.map((r) => r.level)).toEqual([1, 2, 3, 4, 5, 6])
    for (const r of rows) expect((table.data.rows as Array<{ cells: string[] }>)[r.level - 1]!.cells[1]!.trim()).toBe(r.text)
  })
  it('读不出来的行跳过', () => {
    expect(exhaustionRows([{ cells: ['x', 'y'] }, { cells: ['2'] }, { cells: ['3', ' 速度 '] }])).toEqual([{ level: 3, text: '速度' }])
    expect(exhaustionRows(undefined)).toEqual([])
  })
})

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|vue)$/.test(name)) out.push(p)
  }
  return out
}

describe('T1 防回退：界面与派生代码里不能再出现手写的规则出处与页码', () => {
  it('没有「玩家手册 / 怪物图鉴 / 地下城主指南」「PHB p17」「（p197）」这类手写出处', () => {
    const bad: string[] = []
    const pattern = /(玩家手册|怪物图鉴|地下城主指南|\b(?:PHB|DMG|MM) ?p\.? ?\d|[（(]p\d{2,3}(?:[–-]\d+)?[)）])/
    for (const file of [...walk(join(process.cwd(), 'src/ui')), ...walk(join(process.cwd(), 'src/rules/dnd5e2014/derive'))]) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        const code = line.replace(/\/\*.*?\*\//g, '').replace(/(^|\s)\/\/.*$/, '').trim()
        if (!code || code.startsWith('*') || code.startsWith('<!--')) return
        if (pattern.test(code)) bad.push(`${file.replace(process.cwd() + '/', '')}:${i + 1} ${code.slice(0, 80)}`)
      })
    }
    expect(bad).toEqual([])
  })
})
