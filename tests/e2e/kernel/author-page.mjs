// 作者小窗测试页：本地假站点 http://author.test 上用插件真实的小窗宿主代码打开 vendor/en/frame.html（插件骰盘用的同一个作者小窗）。
// 小窗要的作者数据文件从参考目录的 5etools 原件读（只读）；正式插件里由【库】回答。
import { readFile } from 'node:fs/promises'
import { extname, join, resolve, sep } from 'node:path'
import { build } from 'esbuild'
import { reference, root } from './assets.mjs'

const ORIGIN = 'http://author.test'
const vendor = join(root, 'vendor/en')
const bundle = async (entry, format, globalName) => (await build({ entryPoints: [join(root, entry)], bundle: true, write: false, format, globalName, logLevel: 'error' })).outputFiles[0].text
const dist = { 'frame-early.js': await bundle('src/library/runtime/frame/early.ts', 'iife'), 'frame.js': await bundle('src/library/runtime/frame/main.ts', 'esm') }
const host = (await build({ stdin: { contents: "export { startAuthorFrame } from './src/library/runtime/host.ts'", resolveDir: root },
  bundle: true, write: false, format: 'iife', globalName: 'AuthorHost', logLevel: 'error' })).outputFiles[0].text
const types = { '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.html': 'text/html' }
const data = resolve(reference, '5etools-src-main/data')

/** 打开作者小窗；之后用 page.evaluate(() => __author.call(...)) 调作者指令（src/library/runtime/frame/commands.ts）。 */
export async function openAuthor(page, errors) {
  page.on('pageerror', e => errors.push(`pageerror: ${e.stack ?? e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
  await page.context().route(`${ORIGIN}/**`, async route => {
    const path = decodeURIComponent(new URL(route.request().url()).pathname)
    if (path === '/host.html') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body></body></html>' })
    if (path.startsWith('/dist/')) return route.fulfill({ contentType: 'text/javascript', body: dist[path.slice(6)] ?? '', status: dist[path.slice(6)] ? 200 : 404 })
    if (!path.startsWith('/vendor/en/')) return route.fulfill({ status: 404, body: '' })
    const file = resolve(vendor, '.' + path.slice('/vendor/en'.length))
    if (!file.startsWith(vendor + sep)) return route.fulfill({ status: 403, body: '' })
    try { await route.fulfill({ body: await readFile(file), contentType: types[extname(file)] ?? 'application/octet-stream' }) }
    catch { await route.fulfill({ status: 404, body: '' }) }
  })
  await page.exposeFunction('__authorFile', async path => {
    if (!path.startsWith('data/')) return null
    const file = resolve(data, path.slice(5))
    if (!file.startsWith(data + sep)) return null
    return readFile(file, 'utf8').catch(() => null)
  })
  await page.goto(`${ORIGIN}/host.html`)
  await page.addScriptTag({ content: host })
  return page.evaluate(async () => {
    const kv = new Map()
    const frame = await AuthorHost.startAuthorFrame({ codeSet: 'en', pluginRoot: new URL('/', location.href), container: document.body, timeoutMs: 120_000,
      handlers: { file: p => globalThis.__authorFile(p), kvGet: async k => kv.get(k) ?? null, kvSet: async (k, v) => void kv.set(k, v), kvRemove: async k => void kv.delete(k),
        localSnapshot: async () => ({}), localSet: async () => undefined, localRemove: async () => undefined } })
    globalThis.__author = frame
    return { ready: frame.ready, failures: frame.failures }
  })
}
