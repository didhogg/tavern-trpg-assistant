// 参考实录工具的静态服务：和 tests/e2e/library/static.mjs 一样提供仓库目录（模拟酒馆页、dist/、vendor/、work/），
// 多两条（同 tools/tidy-preview/serve.mjs）：① Tidy5e 的地址改到 work/tidy5e 的构建（node tools/tidy-preview/prepare.mjs 造）；
// ② Foundry 没公开、本机也没有的核心模板（templates/…hbs）交空模板，并记下来写进报告（不冒充原样）。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { root } from '../../tests/e2e/library/static.mjs'

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' }
const TIDY = '/vendor/foundry/modules/tidy5e-sheet/'

export async function startRefServer(port) {
  const standIns = new Set()
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    const file = path.startsWith(TIDY) ? join(root, 'work/tidy5e/src/dist', path.slice(TIDY.length)) : join(root, path === '/' ? '/tests/e2e/mock-host.html' : path)
    if (!file.startsWith(root)) return res.writeHead(403).end()
    let body
    try { body = await readFile(file) } catch {
      if (!/^\/vendor\/foundry\/templates\/.+\.hbs$/.test(path)) return res.writeHead(404).end()
      standIns.add(path.slice('/vendor/foundry/'.length)); body = ''
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body)
  })
  await new Promise((ok, fail) => { server.once('error', fail); server.listen(port, '127.0.0.1', ok) })
  return { server, standIns, url: `http://127.0.0.1:${port}/` }
}
