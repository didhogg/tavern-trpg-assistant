import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AlignFile, Dump, RawInfo } from './data'
import type { DatasetResult, Entry } from './entries'
import type { PropPairing, RawPairing } from './pair'
import { EDS, type Ed, type PackInfo } from './packs'

const n = (x: number): string => x.toLocaleString('en-US')
const tbl = (head: string[], rows: Array<Array<string | number>>): string => `| ${head.join(' | ')} |\n|${head.map(() => '---').join('|')}|\n${rows.map((r) => `| ${r.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`).join('\n')}\n`
const MB = (b: number): string => `${(b / 1e6).toFixed(1)}MB`

export interface Recon {
  ok: boolean
  lines: Array<{ name: string; total: number; parts: Record<string, number>; ok: boolean }>
}

/** 对账：每条原始记录、每条取数层条目必须恰好有一个去处；对不上就让构建失败。 */
export function reconcile(cnRaw: RawInfo[], bakRaw: RawInfo[], ds: DatasetResult, cn: Dump, bak: Dump, pairing: Map<string, PropPairing>, entries: Entry[]): Recon {
  const lines: Recon['lines'] = []
  const push = (name: string, total: number, parts: Record<string, number>): void => { lines.push({ name, total, parts, ok: Object.values(parts).reduce((a, b) => a + b, 0) === total }) }
  const c = { entity: 0, dataset: 0, none: 0 }
  for (const r of cnRaw) { const d = ds.cnDest.get(r.id); if (d) c[d] += 1; else c.none += 1 }
  push('中文原始记录（原样库 cn）', cnRaw.length, { 被取数层条目覆盖: c.entity, 整条原样进数据集: c.dataset, 没有去处: c.none })
  const b = { entity: 0, dataset: 0, both: 0, none: 0 }
  for (const r of bakRaw) { const d = ds.bakDest.get(r.id) ?? []; if (d.length === 0) b.none += 1; else if (d.length === 2) b.both += 1; else b[d[0]!] += 1 }
  push('英文原始记录（原样库 bak）', bakRaw.length, { 被取数层条目覆盖: b.entity, 整条原样进数据集: b.dataset, 两处都在: b.both, 没有去处: b.none })
  let cnEnt = 0, bakEnt = 0
  for (const l of cn.byProp.values()) cnEnt += l.length
  for (const l of bak.byProp.values()) bakEnt += l.length
  let paired = 0, cnOnly = 0, bakOnly = 0
  for (const p of pairing.values()) for (const x of p.pairs) { if (x.cn && x.bak) paired += 1; else if (x.cn) cnOnly += 1; else bakOnly += 1 }
  push('中文取数层条目（DataLoader）', cnEnt, { 配成一对: paired, 只有中文: cnOnly })
  push('英文取数层条目（DataLoader, data-bak）', bakEnt, { 配成一对: paired, 只有英文: bakOnly })
  push('条目总数', entries.length, { 取数层条目: paired + cnOnly + bakOnly, 数据集条目: ds.entries.length })
  return { ok: lines.every((l) => l.ok), lines }
}

export interface ReportInput {
  dir: string; recon: Recon; pairing: Map<string, PropPairing>; rp: RawPairing; align: Record<string, AlignFile>; entries: Entry[]; packs: Record<Ed, PackInfo[]>; dsCount: number
  wikiCount: number; extra: Record<string, unknown>
}

export function writeReports(r: ReportInput): void {
  mkdirSync(r.dir, { recursive: true })
  const how = (h: string): number => [...r.pairing.values()].reduce((a, p) => a + (p.stats.byHow[h] ?? 0), 0)
  const totals = [...r.pairing.values()].reduce((a, p) => ({ pairs: a.pairs + p.pairs.filter((x) => x.cn && x.bak).length, cnOnly: a.cnOnly + p.stats.cnOnly, bakOnly: a.bakOnly + p.stats.bakOnly, disagree: a.disagree + p.stats.disagree }), { pairs: 0, cnOnly: 0, bakOnly: 0, disagree: 0 })
  let md = `# 对账总表\n\n每一行：总数 = 各去处之和，否则构建失败。\n\n${tbl(['对账项', '总数', '去处', '是否对上'], r.recon.lines.map((l) => [l.name, n(l.total), Object.entries(l.parts).map(([k, v]) => `${k} ${n(v)}`).join('；'), l.ok ? '对上' : '**对不上**']))}\n`
  writeFileSync(join(r.dir, '对账总表.md'), md)
  // 配对
  md = `# 中英配对报告\n\n配对证据（越靠前越强，只拿还没配上的）：A 并排配对（5e-translator 规则）接上游哈希；B 上游英文哈希；C ENG_name+来源；D wiki-dnd-parser 中英名对照；E 子种族词典；F 术语库；G 衍生条目按父级+顺序。配不上的不猜，各自单独成条。\n\n`
  md += tbl(['层', '配上'], [['A 并排配对', n(how('A'))], ['B 上游英文哈希', n(how('B'))], ['C ENG_name+来源', n(how('C'))], ['D wiki-dnd-parser', n(how('D'))], ['E 子种族词典', n(how('E'))], ['F 术语库', n(how('F'))], ['G 衍生条目按父级+顺序', n(how('G'))], ['合计配成一对', n(totals.pairs)], ['只有中文', n(totals.cnOnly)], ['只有英文', n(totals.bakOnly)], ['被选中的配对里，其它层给出不同候选的', n(totals.disagree)]])
  md += `\n## 按类别\n\n${tbl(['类别', '总条目', 'A', 'B', 'C', 'D', 'E', 'F', 'G', '只有中文', '只有英文', '其它层有分歧'], [...r.pairing].filter(([, p]) => p.stats.cnOnly || p.stats.bakOnly || p.stats.disagree).map(([k, p]) => [k, p.stats.total, p.stats.byHow.A ?? 0, p.stats.byHow.B ?? 0, p.stats.byHow.C ?? 0, p.stats.byHow.D ?? 0, p.stats.byHow.E ?? 0, p.stats.byHow.F ?? 0, p.stats.byHow.G ?? 0, p.stats.cnOnly, p.stats.bakOnly, p.stats.disagree]))}\n（只列出有剩余或有分歧的类别；其余类别全部配上且各层一致。）\n`
  writeFileSync(join(r.dir, '中英配对报告.md'), md)
  writeFileSync(join(r.dir, '配对剩余清单.tsv'), ['类别\t哪边\t名字\t来源\t哈希', ...[...r.pairing].flatMap(([prop, p]) => p.pairs.filter((x) => !(x.cn && x.bak)).map((x) => { const e = (x.cn ?? x.bak)!; return [prop, x.cn ? '只有中文' : '只有英文', String(e.value.name ?? e.value.id ?? ''), e.key.s ?? '', e.key.h ?? ''].join('\t') }))].join('\n'))
  // 对齐器
  const files = Object.entries(r.align)
  const ok = files.filter(([, a]) => a.status === 'ok')
  md = `# 并排对齐报告（5e-translator 对齐器，原样调用）\n\n${tbl(['项', '数'], [['英文文件', files.length], ['工具处理的文件', ok.length], ['工具没处理的文件（它自己的跳过规则，如 generated/ 查找表）', files.length - ok.length], ['翻译单元', n(ok.reduce((a, [, x]) => a + (x.jobs ?? 0), 0))], ['中文并排对上的单元', n(ok.reduce((a, [, x]) => a + (x.translated ?? 0), 0))], ['对齐错误：嵌套段落/查找表内部', n(r.rp.nestedErrors)], ['对齐错误：顶层数组', r.rp.topLevelErrors.length], ['(文件,数组)组：中英条数不一致', r.rp.unequal.length], ['(文件,数组)组：只有一边有', r.rp.oneSided.length]])}\n`
  if (r.rp.oneSided.length) md += `\n## 只有一边有的数组\n\n${tbl(['文件', '数组', '哪边', '条数'], r.rp.oneSided.map((o) => [o.file, o.category, o.lib, o.n]))}`
  if (r.rp.topLevelErrors.length) md += `\n## 顶层数组错误\n\n${r.rp.topLevelErrors.map((e) => `- ${e}`).join('\n')}\n`
  md += `\n## 没有被工具处理的文件\n\n${files.filter(([, a]) => a.status !== 'ok').map(([f]) => `- ${f}`).join('\n')}\n`
  writeFileSync(join(r.dir, '并排对齐报告.md'), md)
  // 导入报告
  const byType = new Map<string, { t: number; ed: Record<string, number> }>()
  for (const e of r.entries) { const x = byType.get(e.type) ?? { t: 0, ed: {} }; x.t += 1; x.ed[e.edition] = (x.ed[e.edition] ?? 0) + 1; byType.set(e.type, x) }
  md = `# 导入报告\n\n全部由程序现数。\n\n## 总体\n\n${tbl(['项', '数'], [['条目总数', n(r.entries.length)], ['  其中取数层条目', n(r.entries.length - r.dsCount)], ['  其中数据集条目（取数层没覆盖的原始记录，原样）', n(r.dsCount)], ...EDS.map((ed) => [`${ed} 书架条目`, n(r.packs[ed].reduce((a, p) => a + p.entries.length, 0))]), ['两书架各放一份的条目', n(r.entries.filter((e) => e.edition === 'both').length)], ['wiki-dnd-parser 收集的中英名', n(r.wikiCount)]])}\n`
  md += `\n## 包\n\n`
  for (const ed of EDS) md += `### ${ed}（${r.packs[ed].length} 个包，合计 ${MB(r.packs[ed].reduce((a, p) => a + (p.bytes?.length ?? 0), 0))}）\n\n${tbl(['包', '名称', '条数', '大小'], r.packs[ed].map((p) => [p.id, p.name, p.entries.length, MB(p.bytes!.length)]))}\n`
  md += `\n## 各类别\n\n${tbl(['类别', '条数', '版本分布'], [...byType].sort((a, b) => b[1].t - a[1].t).map(([k, v]) => [k, v.t, JSON.stringify(v.ed)]))}\n`
  md += `\n## 其它\n\n\`\`\`json\n${JSON.stringify(r.extra, null, 1)}\n\`\`\`\n`
  writeFileSync(join(r.dir, '导入报告.md'), md)
}
