import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { arr, rec, str } from './util'

/** 本地核对材料：5etools 原始数据（不是构建输出）。不存在时返回 undefined，对应测试跳过。 */
const DIR = join(process.cwd(), 'reference', '5etools-cn-main（数据库）', 'data')
export const has5etools = (): boolean => existsSync(join(DIR, 'class', 'class-cleric.json'))
export const raw5e = (rel: string): unknown => JSON.parse(readFileSync(join(DIR, rel), 'utf8'))

export interface RawSubclass { name: string; source: string; className: string; copy: boolean; spellsByLevel: Record<string, string[]> }

/** 取各职业文件里子职业“扩展法术”（prepared、expanded 两种具名列表）；有 _copy 的不取（原始数据不展开）。 */
export function rawSubclasses(): RawSubclass[] {
  const out: RawSubclass[] = []
  for (const cls of ['artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard']) {
    const d = rec(raw5e(`class/class-${cls}.json`))
    for (const s of arr(d.subclass).map(rec)) {
      const by: Record<string, string[]> = {}
      for (const blk of arr(s.additionalSpells).map(rec)) for (const mode of ['prepared', 'expanded']) {
        const v = blk[mode]
        if (Array.isArray(v)) {
          for (const sp of v) {
            const o = rec(sp)
            for (const [lv, list] of Object.entries(o)) if (Array.isArray(list)) (by[lv] ??= []).push(...list.filter((x): x is string => typeof x === 'string'))
          }
        } else for (const [lv, list] of Object.entries(rec(v))) if (Array.isArray(list)) (by[lv] ??= []).push(...list.filter((x): x is string => typeof x === 'string'))
      }
      out.push({ name: str(s.name), source: str(s.source), className: str(s.className), copy: '_copy' in s, spellsByLevel: by })
    }
  }
  return out
}
export const cleanSpellName = (s: string): string => s.replace(/#c$/, '').replace(/\|.*$/, '').trim()
