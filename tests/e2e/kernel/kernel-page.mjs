// 插件结算小窗测试页：本地假站点 http://kernel.test 上用插件真实的小窗宿主代码打开 vendor/foundry/frame.html。
// 小窗要的文件：资料包来自作者原件（测试时读参考目录；正式由【库】供给），5etools 条目来自作者数据目录。
import { readFile } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import { build } from 'esbuild'
import { reference, root } from './assets.mjs'

const ORIGIN = 'http://kernel.test'
const vendor = join(root, 'vendor/foundry')
const vendorManifest = JSON.parse(await readFile(join(vendor, 'manifest.json'), 'utf8'))
const bundle = async (entry, format) => (await build({ entryPoints: [join(root, entry)], bundle: true, write: false, format, logLevel: 'error' })).outputFiles[0].text
const dist = { 'frame-early.js': await bundle('src/library/runtime/frame/early.ts', 'iife'), 'kernel-frame.js': await bundle('src/rules/kernel/frame/main.ts', 'esm') }
const host = await build({ stdin: { contents: "export { startAuthorFrame } from './src/library/runtime/host.ts'; export { kernelHandlers } from './src/rules/kernel/host.ts'", resolveDir: root },
  bundle: true, write: false, format: 'iife', globalName: 'KernelHost', logLevel: 'error' })
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.html': 'text/html', '.hbs': 'text/html' }
const raw = async (input, name) => JSON.parse(await readFile(join(input.moduleRoots[name] ?? '', 'module.json'), 'utf8'))
export const kernelInputFor = async input => ({
  system: JSON.parse(await readFile(join(vendor, 'systems/dnd5e/system.json'), 'utf8')),
  modules: [await raw(input, 'lib-wrapper'), await raw(input, 'plutonium')],
  release: vendorManifest.release, world: { id: 'kernel-candidate', title: 'Kernel candidate' }, userId: 'kernelGM00000000',
  worldTime: 0, language: 'en.core', settings: { 'dnd5e.rulesVersion': 'legacy', 'dnd5e.firstRun': false },
  documents: { actors: input.actors },
})

/**
 * 已知、能解释的报错之外的全部报错（其余一律算失败）：
 * Plutonium 可缺的后端接口 404 及其浏览器 404 提示；小窗 0×0 时官方的“窗口尺寸不足”（只影响界面）。
 */
export const unexpectedErrors = errors => errors.filter(e => !e.endsWith('/vendor/foundry/api/plutonium') && !e.startsWith('console: Failed to load resource: the server responded with a status of 404')
  && !e.startsWith('console: Foundry Virtual Tabletop requires usable window dimensions'))

/** 小窗实际读到的模块自带文件（modules/<id>/…）：vendor 工具据此把 Plutonium 用到的自家数据原样存进 vendor/foundry/（同决定 8 的录制做法）。 */
export const moduleFilesRead = new Set()

/** 打开插件结算小窗并启动世界；返回启动报告。dataRoot：小窗要的 5etools 作者数据从参考目录哪个目录读。之后用 page.evaluate(() => __kernel.call(...)) 调命令。 */
/**
 * files：'plugin'（默认）= 插件真实接线 kernelHandlers（packs/、modules/ 读插件自带 vendor/foundry/，data/ 交给“【库】”——测试里由参考目录代答）；
 *        'reference' = 全部直接读参考原件（vendor 工具录 Plutonium 用到的自家数据时用）。
 */
export const plutoniumDataFrom = { dataRoot: 0, plutonium: 0 }

