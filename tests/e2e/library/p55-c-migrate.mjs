// P5.5 B8-6 迁移的本机局部验证：先用 B8 以前的写法造出「迁移前」的状态（可编辑自制里的「我的资料」条目 + 旧式副本），再迁移。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-c-migrate.mjs。结果写进 work/e2e-lib/p55-c-migrate-chrome.json。
import { cp, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p55c-migrate-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(400000)
const pageErrors = []
let phase = 'setup'
page.on('pageerror', (e) => pageErrors.push({ phase, m: String(e.message ?? e).slice(0, 200) }))
await page.exposeFunction('__phase', (p) => { phase = p })
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })

const r = await page.evaluate(async () => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
  const out = {}
  const sp = (n) => ({ name: `迁移术${n}`, source: 'TRPGMINE', level: n, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'self' } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] })
  // 迁移前：B8 以前的写法，「我的资料」在可编辑自制里
  const put = await lib.service.mutateAuthor('cn', 'p55-pre-b8', async (view) => {
    const f = await lib.service.frameOf('cn', view)
    await f.call('editableEnsureSource', { json: 'TRPGMINE', full: '我的资料', abbreviation: '我的' })
    return [await f.call('editablePut', 'spell', sp(1)), await f.call('editablePut', 'spell', sp(2))]
  })
  const u1 = put.value[0].uniqueId
  await lib.db.manage.put({ kind: 'history', key: `cn-brew|spell|${u1}`, value: [{ at: 1, prop: 'spell', before: null }], updatedAt: 1 })
  // 旧式副本：包头只有官方来源，混进一条 Foundry 补充记录，有一条书内 _copy 没声明
  const view = await lib.currentView()
  const official = { id: 'cn-official', codeSet: 'cn', kind: 'official' }
  const overlay = JSON.parse((await view.fileGet(official, 'data/spells/foundry.json')).text).spell.find((e) => e.source === 'PHB')
  const real = (await lib.service.query('cn-official', 'background', {})).find((x) => x.source === 'PHB')
  const rawBg = JSON.parse((await view.fileGet(official, 'data/backgrounds.json')).text).background.find((e) => e.source === 'PHB' && e.name === real.item.name)
  const oldCopy = { _meta: { sources: [{ json: 'PHB', full: '玩家手册', abbreviation: 'PHB' }] }, spell: [overlay], background: [rawBg, { name: '迁移变体背景', source: 'PHB', _copy: { name: rawBg.name, source: 'PHB' } }] }
  await lib.service.brewImport('cn-brew', [{ name: 'PHB.json', text: JSON.stringify(oldCopy) }])
  await lib.custom.manage?.setMeta?.('p55-b8-migrated:cn', null)
  await lib.db.manage.where('[kind+key]').equals(['meta', 'p55-b8-migrated:cn']).delete()
  // 迁移（之前造旧状态时、迁移过程中旧副本还没修时作者报的「找不到 _copy 原件」正是旧副本的老问题，不算；迁移做完以后必须一条都没有）
  await window.__phase('migrate')
  out.report = await lib.custom.ensureMigrated('cn')
  await window.__phase('after')
  out.again = await lib.custom.ensureMigrated('cn')
  const ed = (await (await lib.service.frameOf('cn')).call('editableDoc')).body
  out.editableSources = (ed._meta?.sources ?? []).map((s) => s.json)
  out.editableSpells = (ed.spell ?? []).filter((e) => e.source === 'TRPGMINE').length
  out.packs = (await lib.custom.packs('cn')).map((p) => ({ id: p.id, sources: p.sources, props: p.props }))
  out.mineEntry = (await lib.custom.packEntry('cn', 'trpgmine', 'spell', { uniqueId: u1 }))?.entity ?? null
  out.history = (await lib.scoped.manage.history(`cn-brew|spell|${u1}`))[0] ?? null
  const copyDoc = (await (await lib.service.frameOf('cn')).call('brewRaw')).find((b) => !b.head.isEditable && (b.body._meta?.sources ?? []).length === 1 && b.body._meta.sources[0].json === 'PHB')
  out.oldCopy = { spells: (copyDoc?.body.spell ?? []).length, internalCopies: copyDoc?.body._meta?.internalCopies ?? null }
  // 迁移后新存一条默认进「我的资料」包
  const s3 = await lib.custom.saveEntry('cn', 'spell', { ...sp(3), source: undefined })
  out.newDefault = (await lib.custom.packEntry('cn', 'trpgmine', 'spell', { uniqueId: s3.uniqueId }))?.entity?.source ?? null
  await lib.brewQueue.settled('cn')
  // B8-7：导入一个和「我的资料」同来源的文件 → 预览里提示会替换它
  const pre = await lib.custom.previewImport('cn', [{ name: 'mine-again.json', text: JSON.stringify({ _meta: { sources: [{ json: 'TRPGMINE', full: 'x', abbreviation: 'x' }], edition: 'classic' }, spell: [] }) }])
  out.replaces = pre.replaces
  return out
})

await writeFile(`${work}/p55-c-migrate-chrome.json`, JSON.stringify({ r, pageErrors }, null, 1))
const o = r
check('「我的资料」从可编辑自制搬成独立的包（房规留着），两条都在、编号不变', !o.editableSources.includes('TRPGMINE') && o.editableSpells === 0 && o.packs.some((p) => p.id === 'trpgmine' && p.props.spell === 2) && o.mineEntry?.level === 1, JSON.stringify({ e: o.editableSources, p: o.packs }))
check('撤销记录补上了「在哪个包」', o.history?.pack === 'trpgmine', JSON.stringify(o.history))
check('旧式副本：去掉了 Foundry 补充记录，补上 internalCopies', o.oldCopy.spells === 0 && JSON.stringify(o.oldCopy.internalCopies) === '["background"]', JSON.stringify(o.oldCopy))
check('迁移报告列得出；第二次不再做', o.report?.moved.some((m) => m.source === 'TRPGMINE' && m.entries === 2) && o.report.fixed.length === 1 && o.again === null, JSON.stringify(o.report))
check('迁移后不指定包的新条目进「我的资料」包', o.newDefault === 'TRPGMINE', String(o.newDefault))
check('B8-7 导入预览：和已有包同来源的文件提示会替换哪个包', o.replaces?.length === 1 && o.replaces[0].pack === 'trpgmine', JSON.stringify(o.replaces))
const duringMigrate = pageErrors.filter((e) => e.phase === 'migrate').map((e) => e.m)
const realErrors = pageErrors.filter((e) => e.phase === 'after').map((e) => e.m).filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index|找不到物品类型|找不到物品属性/.test(m))
console.log('迁移过程中作者报的（迁移前打开的小窗读到还没修的旧副本）：', duringMigrate.length)
check('迁移做完以后页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 2).join(' | '))
await page.waitForTimeout(3000)
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
