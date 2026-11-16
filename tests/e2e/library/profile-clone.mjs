// e2e 浏览器资料副本：每个测试要一份干净的、带已装官方资料库的浏览器资料（底座，4G 多）。
// 以前各脚本自己 rm + cp：每份真占 4G 多、复制要十来秒，跑完又不删，磁盘被占满过一次。
// 现在统一走 freshProfile：
//   ① 用 macOS 的 cp -c（APFS 写时复制克隆）：0.1 秒、几乎不占磁盘，只有浏览器真改动的块才多占；不行就退回普通复制；
//   ② 删掉克隆里的 Singleton* 锁文件（原来脚本里 filter 做的事）；
//   ③ 在 work/e2e-lib/.clones/ 登记（路径、进程号、时间；克隆开始前就登记，克隆中途被杀也扫得到）；
//   ④ 进程退出（正常、出错、Ctrl+C、被超时杀手 process.exit）时自动删；被 kill -9 的由 sweepStale（npm run clean:profiles）按登记扫掉；
//   ⑤ KEEP_PROFILE=1：不登记、不自动删，留着看现场。
// 不依赖 vite / playwright，单元测试（tests/unit/e2e-profile-clone.test.ts）直接引用。
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve, sep } from 'node:path'
import { createHash } from 'node:crypto'

const DEFAULT_WORK = resolve(new URL('../../../work/e2e-lib', import.meta.url).pathname)
const registryDir = (workDir) => join(workDir, '.clones')

/** 本进程登记过的副本：退出时删。 */
const mine = new Map() // path -> registryFile
let hooked = false

const inside = (workDir, p) => {
  const base = resolve(workDir) + sep
  const full = resolve(p)
  return full.startsWith(base) && full !== resolve(workDir)
}

function removeTree(path) {
  rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
}

/** 删本进程登记的全部副本；某个删不掉（浏览器还占着）就留着登记，交给 sweepStale，并如实打印。 */
export function cleanupOwn() {
  for (const [path, file] of [...mine]) {
    try {
      removeTree(path)
      rmSync(file, { force: true })
      mine.delete(path)
    } catch (error) {
      console.warn(`[profile-clone] 没删掉 ${path}：${error instanceof Error ? error.message : String(error)}；留给 npm run clean:profiles`)
    }
  }
}

function hookExit() {
  if (hooked) return
  hooked = true
  process.once('exit', cleanupOwn)
  // 默认的 Ctrl+C / kill 不会触发 'exit' 事件，所以接住后走 process.exit（会触发上面的清理）
  for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]]) process.once(signal, () => process.exit(code))
}

/** 克隆一个目录。返回用了哪种方法。clone 可注入（单元测试模拟"不支持克隆"）。 */
function copyTree(from, to, clone) {
  try {
    clone(from, to)
    return 'clone'
  } catch (error) {
    // 不是 APFS、跨卷等：退回普通复制（慢、占空间，但测试照样能跑）；原因照实打印，不悄悄吞掉
    console.warn(`[profile-clone] 克隆不可用，改用普通复制（慢且占磁盘）：${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
    removeTree(to)
    cpSync(from, to, { recursive: true })
    return 'copy'
  }
}
const nativeClone = (from, to) => { execFileSync('cp', ['-cR', from, to], { stdio: 'ignore' }) }

/**
 * 给测试一份底座的副本，返回副本路径（同步；前面加不加 await 都行）。
 * from：底座目录（只读，不会被改）；to：副本目录，必须在 work/e2e-lib/ 下，已有的先删掉。
 */
export function freshProfile(from, to, { workDir = DEFAULT_WORK, keep = Boolean(process.env.KEEP_PROFILE), clone = nativeClone } = {}) {
  const src = resolve(from)
  const dst = resolve(to)
  if (!existsSync(src) || !lstatSync(src).isDirectory()) throw new Error(`[profile-clone] 底座不存在：${src}`)
  if (!inside(workDir, dst)) throw new Error(`[profile-clone] 副本必须放在 ${resolve(workDir)} 下：${dst}`)
  if (dst === src || src.startsWith(dst + sep)) throw new Error(`[profile-clone] 副本不能就是底座：${dst}`)
  if (lstatSync(join(src, 'SingletonLock'), { throwIfNoEntry: false })) {
    console.warn(`[profile-clone] 底座上有 SingletonLock（可能有浏览器正在用它），克隆出来的可能是写到一半的状态：${src}`)
  }
  removeTree(dst)
  // 先登记、再克隆：克隆几 G、文件多的底座要十来秒，这期间进程被杀，半成品副本也有登记可扫
  let file = null
  if (!keep) {
    const dir = registryDir(workDir)
    mkdirSync(dir, { recursive: true })
    file = join(dir, `${process.pid}-${createHash('sha1').update(dst).digest('hex').slice(0, 10)}.json`)
    writeFileSync(file, JSON.stringify({ path: dst, pid: process.pid, at: Date.now(), method: 'pending' }))
    mine.set(dst, file)
    hookExit()
  }
  const method = copyTree(src, dst, clone)
  for (const name of readdirSync(dst)) if (name.startsWith('Singleton')) rmSync(join(dst, name), { force: true })
  if (file) writeFileSync(file, JSON.stringify({ path: dst, pid: process.pid, at: Date.now(), method }))
  return dst
}

const alive = (pid) => {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error?.code === 'EPERM'
  }
}

/**
 * 扫登记：进程已经死了的（被 kill -9、崩溃）就删它的副本和登记；进程还活着的不动。
 * 删不掉的（例如克隆中途被杀、孤儿 cp 还在写）不抛错：保留登记、列进 busy，让调用方提示"稍后再跑一次"。
 * 返回 { removed, busy }。remove 可注入（单元测试模拟"删不掉"）。
 */
export function sweepStale({ workDir = DEFAULT_WORK, remove = removeTree } = {}) {
  const dir = registryDir(workDir)
  const out = { removed: [], busy: [] }
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir).filter((n) => n.endsWith('.json'))) {
    const file = join(dir, name)
    let entry
    try {
      entry = JSON.parse(readFileSync(file, 'utf8'))
    } catch (error) {
      console.warn(`[profile-clone] 登记文件读不了，跳过：${file}（${error instanceof Error ? error.message : String(error)}）`)
      continue
    }
    if (alive(entry.pid)) continue
    try {
      // 路径保护：只删 work/e2e-lib/ 下的，登记被改坏也不会删到别处
      if (inside(workDir, entry.path)) remove(entry.path)
      rmSync(file, { force: true })
      out.removed.push(entry.path)
    } catch (error) {
      console.warn(`[profile-clone] 暂时删不掉 ${entry.path}：${error instanceof Error ? error.message.split('\n')[0] : String(error)}`)
      out.busy.push(entry.path)
    }
  }
  return out
}
