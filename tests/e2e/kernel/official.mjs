// 官方原件的测试宿主。仅替换世界输入与时间传输，不改规则、字段或骰子实现。
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve, sep, join } from 'node:path'
import { systemRoot, output, digest } from './assets.mjs'
import { exposePackReads } from './pack-transport.mjs'
import { build } from 'esbuild'

// 与结算小窗同一个确定随机源（src/rules/kernel/frame/random.ts），两边编号才可逐项比较。
const commands = await build({ entryPoints: [new URL('../../../src/rules/kernel/frame/commands.ts', import.meta.url).pathname], bundle: true, write: false, format: 'iife', globalName: 'KernelCommandsModule', logLevel: 'error' })
const seeded = await build({ entryPoints: [new URL('../../../src/rules/kernel/frame/random.ts', import.meta.url).pathname], bundle: true, write: false, format: 'iife', globalName: 'KernelRandom', logLevel: 'error' })

export async function loadOfficial(page, moduleRoots = {}) {
  const diagnostics = { errors: [], requests: [], boot: [] }
  // 商业原件只缓存到忽略的 work/，以固定对答案输入并避免每轮重复下载；绝不作为产品依赖。
  const cache = join(output, 'oracle-cache')
  await mkdir(cache, { recursive: true })
  await page.context().route('https://demo.foundryvtt.com/{scripts,common}/**', async route => {
    const key = join(cache, digest(route.request().url()))
    let body; let contentType
    try {
      body = await readFile(key)
      contentType = await readFile(`${key}.type`, 'utf8')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      const response = await route.fetch({ timeout: 30_000 })
      if (!response.ok()) throw new Error(`Official script ${response.status()}: ${route.request().url()}`, { cause: error })
      body = await response.body()
      contentType = response.headers()['content-type'] ?? 'application/javascript'
      await writeFile(key, body)
      await writeFile(`${key}.type`, contentType)
    }
    await route.fulfill({ body, contentType })
  })
  page.on('pageerror', e => diagnostics.errors.push({ kind: 'pageerror', message: e.stack ?? e.message }))
  page.on('console', m => { if (m.type() === 'error') diagnostics.errors.push({ kind: 'console', message: m.text(), location: m.location() }) })
  page.on('requestfailed', r => diagnostics.errors.push({ kind: 'requestfailed', message: `${r.url()}: ${r.failure()?.errorText}` }))
  page.on('response', r => { if (r.status() >= 400) diagnostics.errors.push({ kind: 'http', message: `${r.status()}: ${r.url()}` }) })
  await page.context().route('https://demo.foundryvtt.com/probe-blank-page', r => r.fulfill({
    status: 200, contentType: 'text/html', body: '<!doctype html><html><head></head><body><aside id="tooltip"></aside></body></html>',
  }))
  await page.context().route('https://demo.foundryvtt.com/systems/dnd5e/**', async route => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice('/systems/dnd5e/'.length))
    const path = resolve(systemRoot, rel)
    if (!path.startsWith(resolve(systemRoot) + sep)) throw Error('Reference path escaped')
    try {
      await route.fulfill({ body: await readFile(path), contentType: rel.endsWith('.json') ? 'application/json' : undefined })
    } catch (e) {
      diagnostics.errors.push({ kind: 'file', message: `${rel}: ${e.message}` })
      await route.fulfill({ status: 404, body: '' })
    }
  })
  await page.context().route('https://demo.foundryvtt.com/modules/**', async route => {
    const [id, ...parts] = decodeURIComponent(new URL(route.request().url()).pathname).slice('/modules/'.length).split('/')
    const dir = moduleRoots[id]
    if (!dir) return route.continue()
    const path = resolve(dir, ...parts)
    if (!path.startsWith(resolve(dir) + sep)) throw Error('Module path escaped')
    // 驾驶员定 A：Plutonium 读自带 5etools 拷贝时先由作者数据目录回答（与插件 host.ts 同一规则），没有的才读原包
    if (id === 'plutonium' && parts[0] === 'data') {
      const dataDir = resolve(systemRoot, '..', '5etools-src-main/data')
      const own = resolve(dataDir, ...parts.slice(1))
      if (own.startsWith(dataDir + sep)) {
        const body = await readFile(own).catch(() => null)
        if (body) return route.fulfill({ body, contentType: 'application/json' })
      }
    }
    try {
      const contentType = /\.m?js$/.test(path) ? 'application/javascript' : path.endsWith('.json') ? 'application/json'
        : path.endsWith('.css') ? 'text/css' : /\.(hbs|html)$/.test(path) ? 'text/html' : 'application/octet-stream'
      await route.fulfill({ body: await readFile(path), contentType })
    } catch (e) {
      diagnostics.errors.push({ kind: 'module-file', message: `${id}/${parts.join('/')}: ${e.message}` })
      await route.fulfill({ status: 404, body: '' })
    }
  })
  await page.context().route('https://demo.foundryvtt.com/data/**', async route => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname.slice('/data/'.length))
    const dir = resolve(systemRoot, '..', '5etools-src-main/data')
    const path = resolve(dir, rel)
    if (!path.startsWith(dir + sep)) throw Error('Author data path escaped')
    try { await route.fulfill({ body: await readFile(path), contentType: 'application/json' }) }
    catch (e) { diagnostics.errors.push({ kind: 'author-file', message: `${rel}: ${e.message}` }); await route.fulfill({ status: 404, body: '' }) }
  })
  await page.goto('https://demo.foundryvtt.com/probe-blank-page', { waitUntil: 'load', timeout: 45_000 })
  // 脚本顺序直接读取官方页面，而不是维护第三方依赖名单。
  const response = await page.request.get('https://demo.foundryvtt.com/join', { timeout: 30_000 })
  if (!response.ok()) throw Error(`Official page ${response.status()}`)
  const html = await response.text()
  const scripts = [...html.matchAll(/<script\b([^>]*?)\bsrc="([^"]+)"([^>]*)>/g)]
    .map(m => ({ url: new URL(m[2], response.url()).href, type: /type="module"/.test(m[1] + m[3]) ? 'module' : undefined }))
    .filter(s => new URL(s.url).pathname.startsWith('/scripts/'))
  if (!scripts.some(s => new URL(s.url).pathname === '/scripts/foundry.mjs')) throw Error('Official script list has no Foundry entry')
  await page.evaluate(() => { globalThis.SIGNED_EULA = true; globalThis.ROUTE_PREFIX = ''; globalThis.MESSAGES = null })
  for (const script of scripts) {
    await page.addScriptTag(script)
    diagnostics.requests.push(script.url)
  }
  await page.waitForFunction(() => globalThis.foundry?.dice?.Roll, null, { timeout: 30_000 })
  return diagnostics
}

