// P5.5 界面 e2e 共用：复制测试资料夹（已装中英官方数据，端口必须 47318）、断网、打开库页。ENGINE=webkit 换 WebKit。
import { cp, mkdir, rm } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { settle } from '../helpers.mjs'

export const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`

export async function openLibrary(name, { width = 1280, height = 800 } = {}) {
  if (!process.env.SKIP_BUILD) await buildAll()
  // ENGINE=webkit 用 WebKit（测试资料夹也换成 WebKit 那一份）；默认 Chrome
  const engine = process.env.ENGINE ?? 'chrome'
  const [, type, options] = engines.find((e) => e[0] === engine) ?? engines[0]
  const { server, url } = await startStatic({ port: 47318 })
  const shots = `${work}/p55-ui-shots/${name}${engine === 'chrome' ? '' : `-${engine}`}`
  await mkdir(shots, { recursive: true })
  const profile = `${work}/profile-p55ui${name}-${engine}`
  await rm(profile, { recursive: true, force: true })
  await cp(`${work}/profile-b2-8a-${engine}`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
  const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width, height }, acceptDownloads: true })
  const page = await ctx.newPage()
  page.setDefaultTimeout(180000)
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 200)))
  await page.route((u) => !u.href.startsWith(url), (r) => r.abort())
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await settle(page, 600)
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"]')
  const tab = async (label) => { await page.locator('.lib-top .trpg-seg button', { hasText: label }).click(); await settle(page, 400) }
  const closeAll = () => page.evaluate((P) => eval(P)._s.get('modal').close(true), P)
  const svc = (fn, arg) => page.evaluate(async ([P, src, arg]) => { const s = eval(P)._s.get('app').svc(); return (eval(src))(s, arg) }, [P, fn.toString(), arg])
  const realErrors = () => errors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
  return { ctx, page, server, shots, tab, closeAll, svc, realErrors }
}
