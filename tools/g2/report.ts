import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** 把 G2 发现登记表汇总成一份 Markdown（报告里“登记汇总”一节的来源）。运行：npx tsx tools/g2/report.ts [段落前缀，如 g2a] */
interface Finding { id: string; check: string; kind: string; fixSource: string; count: number; entries: string[]; expected: string; note: string; selfCheck?: boolean }
interface Stat { check: string; key: string; value: number }
interface Registry { group: string; stats: Stat[]; findings: Finding[] }

const DIR = join(process.cwd(), 'docs', 'probes', 'D1.2-G2_发现登记')
const prefix = process.argv[2] ?? 'g2a'
const KIND: Record<string, string> = { 'data-defect': '数据缺陷', 'source-defect': '来源本身的问题', decision: '需驾驶员决定' }
const FIX: Record<string, string> = { 'import-5etools': '5etools 里有，转换时补', 'import-ref': '参考材料里有', 'self-structure': '要自己结构化/对照原书改', normalize: '统一写法', 'reader-only': '读取器处理即可', decision: '待决定' }

const regs: Registry[] = readdirSync(DIR).filter((f) => f.startsWith(prefix) && f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Registry)
const checkNo = (c: string): number => Number(/\d+/.exec(c)?.[0] ?? 0)
const findings = regs.flatMap((r) => r.findings).sort((a, b) => checkNo(a.check) - checkNo(b.check) || a.check.localeCompare(b.check) || a.id.localeCompare(b.id))
const stats = regs.flatMap((r) => r.stats.map((s) => ({ ...s, group: r.group })))

const out: string[] = []
out.push(`<!-- 由 tools/g2/report.ts 生成，数字来自 docs/probes/D1.2-G2_发现登记/${prefix}*.json，不要手改 -->`)
const byKind = (k: string): Finding[] => findings.filter((f) => f.kind === k)
out.push(`发现共 ${findings.length} 项：数据缺陷 ${byKind('data-defect').length}、来源本身的问题 ${byKind('source-defect').length}、需驾驶员决定 ${byKind('decision').length}。`)
out.push('')
out.push('### 检查规模（统计）')
out.push('')
out.push('| 检查 | 项 | 数量 |')
out.push('|---|---|---|')
for (const s of [...stats].sort((a, b) => checkNo(a.check) - checkNo(b.check) || a.check.localeCompare(b.check) || a.key.localeCompare(b.key))) out.push(`| ${s.check} | ${s.key} | ${s.value} |`)
out.push('')
out.push('### 发现清单')
out.push('')
out.push('| 检查 | 编号 | 类别 | 个数 | 怎么修 | 说明 | 期望值来源 |')
out.push('|---|---|---|---|---|---|---|')
for (const f of findings) out.push(`| ${f.check} | ${f.id}${f.selfCheck ? '（自洽）' : ''} | ${KIND[f.kind]} | ${f.count} | ${FIX[f.fixSource]} | ${f.note} | ${f.expected} |`)
out.push('')
out.push('### 按“怎么修”汇总')
out.push('')
out.push('| 怎么修 | 项数 | 条目数合计 |')
out.push('|---|---|---|')
for (const k of Object.keys(FIX)) {
  const fs = findings.filter((f) => f.fixSource === k)
  if (fs.length) out.push(`| ${FIX[k]} | ${fs.length} | ${fs.reduce((a, f) => a + f.count, 0)} |`)
}
out.push('')
out.push('### 按 G2.5 的批次')
out.push('')
out.push('| 批次 | 项数 | 条目数合计 | 内容 |')
out.push('|---|---|---|---|')
const batch = (f: Finding): number => (f.kind !== 'data-defect' || f.fixSource === 'decision' ? 4 : ['import-5etools', 'import-ref'].includes(f.fixSource) ? 1 : ['normalize', 'reader-only'].includes(f.fixSource) ? 2 : 3)
const BATCH: Record<number, string> = { 1: '① 导入类（5etools 或参考材料里已有）', 2: '② 统一写法与读取器类', 3: '③ 自己结构化类（对照原书逐条）', 4: '④ 需驾驶员决定或来源本身的问题' }
for (const b of [1, 2, 3, 4]) {
  const fs = findings.filter((f) => batch(f) === b)
  out.push(`| ${BATCH[b]} | ${fs.length} | ${fs.reduce((a, f) => a + f.count, 0)} | ${fs.map((f) => f.id).join('、') || '—'} |`)
}
out.push('')
const text = out.join('\n') + '\n'
const target = join(process.cwd(), 'docs', 'probes', `D1.2-G2_登记汇总_${prefix}.md`)
writeFileSync(target, text)
console.log(`${target}（${findings.length} 项发现）`)
