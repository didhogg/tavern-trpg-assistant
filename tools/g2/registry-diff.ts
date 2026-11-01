import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * T2 登记对比：工作区的 G2 发现登记表 vs `HEAD`。
 *   npx tsx tools/g2/registry-diff.ts --groups <组,组> --allow "<发现id>=<之后的数量>,…"
 *   npx tsx tools/g2/registry-diff.ts --show          （只显示全部变化，不判定）
 *   加 --base <提交>：改成和那个提交比（默认 HEAD）。站内巡检用：`--base <本站起点提交> --show` 看本站累计变化。
 * 规则：① --groups 以外的登记组有变化 → 失败；② 组内发现的变化只有 --allow 列出的才允许，且之后的数量必须等于给定值（0＝整项消失），
 *      其它发现变化、任何新发现 → 失败；③ 统计（stats）与说明文字的变化只打印，不失败（报告里要逐条解释）。
 */
interface Finding { id: string; count: number; entries: string[]; note?: string; expected?: string }
interface Registry { group: string; stats: Array<{ check: string; key: string; value: number }>; findings: Finding[] }

const REL = 'docs/probes/D1.2-G2_发现登记'
const DIR = join(process.cwd(), REL)

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}

function arg0(name: string): string | undefined {
  const i = process.argv.indexOf(name)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const BASE = arg0('--base') ?? 'HEAD'

function headOf(group: string): Registry | undefined {
  try {
    return JSON.parse(execFileSync('git', ['show', `${BASE}:${REL}/${group}.json`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 })) as Registry
  } catch {
    return undefined // HEAD 里没有这个组（新增的组）
  }
}

const now = new Map<string, Registry>()
for (const f of existsSync(DIR) ? readdirSync(DIR).filter((x) => x.endsWith('.json')) : []) now.set(f.slice(0, -5), JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Registry)
const headGroups = execFileSync('git', ['ls-tree', '--name-only', `${BASE}:${REL}`], { encoding: 'utf8' }).split('\n').filter((x) => x.endsWith('.json')).map((x) => x.slice(0, -5))
const groups = [...new Set([...now.keys(), ...headGroups])].sort()

const show = process.argv.includes('--show')
const scope = new Set((arg('--groups') ?? '').split(',').map((x) => x.trim()).filter(Boolean))
const allow = new Map<string, number>()
for (const part of (arg('--allow') ?? '').split(',').map((x) => x.trim()).filter(Boolean)) {
  const m = /^([a-z0-9-]+)=(\d+)$/i.exec(part)
  if (!m) { console.error(`--allow 写法不对：「${part}」，应为 发现id=数量`); process.exit(2) }
  allow.set(m[1], Number(m[2]))
}

const failures: string[] = []
const infos: string[] = []
const touchedAllow = new Set<string>()
for (const g of groups) {
  const a = headOf(g)
  const b = now.get(g)
  const lines: string[] = []
  const fa = new Map((a?.findings ?? []).map((f) => [f.id, f]))
  const fb = new Map((b?.findings ?? []).map((f) => [f.id, f]))
  for (const id of new Set([...fa.keys(), ...fb.keys()])) {
    const x = fa.get(id)
    const y = fb.get(id)
    if (x && y && x.count === y.count && JSON.stringify(x.entries) === JSON.stringify(y.entries)) {
      if (x.note !== y.note || x.expected !== y.expected) lines.push(`  说明文字变了（不判定）：${id}`)
      continue
    }
    const after = y?.count ?? 0
    const text = `${id}：${x?.count ?? '（无）'} → ${y ? y.count : '消失'}`
    if (!x) { lines.push(`  ✗ 新发现 ${text}`); failures.push(`${g}：新发现 ${id}`); continue }
    if (!allow.has(id)) { lines.push(`  ${show ? '·' : '✗'} ${text}`); if (!show) failures.push(`${g}：${id} 变了但不在 --allow 里`); continue }
    touchedAllow.add(id)
    if (allow.get(id) === after) lines.push(`  ✓ ${text}`)
    else { lines.push(`  ✗ ${text}（--allow 要求 ${allow.get(id)}）`); failures.push(`${g}：${id} 之后是 ${after}，--allow 要求 ${allow.get(id)}`) }
  }
  const sa = new Map((a?.stats ?? []).map((s) => [`${s.check}|${s.key}`, s.value]))
  const sb = new Map((b?.stats ?? []).map((s) => [`${s.check}|${s.key}`, s.value]))
  for (const k of new Set([...sa.keys(), ...sb.keys()])) if (sa.get(k) !== sb.get(k)) lines.push(`  统计 ${k}：${sa.get(k) ?? '（无）'} → ${sb.get(k) ?? '（无）'}`)
  if (!lines.length) continue
  const inScope = show || scope.has(g)
  if (!inScope) failures.push(`${g}：不在 --groups 里却有变化`)
  infos.push(`${inScope ? '' : '✗ '}[${g}]${inScope ? '' : '（不在 --groups 里）'}\n${lines.join('\n')}`)
}
for (const id of allow.keys()) if (!show && !touchedAllow.has(id)) failures.push(`--allow 里的 ${id} 没有发生变化（写错了，或这一步没做）`)
console.log(infos.length ? infos.join('\n') : '登记表与 HEAD 完全一致')
if (failures.length) { console.log(`\n失败 ${failures.length} 项：\n- ${failures.join('\n- ')}`); process.exit(1) }
console.log(show ? '\n（--show：只显示，不判定）' : '\n通过')