/** plutoniumData：Plutonium 读自家 data/ 下的 5etools 文件时，先从参考目录这个 5etools 数据目录取（没有的再读原包）。默认与 dataRoot 相同（驾驶员定 A）。 */
export async function openKernel(page, input, errors, { moduleIds = null, dataRoot = '5etools-src-main/data', files = process.env.KERNEL_FILES ?? 'plugin', plutoniumData = dataRoot } = {}) {
  const context = page.context()
  const kernelInput = await kernelInputFor(input)
  if (moduleIds) kernelInput.modules = kernelInput.modules.filter(m => moduleIds.includes(m.id))
  page.on('pageerror', e => errors.push(`pageerror: ${e.stack ?? e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`) })
  await context.route(`${ORIGIN}/**`, async route => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname)
    if (path === '/host.html') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body></body></html>' })
    if (path.startsWith('/dist/')) return route.fulfill({ contentType: 'text/javascript', body: dist[path.slice(6)] ?? '' , status: dist[path.slice(6)] ? 200 : 404 })
    if (!path.startsWith('/vendor/foundry/')) return route.fulfill({ status: 404, body: '' })
    const file = resolve(vendor, '.' + path.slice('/vendor/foundry'.length))
    if (!file.startsWith(vendor + sep)) return route.fulfill({ status: 403, body: '' })
    try { await route.fulfill({ body: await readFile(file), contentType: types[extname(file)] ?? 'application/octet-stream' }) }
    catch { await route.fulfill({ status: 404, body: '' }) }
  })
  // 插件给小窗的文件：资料包来自作者原件（测试时直接读参考目录；正式时由【库】供给），5etools 条目来自作者数据目录。
  await page.exposeFunction('__kernelFile', async path => {
    if (process.env.KERNEL_FILE_LOG) console.error('[kernel-file]', path)
    const pack = /^packs\/(.+)\.json$/.exec(path)
    if (pack) return input.packs[pack[1]] ? JSON.stringify(input.packs[pack[1]]) : null
    // Plutonium 读自己原包里的数据目录：与标准答案同源（原包目录）。正式插件里这条由【库】回答。
    const own = /^modules\/([^/]+)\/(.+)$/.exec(path)
    const fiveTools = plutoniumData && /^modules\/plutonium\/data\/(.+)$/.exec(path)
    if (fiveTools) {
      const dir = resolve(reference, plutoniumData)
      const file = resolve(dir, fiveTools[1])
      const text = file.startsWith(dir + sep) ? await readFile(file, 'utf8').catch(() => null) : null
      if (text !== null) { plutoniumDataFrom.dataRoot++; return text }
      plutoniumDataFrom.plutonium++
    }
    if (own && input.moduleRoots[own[1]]) {
      const dir = resolve(input.moduleRoots[own[1]])
      const file = resolve(dir, own[2])
      if (!file.startsWith(dir + sep)) return null
      const text = await readFile(file, 'utf8').catch(() => null)
      if (text !== null) moduleFilesRead.add(path)
      return text
    }
    if (path.startsWith('data/')) {
      const dir = resolve(reference, dataRoot)
      const file = resolve(dir, path.slice(5))
      if (!file.startsWith(dir + sep)) return null
      return readFile(file, 'utf8').catch(() => null)
    }
    return null
  })
  await page.goto(`${ORIGIN}/host.html`)
  await page.addScriptTag({ content: host.outputFiles[0].text })
  return page.evaluate(async ([kernelInput, files]) => {
    const pluginRoot = new URL('/', location.href)
    // 同一页面再开小窗（session.mjs 的隔离检查）用同一种接线
    globalThis.__kernelHandlers = () => files === 'reference'
      ? { file: p => globalThis.__kernelFile(p), kvGet: async () => null, kvSet: async () => undefined, kvRemove: async () => undefined,
        localSnapshot: async () => ({}), localSet: async () => undefined, localRemove: async () => undefined }
      : KernelHost.kernelHandlers({ pluginRoot, data: p => globalThis.__kernelFile(p) })
    const handlers = globalThis.__kernelHandlers()
    const frame = await KernelHost.startAuthorFrame({ codeSet: 'foundry', pluginRoot, container: document.body, timeoutMs: 120_000, handlers })
    globalThis.__kernel = frame
    return { ready: frame.ready, status: await frame.call('boot', kernelInput), failures: frame.failures }
  }, [kernelInput, files])
}
