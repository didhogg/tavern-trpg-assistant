import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { OUT_ROOT } from '../lib/paths'
import { reconcileManifest, resolveDataSource } from '../../../src/core/source'
import { REPOS } from './repos'

/**
 * T4 对账：用插件里的同一套代码（resolveDataSource）读真实的 manifest.json，
 * 再和 T3 自己写出的 validation.json 对数；并检查"源登记表"（REPOS）里的每个仓库都在清单里。
 * 任何对不上都以非 0 退出，不手补。
 */
const dir = join(OUT_ROOT, 'source-manifest')
const raw = readFileSync(join(dir, 'manifest.json'), 'utf8')
const validation = JSON.parse(readFileSync(join(dir, 'validation.json'), 'utf8')) as {
  totals: { repos: number; jsonFiles: number; contentRecords: number; sourceIds: number }
  manifestHash?: string
}
const fetchFn = (async () => new Response(raw, { status: 200 })) as unknown as typeof fetch
const active = await resolveDataSource({ dataSource: 'upstream', sourceManifestUrl: 'file://manifest.json', sourceManifestFallbackUrl: '' }, { fetchFn })

const problems: string[] = []
if (active.mode !== 'upstream') {
  problems.push(`清单没有被接受：${active.notice?.message ?? '未知原因'}`)
} else {
  const m = active.manifest
  const got = { repos: m.repos.length, jsonFiles: m.files.length, contentRecords: m.recordIndex.count, sourceIds: m.sources.length }
  for (const [k, v] of Object.entries(got)) if (v !== validation.totals[k as keyof typeof got]) problems.push(`${k}：清单 ${v}，T3 校验报告 ${validation.totals[k as keyof typeof got]}`)
  const inManifest = new Set(m.repos.map((r) => r.id))
  for (const r of REPOS) if (!inManifest.has(r.id)) problems.push(`源登记表里的 ${r.id} 不在清单里`)
  for (const id of inManifest) if (!REPOS.some((r) => r.id === id)) problems.push(`清单里的 ${id} 不在源登记表里`)
  const issues = reconcileManifest(m)
  problems.push(...issues)
  console.log('读取：', active.mode, active.from)
  console.log('对账：', JSON.stringify(got), '← T3 校验报告', JSON.stringify(validation.totals))
  for (const r of m.repos) console.log(`  ${r.id.padEnd(18)} ${r.kind.padEnd(9)} ${r.lang}  json ${String(r.jsonCount).padStart(5)}  记录 ${String(r.contentRecords).padStart(7)}  提交 ${r.revision?.slice(0, 12) ?? '无'}`)
  console.log(`  来源→文件索引：${active.index.filesBySource.size} 个来源有内容文件；上游索引与查找表 ${active.index.lookups.length} 个`)
}
if (problems.length) {
  console.error('对账失败：\n- ' + problems.join('\n- '))
  process.exitCode = 1
} else console.log('对账通过：清单数字与 T3 校验报告一致，源登记表与清单的仓库一一对应。')
