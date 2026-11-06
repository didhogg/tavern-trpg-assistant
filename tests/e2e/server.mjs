// 测试用的本地静态服务：提供模拟宿主页与构建产物。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = fileURLToPath(new URL('../../', import.meta.url))
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }

export async function startServer() {
  const server = createServer(async (req, res) => {
    const requested = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (requested === '/favicon.ico') {
      res.writeHead(204).end()
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
