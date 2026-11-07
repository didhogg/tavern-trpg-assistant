// 中英对照转换（蓝图 §3.1、§8：中文条目走英文对照转换是推断方案，a 段用中英两套全量转换比对确认）。
// 两套作者数据都来自中文站原件（参考目录只读）：data/ 是中文；data-bak/ 是同一版本的英文原件
// （中文站作者自己的配对方式：查英文原文时把 data/ 换成 data-bak/）。
// Plutonium 不读 data/，读的是它原包自带的 5etools 数据拷贝（modules/plutonium/data/）；这里让它读这两套（原包独有的补充文件照旧读原包）。
// 两个插件结算小窗各读一套，用作者加载器展开、只留作者判断的旧版来源（与 ⓪ 探路生成英文条目集同一做法），
// 按类别、位置配对，并核对“中文条目的英文名 = 英文条目名、来源相同”，对不上的单列；
// 然后用同一个转换命令各转一遍、逐项比较。差异按“值是不是中文文字”自动分两类，按路径汇总；不手工判断、不改数据。
import { chromium, webkit } from 'playwright-core'
import { assets, save } from './assets.mjs'
import { openKernel, plutoniumDataFrom, unexpectedErrors } from './kernel-page.mjs'

const BATCH = Number(process.env.BATCH ?? 50)
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity
const input = await assets()

/** 在结算小窗里：照 ⓪ 探路（p3-2-effects-browser.mjs）用作者加载器展开条目，只留旧版来源，怪物子条目由作者生成。 */
const CORPUS = async () => {
  const src = await (await fetch(new URL('modules/plutonium/js/Bundle.js', document.baseURI))).text()
  const AsyncFn = Object.getPrototypeOf(async () => undefined).constructor
  const C = await new AsyncFn(`${src}\n;return { DataLoader, SourceUtil, Renderer, MiscUtil, DataConverterCreatureFeature, Config, ConfigConsts, ImplementationRegistryImportList, Vetools, VetoolsLinks, UtilDamageTypes, Dnd5eUtil, SideDataInterfaces };`)()
  C.Config._CONFIG_TEMP = { dataSources: { baseSiteUrl: new URL('.', document.baseURI).href }, misc: { rulesVersion: 'classic' } }
  C.ConfigConsts.prePreInit({ implRegistryImportList: C.ImplementationRegistryImportList.get() })
  C.Config._CONFIG = C.Config.api_getDefaults()
  C.Config._CONFIG_PLAYER = C.Config._getDefaultPlayerConfig()
  C.Vetools.prePreInit_preConfig(); C.VetoolsLinks.prePreInit_postConfig(); C.Vetools.prePreInit_postConfig()
  C.UtilDamageTypes.init(); C.Dnd5eUtil.init(); C.Vetools.init(); C.SideDataInterfaces.init()
  const corpus = {}; const loadErrors = {}
  for (const prop of ['class', 'subclass', 'classFeature', 'subclassFeature', 'feat', 'optionalfeature', 'spell', 'item', 'race', 'raceFeature', 'background', 'monster']) {
    try { corpus[prop] = ((await C.DataLoader.pCacheAndGetAllSite(prop)) ?? []).filter(ent => C.SourceUtil.isClassicSource(ent.source)) }
    catch (e) { loadErrors[prop] = String(e.stack).slice(0, 500) }
  }
  corpus.monsterFeature = []
  const childErrors = []
  for (const mon of corpus.monster ?? []) for (const prop of C.Renderer.monster.CHILD_PROPS_EXTENDED) for (const entry of mon[prop] ?? []) {
    try { corpus.monsterFeature.push(C.DataConverterCreatureFeature.getFauxFeature(mon, entry, prop, { isIgnoreActorData: true })) }
    catch (e) { childErrors.push(`${mon.name}|${mon.source} ${prop}: ${String(e.message).slice(0, 200)}`) }
  }
  globalThis.__corpus = C.MiscUtil.copyFast(corpus)
  return { counts: Object.fromEntries(Object.entries(corpus).map(([k, v]) => [k, v.length])), loadErrors, childErrors }
}

const CJK = /[㐀-鿿]/
const flatten = (v, path = '', out = {}) => {
  if (v && typeof v === 'object') { for (const k of Object.keys(v)) flatten(v[k], path ? `${path}.${k}` : k, out); if (!Object.keys(v).length) out[path] = Array.isArray(v) ? '[]' : '{}' }
  else out[path] = v
  return out
}
const groupOf = path => path.replace(/\.\d+(?=\.|$)/g, '.#').replace(/\.[A-Za-z0-9]{16}(?=\.|$)/g, '.{id}')

