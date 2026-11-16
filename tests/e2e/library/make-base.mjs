// npm run e2e:base —— 从零造 e2e 的干净底座（说明见 e2e-base.mjs）：新浏览器资料 → 在统一端口上装中英官方资料 → 验证装全了。
// 用法：[ENGINE=chrome|webkit] [SKIP_BUILD=1] npm run e2e:base（不指定内核就两种都造，各约半分钟，需要联网）。
// 先造到 <底座>.building，验证通过才换掉正式底座：中途失败 / 被中断都不会留下半成品，也不会弄坏已有底座。
// 什么时候重造：官方资料更新、插件的资料库存储格式变了、底座坏了。不要往底座里加别的东西（自制包、战役）——测试自己建。
import { execFileSync } from 'node:child_process'
import { rename, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { E2E_PORT, baseDir, buildAll, engines } from './chain-common.mjs'

const wanted = process.env.ENGINE
if (wanted && !engines.some((e) => e[0] === wanted)) throw new Error(`ENGINE 只能是 ${engines.map((e) => e[0]).join(' 或 ')}：${wanted}`)
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
if (!process.env.SKIP_BUILD) await buildAll()

const sizeMb = (dir) => Math.round(Number(execFileSync('du', ['-sk', dir]).toString().split('\t')[0]) / 1024)
let failed = false
for (const [engine, type, options] of engines) {
  if (wanted && wanted !== engine) continue
  const final = baseDir(engine)
  const building = `${final}.building`
  const t0 = Date.now()
  await rm(building, { recursive: true, force: true })
  const { server, url } = await startStatic({ port: E2E_PORT })
  const ctx = await type.launchPersistentContext(building, { ...options, viewport: { width: 1280, height: 800 } })
  try {
    const page = await ctx.newPage(); page.setDefaultTimeout(8 * 60_000)
    await page.goto(url)
    const audits = await page.evaluate(async () => {
      const h = await import('/work/e2e-lib/harness.js')
      const out = {}
      for (const id of ['cn-official', 'en-official']) {
        await h.install(id)
        const a = await h.offlineAudit(id)
        out[id] = { status: a.set?.status, ok: a.ok, planFiles: a.planFiles }
      }
      await h.service.englishPairs('cn-official') // 配对表先建好，测试里不用再等
      return out
    })
    const bad = Object.entries(audits).filter(([, a]) => a.status !== 'installed' || a.ok !== a.planFiles)
    if (bad.length) throw new Error(`装完核对不过：${JSON.stringify(Object.fromEntries(bad))}`)
  } catch (error) {
    failed = true
    console.error(`✘ ${engine}：${error instanceof Error ? error.message : String(error)}`)
    await ctx.close()
    server.close()
    await rm(building, { recursive: true, force: true })
    continue
  }
  await ctx.close()
  server.close()
  await rm(final, { recursive: true, force: true })
  await rename(building, final)
  console.log(`✔ ${engine}：${final}  ${sizeMb(final)}MB，用时 ${((Date.now() - t0) / 1000).toFixed(0)} 秒`)
}
clearTimeout(killer)
process.exit(failed ? 1 : 0)
