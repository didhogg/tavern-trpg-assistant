// 测试用的本地静态服务：提供模拟宿主页、构建产物与本地数据仓库目录。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = fileURLToPath(new URL('../../', import.meta.url))
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }
const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'

export async function startServer() {
  const catalogPath = join(DATA_REPO, 'catalog.json')
  if (!existsSync(catalogPath)) {
    console.error(`缺少 ${catalogPath}；先运行 npm run build:data`)
    process.exit(1)
  }
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'))
  const server = createServer(async (req, res) => {
    const requested = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (requested === '/favicon.ico') {
      res.writeHead(204).end()
      return
    }
    if (requested === '/mock-data/catalog.json') {
      const local = { ...catalog, packs: catalog.packs.map((p) => ({ ...p, url: `/mock-data/packs/${p.id}-${p.version}.trpgpack` })) }
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(local))
      return
    }
    if (requested.startsWith('/mock-data/packs/')) {
      try {
        const file = requested.slice('/mock-data/packs/'.length)
        const body = await readFile(join(DATA_REPO, 'packs', 'dnd5e2014', file))
        res.writeHead(200, { 'content-type': 'application/octet-stream' })
        res.end(body)
      } catch {
        res.writeHead(404).end()
      }
      return
    }
    const path = requested === '/' ? '/tests/e2e/mock-host.html' : requested
    try {
      const body = await readFile(join(root, path))
      res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end()
    }
  })
  await new Promise((resolve) => server.listen(0, resolve))
  return { server, url: `http://127.0.0.1:${server.address().port}/` }
}
