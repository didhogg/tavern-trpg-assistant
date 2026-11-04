import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { REF_FOUNDRY_SYSTEM } from '../../../tools/data/lib/io'

/** 本地核对材料：Foundry dnd5e 系统的 SRD 数据（packs/_source）。不存在时 hasFoundry() 为 false。 */
const ROOT = join(REF_FOUNDRY_SYSTEM, 'packs', '_source')
export const hasFoundry = (): boolean => existsSync(join(ROOT, 'classfeatures'))

export interface FoundryUses { name: string; file: string; max?: string; periods: string[] }

function walk(dir: string, out: string[]): string[] {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (n.endsWith('.yml') && !n.startsWith('_')) out.push(p)
  }
  return out
}

/** 极简 YAML 扫描：只取第一个 `  uses:`（system.uses）下的 max 与 recovery 的 period。 */
export function foundryUses(folders: string[] = ['classfeatures', 'races', 'subclasses']): FoundryUses[] {
  const out: FoundryUses[] = []
  for (const f of folders) {
    const dir = join(ROOT, f)
    if (!existsSync(dir)) continue
    for (const file of walk(dir, [])) {
      const lines = readFileSync(file, 'utf8').split('\n')
      const name = /^name:\s*(.+)$/m.exec(lines.join('\n'))?.[1]?.replace(/^['"]|['"]$/g, '')
      const i = lines.findIndex((l) => /^ {2}uses:\s*$/.test(l))
      if (!name || i < 0) continue
      let max: string | undefined
      const periods: string[] = []
      for (let k = i + 1; k < lines.length && /^ {4}|^\s*$/.test(lines[k]); k++) {
        const mm = /^ {4}max:\s*(.*)$/.exec(lines[k])
        if (mm) max = mm[1].replace(/^['"]|['"]$/g, '')
        const pm = /^\s+- period:\s*(\w+)/.exec(lines[k])
        if (pm) periods.push(pm[1])
      }
      // Foundry 每个特性都带一个空的 uses（max 为空、recovery 为空）；只有真正有次数或恢复的才算
      if (!max && periods.length === 0) continue
      out.push({ name, file: file.slice(ROOT.length + 1), max, periods })
    }
  }
  return out
}
