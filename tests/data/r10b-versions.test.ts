import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { describe, expect, it } from 'vitest'
import { BOOKS, SRD_PACK_ID } from '../../tools/data/config/books'
import { applyVersionMods, expandVersions } from '../../tools/data/extract/versions'
import type { Entry } from '../../src/schemas/pack'

const ROOT = process.cwd()
const file = (id: string): string => (id === SRD_PACK_ID ? join(ROOT, 'packs', `${SRD_PACK_ID}.trpgpack`) : join(ROOT, '..', 'tavern-trpg-data', 'packs', 'dnd5e2014', `${id}-${BOOKS.find((x) => x.packId === id)!.version}.trpgpack`))
async function load(): Promise<Map<string, Entry>> {
  const all = new Map<string, Entry>()
  for (const id of [SRD_PACK_ID, ...BOOKS.map((x) => x.packId)]) {
    if (!existsSync(file(id))) throw new Error(`缺少 ${file(id)}`)
    for (const [name, data] of Object.entries(unzipSync(new Uint8Array(await readFile(file(id)))))) if (name.startsWith('entries/')) for (const e of JSON.parse(strFromU8(data)) as Entry[]) all.set(e.id, e)
  }
  return all
}
const d = (e: Entry | undefined): Record<string, unknown> => (e?.data ?? {}) as Record<string, unknown>
const names = (list: unknown): string[] => (Array.isArray(list) ? (list as Array<{ name: string }>).map((x) => x.name) : [])

describe('R10b 备选版本与 versionGroup', () => {
  it('数量：58 个版本组、212 个条目带 versionGroup（基础 53 + 备选 159），备选版本全部有存在的组', async () => {
    const all = await load()
    const grouped = [...all.values()].filter((e) => d(e).versionGroup)
    expect(grouped).toHaveLength(212)
    expect(new Set(grouped.map((e) => d(e).versionGroup)).size).toBe(58)
    for (const e of grouped) expect(all.has(d(e).versionGroup as string), `${e.id} → ${String(d(e).versionGroup)}`).toBe(true)
    const generated = grouped.filter((e) => e.id !== d(e).versionGroup)
    expect(generated.filter((e) => e.type === 'monster')).toHaveLength(126)
    expect(generated.filter((e) => e.type === 'race')).toHaveLength(12)
    expect(grouped.filter((e) => e.type === 'subrace')).toHaveLength(21 + 0)
  })

  it('金样：_mod 的各种模式', async () => {
    const all = await load()
    expect(d(all.get('monster.living-star-necrotic.bmt')).versionGroup).toBe('monster.living-portent.bmt')
    expect(all.get('monster.living-star-necrotic.bmt')!.name).toBe('活体星辰（暗蚀）')
    expect(names(d(all.get('monster.duodrone.mm')).traits)).toContain('公理之念')
    expect(names(d(all.get('monster.duodrone-rogue.mm')).traits)).not.toContain('公理之念')
    expect(names(d(all.get('monster.aberrant-spirit-beholderkin.tce')).actions)).toContain('眼波射线')
    expect(JSON.stringify(d(all.get('monster.archmage-familiar.mm')).spellcasting)).toContain('寻获魔宠')
    expect(JSON.stringify(d(all.get('monster.archmage.mm')).spellcasting)).not.toContain('寻获魔宠')
    expect(all.get('race.aasimar-necrotic-shroud.mpmm')!.name).toBe('阿斯莫; 死灵斗篷')
    expect(d(all.get('race.aasimar-necrotic-shroud.mpmm')).versionGroup).toBe('race.aasimar.mpmm')
  })

  it('龙裔 10 种颜色各一个亚种族，名称不重复拼接父种族', async () => {
    const all = await load()
    const colors = [...all.values()].filter((e) => e.type === 'subrace' && /^subrace\.dragonborn-dragonborn-/.test(e.id))
    expect(colors.map((e) => e.name).sort()).toEqual(['龙裔 (赤铜)', '龙裔 (蓝)', '龙裔 (绿)', '龙裔 (青铜)', '龙裔 (金)', '龙裔 (红)', '龙裔 (黑)', '龙裔 (黄铜)', '龙裔 (银)', '龙裔 (白)'].sort())
    expect(new Set(colors.map((e) => d(e).versionGroup)).size).toBe(1)
  })

  it('其他随版本补齐的数据：动作的所属变体规则 8 条，怪物标签不再因缺 environment 丢失', async () => {
    const all = await load()
    const actions = [...all.values()].filter((e) => typeof d(e).fromVariantRule === 'string')
    expect(actions).toHaveLength(8)
    for (const e of actions) expect(all.has(d(e).fromVariantRule as string)).toBe(true)
    expect(d(all.get('monster.aberrant-spirit-beholderkin.tce')).tags).toEqual(expect.arrayContaining(['Y']))
  })

  it('版本引擎：正则 replaceTxt、null 删除字段、renameArr、addSpells 无法执行时登记', () => {
    const base = { ENG_name: 'A', name: '甲', source: 'MM', variant: [{}], trait: [{ name: '旧', entries: ['Radiant light'] }], spellcasting: [{ spells: { 1: { spells: ['x'] } } }], _versions: [
      { ENG_name: 'A2', name: '甲二', source: 'MM', variant: null, _mod: { '*': { mode: 'replaceTxt', replace: '\\bRadiant\\b', with: 'Necrotic' }, trait: { mode: 'renameArr', renames: { rename: '旧', with: '新' } }, _: { mode: 'addSpells', spells: { 1: { spells: ['y'] } }, will: ['z'] } } },
    ] }
    const out = expandVersions([base])
    expect(out).toHaveLength(2)
    const v = out[1]
    expect(v.variant).toBeUndefined()
    expect(JSON.stringify(v.trait)).toContain('Necrotic light')
    expect((v.trait as Array<{ name: string }>)[0].name).toBe('新')
    expect(JSON.stringify(v.spellcasting)).toContain('"will":["z"]')
    expect(JSON.stringify((v.spellcasting as Array<{ spells: unknown }>)[0].spells)).toContain('"spells":["x","y"]')
    const sink: Array<{ mode: string }> = []
    applyVersionMods({ name: 'B', source: 'MM' }, { _: { mode: 'addSpells', will: ['q'] } }, sink as never)
    expect(sink.map((s) => s.mode)).toEqual(['addSpells'])
  })
})
