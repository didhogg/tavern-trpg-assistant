// 在旧配对表的真实 Chrome 资料副本上断网重开，检查正常详情入口和来回切换。
import { cp, mkdtemp } from 'node:fs/promises'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
import { P } from './p55-ui-common.mjs'

const [seed, portArg] = process.argv.slice(2)
if (!seed || !Number(portArg)) throw new Error('用法：node tests/e2e/library/p5-t6-english-reopen.mjs <旧配对表的 Chrome 资料夹> <原端口>')
setTimeout(() => process.exit(124), 300000).unref()
const profile = await mkdtemp(join(work, 'p5-english-reopen-'))
await cp(seed, profile, { recursive: true, filter: (path) => !path.includes('Singleton') })
const { server, url } = await startStatic({ port: Number(portArg) })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
try {
  const page = await ctx.newPage()
  page.setDefaultTimeout(20000)
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).click()
  const shelf = page.getByTestId('shelf-tab')
  await shelf.locator('.trpg-shelf__row').filter({ hasText: '玩家手册(2024)' }).locator('.lib-name').click()
  const pack = page.getByTestId('pack-page')
  await pack.locator('input[type=search]').fill('火球术')
  await pack.getByText('火球术', { exact: true }).click()
  const header = page.getByTestId('entry-lang')
  const english = header.getByRole('button', { name: 'En', exact: true })
  const chinese = header.getByRole('button', { name: '中文', exact: true })
  const body = () => page.locator('.trpg-modal__page:not(.is-under)').getByTestId('entry-author')
  const title = () => page.locator('.trpg-modal__head')
  const depth = () => page.evaluate((source) => eval(source)._s.get('modal').depth, P)

  await body().waitFor()
  const count = await depth()
  await english.click()
  await body().getByText(/A bright streak/i).waitFor()
  assert.match(await title().innerText(), /Fireball/)
  assert.match(await page.locator('.trpg-modal__page:not(.is-under) .lib-srcline').first().innerText(), /XPHB/)
  assert.equal(await depth(), count)
  await page.screenshot({ path: join(profile, 'fireball-en.png'), animations: 'disabled' })

  await chinese.click()
  await body().getByText(/明亮的闪光/).waitFor()
  assert.match(await title().innerText(), /火球术/)
  assert.equal(await depth(), count)
  await page.screenshot({ path: join(profile, 'fireball-cn.png'), animations: 'disabled' })
  const coverage = await page.evaluate(async (source) => {
    const { service } = eval(source)._s.get('app').svc().backend.library
    const pairs = (await service.englishPairs('cn-official')).pairs.spell
    const rows = await service.query('cn-official', 'spell', { source: 'XPHB' })
    return { total: rows.length, paired: rows.filter((row) => pairs?.[row.hash]).length }
  }, P)
  console.log('PASS  2024 火球术从旧库恢复中英切换，正文与来源正确，返回层数不变', coverage, profile)
} finally {
  await ctx.close()
  server.close()
}
