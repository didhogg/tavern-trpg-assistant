import { join } from 'node:path'
import { OUT_ROOT } from '../lib/paths'
import { loadAlign, loadDump, loadRawInfo, loadSources, loadSubraceDict, loadTerms, loadWikiNames, openRaw } from './data'
import { buildDatasets, buildEntityEntries, type Entry } from './entries'
import { pairAll, pairRaw } from './pair'
import { EDS, packBytes, splitPacks, writeOut, type SourceNames } from './packs'
import { reconcile, writeReports } from './report'

/** 配对 → 套外壳 → 数据集 → 分书架分包 → 写包 → 对账 → 报告。取数与对齐都已由上游/5e-translator 做完（见 build.ts 的前几步）。 */
function main(): void {
  const db = openRaw()
  const cn = loadDump('cn'), bak = loadDump('bak')
  const cnRaw = loadRawInfo(db, 'cn'), bakRaw = loadRawInfo(db, 'bak')
  const align = loadAlign()
  const rp = pairRaw(cnRaw, bakRaw, align)
  const wiki = new Map<string, string>()
  const wikiRows = loadWikiNames()
  for (const [, zh, en, src] of wikiRows) if (zh) { const k = `${zh}|${src}`.toLowerCase(); if (!wiki.has(k)) wiki.set(k, en) }
  const sub = new Map<string, [string, string]>(loadSubraceDict().map(([pz, pe, sz, se, src]) => [`${pz}|${sz}|${src}`, [pe, se]]))
  const pairing = pairAll(cn, bak, rp.rawMap, wiki, { sub, terms: loadTerms() })
  const entities = buildEntityEntries(pairing)
  const ds = buildDatasets(db, cnRaw, bakRaw, cn, bak, rp)
  const entries: Entry[] = [...entities, ...ds.entries]
  // 来源 → 书名：中文名取上游 Parser，英文名取 data-bak 的 book / adventure 条目
  const src = loadSources()
  const names: SourceNames = new Map(Object.entries(src).map(([k, v]) => [k, { name: v.full, nameEn: v.full }]))
  for (const prop of ['book', 'adventure']) for (const e of bak.byProp.get(prop) ?? []) if (typeof e.value.source === 'string' && typeof e.value.name === 'string') names.set(e.value.source, { name: names.get(e.value.source)?.name ?? e.value.name, nameEn: e.value.name })
  const packs = splitPacks(entries, names)
  for (const ed of EDS) for (const p of packs[ed]) packBytes(p, names)
  // 可重现：再打一遍，字节哈希必须相同
  const again = splitPacks(entries, names)
  let reproducible = true
  for (const ed of EDS) for (const [i, p] of again[ed].entries()) { packBytes(p, names); if (p.sha256 !== packs[ed][i]!.sha256) reproducible = false }
  writeOut(packs)
  const recon = reconcile(cnRaw, bakRaw, ds, cn, bak, pairing, entries)
  const noDate = entries.filter((e) => e.edition === 'both' && e.source !== null).length
  writeReports({
    dir: join(OUT_ROOT, 'report'), recon, pairing, rp, align, entries, packs, dsCount: ds.entries.length, wikiCount: wikiRows.length,
    extra: { 两次打包字节哈希相同: reproducible, 有来源但来源没有出版日期_两书架各放一份: noDate, 没有来源_两书架各放一份: entries.filter((e) => e.edition === 'both' && e.source === null).length },
  })
  for (const l of recon.lines) console.log(l.ok ? '对上' : '对不上！', l.name, l.total, JSON.stringify(l.parts))
  console.log('条目', entries.length, '包', EDS.map((ed) => `${ed}:${packs[ed].length}`).join(' '), '可重现', reproducible)
  if (!recon.ok || !reproducible) process.exitCode = 1
}
main()
