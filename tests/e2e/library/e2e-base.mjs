// e2e 的"底座"和统一端口（只在这里定义，各脚本引用，不写死数）。
//   底座 = work/e2e-lib/profile-e2e-base-<chrome|webkit>：只有一个来源（E2E_PORT）、装好中英官方资料的干净浏览器资料，
//          Chrome 约 200MB、WebKit 约 500MB；用 npm run e2e:base 从零造（约半分钟一个，需要联网）。
//   每个测试都用 freshFromBase 克隆一份用（0.2~0.4 秒、几乎不占磁盘），跑完自动删；不要原地改底座（会越用越脏）。
// 为什么统一端口：浏览器把"不同端口"当成不同网站，数据库按网站隔离；端口不在底座里 = 每次重装资料（15 秒、写 1G 多）。
// 所以所有 e2e 必须用同一个端口；两个测试同时跑会抢这个端口（static.mjs 会报清楚的错，不会偷偷换端口）。
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { freshProfile } from './profile-clone.mjs'

export const E2E_PORT = 47337
const WORK = resolve(new URL('../../../work/e2e-lib', import.meta.url).pathname)
const ENGINES = ['chrome', 'webkit']

const checkEngine = (engine) => {
  if (!ENGINES.includes(engine)) throw new Error(`[e2e-base] 浏览器内核只能是 ${ENGINES.join(' 或 ')}：${engine}`)
}

/** 底座目录。workDir 只给单元测试改位置用。 */
export function baseDir(engine, workDir = WORK) {
  checkEngine(engine)
  return join(workDir, `profile-e2e-base-${engine}`)
}

/** 从底座克隆出这个测试自己的资料副本（label 区分测试，副本在 work/e2e-lib 下，跑完自动删；KEEP_PROFILE=1 保留）。 */
export function freshFromBase(engine, label, options = {}) {
  const workDir = options.workDir ?? WORK
  const base = baseDir(engine, workDir)
  if (!existsSync(base)) throw new Error(`[e2e-base] 底座不存在：${base}。先跑 npm run e2e:base 造一份（Chrome 和 WebKit 各约半分钟，需要联网）`)
  return freshProfile(base, join(workDir, `profile-${label}-${engine}`), options)
}
