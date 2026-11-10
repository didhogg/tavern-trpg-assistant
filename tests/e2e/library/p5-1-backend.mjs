// P5-1 后端（B-18 排序、B-29 自制书、B-33 变体…）的本机局部验证：用已装好中英官方数据的旧测试资料夹的副本（不联网、不改原资料夹），
// 在真实构建的插件里，通过 app store 拿到 backend，逐项核对。结果写进 work/e2e-lib/p5-1-backend-chrome.json。
// 资料夹来源：work/e2e-lib/profile-b2-8a-chrome（原来用端口 47318，浏览器存储按端口分，所以这里也用 47318）。
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const profile = `${work}/profile-p51-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(900000)
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
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
  return r
}, bookText)
await writeFile(`${work}/p5-1-backend-chrome.json`, JSON.stringify({ result, pageErrors }, null, 1))
console.log(JSON.stringify(result, null, 1).slice(0, 6000)); console.log('pageErrors', pageErrors.slice(0, 8))
await ctx.close(); server.close()
