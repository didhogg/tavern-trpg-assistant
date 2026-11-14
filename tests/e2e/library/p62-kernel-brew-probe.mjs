// 【结果（2026-11-14 跑了两次，Chrome）】自测没过：内核小窗里 StorageUtil 的口子确实被接管（dist/frame-early.js:143），但直接 pGet 一个键
// 不会发出 kv-get；原因是 Plutonium 在 Foundry 里自己把 BrewUtil2._storage 换成了内存存储（Bundle.js:82023），自制走的是另一条路：
// 设置 dataSources.localHomebrew（Bundle.js:77750）→ BrewUtil2.pAddBrewFromUrl（经"取文件"通道，Bundle.js:82357、64523）。
// 所以"把内核的 kvGet 转给库"这条思路不成立，下面的拦截实验（变体 cn / cn+en）没有跑到、也不要照这个思路再用。留着这个文件是为了留下自测和结论。
// 探针：结算内核能不能读到库里的自制包？（B 的第一步，只量、不改 src/，2026-11-14）
// 问题（都是"未验证"，探针只记录事实，不下结论）：
//   Q1 结算小窗里 Plutonium 的 StorageUtil 有没有真的走到宿主的 kv-get（早期钩子 early.ts 有没有接管它）？实际读的是哪个键？
//   Q2 宿主在测试里扮演「把库里的自制存储交给内核」之后，Plutonium 的 BrewUtil2.pGetBrewProcessed() 里有没有自制的子职 / 职业？
//   Q3 这时加自制子职（p58 里一直失败的那一步）会不会成功？
//   Q4 这时用自制职业（厨师职业包，真实中英文件，可选）建人物会不会成功？
//   Q5 代价：结算小窗开机时间、读自制包的时间；以及「中文那套」和「中英两套合并」交给内核有什么区别。
// 做法：不动 src/。测试在宿主这边挂一个"抢先回答"的监听——只回答结算小窗（foundry-…）发来的 kv-get / kv-set / kv-remove：
//   变体 baseline = 照现状答（空）；cn = 把库里中文那套自制存储（HOMEBREW_2_STORAGE）原样交出；cn+en = 中英两套的数组接在一起交出。
//   这就是"让内核的 kvGet 转给库"想做的事，只是写在测试里。每个变体都重开结算小窗；不传换算缓存，所以变体之间不会互相借结果。
// 注意：自制存储的真正键是 HOMEBREW_2_STORAGE（和 _METAS）；HOMEBREW_STORAGE 是旧版迁移用的老键（Plutonium Bundle.js 65687 起）。
// 输入：work/p58-fixtures/ 里的试跑包（同 p58）；可选的厨师职业包用 BREW_ZH / BREW_EN 指向本机两个自制仓库（只读，同 p59），没有就跳过 Q4。
// 端口 47340：profile-p3-1-* 里的官方数据按端口存，47340 已确认有数据（见 p58 文件头）。断网。
// 用法：node tests/e2e/library/p62-kernel-brew-probe.mjs（SKIP_BUILD=1 跳过构建；ENGINE=webkit 跑 WebKit；VARIANTS=baseline,cn 只跑某几个）。
// 结果写进 work/e2e-lib/p62-kernel-brew-probe-<engine>.json。整个脚本 8 分钟强制结束。
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

setTimeout(() => { console.error('p62 超过 8 分钟，强制结束'); process.exit(2) }, 8 * 60 * 1000).unref()

