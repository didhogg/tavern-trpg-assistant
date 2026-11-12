// 阅读器目录（驾驶员 2026-11-12）：第一次点章节名 = 跳到章首并展开小节（下拉动效）；再点同一章 = 收起，正文不动；
// 点小节 = 正文从当前位置平滑滑到那个小节。Chrome，真实中文资料副本，断网。
// 用法：npm run build 后 node tests/e2e/library/p5-t6-reader-toc.mjs
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-t6-reader-toc-'))
await cp(join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, info: {}, pageErrors: [] }
const ok = (k, v, info) => { result.checks[k] = !!v; if (info !== undefined) result.info[k] = info; console.log(`${v ? 'PASS' : 'FAIL'}  ${k}${info !== undefined ? ' — ' + JSON.stringify(info) : ''}`) }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await ctx.route((u) => !u.href.startsWith(url), (r) => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(30000)
  page.on('pageerror', (e) => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.getByTestId('nav-library').click()
  await page.locator('.trpg-shelf__row .lib-name', { hasText: '玩家手册' }).first().click()
  await page.waitForSelector('[data-testid="pack-page"] .lib-pills')
  await page.locator('.lib-pills .trpg-pill', { hasText: /^书/ }).first().click()
  await page.getByTestId('book-row').first().click()
  await page.waitForSelector('[data-testid="reader-body"] .lib-dbody', { timeout: 120000 })
  await page.getByTestId('reader-toc').click()
  const toc = page.getByTestId('reader-toc-list')
  const chapters = toc.locator('.lib-toc__chapter')
  const body = page.getByTestId('reader-body')
  const scrollTop = () => body.evaluate((e) => Math.round(e.scrollTop))
  // 找一个有小节的、不是当前的章
  const n = await chapters.count()
  let idx = -1
  for (let i = 1; i < n; i++) if ((await chapters.nth(i).getAttribute('aria-expanded')) === 'false') { idx = i; break }
  const ch = chapters.nth(idx)
  const name = (await ch.innerText()).trim()
  result.info.chapter = name
  // 从点击起记下目录里出现过的动效样式类（换章时正文重画，读晚了动效已经结束）
  await toc.evaluate((el) => { window.__drop = []; new MutationObserver((ms) => { for (const m of ms) if (m.target.className?.includes?.('lib-toc-drop')) window.__drop.push(m.target.className) }).observe(el, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true }) })
  await ch.click()
  await page.waitForTimeout(600)
  const seen = await page.evaluate(() => [...new Set(window.__drop)])
  ok('第一次点章节：小节有下拉动效（展开）', seen.some((c) => /lib-toc-drop-enter-active/.test(c)), seen)
  ok('第一次点章节：跳到这一章章首、小节展开', (await page.locator('.lib-rbar .lib-name').innerText()).trim() === name && (await scrollTop()) === 0 && (await ch.getAttribute('aria-expanded')) === 'true' && (await toc.locator('.lib-toc__section').count()) > 0)
  await page.screenshot({ path: join(profile, 'toc-open.png') })
  // 点后面的一个小节：平滑滑过去
  const secs = toc.locator('.lib-toc__section')
  const k = Math.min(3, (await secs.count()) - 1)
  await secs.nth(k).click()
  await page.waitForTimeout(80)
  const during = await scrollTop()
  await page.waitForTimeout(1200)
  const after = await scrollTop()
  ok('点小节：正文从当前位置平滑滑到那个小节（中途停在半路）', after > 0 && during < after, { during, after })
  ok('点小节：到达的小节被标为当前', (await body.locator('[data-reader-current]').count()) === 1)
  // 再点同一章：收起，正文不动
  await ch.click()
  await page.waitForTimeout(500)
  ok('再点同一章：小节收起，正文停在原处', (await ch.getAttribute('aria-expanded')) === 'false' && (await toc.locator('.lib-toc__section').count()) === 0 && (await scrollTop()) === after, { scroll: await scrollTop(), after })
  await page.screenshot({ path: join(profile, 'toc-closed.png') })
  // 点另一章：跳过去并展开
  const other = chapters.nth(idx === 1 ? 2 : 1)
  const otherName = (await other.innerText()).trim()
  await other.click()
  await page.waitForTimeout(500)
  ok('点另一章：跳到那一章章首', (await page.locator('.lib-rbar .lib-name').innerText()).trim() === otherName && (await scrollTop()) === 0)
  const real = result.pageErrors.filter((e) => !/gendata-nav-adventure-book-index|网络错误|Network error|无法加载 \d+ 个条目的引用/.test(e))
  ok('没有界面自己的页面错误', real.length === 0, real)
} catch (e) {
  result.error = String(e?.stack ?? e)
  console.log('ERROR', result.error)
} finally {
  await writeFile(join(profile, 'result.json'), JSON.stringify(result, null, 1))
  console.log(profile)
  const fails = Object.values(result.checks).filter((v) => !v).length + (result.error ? 1 : 0)
  console.log(fails ? `FAIL ${fails}` : 'ALL PASS')
  await ctx.close(); server.close()
  process.exit(fails ? 1 : 0)
}