for (const [name, engine, launch] of [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const browser = await engine.launch(launch)
  const result = { engine: name, counts: {}, pairing: { mismatched: [] }, props: {}, text: {}, rules: {}, examples: [] }
  const errors = []
  try {
    const open = async dataRoot => {
      const page = await (await browser.newContext()).newPage()
      await openKernel(page, input, errors, { moduleIds: ['lib-wrapper'], dataRoot, plutoniumData: dataRoot, files: 'reference' })
      const frame = page.frames().find(f => f.url().includes('/vendor/foundry/frame.html'))
      return { page, frame }
    }
    // 读条目和转换分开两个小窗：Plutonium 原包源码在一个小窗里只能执行一次（转换命令自己执行一次）
    console.error('stage: corpus')
    const [zhSrc, enSrc] = await Promise.all([open('5etools-cn-main/data'), open('5etools-cn-main/data-bak')])
    const [zhC, enC] = await Promise.all([zhSrc.frame.evaluate(CORPUS), enSrc.frame.evaluate(CORPUS)])
    console.error('stage: open')
    const [zh, en] = await Promise.all([open('5etools-cn-main/data'), open('5etools-cn-main/data-bak')])
    const slice = (side, prop, a, b) => side.frame.evaluate(([p, x, y]) => globalThis.__corpus[p].slice(x, y), [prop, a, b])
    result.counts = { zh: zhC.counts, en: enC.counts, loadErrors: { zh: zhC.loadErrors, en: enC.loadErrors }, childErrors: { zh: zhC.childErrors, en: enC.childErrors } }
    const classes = { zh: await slice(zhSrc, 'class', 0, Infinity), en: await slice(enSrc, 'class', 0, Infinity) }
    for (const prop of Object.keys(zhC.counts)) {
      const n = Math.min(zhC.counts[prop], enC.counts[prop] ?? 0, LIMIT)
      const tally = (result.props[prop] = { zh: zhC.counts[prop], en: enC.counts[prop] ?? 0, compared: 0, pairMismatch: 0, same: 0, textOnly: 0, rules: 0 })
      for (let i = 0; i < n; i += BATCH) {
        const range = [i, Math.min(i + BATCH, n)]
        const run = async (side, src, scope) => {
          const entries = await slice(src, prop, ...range)
          return { keys: entries.map(e => ({ name: e.name, eng: e.ENG_name ?? null, source: e.source })), rows: await side.page.evaluate(([p, list, cls]) => globalThis.__kernel.call('convert', p, list, { class: cls }), [prop, entries, scope]) }
        }
        const [z, e] = await Promise.all([run(zh, zhSrc, classes.zh), run(en, enSrc, classes.en)])
        z.rows.forEach((zr, j) => {
          const zk = z.keys[j]; const ek = e.keys[j]
          if ((zk.eng ?? zk.name) !== ek.name || zk.source !== ek.source) { tally.pairMismatch++; if (result.pairing.mismatched.length < 200) result.pairing.mismatched.push({ prop, index: i + j, zh: zk, en: ek }); return }
          tally.compared++
          const fz = flatten({ status: zr.error ? 'error' : zr.notAttempted ? 'boundary' : 'converted', type: zr.type, system: zr.system, effects: zr.effects })
          const fe = flatten({ status: e.rows[j].error ? 'error' : e.rows[j].notAttempted ? 'boundary' : 'converted', type: e.rows[j].type, system: e.rows[j].system, effects: e.rows[j].effects })
          let text = 0; let rules = 0
          for (const path of new Set([...Object.keys(fz), ...Object.keys(fe)])) {
            if (JSON.stringify(fz[path]) === JSON.stringify(fe[path])) continue
            const bucket = typeof fz[path] === 'string' && CJK.test(fz[path]) ? 'text' : 'rules'
            const g = `${prop}: ${groupOf(path)}`
            result[bucket][g] = (result[bucket][g] ?? 0) + 1
            if (bucket === 'text') text++
            else { rules++; if (result.examples.length < 60 && !result.examples.some(x => x.group === g)) result.examples.push({ group: g, entry: `${ek.name}|${ek.source}`, zh: fz[path] ?? null, en: fe[path] ?? null }) }
          }
          if (rules) tally.rules++
          else if (text) tally.textOnly++
          else tally.same++
        })
        process.stdout.write(`\r${name} ${prop} ${range[1]}/${n}   `)
      }
      console.log(`\n${name} ${prop}`, JSON.stringify(tally))
    }
  } catch (error) {
    result.failure = error.stack ?? String(error)
    process.exitCode = 1
  } finally {
    result.unexpectedErrors = unexpectedErrors(errors)
    result.plutoniumDataFrom = { ...plutoniumDataFrom }
    const top = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 25)
    result.rulesTop = top(result.rules); result.textTop = top(result.text)
    await save(`convert-zh-${name}.json`, result)
    console.log(JSON.stringify({ engine: name, counts: result.counts, props: result.props, rulesTop: result.rulesTop.slice(0, 15), unexpectedErrors: result.unexpectedErrors.slice(0, 3), failure: result.failure?.slice(0, 500) }, null, 1))
    await browser.close()
  }
}
