// Tidy5e 角色卡对照预览（驾驶员 2026-11-25：本地服务器调出 Tidy5e 角色卡，浏览器里和插件对比）。
// 用插件自己的结算小窗（官方 Foundry 14 + dnd5e 6.1）原样跑 Tidy5e，人物用 dnd5e 自带的 12 个英雄。
// 先构建（一次）：node tools/tidy-preview/prepare.mjs；再运行：node tools/tidy-preview/serve.mjs，打开 http://localhost:47400/
// 只读参考目录；构建产物都在 work/tidy5e/（不进仓库）。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = fileURLToPath(new URL('../../', import.meta.url))
const work = join(root, 'work/tidy5e')
const PORT = Number(process.env.PORT ?? 47400)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.hbs': 'text/html; charset=utf-8' }
const bundle = async () => (await build({ entryPoints: [join(root, 'tools/tidy-preview/main.ts')], bundle: true, write: false, format: 'esm', logLevel: 'error', loader: { '.css': 'text' } })).outputFiles[0].text

/** 地址 → 本机文件：Tidy5e 构建、dnd5e 样式 / 字体 / 图标改道到 work/tidy5e，其余照仓库目录。 */
function fileOf(path) {
  const tidy = '/vendor/foundry/modules/tidy5e-sheet/'
  if (path.startsWith(tidy)) return join(work, 'src/dist', path.slice(tidy.length))
  const sys = '/vendor/foundry/systems/dnd5e/'
  if (path.startsWith(sys) && /^(dnd5e\.css|fonts\/|icons\/|ui\/)/.test(path.slice(sys.length))) return join(work, 'dnd5e', path.slice(sys.length))
  if (path.startsWith('/fa/')) return join(work, 'fa', path.slice('/fa/'.length))
  return join(root, path === '/' ? 'tools/tidy-preview/index.html' : path)
}

/** Foundry 核心模板（templates/…）没公开、本机也没有：缺的交空模板，记下来显示在页面顶栏，不冒充原样。 */
const standIns = new Set()

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (path === '/stand-ins') return res.writeHead(200, { 'content-type': TYPES['.json'] }).end(JSON.stringify([...standIns]))
  if (path === '/tidy-preview.js') return res.writeHead(200, { 'content-type': TYPES['.js'], 'cache-control': 'no-store' }).end(await bundle())
  const file = fileOf(path)
  if (!file.startsWith(root)) return res.writeHead(403).end()
  let body
  try { body = await readFile(file) } catch {
    if (!/^\/vendor\/foundry\/templates\/.+\.hbs$/.test(path)) return res.writeHead(404).end()
    standIns.add(path.slice('/vendor/foundry/'.length))
    body = ''
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body)
}).listen(PORT, () => console.log(`Tidy5e 预览：http://localhost:${PORT}/`))
