// 自制包中英文条目配对：中文版把条目重排过顺序的真实包，不再配错（A1，2026-11-14）。
// 真实插件函数 counterparts.counterpart（界面切 En / 中文用的同一个入口），真实包，两个方向都查：
//   对照 = Laserllama 专长合集（本来就对齐）；厨师职业包（子职顺序不同）；万兽图志 3（怪物顺序不同，抽前 300 条）。
// 判对错的标准：中文条目的 ENG_name = 对面英文条目的 name（作者中文版自己的“英文名锚点”；不逐条人工核对，数据对不对归上游）。
// 输入是两个本机自制仓库的真实文件（只读）：中文 _sources/homebrew-zh，英文 DND- reference/homebrew-master（路径可用 BREW_ZH / BREW_EN 覆盖）。
// 用法：node tests/e2e/library/p59-brew-pair-names.mjs（SKIP_BUILD=1 跳过构建；ENGINE=webkit 跑 WebKit）。
// 端口：基础资料夹 profile-p3-1-* 的官方数据按端口存，只有部分端口有数据；47342 已确认有（见 p58 文件头说明）。
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

const ZH = process.env.BREW_ZH ?? '/Users/xxx/tavern-trpg-data-next/_sources/homebrew-zh'
const EN = process.env.BREW_EN ?? '/Users/xxx/DND- reference（DO NO DELETE！）/homebrew-master'
const packs = [
  { key: 'control', label: '对照：Laserllama 专长合集（本来就对齐）', zh: `${ZH}/feat/Laserllama; 专长合集.json`, en: `${EN}/feat/Laserllama; Compendium of Feats.json`, cap: 400 },
  { key: 'cook', label: '厨师职业包（子职顺序不同）', zh: `${ZH}/class/Sam Grierson; 厨师The Cook Class.json`, en: `${EN}/class/Sam Grierson; The Cook Class.json`, cap: 400 },
  { key: 'tob3', label: '万兽图志 3（怪物顺序不同，抽前 300 条）', zh: `${ZH}/creature/Kobold Press; 万兽图志 3.json`, en: `${EN}/creature/Kobold Press; Tome of Beasts 3.json`, cap: 300 },
]
const inputs = []
for (const p of packs) inputs.push({ ...p, files: [{ name: p.zh.split('/').pop(), text: await readFile(p.zh, 'utf8') }, { name: p.en.split('/').pop(), text: await readFile(p.en, 'utf8') }] })

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines[engineName === 'webkit' ? 1 : 0]
const results = {}
for (const p of inputs) {
  const profile = `${work}/profile-p59-${engineName}`
  await rm(profile, { recursive: true, force: true })
  await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true })
  const { server, url } = await startStatic({ port: 47342 })
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  page.setDefaultTimeout(420_000)
  await page.route((u) => !u.href.startsWith(url), (route) => route.abort())
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  results[p.key] = await page.evaluate(async ({ files, cap }) => {
    const host = document.querySelector('#trpg-assistant-root')
    const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
    const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
    const out = { step: 'import' }
    try {
      await lib.bilingual.importFiles(files)
      await lib.brewQueue.settled()
      out.packs = (await lib.bilingual.packs()).map((x) => ({ id: x.id, zh: !!x.zh, en: !!x.en }))
      const props = ['monster', 'subclass', 'subclassFeature', 'feat', 'class', 'classFeature', 'spell', 'item', 'race', 'optionalfeature']
      const dirs = { zh: { set: 'cn-brew', from: 'ENG_name', to: 'name', other: 'en-brew' }, en: { set: 'en-brew', from: 'name', to: 'ENG_name', other: 'cn-brew' } }
      for (const [dir, d] of Object.entries(dirs)) {
        out.step = `counterpart ${dir}`
        const stat = { right: 0, wrong: 0, none: 0, ambiguous: 0, skipped: 0 }
        const wrongSamples = []
        let seen = 0
        for (const prop of props) {
          let rows = []
          try { rows = await lib.service.query(d.set, prop) } catch { continue }
          for (const row of rows) {
            if (seen >= cap) break
            seen++
            // 判对错的标准：中文条目的 ENG_name 就是英文条目的 name
            const anchor = dir === 'zh' ? row.item?.ENG_name : row.item?.name
            if (typeof anchor !== 'string') { stat.skipped++; continue }
            const c = await lib.counterparts.counterpart({ set: d.set, prop, hash: row.hash })
            if (!c.refs?.length) { stat.none++; continue }
            if (c.refs.length > 1) { stat.ambiguous++; continue }
            const found = await lib.service.storedItem(c.refs[0].set, prop, c.refs[0].hash)
            const got = found?.item?.[d.to]
            if (got === anchor) stat.right++
            else { stat.wrong++; if (wrongSamples.length < 4) wrongSamples.push(`${prop}：${row.item.name}（${anchor}）→ ${got}`) }
          }
          if (seen >= cap) break
        }
        out[dir] = { checked: seen, ...stat, wrongSamples }
      }
    } catch (e) { out.error = String(e?.message ?? e).slice(0, 300) }
    return out
  }, { files: p.files, cap: p.cap })
  await ctx.close()
  server.close()
}
await rm(`${work}/profile-p59-${engineName}`, { recursive: true, force: true })
await writeFile(`${work}/p59-brew-pair-names-${engineName}.json`, JSON.stringify(results, null, 2))

for (const p of packs) {
  const r = results[p.key]
  console.log(`## ${p.label}`)
  console.log(JSON.stringify({ packs: r.packs, 中文到英文: r.zh && { ...r.zh, wrongSamples: undefined }, 英文到中文: r.en && { ...r.en, wrongSamples: undefined }, error: r.error }))
  for (const s of [...(r.zh?.wrongSamples ?? []), ...(r.en?.wrongSamples ?? [])]) console.log('  配错：', s)
}
for (const p of packs) {
  const r = results[p.key]
  check(`${p.label}：导入成功，包里中英都有`, !r.error && r.packs?.length === 1 && r.packs[0].zh && r.packs[0].en, JSON.stringify({ packs: r.packs, error: r.error }))
  check(`${p.label}：中文 → 英文没有配错的`, r.zh?.wrong === 0, JSON.stringify(r.zh))
  check(`${p.label}：英文 → 中文没有配错的`, r.en?.wrong === 0, JSON.stringify(r.en))
}
const c = results.control
check('对照包（本来就对齐）：两个方向都全对，没有退化', c.zh?.right > 0 && c.zh.right + c.zh.skipped === c.zh.checked && c.en?.right > 0 && c.en.right + c.en.skipped === c.en.checked, JSON.stringify({ zh: c.zh, en: c.en }))
for (const k of ['cook', 'tob3']) {
  const r = results[k]
  check(`${k}：重排过顺序的包里，绝大多数条目现在能配上正确的对面条目（配对 > 80%）`, r.zh?.right / Math.max(1, r.zh.checked - r.zh.skipped) > 0.8, JSON.stringify(r.zh))
}
console.log(failures.length ? `FAIL ${failures.length}（见 work/e2e-lib/p59-brew-pair-names-${engineName}.json）` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
