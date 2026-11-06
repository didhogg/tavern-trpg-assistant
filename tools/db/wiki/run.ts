import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { OUT_ROOT, REF, REFERENCE_ROOT } from '../lib/paths'

/**
 * 运行 wiki-dnd-parser（summerset-zz，参考库里的 wiki-dnd-parser-master 2）：
 * 在输出目录里的拷贝上原样跑它的 prepareData.ts（中文 data + 英文 data-bak），
 * 然后把它写出的每个条目文件里的 displayName {zh,en} 和来源收成一张表，供配对时当作"中英名对照"。
 * 它对物品变体用中文数据里的 ENG_namePrefix 等字段算英文名，上游取数层拿不到这个。
 * 参考库只读：拷贝后在拷贝里运行。
 */
const SRC = join(REFERENCE_ROOT, 'wiki-dnd-parser-master 2')
const WORK = join(OUT_ROOT, '_upstream', 'wikiparser')

function walk(dir: string, out: string[] = []): string[] {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n)
    if (statSync(f).isDirectory()) walk(f, out)
    else if (n.endsWith('.json')) out.push(f)
  }
  return out
}
const run = (cmd: string, args: string[]): void => {
  const r = spawnSync(cmd, args, { cwd: WORK, stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} 失败`)
}

rmSync(WORK, { recursive: true, force: true })
cpSync(SRC, WORK, { recursive: true })
mkdirSync(join(WORK, 'input', '5e-cn'), { recursive: true })
mkdirSync(join(WORK, 'input', '5e-en'), { recursive: true })
symlinkSync(REF.cn, join(WORK, 'input', '5e-cn', 'data'))
symlinkSync(REF.cnBak, join(WORK, 'input', '5e-en', 'data'))
run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--silent'])
run('npx', ['tsx', 'src/prepareData.ts'])

const rows: Array<[string, string, string, string]> = [] // [数据类型, 中文名, 英文名, 来源]
const outDir = join(WORK, 'output')
for (const f of walk(outDir)) {
  if (/(namelist|collection|contents|generated)\//.test(f) || /\/(idMgr|logs|tags)\.json$/.test(f)) continue
  let j: any
  try { j = JSON.parse(readFileSync(f, 'utf8')) } catch { continue }
  const dn = j?.displayName
  if (!dn || typeof dn.en !== 'string') continue
  const src = j.mainSource?.source ?? j.source ?? f.split('/').slice(-2)[0]
  rows.push([String(j.dataType ?? f.slice(outDir.length + 1).split('/')[0]), String(dn.zh ?? ''), dn.en, String(src)])
}
writeFileSync(join(OUT_ROOT, '_upstream', 'wiki_names.json'), JSON.stringify(rows))
// 它自带的《子种族名字替换词典》：母种族/缀名的中英对照
const XLSX = createRequire(join(WORK, 'package.json'))('xlsx')
const wb = XLSX.readFile(join(WORK, 'config', '子种族名字替换词典.xlsx'))
const dict = (XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]!], { header: 1 }) as unknown[][]).slice(1).filter((r) => r[0] && r[1] && r[3] && r[4] && r[5])
writeFileSync(join(OUT_ROOT, '_upstream', 'subrace_dict.json'), JSON.stringify(dict.map((r) => [r[0], r[1], r[3], r[4], r[5]])))
console.log(`子种族词典：${dict.length} 行`)
console.log(`wiki-dnd-parser：收集到 ${rows.length} 个条目的中英名；有中文名 ${rows.filter((r) => r[1]).length}`)
void existsSync
