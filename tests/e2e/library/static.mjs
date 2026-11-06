// 测试用静态服务：提供仓库目录（模拟宿主页、dist/、vendor/）和 work/ 下构建的测试入口。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = fileURLToPath(new URL('../../../', import.meta.url))
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' }

export async function startStatic() {
  const requests = []
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    requests.push({ path, status: 0 })
    const file = join(root, path === '/' ? '/tests/e2e/mock-host.html' : path)
    if (!file.startsWith(root)) return res.writeHead(403).end()
    try {
      const body = await readFile(file)
      requests.at(-1).status = 200
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body)
    } catch {
      requests.at(-1).status = 404
      res.writeHead(404).end()
    }
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  return { server, requests, url: `http://127.0.0.1:${server.address().port}/` }
}
