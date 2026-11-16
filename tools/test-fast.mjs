// npm run test:fast（make test-changed）：日常改完代码只跑和改动相关的检查，约 20 秒。
//   ① 相关单元测试  vitest --changed（只跑受改动影响的测试；新建还没提交的测试也会跑）
//   ② 类型检查      vue-tsc --noEmit
//   ③ lint          只查改动的 src/ tests/ 文件（和项目 npm run lint 同一个范围，不另定范围）
// 默认比较"未提交的改动"；做完一个任务提交之后用 --since HEAD~1（或别的提交号）比较那次提交的改动。
// 不含 e2e：e2e 要真开浏览器，按改动由人 / agent 自己选一个相关的单独跑（不在这里手写"改了哪个文件跑哪个 e2e"的对照表）。
// 每一步限时 5 分钟；每步都跑完再汇总，有一步失败整体就是失败；成功时不刷屏，失败时只给末尾 40 行。
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const STEP_LIMIT_MS = 5 * 60_000
/** 项目 lint（npm run lint = eslint src tests）的范围。 */
const LINT_ROOTS = ['src/', 'tests/']
const LINT_EXT = /\.(ts|mts|cts|vue|js|mjs|cjs)$/

/** 从改动文件里挑出该 lint 的：在项目 lint 范围内、扩展名对、文件还在（删掉的不查）。 */
export function lintTargets(files, exists = existsSync) {
  return [...new Set(files)].filter((f) => LINT_ROOTS.some((r) => f.startsWith(r)) && LINT_EXT.test(f) && exists(f)).sort()
}

export function parseArgs(argv) {
  const i = argv.indexOf('--since')
  if (i === -1) return { since: null }
  const ref = argv[i + 1]
  if (!ref || ref.startsWith('--')) throw new Error('--since 后面要跟一个提交号，例如 --since HEAD~1')
  return { since: ref }
}

const git = (args) => {
  const r = spawnSync('git', args, { encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} 失败：${(r.stderr || '').trim().split('\n')[0]}`)
  return r.stdout.split('\n').filter(Boolean)
}

/** 改动文件：和 since（默认 HEAD = 未提交）比较的改动 + 还没跟踪的新文件。 */
export function changedFiles(since) {
  return [...new Set([...git(['diff', '--name-only', since ?? 'HEAD']), ...git(['ls-files', '--others', '--exclude-standard'])])]
}

function step(label, cmd, args) {
  const t = Date.now()
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: STEP_LIMIT_MS, killSignal: 'SIGKILL', maxBuffer: 64 * 1024 * 1024 })
  const seconds = ((Date.now() - t) / 1000).toFixed(1)
  const timedOut = r.error?.code === 'ETIMEDOUT'
  const ok = r.status === 0 && !timedOut
  console.log(`${ok ? '✔' : '✘'} ${label}  ${seconds}s${timedOut ? '  （超过 5 分钟，已中止）' : ''}`)
  if (!ok) console.log((r.stdout + r.stderr).trim().split('\n').slice(-40).join('\n'))
  return ok
}

export function main(argv = process.argv.slice(2)) {
  const { since } = parseArgs(argv)
  const files = changedFiles(since)
  console.log(`比较：${since ?? '未提交的改动'}；改动文件 ${files.length} 个`)
  const results = []
  // --changed 不带值 = 未提交的改动；带值 = 和那个提交比。--passWithNoTests 放前面，免得被当成 --changed 的值
  // --testTimeout：全套并行 + 机器忙（系统在扫描磁盘、重建索引）时，要编译结构定义的几个重测试会超过默认 5 秒而误报失败；
  // 这里只放宽单个测试的时限到 20 秒（不改项目的 vitest 配置，npm test 不受影响），真卡死的由整步 5 分钟上限拦住
  results.push(step('相关单元测试', 'npx', ['vitest', 'run', '--passWithNoTests', '--testTimeout', '20000', ...(since ? ['--changed', since] : ['--changed'])]))
  results.push(step('类型检查', 'npx', ['vue-tsc', '--noEmit']))
  const targets = lintTargets(files)
  if (targets.length) results.push(step(`lint（${targets.length} 个文件）`, 'npx', ['eslint', ...targets]))
  else console.log('- lint：没有改动的 src/ tests/ 文件，跳过')
  const failed = results.filter((ok) => !ok).length
  console.log(failed ? `\n✘ ${failed} 项失败` : '\n✔ 全部通过')
  console.log('提醒：这里不含 e2e；需要时单独跑相关的一个（资料副本已改成克隆，跑完自动删）。')
  return failed ? 1 : 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exit(main())
  } catch (error) {
    console.error(`✘ ${error instanceof Error ? error.message : String(error)}`)
    process.exit(2)
  }
}