const fixtures = `${work}/../p58-fixtures`
const cnOnly = { name: '试跑者; 试跑包.json', text: await readFile(`${fixtures}/试跑者; 试跑包.json`, 'utf8').catch(() => { throw new Error(`缺测试输入 ${fixtures}/试跑者; 试跑包.json（见该目录 README.txt）`) }) }
const ZH = process.env.BREW_ZH ?? '/Users/xxx/tavern-trpg-data-next/_sources/homebrew-zh'
const EN = process.env.BREW_EN ?? '/Users/xxx/DND- reference（DO NO DELETE！）/homebrew-master'
let cook = null
try {
  const zh = { name: 'Sam Grierson; 厨师The Cook Class.json', text: await readFile(`${ZH}/class/Sam Grierson; 厨师The Cook Class.json`, 'utf8') }
  const en = { name: 'Sam Grierson; The Cook Class.json', text: await readFile(`${EN}/class/Sam Grierson; The Cook Class.json`, 'utf8') }
  const sources = (JSON.parse(zh.text)._meta?.sources ?? []).map((s) => s.json)
  cook = { files: [zh, en], sources }
} catch (e) { console.log('没找到厨师职业包文件，跳过 Q4：', String(e.message ?? e).slice(0, 120)) }
const VARIANTS = [['baseline', null], ['cn', ['cn']], ['cn+en', ['cn', 'en']]].filter(([n]) => !process.env.VARIANTS || process.env.VARIANTS.split(',').includes(n))

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines[engineName === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47340 })
const profile = `${work}/profile-p62-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(420_000)
const pageErrors = []
let curStep = ''
await page.exposeFunction('p62Step', (s) => { curStep = s })
page.on('pageerror', (e) => pageErrors.push(`[${curStep}] ${String(e.stack ?? e)}`.slice(0, 300)))
// 被断网拦掉的请求：加子职时 Plutonium 想联网取什么，网址在这里
const failedRequests = []
page.on('requestfailed', (req) => failedRequests.push(`[${curStep}] ${req.url()}`.slice(0, 260)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())

let r
try {
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  r = await page.evaluate(async ({ cnOnly, cook, VARIANTS }) => {
    const out = { step: 'start', setup: {}, variants: [] }
    const at = async (s) => { out.step = s; await window.p62Step(s) }
    const guard = async (fn) => { try { return await fn() } catch (e) { return { thrown: String(e?.stack ?? e).slice(0, 400) } } }
    try {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
      const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library

      await at('import')
      await lib.bilingual.importFiles([cnOnly]); await lib.brewQueue.settled()
      if (cook) { await lib.bilingual.importFiles(cook.files); await lib.brewQueue.settled() }

      await at('setup')
      const h = await import('/work/e2e-lib/harness.js')
      const lib2 = { ...h.defaultCampaignLibrary('dnd5e2014', 'cn'), include: ['src:testrunpack', ...(cook?.sources ?? []).map((s) => `src:${s.toLowerCase()}`)] }
      const pick = async (set, prop, book, pred) => {
        const p = await h.service.parsed(set, prop)
        for (let i = 0; i < p.items.length; i++) {
          if (book && p.sources[i] !== book) continue
          if (!pred(p.items[i])) continue
          const ref = { set, prop, hash: p.hashes[i] }
          const d = await h.scoped.detail(lib2, ref)
          if (d && !('hidden' in d) && (!book || d.english?.status === 'found')) return { ref, label: p.items[i].name }
        }
        return null
      }
      const fighter = await pick('cn-official', 'class', 'PHB', (it) => it.name === '战士')
      const human = await pick('cn-official', 'race', 'PHB', (it) => !!it.size && !String(it.name).includes('('))
      const bg = await pick('cn-official', 'background', 'PHB', (it) => !!it.skillProficiencies || !!it.entries)
      const subRows = await h.service.parsed('cn-brew', 'subclass')
      const subIdx = subRows.items.findIndex((it) => it.name === '月影斥候' && it.source === 'TestRunPack' && !it._isCopy)
      const mSub = subIdx >= 0 ? { ref: { set: 'cn-brew', prop: 'subclass', hash: subRows.hashes[subIdx] }, label: '月影斥候' } : null
      const cookClass = cook ? await pick('cn-brew', 'class', null, (it) => cook.sources.includes(it.source) && !it._isCopy) : null
      out.setup = { fighter: !!fighter, human: !!human, bg: !!bg, mSub: !!mSub, cook: cook ? !!cookClass : 'skipped' }

      const owner = { ownerKey: 'char:p62.png', ownerLabel: 'P62 内核读自制探针' }
      await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
      await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: owner.ownerLabel })
      await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library: lib2, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
      // 不传 cache：变体之间不借换算结果
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
        campaignOf: async () => ({ rule: 'dnd5e2014', library: lib2, title: owner.ownerLabel }) })

      // ---- 宿主这边：抢先回答结算小窗（foundry-…）的 kv 请求；其它小窗（库的作者小窗）一概不碰 ----
      const view = await lib.currentView()
      const mode = { name: 'none', feed: null, log: [] }
      const mem = new Map()
      const readKv = async (key) => {
        if (mem.has(key)) return mem.get(key)
        if (!mode.feed) return null
        const parts = []
        for (const cs of mode.feed) { const v = await view.kvGet(cs, key); if (v != null) parts.push(v) }
        if (!parts.length) return null
        return parts.every(Array.isArray) ? parts.flat() : parts[0]
      }
      // 监听到的所有传话消息按「类型 / 操作 / 小窗种类」计数：抓不到请求时，靠它看出是消息没来、还是被我的条件挡了
      const tally = {}
      const bump = (k) => { tally[k] = (tally[k] ?? 0) + 1 }
      window.addEventListener('message', (ev) => {
        const m = ev.data
        if (!m || m.channel !== 'trpg-library') return
        const kind = String(m.frame ?? '').split('-')[0] || '(无暗号)'
        bump(`${m.type}/${m.op ?? '-'}/${kind}`)
        if (m.type !== 'request' || kind !== 'foundry' || !/^kv-/.test(String(m.op))) return
        const f = [...document.querySelectorAll('iframe')].find((x) => x.src.includes(m.frame))
        if (!f) { bump('没找到对应的小窗元素（没抢答）'); return }
        ev.stopImmediatePropagation()
        bump(`抢答了/${m.op}`)
        ;(async () => {
          let value = null
          if (m.op === 'kv-get') value = await readKv(m.key)
          else if (m.op === 'kv-set') mem.set(m.key, m.value)
          else mem.delete(m.key)
          mode.log.push({ variant: mode.name, op: m.op, key: m.key, hit: m.op === 'kv-get' ? value != null : null })
          f.contentWindow.postMessage({ channel: 'trpg-library', type: 'response', id: m.id, ok: true, value: value ?? null }, new URL(f.src).origin)
        })()
      }, true)

      const shape = (x) => (x == null ? null : Array.isArray(x) ? { array: x.length } : typeof x === 'object' ? { keys: Object.keys(x).slice(0, 6) } : typeof x)
      // 取"这个战役的内核小窗"：AuthorFrame 自己带着它的 iframe 和暗号，不去页面里扫（页面上可能还有后台预换算另开的小窗）
      const observe = async (session) => {
        const win = session.frame.frame?.contentWindow
        const o = { pageFoundryFrames: document.querySelectorAll('iframe[data-trpg-author-frame="foundry"]').length, token: session.frame.ready?.frame ?? null, storageUtil: typeof win?.StorageUtil, brewUtil2: typeof win?.BrewUtil2, asyncStorageSource: String(win?.StorageUtil?._getAsyncStorage).replace(/\s+/g, ' ').slice(0, 110) }
        // 自测：先主动读一个假键，确认抓得到这个小窗的存储请求；抓不到就别往下做实验
        const before = mode.log.length
        try { await win.StorageUtil.pGet('__p62_selftest__') } catch (e) { o.selfTestError = String(e?.message ?? e).slice(0, 160) }
        o.selfTestCaught = mode.log.slice(before).some((e) => e.key === '__p62_selftest__')
        o.tally = { ...tally }
        const keys = [...new Set(mode.log.filter((e) => e.variant === mode.name).map((e) => `${e.op}:${e.key}`))]
        o.kvKeysSeenSoFar = keys
        try { o.pGetHomebrew2 = shape(await win.StorageUtil.pGet('HOMEBREW_2_STORAGE')) } catch (e) { o.pGetHomebrew2 = { error: String(e?.message ?? e).slice(0, 160) } }
        try {
          const t = performance.now()
          const p = await win.BrewUtil2.pGetBrewProcessed()
          o.processedMs = Math.round(performance.now() - t)
          o.processed = Object.fromEntries(['class', 'subclass', 'classFeature', 'subclassFeature', 'race', 'feat', 'spell', 'monster', 'item'].map((k) => [k, Array.isArray(p?.[k]) ? p[k].length : null]))
        } catch (e) { o.processed = { error: String(e?.message ?? e).slice(0, 160) } }
        return o
      }

      const levelTo3 = async (id) => {
        const sess = (await rt.session(owner.ownerKey)).session
        const cls = (await h.actorData(sess, id)).items.find((i) => i.type === 'class')
        const steps = []
        for (let k = 0; k < 2; k++) { const u = await sess.call('levelUpApply', id, cls._id, 1); steps.push(u.status) }
        return steps
      }

      for (const [name, feed] of VARIANTS) {
        await at(`variant ${name}`)
        mode.name = name; mode.feed = feed; mem.clear()
        await rt.closeAllExcept(null)
        const t0 = performance.now()
        const { session, bootMs } = await rt.session(owner.ownerKey)
        const v = { name, feed, bootMs: Math.round(bootMs), sessionOpenMs: Math.round(performance.now() - t0) }
        v.observe = await guard(() => observe(session))
        v.kvLog = mode.log.filter((e) => e.variant === name).reduce((acc, e) => { const k = `${e.op}:${e.key}${e.hit === null ? '' : e.hit ? ' (有数据)' : ' (空)'}`; acc[k] = (acc[k] ?? 0) + 1; return acc }, {})
        if (!v.observe.selfTestCaught) { out.stoppedEarly = `变体 ${name} 的自测没抓到存储请求，后面的实验没有意义，停下`; out.tally = { ...tally }; out.variants.push(v); break }
        await at(`variant ${name} · 加自制子职`)
        v.addSubclass = !(fighter && human && bg && mSub) ? { skipped: '缺前置条目' } : await guard(async () => {
          const hero = await rt.buildCharacter(owner.ownerKey, { name: `P62 战士 ${name}`, items: [human.ref, bg.ref, fighter.ref], equipment: [] })
          if (hero.status !== 'complete') return { stage: 'build', status: hero.status, error: hero.error ?? null }
          const levels = await levelTo3(hero.id)
          const a = await rt.addToActor(owner.ownerKey, hero.id, [mSub.ref])
          const sess = (await rt.session(owner.ownerKey)).session
          const actor = await h.actorData(sess, hero.id)
          return { levels, status: a.status, error: a.error ?? null, noEnglish: a.noEnglish?.map((x) => x.prop) ?? null, subclassesOnActor: actor.items.filter((i) => i.type === 'subclass').map((i) => i.name) }
        })
        await at(`variant ${name} · 自制职业`)
        v.customClass = !cook ? { skipped: '没有厨师职业包文件' } : !(human && bg && cookClass) ? { skipped: '缺前置条目 / 没挑到职业' } : await guard(async () => {
          const hero = await rt.buildCharacter(owner.ownerKey, { name: `P62 厨师 ${name}`, items: [human.ref, bg.ref, cookClass.ref], equipment: [] })
          const sess = (await rt.session(owner.ownerKey)).session
          const actor = hero.id ? await h.actorData(sess, hero.id) : null
          return { status: hero.status, error: hero.error ?? null, classesOnActor: actor?.items.filter((i) => i.type === 'class').map((i) => ({ name: i.name, levels: i.system?.levels })) ?? null }
        })
        out.variants.push(v)
      }
      out.tally = { ...tally }
      await rt.closeAllExcept(null)
      await at('done')
    } catch (e) { out.error = String(e?.stack ?? e).slice(0, 1500) }
    return out
  }, { cnOnly, cook, VARIANTS })
} finally {
  await writeFile(`${work}/p62-kernel-brew-probe-${engineName}.json`, JSON.stringify({ r, pageErrors, failedRequests }, null, 2))
}

if (r?.error) { console.log('STEP', r.step, r.error); await ctx.close(); server.close(); await rm(profile, { recursive: true, force: true }); process.exit(1) }
check('探针前置：战士 / 人类 / 背景 / 自制子职都挑到了（否则后面的"加子职"没有意义）', r.setup.fighter && r.setup.human && r.setup.bg && r.setup.mSub, JSON.stringify(r.setup))
check('探针前置：至少开出了一个结算小窗，并且自测抓得到它的存储请求（抓不到，后面的实验不算数）', r.variants.length >= 1 && r.variants.every((v) => typeof v.bootMs === 'number') && r.variants.every((v) => v.observe?.selfTestCaught), JSON.stringify({ stoppedEarly: r.stoppedEarly ?? null, variants: r.variants.map((v) => [v.name, v.bootMs, v.observe?.selfTestCaught]) }))
console.log('\n监听到的传话消息（类型/操作/小窗种类 → 次数）：', JSON.stringify(r.tally))
if (r.stoppedEarly) console.log('提前停下：', r.stoppedEarly)
const failedUnique = [...new Set(failedRequests.map((x) => x.replace(/\?.*$/, '')))]
console.log('被断网拦掉的请求（去掉查询串、去重）：', JSON.stringify(failedUnique.slice(0, 12)))
for (const v of r.variants) {
  console.log(`\n## 变体 ${v.name}（交给内核的自制：${v.feed ? v.feed.join(' + ') : '无，照现状'}）  开机 ${v.bootMs} 毫秒`)
  console.log('  Q1 小窗里的存储口子：', JSON.stringify({ StorageUtil: v.observe.storageUtil, BrewUtil2: v.observe.brewUtil2, 口子源码: v.observe.asyncStorageSource }))
  console.log('  Q1 小窗向宿主要过的存储键（次数）：', JSON.stringify(v.kvLog))
  console.log('  Q1 直接读 HOMEBREW_2_STORAGE：', JSON.stringify(v.observe.pGetHomebrew2))
  console.log(`  Q2 BrewUtil2.pGetBrewProcessed（${v.observe.processedMs ?? '?'} 毫秒）：`, JSON.stringify(v.observe.processed))
  console.log('  Q3 加自制子职：', JSON.stringify(v.addSubclass))
  console.log('  Q4 自制职业建人物：', JSON.stringify(v.customClass))
}
console.log(`\n页面报错 ${pageErrors.length} 条（见 json）`)
await ctx.close()
server.close()
await rm(profile, { recursive: true, force: true })
console.log(failures.length ? `前置检查 FAIL ${failures.length}（结果仍在 work/e2e-lib/p62-kernel-brew-probe-${engineName}.json）` : `探针跑完（结果 work/e2e-lib/p62-kernel-brew-probe-${engineName}.json；上面是观察，不是通过 / 失败）`)
process.exit(failures.length ? 1 : 0)
