import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** G2 发现登记表：每个检查组一个 JSON 文件，测试把实时发现与登记表逐项比对。
 * 写入模式：G2_WRITE=1 npx vitest run --config vitest.data.config.ts tests/data/<文件>
 */
export type Kind = 'data-defect' | 'source-defect' | 'decision'
export type FixSource = 'import-5etools' | 'import-ref' | 'self-structure' | 'normalize' | 'reader-only' | 'decision'

export interface Finding {
  id: string
  check: string
  kind: Kind
  fixSource: FixSource
  count: number
  entries: string[]
  expected: string
  note: string
  selfCheck?: boolean
}
export interface Stat { check: string; key: string; value: number }
export interface Registry { group: string; stats: Stat[]; findings: Finding[] }

const DIR = join(process.cwd(), 'docs', 'probes', 'D1.2-G2_发现登记')
const FULL_DIR = join(process.cwd(), 'tools', 'data', 'out', 'g2-full')
const EXCLUDE_FILE = join(process.cwd(), 'docs', 'probes', 'D1.2-G2.5_登记排除.json')
const KEEP = 50

/** 「来源如此」：原书本来就没有这个值/本来就是这个写法，不是数据缺陷。只能由规划者加（见 00 红线）。 */
export interface Exclusion { finding: string; entry: string; reason: string; basis: string }
let exclusions: Exclusion[] | undefined
export function loadExclusions(): Exclusion[] {
  exclusions ??= existsSync(EXCLUDE_FILE) ? (JSON.parse(readFileSync(EXCLUDE_FILE, 'utf8')) as Exclusion[]) : []
  return exclusions
}

const file = (group: string): string => join(DIR, `${group}.json`)

export class Recorder {
  readonly stats: Stat[] = []
  readonly findings: Finding[] = []
  /** T3：每项发现的完整条目清单（登记只存前 50 个）；G2_WRITE=1 时写到 tools/data/out/g2-full/<组>.json（不入库）。 */
  private readonly full: Array<{ id: string; count: number; entries: string[] }> = []
  constructor(readonly group: string) {}

  stat(check: string, key: string, value: number): void { this.stats.push({ check, key, value }) }

  /** entries 可以很长；登记只存排序后的前 50 个，count 存总数。同一个 id 不能登记两次。 */
  find(f: Omit<Finding, 'count' | 'entries'> & { entries: string[] }): void {
    if (this.findings.some((x) => x.id === f.id)) throw new Error(`发现 ${f.id} 重复登记`)
    const skip = new Set(loadExclusions().filter((x) => x.finding === f.id).map((x) => x.entry))
    const kept = [...new Set(f.entries)].filter((line) => !skip.has(line.split(' ')[0]))
    const excluded = new Set(f.entries).size - kept.length
    if (excluded > 0) this.stat(f.check, `excluded-${f.id}`, excluded)
    if (kept.length === 0) return // 全部是「来源如此」：这一项发现不再登记
    const all = kept.sort()
    this.full.push({ id: f.id, count: all.length, entries: all })
    this.findings.push({ ...f, count: all.length, entries: all.slice(0, KEEP) })
  }

  private sortedOut(): Registry {
    const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)
    return {
      group: this.group,
      stats: [...this.stats].sort((a, b) => cmp(`${a.check}|${a.key}`, `${b.check}|${b.key}`)),
      findings: [...this.findings].sort((a, b) => cmp(`${a.check}|${a.id}`, `${b.check}|${b.id}`)),
    }
  }

  /** 与登记表比对；返回差异说明（空数组 = 一致）。G2_WRITE=1 时改为写入。 */
  settle(): string[] {
    const now = this.sortedOut()
    if (process.env.G2_WRITE === '1') {
      mkdirSync(DIR, { recursive: true })
      writeFileSync(file(this.group), JSON.stringify(now, null, 1) + '\n')
      mkdirSync(FULL_DIR, { recursive: true })
      writeFileSync(join(FULL_DIR, `${this.group}.json`), JSON.stringify({ group: this.group, findings: this.full }, null, 1) + '\n')
      return []
    }
    if (!existsSync(file(this.group))) return [`缺少登记表 ${this.group}.json；先用 G2_WRITE=1 生成`]
    const old = JSON.parse(readFileSync(file(this.group), 'utf8')) as Registry
    return diff(old, now)
  }
}

function diff(old: Registry, now: Registry): string[] {
  const out: string[] = []
  const oldF = new Map(old.findings.map((f) => [f.id, f]))
  const nowF = new Map(now.findings.map((f) => [f.id, f]))
  for (const [id, f] of nowF) {
    const o = oldF.get(id)
    if (!o) out.push(`新发现未登记：${id}（${f.check}，${f.count} 个）`)
    else if (JSON.stringify(o) !== JSON.stringify(f)) out.push(`发现 ${id} 与登记不一致：登记 ${o.count} 个，现在 ${f.count} 个`)
  }
  for (const id of oldF.keys()) if (!nowF.has(id)) out.push(`登记的发现 ${id} 这次没复现：已修复或检查失效，更新登记表`)
  const oldS = new Map(old.stats.map((s) => [`${s.check}|${s.key}`, s.value]))
  for (const s of now.stats) {
    const k = `${s.check}|${s.key}`
    if (!oldS.has(k)) out.push(`新统计未登记：${k}`)
    else if (oldS.get(k) !== s.value) out.push(`统计 ${k} 变了：登记 ${oldS.get(k)}，现在 ${s.value}`)
    oldS.delete(k)
  }
  for (const k of oldS.keys()) out.push(`登记的统计 ${k} 这次没有产生`)
  return out
}
