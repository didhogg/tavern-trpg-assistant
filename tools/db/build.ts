import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { REF, REPO, OUT_ROOT } from './lib/paths'
import { runIngest } from './ingest'

/**
 * 全量重建的命令入口。步骤（按顺序）：
 *   ingest   原样入库（全部文件原样存，图片不存）
 *   upstream 上游取数：用上游 DataLoader 取出中文、data-bak 两边的条目 + 给原始记录算上游哈希
 *   align    中英并排对齐：原样调用 5e-translator 自己的对齐器
 *   wiki     运行 wiki-dnd-parser（用它的物品变体中英名补配对）
 *   build    配对、套外壳、分版本分包、写包、对账
 *   verify   与上游比对结构、数据量、一致性
 *   all      以上全部
 */
const step = process.argv[2] ?? 'all'
const tsx = (file: string, ...args: string[]): void => {
  const r = spawnSync('npx', ['tsx', file, ...args], { stdio: 'inherit', cwd: join(import.meta.dirname, '..', '..') })
  if (r.status !== 0) throw new Error(`${file} ${args.join(' ')} 失败`)
}
const here = (p: string): string => join(import.meta.dirname, p)
const PY = join(OUT_ROOT, '_upstream', 'venv-translator', 'bin', 'python')
const TOOLS = join(REF.cn, '..', '..')

if (step === 'ingest' || step === 'all') {
  const res = runIngest()
  for (const r of res) console.log(`${r.lib}${r.label ? ' ' + r.label : ''}: 文件 ${r.files} 条 ${r.records} 另数 ${r.expected} ${r.ok ? '相等' : '不相等！'}`)
  if (res.some((r) => !r.ok)) process.exitCode = 1
}
if (step === 'upstream' || step === 'all') {
  tsx(here('upstream/dump.ts'), 'cn')
  tsx(here('upstream/dump.ts'), 'bak')
  tsx(here('upstream/rawKeys.ts'))
}
if (step === 'align' || step === 'all') {
  const r = spawnSync(PY, [here('translator/align.py'), join(TOOLS, '5e-translator-main'), REPO.cn, join(OUT_ROOT, '_upstream', 'translator', 'align.json')], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error('对齐失败')
}
if (step === 'wiki' || step === 'all') tsx(here('wiki/run.ts'))
if (step === 'build' || step === 'all') tsx(here('build/run.ts'))
if (step === 'verify' || step === 'all') tsx(here('verify/mirror.ts'))
if (step === 'upstream-trial') { const { runTrial } = await import('./upstream/trial'); await runTrial() }
