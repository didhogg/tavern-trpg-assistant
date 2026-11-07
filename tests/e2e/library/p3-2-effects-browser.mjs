// ⓪ 探路环境：作者原件；空壳仅允许载入，实际转换遇到缺依赖就失败。
export async function probeEffects({ EXPORTS, system, debug }) {
  // ---- 万能空壳：任何属性、调用、new、继承都返回空壳；记下被要过的名字 ----
  const asked = new Set(); let strict = false; const stubCalls = new Map()
  const store = new WeakMap()
  const make = (path) => {
    const f = function () {}
    const kids = new Map()
    const p = new Proxy(f, {
      get(t, k) {
        if (strict) throw new Error(`HOST_MISSING: ${path}.${String(k)}`)
        if (k === Symbol.toPrimitive) return () => ''
        if (k === Symbol.iterator) return function* () {}
        if (k === Symbol.unscopables || k === 'then' || k === 'toJSON') return undefined
        if (k === 'prototype') return t.prototype
        if (!kids.has(k)) kids.set(k, make(`${path}.${String(k)}`))
        return kids.get(k)
      },
      set(_t, k, v) { kids.set(k, v); return true },
      apply() { stubCalls.set(path, (stubCalls.get(path) ?? 0) + 1); if (strict) throw new Error(`HOST_MISSING: ${path}()`); return make(`${path}()`) },
      construct() { if (strict) throw new Error(`HOST_MISSING: new ${path}`); return make(`new ${path}`) },
    })
    store.set(p, path)
    return p
  }
  const scopeVals = new Map()
  const scope = new Proxy({}, {
    // 模块系统探测用的名字不接：让整包开头的存储库（localForage）按普通网页装到全局
    has(_t, k) { return typeof k === 'string' && !(k in globalThis) && !['exports', 'define', 'module', 'require'].includes(k) },
    get(_t, k) {
      if (k === Symbol.unscopables) return undefined
      if (strict && (!scopeVals.has(k) || store.has(scopeVals.get(k)))) throw new Error(`HOST_MISSING: ${String(k)}`)
      if (!scopeVals.has(k)) { asked.add(String(k)); scopeVals.set(k, make(String(k))) }
      return scopeVals.get(k)
    },
    set(_t, k, v) { scopeVals.set(k, v); return true },
  })
  // ① DDB-Importer 的 Foundry 替身：真正的 foundry.utils、CONFIG 骨架、slugify（作为真实全局）
  await new Promise((ok, bad) => { const el = document.createElement('script'); el.src = '/shim.js'; el.onload = ok; el.onerror = bad; document.head.append(el) })
  await new Promise((ok, bad) => { const el = document.createElement('script'); el.src = '/official.js'; el.onload = ok; el.onerror = bad; document.head.append(el) })
  const regressionInput = [{ changes: [{ key: 'flags.dnd5e.initiativeAlert', value: true }] }]
  const regression = { mockIsArray: Array.isArray(foundry.utils.expandObject(regressionInput)), officialRoundTrip: JSON.stringify(OfficialFoundry.utils.expandObject(regressionInput)) === JSON.stringify(regressionInput) }
  globalThis.foundry.utils = { ...globalThis.foundry.utils, ...OfficialFoundry.utils }
  globalThis.CONST = { ...globalThis.CONST, ...OfficialFoundry.constants }
  globalThis.foundry.data.validators = OfficialFoundry.validators
  globalThis.Collection = OfficialFoundry.utils.Collection
  globalThis.Color = OfficialFoundry.utils.Color
  globalThis.game.packs = new OfficialFoundry.utils.Collection()
  // Foundry 官方 v14 文档定义的本地化别名；沿用作者测试环境的本地化函数，不补算法。
  globalThis._loc = game.i18n.localize.bind(game.i18n)
  globalThis.game.system = system
  globalThis.game.userId = game.user.id
  globalThis.game.data = { users: [{ _id: game.user.id, role: CONST.USER_ROLES.GAMEMASTER }] }
  const getSetting = game.settings.get
  game.settings.get = (ns, key) => ns === 'dnd5e' && key === 'rulesVersion' ? 'legacy' : getSetting(ns, key)
  // 替身是部分实现：给它的真实全局对象包一层"有就用真的，缺了才走空壳"
  const wrapCache = new WeakMap()
  const fallback = (obj, path) => {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function') || Array.isArray(obj)) return obj
    if (wrapCache.has(obj)) return wrapCache.get(obj)
    const w = new Proxy(obj, { get(t, k, r) {
      if (typeof k === 'symbol' || k === 'then' || k === 'toJSON') return Reflect.get(t, k, r)
      if (!(k in t)) { if (strict) throw new Error(`HOST_MISSING: ${path}.${String(k)}`); asked.add(`${path}.${String(k)}`); return make(`${path}.${String(k)}`) }
      const v = Reflect.get(t, k, r)
      return v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype ? fallback(v, `${path}.${String(k)}`) : v
    } })
    wrapCache.set(obj, w)
    return w
  }
  { const sg = globalThis.game.settings.get; globalThis.game.settings.get = (ns, key) => (ns === 'plutonium' ? undefined : sg(ns, key)) }
  { const g = globalThis.game.modules.get; globalThis.game.modules.get = (id) => g(id) ?? (id === 'lib-wrapper' ? { active: true, version: '1.13.0.0' } : undefined) }
  // DDB 的文档模型替身不是实际计算器。运行阶段禁止使用它们，不能把空返回当正确结果。
  const guardModels = (object, path) => new Proxy(object, { get(target, key) {
    const value = target[key]
    if (strict && typeof value === 'function') throw Error(`HOST_MODEL_MISSING: ${path}.${String(key)}`)
    return value && typeof value === 'object' ? guardModels(value, `${path}.${String(key)}`) : value
  } })
  game.dnd5e = guardModels(game.dnd5e, 'game.dnd5e')
  const rawGlobals = Object.fromEntries(['foundry', 'game', 'CONFIG', 'CONST', 'ui'].map(g => [g, globalThis[g]]))
  for (const g of ['foundry', 'game', 'CONFIG', 'CONST', 'ui']) if (globalThis[g]) globalThis[g] = fallback(globalThis[g], g)
  const AsyncFn0 = Object.getPrototypeOf(async function () {}).constructor
  // ② dnd5e 6.1 真实规则配置：整个系统打包后在空壳作用域里载入（Foundry 基类由空壳接住）
  const dnd5eSrc = await (await fetch('/dnd5e.js')).text()
  let dnd5eErr = null
  try { await new AsyncFn0('__S', `with (__S) {\n${dnd5eSrc}\n}`)(scope) } catch (e) { dnd5eErr = String(e?.stack ?? e).split('\n').slice(0, 3).join(' | ') }
  if (globalThis.__DND5E) globalThis.CONFIG.DND5E = globalThis.__DND5E
  if (!dnd5eErr) globalThis.__APPLY_LEGACY()
  // 唯一不是空壳的：Hooks 真的记下回调，之后按 Foundry 的顺序触发，让 Plutonium 走自己的启动流程
  const hooks = new Map()
  const reg = (n, f) => { hooks.set(n, [...(hooks.get(n) ?? []), f]); return hooks.get(n).length }
  scopeVals.set('Hooks', { once: reg, on: reg, off() {}, callAll() { return true }, call() { return true } })
  const src = await (await fetch('/bundle.js')).text()
  const AsyncFn = Object.getPrototypeOf(async function () {}).constructor
  let C
  try {
    C = await new AsyncFn('__S', `with (__S) {\n${src}\n;return { ${EXPORTS.join(', ')} };\n}`)(scope)
  } catch (e) {
    return { stage: 'load', error: String(e?.stack ?? e).split('\n').slice(0, 4).join(' | '), asked: [...asked].slice(0, 80) }
  }
  // 仅准备作者转换器所需的数据与配置，不启动整套 Foundry 界面/网络插件。
  const temp = { dataSources: { baseSiteUrl: location.origin + '/' }, misc: { rulesVersion: 'classic' } }
  C.Config._CONFIG_TEMP = temp
  C.ConfigConsts.prePreInit({ implRegistryImportList: C.ImplementationRegistryImportList.get() })
  C.Config._CONFIG = C.Config.api_getDefaults()
  C.Config._CONFIG_PLAYER = C.Config._getDefaultPlayerConfig()
  C.Vetools.prePreInit_preConfig()
  C.VetoolsLinks.prePreInit_postConfig()
  C.Vetools.prePreInit_postConfig()
  C.UtilDamageTypes.init()
  C.Dnd5eUtil.init()
  C.Vetools.init()
  C.SideDataInterfaces.init()
  void CONFIG.DND5E.enrichmentLookup
  const startupMissing = [...asked]
  const timeout = (promise, ms) => { let timer; return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('PROBE_TIMEOUT ' + ms)), ms) })]).finally(() => clearTimeout(timer)) }
  const props = ['class', 'subclass', 'classFeature', 'subclassFeature', 'feat', 'optionalfeature', 'spell', 'item', 'race', 'raceFeature', 'background', 'monster']
  const census = {}; const rows = []; const corpus = {}; const loadErrors = {}
  for (const prop of props) {
    console.log('[probe-progress] load ' + prop)
    try {
      const all = await DataLoader.pCacheAndGetAllSite(prop) ?? []
      const filtered = all.filter(ent => SourceUtil.isClassicSource(ent.source))
      census[prop] = { all: all.length, classic: filtered.length, excluded: all.length - filtered.length }
      corpus[prop] = filtered
    } catch(e) { loadErrors[prop] = String(e.stack) }
  }
  const childErrors = []
  corpus.monsterFeature = []
  for (const mon of corpus.monster ?? []) for (const prop of Renderer.monster.CHILD_PROPS_EXTENDED) for (const entry of mon[prop] ?? []) {
    try { corpus.monsterFeature.push(C.DataConverterCreatureFeature.getFauxFeature(mon, entry, prop, { isIgnoreActorData: true })) }
    catch(e) { childErrors.push({ parent: mon.name, source: mon.source, prop, error: String(e.message) }) }
  }
  census.monsterFeature = { classic: corpus.monsterFeature.length, note: '作者按怪物生成的子条目；不与父条目相加当覆盖率' }
  const inputCorpus = MiscUtil.copyFast(corpus)
  const converters = { classFeature: C.DataConverterClassSubclassFeature, subclassFeature: C.DataConverterClassSubclassFeature, feat: C.DataConverterFeat, optionalfeature: C.DataConverterOptionalfeature, spell: C.DataConverterSpell, item: C.DataConverterItem, race: C.DataConverterRace, raceFeature: C.DataConverterRaceFeature, monsterFeature: C.DataConverterCreatureFeature, background: C.DataConverterBackground }
  // 配置表缺少可选键本来应返回 undefined；不能递归代理作者的数据。
  Object.assign(globalThis, rawGlobals)
  strict = true; asked.clear(); stubCalls.clear()
  for (const [kind, items] of Object.entries(corpus)) {
    console.log('[probe-progress] convert ' + kind + ' ' + items.length)
    for (const ent of items) {
      if (debug && ent.name !== debug) continue
      const row = { kind, name: ent.name, source: ent.source, hash: UrlUtil.URL_TO_HASH_BUILDER[ent.__prop ?? kind]?.(ent), owner: ent.className ?? null }
      row.fields = Object.keys(ent).filter(k => !k.startsWith('_'))
      row.srd = ent.srd ?? null
      row.ownerCompatible = [ent.classSource, ent.subclassSource].filter(Boolean).every(source => SourceUtil.isClassicSource(source))
      if (!row.ownerCompatible) { row.notAttempted = '所属职业/子职业来源不是作者判断的旧版；资料可见不代表兼容 2014 结算'; rows.push(row); continue }
      if (ent.__prop === 'monsterSpellcasting') { row.notAttempted = '必须走作者完整 NPC 施法导入流程；不能把原始施法对象当普通特性'; rows.push(row); continue }
      try {
        if (kind === 'class') {
          const doc = await timeout(C.DataConverterClass.pGetDocumentJsonClass(MiscUtil.copyFast(ent), { isClsDereferenced: true }), 2000)
          row.effects = doc.effects ?? []; row.system = doc.system; row.type = doc.type
        } else if (kind === 'subclass') {
          const cls = corpus.class.find(c => c.name === ent.className && c.source === ent.classSource)
          if (!cls) throw Error('Parent class outside input scope')
          const doc = await timeout(C.DataConverterClass.pGetDocumentJsonSubclass(MiscUtil.copyFast(cls), MiscUtil.copyFast(ent), { isScDereferenced: true }), 2000)
          row.effects = doc.effects ?? []; row.system = doc.system; row.type = doc.type
        } else if (kind === 'monster') {
          row.hpProbe = C.DataConverterCreature.getDataHp(MiscUtil.copyFast(ent))
          row.notAttempted = '完整怪物需 Actor 导入流程；本行只验证作者 HP 处理'
          rows.push(row); continue
        } else if (!converters[kind]) { row.notAttempted = 'No standalone document converter in this probe'; rows.push(row); continue }
        if (row.system) { rows.push(row); continue }
        const doc = await timeout(converters[kind].pGetDocumentJson(MiscUtil.copyFast(ent), {}), 15000)
        row.effects = doc?.effects ?? []
        row.system = doc?.system ?? null
        row.type = doc?.type
        // 有输出不是完全覆盖：保留完整效果/动作，后续只统计机器结构，不猜语义。
        const serialized = JSON.stringify(row, (_k, value) => { if (typeof value === 'function' || store.has(value)) throw Error('NON_SERIALIZABLE_OUTPUT'); return value })
        JSON.parse(serialized)
      } catch(e) { row.error = String(e.stack).split('\n').slice(0, 4).join(' | ') }
      rows.push(row)
    }
  }
  globalThis.__probeClasses = C; globalThis.__probeCorpus = inputCorpus
  return { stage: 'batch', dnd5eErr, regression, census, loadErrors, childErrors, startupMissing, conversionMissing: [...asked], stubCalls: [...stubCalls], rows, corpus: inputCorpus }
}
