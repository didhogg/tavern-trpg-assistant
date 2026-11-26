// 真实插件启动和安装入口，使用已装官方资料的浏览器副本。ADVENTURE=1 另跑联网下载。
import assert from 'node:assert/strict'
import { join } from 'node:path'
import { engines, freshProfile, work } from './chain-common.mjs'
import { P } from './p55-ui-common.mjs'
import { startStatic } from './static.mjs'

const engine = process.env.ENGINE ?? 'chrome'
const downloadAdventure = process.env.ADVENTURE === '1'
const [, browser, options] = engines.find(([name]) => name === engine)
const profile = freshProfile(join(work, `profile-b2-8a-${engine}`), join(work, `profile-precompute-startup-${process.pid}`))
const { server, url } = await startStatic({ port: 47318 })
const origin = new URL(url).origin
let ctx
try {
  ctx = await browser.launchPersistentContext(profile, options)
  await ctx.route((u) => u.origin !== origin && !(downloadAdventure && u.href.includes('/5etools-mirror-3/5etools-src')), (route) => route.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  const ready = () => page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.goto(url)
  await ready()
  // 旧版装完英文资料后写的中英全量待办。刷新带它们的库，走正式启动。
  const at = Date.now()
  await page.evaluate(async ([pin, at]) => {
    const lib = eval(pin)._s.get('app').svc().backend.library
    await lib.db.derived.bulkPut(['cn', 'en'].map((codeSet) => ({ key: `kc-pending:${codeSet}`, fingerprint: '', value: { at }, savedAt: at })))
  }, [P, at])
  await page.reload()
  await ready()
  const startup = await page.evaluate(async (pin) => {
    const lib = eval(pin)._s.get('app').svc().backend.library
    await lib.ready
    return lib.precomputeQueue.state()
  }, P)
  assert.deepEqual(startup, { running: null, pending: [], last: null }, '重新打开酒馆时，旧待办不启动全量换算')
  console.log(`PASS ${engine}：带两轮旧待办启动，没有开启换算`)

  const result = await page.evaluate(async ([pin, at, downloadAdventure]) => {
    const lib = eval(pin)._s.get('app').svc().backend.library
    const set = 'en-official'
    const before = await lib.currentView()
    const state = await before.officialState(set)
    if (state?.status !== 'installed') throw new Error('测试资料库未装英文官方资料')
    const directory = await lib.directory.get('en')
    const picks = directory.adventures.filter((a) => directory.adventureFiles[a.id]).map((a) => ({ set, id: a.id }))
    const estimates = downloadAdventure ? (await lib.estimate({ sets: [], adventures: picks })).adventures.items : []
    const adventure = estimates.filter((a) => !a.downloaded && a.bytes > 0).sort((a, b) => a.bytes - b.bytes)[0]
    if (downloadAdventure && !adventure) throw new Error('找不到可补装的官方冒险')
    const book = directory.books.find((b) => !state.books || state.books.includes(b.id))
    if (!adventure && !book) throw new Error('测试资料库缺英文官方书')
    const task = adventure ? lib.tasks.startAdventure(set, adventure.id) : lib.tasks.startOfficial(set, { books: [book.id] })
    const installed = await lib.tasks.wait(task)
    const queue = lib.precomputeQueue.state()
    const markers = await lib.db.derived.where('key').startsWith('kc-pending:').toArray()
    const corpus = adventure ? await lib.service.corpus(set, directory.adventureProp, adventure.id) : null
    return { status: installed.status, error: installed.error ?? installed.convertError, kind: installed.kind, published: before.id !== (await lib.currentView()).id, queue, newMarkers: markers.filter((r) => r.savedAt > at).length, corpus: !!corpus }
  }, [P, at, downloadAdventure])
  assert.equal(result.status, 'done', JSON.stringify(result))
  assert.equal(result.published, true, '安装确实发布了资料版本')
  assert.deepEqual(result.queue, { running: null, pending: [], last: null }, '正式安装发布不触发全量换算')
  assert.equal(result.newMarkers, 0, '不用留下重开时会续跑的全量待办')
  if (downloadAdventure) assert.equal(result.corpus, true, '冒险正文可读')
  console.log(`PASS ${engine}：${result.kind} 安装发布，没有开启换算`)

  const failedScripts = new Set()
  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'script') failedScripts.add(new URL(request.url()).pathname)
  })
  page.on('response', (response) => {
    if (!response.ok() && response.request().resourceType() === 'script') failedScripts.add(new URL(response.url()).pathname)
  })
  const use = await page.evaluate(async (pin) => {
    const backend = eval(pin)._s.get('app').svc().backend
    const ownerKey = 'char:precompute-startup-test.png'
    await backend.starter.startCampaign({ ownerKey, ownerLabel: '换算测试', name: '换算测试', ruleId: 'dnd5e2014', codeSet: 'en', picks: [] })
    const lib = backend.library
    const cache = lib.db.derived.where('key').startsWith('kc:')
    const before = new Set(await cache.primaryKeys())
    const monster = (await lib.service.query('en-official', 'monster', { source: 'MM' })).find((row) => row.hash && !row.item.spellcasting && !row.item.legendary)
    if (!monster) throw new Error('测试资料库缺《怪物图鉴》')
    const ref = { set: 'en-official', prop: 'monster', hash: monster.hash }
    try {
      const first = await backend.kernel.createActors(ownerKey, [ref])
      const written = (await cache.primaryKeys()).filter((key) => !before.has(key))
      const savedAt = written.length === 1 ? (await lib.db.derived.get(written[0]))?.savedAt : null
      const second = await backend.kernel.createActors(ownerKey, [ref])
      return { first: first.status, second: second.status, error: first.error ?? second.error, written: written.length, reused: savedAt !== null && (await lib.db.derived.get(written[0]))?.savedAt === savedAt }
    } finally {
      await backend.kernel.close(ownerKey)
    }
  }, P).catch((error) => { throw new Error(`${error.message}，加载失败的脚本：${[...failedScripts].join('、')}`, { cause: error }) })
  assert.equal(use.first, 'complete', JSON.stringify(use))
  assert.equal(use.second, 'complete', JSON.stringify(use))
  assert.equal(use.written, 1, '首次使用时才写入这一条换算结果')
  assert.equal(use.reused, true, '第二次使用复用同一条缓存')
  console.log(`PASS ${engine}：首次结算写入缓存，第二次复用`)
} finally {
  await ctx?.close()
  server.close()
}
