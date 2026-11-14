// 交付中文版自制包之前的核对。三项：
//   ① 结构一致：直接调作者中文 fork 的 compare_json_structure.py（键、数组长度、值类型、非文字的标量、ENG_name 都不许和英文不同；
//      中文字符串可以不同）。中英自制包在插件里是按“文件—数组—下标”逐条配对的（src/library/brew-pairing.ts），所以必须结构一致。
//   ② ENG_name：每个顶层条目都要有（插件靠它认这是中文文件，并用它做显示、配对、英文名搜索；src/library/custom-lang.ts）；
//      嵌套对象只要 name 译了就要有，等于英文原 name（作者中文 fork 的规则，见下面注释）。
//   ③ （给了术语单才查）术语单里翻译的人选定的译名，有没有出现在中文版里；还没选定的列出来。只报告，不改任何文件。
// 用法：node check-translation.mjs <英文包.json> <中文版.json> [--sheet=术语单.json]
//        [--allow-extra-key=键名] [--translated-key-path=JSON指针通配]（这两个原样转给作者脚本，各可重复；确认别处有此约定才用）
// 退出码：0 全部通过；1 有问题；2 用不了（缺 python3 / 作者脚本 / 参数不对）。结构校验（结构定义）另用 validate.mjs 查中文版。
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { compareScript } from './paths.mjs'

const run = promisify(execFile)
const args = process.argv.slice(2)
const opt = (n) => args.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3)
const files = args.filter((a) => !a.startsWith('--'))
if (files.length !== 2) { console.error('用法：node check-translation.mjs <英文包.json> <中文版.json> [--sheet=术语单.json]'); process.exit(2) }
const [enFile, zhFile] = files
if (!existsSync(compareScript)) { console.error(`找不到作者的结构比对脚本：${compareScript}\n（用环境变量 CHECK_STRUCTURE 指定 compare_json_structure.py）`); process.exit(2) }

let bad = 0
const forward = args.filter((a) => a.startsWith('--allow-extra-key=') || a.startsWith('--translated-key-path=')).flatMap((a) => a.split(/=(.*)/s).slice(0, 2))

// ① 结构一致
console.log('① 结构一致（作者的 compare_json_structure.py）')
let report
try {
  // 作者脚本有错时退出码为 1 但仍在 stdout 给报告；退出码 1 不算“用不了”
  const result = await run('python3', ['-I', compareScript, '--mode', 'homebrew', ...forward, enFile, zhFile], { maxBuffer: 64 * 1024 * 1024 }).catch((error) => {
    if (error.stdout) return { stdout: error.stdout }
    throw error
  })
  report = JSON.parse(result.stdout)
} catch (error) {
  console.error(`  没能运行作者的比对脚本：${error instanceof Error ? error.message.split('\n')[0] : error}\n  （需要 python3；脚本：${compareScript}）`)
  process.exit(2)
}
if (report.passed) console.log(`  ✓ 通过（允许的差异 ${report.summary?.allowed_differences ?? 0} 处：中文名、ENG_name、译者等）`)
else {
  bad++
  console.log(`  ✗ 不通过：错误 ${report.summary?.errors ?? '?'} 处`)
  for (const e of (report.errors ?? []).slice(0, 15)) console.log(`    ${e.code} ${e.path}：${e.message}${e.expected !== undefined ? `（英文：${JSON.stringify(e.expected)}，中文：${JSON.stringify(e.actual)}）` : ''}`)
  if ((report.errors ?? []).length > 15) console.log(`    …另有 ${report.errors.length - 15} 处，用作者脚本直接跑可看全部`)
}

