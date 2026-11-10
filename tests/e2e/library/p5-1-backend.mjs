// P5-1 后端（B-18 排序、B-29 自制书、B-33 变体…）的本机局部验证：用已装好中英官方数据的旧测试资料夹的副本（不联网、不改原资料夹），
// 在真实构建的插件里，通过 app store 拿到 backend，逐项核对。结果写进 work/e2e-lib/p5-1-backend-chrome.json。
// 资料夹来源：work/e2e-lib/profile-b2-8a-chrome（原来用端口 47318，浏览器存储按端口分，所以这里也用 47318）。
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p51-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-${engineName}`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
// 联网部分（官方上游检查、自制下载 / 依赖 / 更新检查）需要外网：默认放行 GitHub / jsDelivr，OFFLINE=1 时全部断开
await page.route((u) => !u.href.startsWith(url), (route) => (process.env.OFFLINE ? route.abort() : route.continue()))
await page.goto(url)
await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })



const BOOK = '/Users/xxx/DND- reference（DO NO DELETE！）/homebrew-master/book/D. Larson; Ritual Grafting.json'
const bookText = await readFile(BOOK, 'utf8')

const result = await page.evaluate(async (bookText) => {
  const host = document.querySelector('#trpg-assistant-root')
  const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
  const backend = app.config.globalProperties.$pinia._s.get('app').svc().backend
  const lib = backend.library
  const c = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: [], exclude: [], choices: {} }
  const r = {}
  // ---- B-18 排序：作者 ModalFilter 在小窗里给列和名次 ----
  r.b18 = {}
  for (const prop of ['spell', 'monster', 'item', 'race', 'feat', 'background', 'optionalfeature', 'class', 'action', 'deity', 'vehicle']) {
    try {
      const t0 = performance.now()
      const cols = await lib.sorting.columns('cn', prop)
      const rows = await lib.service.query('cn-official', prop, {})
      const out = { cols: cols.map((x) => x.sort + ':' + x.text), n: rows.length, ranked: {} }
      for (const col of cols) {
        const ranks = await lib.sorting.ranks('cn', prop, col.sort, 'asc')
        const desc = await lib.sorting.ranks('cn', prop, col.sort, 'desc')
        const hashes = rows.map((x) => x.hash).filter(Boolean)
        const covered = hashes.filter((h) => ranks && h in ranks).length
        out.ranked[col.sort] = { covered, of: hashes.length, descDiffers: !!ranks && !!desc && Object.keys(ranks).some((h) => ranks[h] !== desc[h]) }
      }
      out.ms = Math.round(performance.now() - t0)
      r.b18[prop] = out
    } catch (e) { r.b18[prop] = { err: String(e.message ?? e).slice(0, 200) } }
  }
  // ---- B-35 列显示值：作者列表行里每个单元格的文字 ----
  r.b35 = {}
  for (const prop of ['spell', 'monster', 'item', 'race', 'feat', 'background', 'optionalfeature', 'class', 'action']) {
    try {
      const t0 = performance.now()
      const lc = await lib.sorting.cells('cn', prop)
      if (!lc) { r.b35[prop] = { none: true }; continue }
      const rows = (await lib.service.query('cn-official', prop, {})).filter((x) => x.hash)
      const have = rows.filter((x) => lc.cells[x.hash]).length
      const nameCol = lc.columns.findIndex((c) => c.sort === 'name')
      const nameOk = rows.filter((x) => lc.cells[x.hash] && lc.cells[x.hash][nameCol] === x.item.name).length
      r.b35[prop] = { cols: lc.columns.map((c) => `${c.sort}:${c.text}`), n: rows.length, have, nameOk, ms: Math.round(performance.now() - t0) }
    } catch (e) { r.b35[prop] = { err: String(e.message ?? e).slice(0, 200) } }
  }
  try {
    const lc = await lib.sorting.cells('cn', 'spell')
    const fb = (await lib.service.query('cn-official', 'spell', {})).find((x) => x.item.name === '火球术')
    r.b35_fireball = lc && fb ? lc.cells[fb.hash] : null
  } catch (e) { r.b35_fireballErr = String(e.message ?? e).slice(0, 200) }
  // ---- B-36 作者函数翻译的摘要字段 ----
  try {
    const fr = await lib.service.frameOf('cn')
    const q = async (prop, pred) => (await lib.service.query('cn-official', prop, {})).find((x) => pred(x.item))?.item
    const fb = await q('spell', (s) => s.name === '火球术' && s.source === 'PHB')
    const wiz = await q('class', (c) => c.name === '法师' && c.source === 'PHB')
    const dei = await q('deity', (d) => d.name === '阿巴索')
    r.b36 = { spell: (await fr.call('authorFields', 'spell', fb)).lines, cls: (await fr.call('authorFields', 'class', wiz)), deity: (await fr.call('authorFields', 'deity', dei)).lines, unknown: (await fr.call('authorFields', 'zzz', {})).lines }
  } catch (e) { r.b36err = String(e.stack ?? e).slice(0, 300) }
  // 抽查：法术按环阶升序，环阶不下降；按名称升序
  try {
    const rows = (await lib.service.query('cn-official', 'spell', {})).filter((x) => x.hash)
    const byLevel = await lib.sorting.sort('cn', 'spell', rows, (x) => x.hash, 'level', 'asc')
    r.b18_spellLevelMonotonic = byLevel.every((x, i) => i === 0 || x.item.level >= byLevel[i - 1].item.level)
    r.b18_spellFirst = byLevel.slice(0, 3).map((x) => x.item.name + ':' + x.item.level)
    const mons = (await lib.service.query('cn-official', 'monster', {})).filter((x) => x.hash)
    const byCr = await lib.sorting.sort('cn', 'monster', mons, (x) => x.hash, 'cr', 'asc').catch((e) => String(e))
    r.b18_monsterCr = Array.isArray(byCr) ? byCr.slice(0, 3).map((x) => x.item.name + ':' + JSON.stringify(x.item.cr)) : byCr
  } catch (e) { r.b18_spotErr = String(e.stack ?? e).slice(0, 300) }

  // ---- B-33 变体（版本 / 魔法变体）挂在母条目旁边 ----
  try {
    const items = await lib.service.query('cn-official', 'item', {})
    const gen = items.find((x) => x.item.genericVariant && typeof x.item.baseItem === 'string')
    const mother = gen && items.find((x) => x.item.name === gen.item.baseItem.split('|')[0])
    r.b33 = mother ? { mother: mother.item.name, ref: mother.hash } : { none: true }
    if (mother) {
      const v = await lib.scoped.variantsOf(c, { set: 'cn-official', prop: 'item', hash: mother.hash })
      r.b33.count = v.variants.length; r.b33.first = v.variants.slice(0, 3).map((x) => x.item.name)
      const back = await lib.scoped.variantsOf(c, { set: 'cn-official', prop: 'item', hash: gen.hash })
      r.b33.parentOfVariant = back.parent && back.parent.hash
    }
    const mons = await lib.service.query('cn-official', 'monster', {})
    const ver = mons.find((x) => Array.isArray(x.item._versions) && x.item._versions.length)
    if (ver) { const v = await lib.scoped.variantsOf(c, { set: 'cn-official', prop: 'monster', hash: ver.hash }); r.b33.monsterVersions = { name: ver.item.name, n: v.variants.length } }
  } catch (e) { r.b33 = { err: String(e.stack ?? e).slice(0, 300) } }

  // ---- B-29 自制包里的书：装一个真实自制文件（作者格式，来自参考库），看目录、正文、搜索路由、书架行 ----
  try {
    const added = await lib.service.brewImport('cn-brew', [{ name: 'Ritual Grafting.json', text: bookText }])
    r.b29 = { added: added.value.added.length, corpora: added.parse.parse.corpora, notRun: added.parse.parse.notRun, errors: added.parse.parse.errors }
    const listed = await lib.service.brewCorpora('cn-brew')
    r.b29.listed = Object.fromEntries(Object.entries(listed).map(([k, v]) => [k, v.map((x) => x.id + '|' + x.source)]))
    const first = Object.entries(listed).flatMap(([prop, v]) => v.map((x) => ({ prop, ...x })))[0]
    if (first) {
      const body = await lib.service.corpus('cn-brew', first.prop, first.id)
      r.b29.body = { keys: Object.keys(body ?? {}), dataLen: body?.bookData?.data?.length ?? body?.adventureData?.data?.length ?? null }
      const at = await lib.links.locate('cn', first.prop, first.hash)
      r.b29.locate = at && { kind: at.kind, set: at.set, id: at.id }
      const cat = await lib.scoped.catalog(c)
      const row = cat.find((x) => x.set === 'cn-brew' && x.corpora?.some((k) => k.id === first.id))
      r.b29.shelfRow = row ? { source: row.source, corpora: row.corpora } : null
    }
    const packs = await lib.brewPacks.list('cn-brew')
    await lib.service.brewDelete('cn-brew', packs.filter((p) => p.filename?.includes('Ritual')).map((p) => p.docIdLocal))
    r.b29.afterDelete = Object.keys(await lib.service.brewCorpora('cn-brew'))
  } catch (e) { r.b29 = { ...(r.b29 ?? {}), err: String(e.stack ?? e).slice(0, 500) } }
  // ---- B-27 存入我的库：官方的小书（作者办法复制 → 作者导入）----
  try {
    const cat = await lib.scoped.catalog(c)
    const cands = cat.filter((x) => x.set === 'cn-official' && x.kind === 'book' && x.count > 0).sort((a, b) => a.count - b.count)
    let small = cands[0]
    for (const cand of cands) { if ((await lib.service.query('cn-official', 'spell', { source: cand.source })).length >= 3) { small = cand; break } }
    const t0 = performance.now()
    const saved = await lib.custom.saveToMine('cn', { kind: 'source', source: small.source })
    r.b27 = { source: small.source, officialCount: small.count, counts: saved.counts, ms: Math.round(performance.now() - t0), issues: saved.issues.slice(0, 5).map((i) => i.path + ' ' + i.text), parseErrors: saved.parse.parse.errors, altTargets: saved.parse.alternatives.targets, altErrors: saved.parse.alternatives.errors.slice(0, 3) }
    const packs = await lib.brewPacks.list('cn-brew')
    const mine = packs.find((p) => p.sources.map((x) => x.toLowerCase()).includes(small.source.toLowerCase()))
    r.b27.pack = mine && { origin: mine.origin, entryCount: mine.entryCount, filename: mine.filename }
    // 与官方原件对比：同一条，复制后的版本（备选）和官方生效版本是不是一样（只量，不判）
    const spells = (await lib.service.query('cn-official', 'spell', { source: small.source })).filter((x) => x.hash).slice(0, 5)
    const cmp = []
    for (const sp of spells) {
      const d = await lib.scoped.detail(c, { set: 'cn-official', prop: 'spell', hash: sp.hash })
      const alt = d?.alternatives?.[0]
      const diff = alt ? [...new Set([...Object.keys(alt.item), ...Object.keys(d.base)])].filter((k) => JSON.stringify(alt.item[k]) !== JSON.stringify(d.base[k])) : null
      cmp.push({ name: sp.item.name, hasAlt: !!alt, same: alt ? JSON.stringify(alt.item) === JSON.stringify(d.base) : null, diffKeys: diff })
    }
    r.b27.compareSpells = cmp
    // 重复存 = 并进去，不冲掉
    await lib.custom.saveToMine('cn', { kind: 'source', source: small.source })
    r.b27.again = { packsAfter: (await lib.brewPacks.list('cn-brew')).filter((p) => p.sources.map((x) => x.toLowerCase()).includes(small.source.toLowerCase())).length }
    // B-31 拆行：同编号的原件 + 副本
    const rows = await lib.scoped.query(c, 'spell', { source: small.source, expand: true })
    r.b31 = { rows: rows.length, variants: rows.slice(0, 4).map((x) => x.variant?.altId + '|' + (x.variant?.pack ?? '-') + '|' + x.variant?.effective) }
    // B-21 选了副本的版本后，卸载重装副本，选择还在
    if (spells[0]) {
      const target = { set: 'cn-official', prop: 'spell', hash: spells[0].hash }
      const d1 = await lib.scoped.detail(c, target)
      const altId = d1.alternatives[0]?.altId
      await lib.scoped.choose(c, target, altId, 'global')
      const before = (await lib.scoped.detail(c, target)).version
      const docs = (await lib.brewPacks.list('cn-brew')).filter((p) => p.sources.map((x) => x.toLowerCase()).includes(small.source.toLowerCase()))
      const exported = await lib.custom.exportBrew('cn', docs[0].docIdLocal)
      await lib.service.brewDelete('cn-brew', docs.map((p) => p.docIdLocal))
      const gone = (await lib.scoped.detail(c, target)).version
      await lib.service.brewImport('cn-brew', [{ name: exported.filename ?? 'x.json', text: JSON.stringify(exported.body) }])
      const back = (await lib.scoped.detail(c, target)).version
      r.b21 = { altId, before: { altId: before.altId, by: before.by }, gone: { altId: gone.altId, missing: gone.missing }, back: { altId: back.altId, by: back.by } }
    }
    // 清理：删掉副本
    const left = (await lib.brewPacks.list('cn-brew')).filter((p) => p.sources.map((x) => x.toLowerCase()).includes(small.source.toLowerCase()))
    if (left.length) await lib.service.brewDelete('cn-brew', left.map((p) => p.docIdLocal))
    await lib.scoped.manage.setChoice('global', `cn-official|spell|${spells[0]?.hash}`, null)
  } catch (e) { r.b27 = { ...(r.b27 ?? {}), err: String(e.stack ?? e).slice(0, 700) } }

  // ---- B-28 官方上游检查（只比较）----
  try {
    r.b28 = {}
    for (const id of ['cn-official', 'en-official']) { const t0 = performance.now(); const chk = await lib.updates.check(id); r.b28[id] = { ...chk, ms: Math.round(performance.now() - t0) } }
  } catch (e) { r.b28 = { ...(r.b28 ?? {}), err: String(e.stack ?? e).slice(0, 400) } }

  // ---- 联网：B-24 缺依赖一键下载、B-25 传递闭包、B-28 自制检查、B-27 存入下载包 ----
  try {
    const WITH_DEP = 'class/DXHHH101, Sinder, Superxavman; 重振术士.json'
    const cat = await lib.service.brewCatalog('cn-brew')
    const entry = cat.value?.find((x) => x.path === WITH_DEP)
    if (!entry) throw new Error('目录里没有 ' + WITH_DEP + '（目录取不到：' + JSON.stringify(cat.errors).slice(0, 120) + '）')
    const a = await lib.service.brewAddUrl('cn-brew', entry.urlDownload)
    const packs = await lib.brewPacks.list('cn-brew')
    const dep = packs.find((p) => decodeURIComponent(p.url ?? '').includes('果园起源术士'))
    const main = packs.find((p) => decodeURIComponent(p.url ?? '').includes('重振术士'))
    r.net = { added: a.value.length, packs: packs.map((p) => [p.filename, p.origin]) }
    // B-25
    const imp = await backend.removalImpact({ kind: 'brew', setId: 'cn-brew', docIdLocals: [dep.docIdLocal] })
    r.net.b25 = { packs: imp.packs.map((p) => [p.filename, p.mustRemove]), removeTogether: imp.removeTogether.length }
    // B-28 自制检查（只比较）
    const chk = await lib.service.brewCheckUpdates('cn-brew')
    r.net.b28brew = chk.value.map((x) => ({ f: x.filename, has: x.hasUpdate, err: x.error, local: x.local, remote: x.remote }))
    // B-24：删掉依赖包，再用"缺的来源"一键装回
    const depSource = dep.sources[0]
    const delRes = await lib.service.brewDelete('cn-brew', [dep.docIdLocal])
    r.net.delRes = { value: delRes.value, errors: delRes.errors }
    const afterDel = (await lib.brewPacks.list('cn-brew')).map((p) => p.filename)
    const got = await lib.service.brewInstallSources('cn-brew', [depSource, 'NO_SUCH_SOURCE_ZZ'])
    r.net.b24 = { depSource, afterDel, added: got.value.added.map((e) => e.head.filename), notFound: got.value.notFound, back: (await lib.brewPacks.list('cn-brew')).some((p) => p.sources.includes(depSource)) }
    // B-24 另一个没装的来源：目录里随便取一个小文件的来源标识，一键装
    const other = cat.value.find((x) => x.path.startsWith('spell/Sample - Giddy;') && Array.isArray(x.sources) && x.sources.length)
    if (other) {
      const one = await lib.service.brewInstallSources('cn-brew', [other.sources[0]])
      r.net.b24b = { source: other.sources[0], added: one.value.added.map((e) => e.head.filename), notFound: one.value.notFound, parseErrors: one.parse?.parse.errors.length }
    }
    // B-27 存入下载包
    const cp = await lib.custom.saveToMine('cn', { kind: 'pack', docIdLocal: main.docIdLocal })
    r.net.b27pack = { name: cp.name, added: cp.added.length, origins: (await lib.brewPacks.list('cn-brew')).map((p) => p.filename + ':' + p.origin) }
    // 清理
    await lib.service.brewDelete('cn-brew', (await lib.brewPacks.list('cn-brew')).map((p) => p.docIdLocal))
  } catch (e) { r.net = { ...(r.net ?? {}), err: String(e.stack ?? e).slice(0, 700) } }
  return r
}, bookText)
await writeFile(`${work}/p5-1-backend-${engineName}.json`, JSON.stringify({ result, pageErrors }, null, 1))
console.log(JSON.stringify(result, null, 1).slice(0, 6000)); console.log('pageErrors', pageErrors.slice(0, 8))
await ctx.close(); server.close()