export async function bootOfficial(page, { manifest, compiled, actors, templates, modules, packs }, { timeMethod = 'sync', upstreams = false, fullHost = false, headlessFull = false, moduleIds = null } = {}) {
  // moduleIds：只启用其中几个模块（条目转换对答案照探路，不预先加载 Plutonium 模块）。
  if (moduleIds) modules = modules.filter(m => moduleIds.includes(m.id))
  await exposePackReads(page, packs)
  await page.addScriptTag({ content: seeded.outputFiles[0].text })
  // 与结算小窗同一份结算命令（src/rules/kernel/frame/commands.ts）。
  await page.addScriptTag({ content: commands.outputFiles[0].text })
  return page.evaluate(async ({ manifest, source, actors, templates, timeMethod, modules, upstreams, fullHost, headlessFull }) => {
    modules = modules.map(m => ({ ...m, active: true }))
    KernelRandom.installSeededCrypto(globalThis)('kernel')
    const steps = []; const socketCalls = []; const uid = 'kernelGM00000000'
    globalThis.__kernelOracleProgress = { steps, socketCalls }
    for (const hook of ['init', 'setup', 'ready', 'dnd5e.ready']) Hooks.on(hook, () => steps.push(`hook:${hook}`))
    const step = async (name, fn) => { steps.push(`start:${name}`); const result = await fn(); steps.push(name); return result }
    let originalTemplateSocket
    const getTemplate = async path => {
      if (path in templates) return templates[path]
      if (!path.startsWith('templates/')) throw Error(`Missing original template: ${path}`)
      originalTemplateSocket ??= await foundry.Game.connect()
      // 此连接仅发送 template 读取；文档写入始终走下方隔离端口。
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(Error(`Original template timed out: ${path}`)), 10_000)
        originalTemplateSocket.emit('template', path, response => {
          clearTimeout(timeout)
          if (response.error) reject(Error(response.error.message ?? response.error))
          else if (typeof response.html !== 'string') reject(Error(`Invalid original template: ${path}`))
          else { templates[path] = response.html; resolve(response.html) }
        })
      })
    }
    // 页面已经加载 Socket.IO 原件；使用完整客户端，不再手写 on/off/once/offAny 等空壳。
    const socket = io({ autoConnect: false, forceNew: true })
    const emit = socket.emit.bind(socket)
    socket.emit = function(event, ...args) {
      // 与真实 Socket.IO 发送相同，在发送边界固定 JSON，不能保留稍后被文档生命周期改写的引用。
      socketCalls.push({ event, args: JSON.parse(JSON.stringify(args.filter(a => typeof a !== 'function'))) })
      if (event === 'template') {
        const [path, callback] = args
        getTemplate(path).then(html => callback({ html }), error => callback({ error: { message: error.message } }))
        return
      }
      if (event === 'manageCompendium') {
        const [request, callback] = args
        if (request.action !== 'create') throw Error(`Unsupported temporary compendium operation: ${request.action}`)
        const definition = [...new foundry.packages.World({ ...game.world.toObject(), packs: [request.data] }).packs][0]
        const metadata = { ...definition, id: `${request.data.package}.${definition.name}`,
          packageType: 'world', packageName: game.world.id, system: game.system.id, index: [], folders: [] }
        globalThis.__kernelCreateTemporaryPack(metadata).then(result => callback({ request, result }),
          error => callback({ error: { message: error.message } }))
        return
      }
      if (event === 'modifyDocumentBatch') {
        const [requests, callback] = args
        Promise.all(requests.map(async request => ({ ...request, userId: uid,
          result: await globalThis.__kernelReadOriginalPack(JSON.parse(JSON.stringify(request)), []) })))
          .then(results => callback({ results }), error => callback({ error: { message: error.message } }))
        return
      }
      if (event === 'modifyDocument') {
        const [request, callback] = args
        const canonical = request.action === 'update' && !request.operation.parentUuid ? request.operation.updates.map(change => {
          const collection = request.operation.pack ? game.packs.get(request.operation.pack) : game.collections.get(request.type)
          const doc = collection.get(change._id, { strict: true })
          // 原件自己的 clone/clean/merge 用于模拟服务器保存的快照；不提前改动被测的世界文档。
          return doc.clone(change, { keepId: true }).toObject()
        }) : []
        globalThis.__kernelReadOriginalPack(JSON.parse(JSON.stringify(request)), JSON.parse(JSON.stringify(canonical))).then(
          result => callback({ ...request, userId: uid, result }),
          error => callback({ error: { message: error.message } }),
        )
        return
      }
      // 一人世界没有其他客户端；不带确认回调的广播只记录，不伪造服务器回复。
      if (typeof args.at(-1) !== 'function') return emit(event, ...args)
      if (event !== 'time') throw Error(`Unexpected oracle RPC: ${event}`)
      const callback = args.at(-1)
      if (typeof callback !== 'function') throw Error('Missing time callback')
      callback({ serverTime: Date.now(), worldTime: 0 })
    }
    // 沿用探路中官方输入的版本元数据；缺失会令整个设置文档失效，并静默回到 modern。
    const settings = [{ _id: 'kernelSetting001', key: 'dnd5e.rulesVersion', value: '"legacy"',
      _stats: { coreVersion: '14.365', systemId: manifest.id, systemVersion: manifest.version } }]
    if (upstreams) settings.push({ _id: 'kernelSetting002', key: 'core.moduleConfiguration',
      value: JSON.stringify(Object.fromEntries(modules.map(m => [m.id, true]))), _stats: settings[0]._stats })
    if (fullHost || headlessFull) settings.push({ _id: 'kernelSetting005', key: 'dnd5e.firstRun', value: 'false', _stats: settings[0]._stats })
    const model = Object.fromEntries(CONST.ALL_DOCUMENT_TYPES.map(d => {
      const types = new Set(['base', ...Object.keys(CONFIG[d]?.dataModels ?? {}), ...Object.keys(CONFIG[d]?.typeLabels ?? {}),
        ...Object.keys(manifest.documentTypes[d] ?? {}), ...(d === 'Folder' ? CONST.FOLDER_DOCUMENT_TYPES : [])])
      return [d, Object.fromEntries([...types].map(type => [type, {}]))]
    }))
    const releaseData = { generation: 14, build: 365, channel: 'stable', node_version: 22 }
    globalThis.release = new foundry.config.ReleaseData(releaseData)
    // 资料包描述先经过官方清单模型；直接拿 module.json 中未展开的描述冒充服务器数据会漏默认值。
    const packageModel = new foundry.packages.System(manifest)
    const data = {
      userId: uid, release: releaseData, system: manifest,
      model, modules: upstreams ? modules : [], world: { id: 'kernel-oracle', title: 'Kernel oracle', system: manifest.id,
        coreVersion: '14.365', systemVersion: manifest.version, flags: { dnd5e: { version: manifest.version } } },
      settings, options: { language: 'en.core' }, packs: [...packageModel.packs].map(p => ({ ...p, id: `${manifest.id}.${p.name}`,
        packageType: 'system', packageName: manifest.id, system: manifest.id, index: [], folders: [] })),
      users: [{ _id: uid, name: 'GM', role: 4 }], actors, items: [], folders: [], scenes: [], combats: [], journal: [],
      macros: [], playlists: [], tables: [], cards: [], messages: [],
    }
    globalThis.packages = { System: new foundry.utils.Collection([[manifest.id, new foundry.packages.System(manifest)]]),
      Module: new foundry.utils.Collection(upstreams ? modules.map(m => [m.id, new foundry.packages.Module(m)]) : []) }
    // 只把测试页的显示出口换为计算准备流程；initialize 及其 libWrapper 前置钩子原样执行。
    // 这是 prepared-only 基线，不冒充已完成 ready、数据库写回或完整 Foundry 界面启动。
    class OracleGame extends foundry.Game {
      activateListeners() { steps.push('UI listeners intentionally omitted') }
      async _initializeView() {
        await step('permissions', () => { this.permissions = this.settings.get('core', 'permissions') })
        await step('world time', async () => {
          Object.defineProperty(this, 'time', { value: new foundry.helpers.GameTime(), configurable: false })
          if (timeMethod === 'callback') await this.time.onUpdateWorldTime(0, {}, uid)
          else await this.time.sync()
        })
        await step('initializeConfig', () => this.initializeConfig())
        await step('initializePacks', () => this.initializePacks())
        await step('initializeDocuments', () => this.initializeDocuments())
        await step('setup', () => Hooks.callAll('setup'))
      }
    }
    class HeadlessFullGame extends foundry.Game {
      activateListeners() { steps.push('omit UI event listeners') }
      initializeUI() {
        // 使用官方登记的 UI 原类提供通知等接口，不渲染整个 VTT；不造逐项空函数。
        for (const [name, Class] of Object.entries(CONFIG.ui)) ui[name] = new Class()
        ui.windows ??= {}
        steps.push('official UI helpers constructed without rendering')
      }
      initializeMouse() { steps.push('omit mouse UI') }
      initializeKeyboard() { steps.push('omit keyboard UI') }
      initializeGamepads() { steps.push('omit gamepad UI') }
      initializeRTC() { steps.push('omit AV conferencing') }
      async initializeCanvas() { steps.push('omit map rendering') }
    }
    await step('Game constructor', () => { globalThis.game = new (headlessFull ? HeadlessFullGame : fullHost ? foundry.Game : OracleGame)('game', data, socket) })
    if (fullHost || headlessFull) {
      // 这是官方声明的 client 设置，必须交给客户端存储，不能放进 world 设置表。
      game.settings.storage.get('client').setItem('core.noCanvas', 'true')
    }
    await step('dnd5e original', () => { const s = document.createElement('script'); s.textContent = source; document.head.append(s) })
    if (upstreams) for (const m of modules) await step(`module ${m.id}`, async () => {
      for (const path of m.esmodules ?? []) await import(`/${path}`)
    })
    if (headlessFull) Hooks.once('setup', () => {
      // 只关闭显示用的日历 HUD；时间模型和全部时间规则仍由官方程序执行。
      CONFIG.DND5E.calendar.application = null
    })
    try { await step('official Game.initialize', () => game.initialize()) }
    catch (error) { error.message += `; completed=${JSON.stringify(steps)}; transport=${JSON.stringify(socketCalls.slice(-3))}`; throw error }
    return { steps, socketCalls, actors: game.actors.size, invalid: [...game.actors.invalidDocumentIds],
      rules: game.settings.get('dnd5e', 'rulesVersion'), worldTime: game.time.worldTime,
      components: game.time.components, release: game.release.version,
      modules: Object.fromEntries(game.modules.map(m => [m.id, { active: m.active, availability: m.availability }])),
      plutoniumApi: typeof game.modules.get('plutonium')?.api,
      plutoniumApiKeys: Object.keys(game.modules.get('plutonium')?.api ?? {}) }
  }, { manifest, source: compiled.outputFiles[0].text, actors, templates, modules, timeMethod, upstreams, fullHost, headlessFull })
}