// ② 顶层条目的 ENG_name
console.log('② 顶层条目的 ENG_name（插件靠它认中文文件）')
let zh, en
try { zh = JSON.parse(await readFile(zhFile, 'utf8')); en = JSON.parse(await readFile(enFile, 'utf8')) } catch (error) {
  console.error(`  读不了文件：${error instanceof Error ? error.message : error}`)
  process.exit(2)
}
// 规则：顶层条目一律要有 ENG_name（插件靠它认中文文件）；嵌套对象（特性、动作、引用等）只要 name 译了（和英文不同）就要有，
// 值等于英文原 name。依据：作者中文 fork 的本地化规则（译了对象的 name 就把英文原名留在 ENG_name）；作者自己的中文样例里 12 个带 name 的对象 12 个都有。
// 前提是 ① 已经保证两边结构一致，所以按同样的路径一一对应着往下走。
const missing = []
const mismatch = []
function pairWalk(z, e, path, top) {
  if (Array.isArray(z) && Array.isArray(e)) { for (let i = 0; i < Math.min(z.length, e.length); i++) pairWalk(z[i], e[i], `${path}/${i}`, false); return }
  if (!z || !e || typeof z !== 'object' || typeof e !== 'object' || Array.isArray(z) || Array.isArray(e)) return
  if (typeof z.name === 'string' && typeof e.name === 'string') {
    const has = typeof z.ENG_name === 'string' && z.ENG_name !== ''
    if (has && z.ENG_name !== e.name) mismatch.push(`${path}：ENG_name「${z.ENG_name}」≠ 英文 name「${e.name}」`)
    else if (!has && (top || z.name !== e.name)) missing.push(`${path}（${z.name}）`)
  }
  for (const [k, v] of Object.entries(z)) if (k !== '_copy' && k !== 'ENG_name' && k in e) pairWalk(v, e[k], `${path}/${k}`, false)
}
for (const [prop, list] of Object.entries(zh)) {
  if (prop.startsWith('_') || prop.startsWith('$') || !Array.isArray(list)) continue
  list.forEach((entry, i) => pairWalk(entry, en[prop]?.[i], `/${prop}/${i}`, true))
}
if (!missing.length && !mismatch.length) console.log('  ✓ 顶层条目都带 ENG_name；译了 name 的嵌套对象也都带，且等于英文原 name')
else {
  bad++
  if (missing.length) console.log(`  ✗ 缺 ENG_name ${missing.length} 个（译了 name 就要把英文原名留在 ENG_name）：${missing.slice(0, 10).join('、')}${missing.length > 10 ? '…' : ''}`)
  if (mismatch.length) console.log(`  ✗ ENG_name 和英文名不一致 ${mismatch.length} 个：${mismatch.slice(0, 5).join('；')}${mismatch.length > 5 ? '…' : ''}`)
}

// ③ 术语单
if (opt('sheet')) {
  console.log('③ 术语单里选定的译名是否用在了中文版里')
  const sheet = JSON.parse(await readFile(opt('sheet'), 'utf8'))
  const strings = []
  const collect = (n) => { if (typeof n === 'string') strings.push(n); else if (Array.isArray(n)) n.forEach(collect); else if (n && typeof n === 'object') Object.values(n).forEach(collect) }
  collect(zh)
  const text = strings.join('\n')
  const entries = sheet.entries ?? []
  const unchosen = entries.filter((e) => !e.chosen)
  const absent = entries.filter((e) => e.chosen && !text.includes(e.chosen))
  const noReason = entries.filter((e) => e.chosen && e.status === '多个候选' && !e.reason)
  console.log(`  术语单共 ${entries.length} 项：已选定 ${entries.length - unchosen.length}，未选定 ${unchosen.length}`)
  if (unchosen.length) { bad++; console.log(`  ✗ 还没选定译名：${unchosen.slice(0, 10).map((e) => e.en).join('、')}${unchosen.length > 10 ? '…' : ''}`) }
  if (absent.length) { bad++; console.log(`  ✗ 选定了、但中文版里没出现（可能没用上，也可能用了别的译法）：${absent.slice(0, 10).map((e) => `${e.en}→${e.chosen}`).join('、')}${absent.length > 10 ? '…' : ''}`) }
  if (noReason.length) { bad++; console.log(`  ✗ 有多个候选的词选定了但没写 reason：${noReason.slice(0, 10).map((e) => e.en).join('、')}`) }
  if (!unchosen.length && !absent.length && !noReason.length) console.log('  ✓ 全部选定，都出现在中文版里，多候选的都写了理由')
}

console.log(bad ? `\n有 ${bad} 项没过` : '\n全部通过')
process.exit(bad ? 1 : 0)
