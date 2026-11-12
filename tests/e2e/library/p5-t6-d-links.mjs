// Chrome，使用真实中文资料的隔离副本。先 npm run build，再 node tests/e2e/library/p5-t6-d-links.mjs。
// 可用 P5_LIBRARY_PROFILE 指定同一测试来源（端口 47342）的资料库副本。
import { cp, mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { startStatic } from './static.mjs'
import { engines, work } from './chain-common.mjs'
const limit = setTimeout(() => process.exit(124), 300000)
const profile = await mkdtemp(join(work, 'p5-t6-d-links-ui-'))
await cp(process.env.P5_LIBRARY_PROFILE ?? join(work, 'p5-t6-pack-audit-WST6kp'), profile, { recursive: true, filter: p => !p.includes('Singleton') })
const { server, url } = await startStatic({ port: 47342 })
const [, chrome, options] = engines[0]
const ctx = await chrome.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 850 } })
const result = { checks: {}, pageErrors: [] }
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
try {
  await ctx.route(u => !u.href.startsWith(url), r => r.abort())
  const page = await ctx.newPage()
  page.setDefaultTimeout(28000)
  page.on('pageerror', e => { if (!result.pageErrors.includes(e.message)) result.pageErrors.push(e.message) })
  await page.goto(url)
  await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
  await page.locator('.trpg-ball').click()
  await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
  await page.waitForSelector('[data-testid="shelf-tab"] .trpg-shelf__row')
  const copiedBook = await page.evaluate(P => {
    const shelf = eval(P)._s.get('library')
    const mine = new Set(shelf.minePacks.flatMap((p) => p.sources))
    return shelf.shelf.groups.flatMap((g) => g.books).find((b) => b.set === 'cn-official' && b.downloaded && mine.has(b.source))?.name
  }, P)
  if (copiedBook) {
    await page.getByRole('switch', { name: `在本战役里使用《${copiedBook}》`, exact: true }).waitFor()
    result.checks.copyDoesNotHideOfficialBook = true
  }
  const info = await page.evaluate(async P => {
    const stores = eval(P)._s
    const app = stores.get('app')
    const lib = app.svc().backend.library
    const view = await lib.currentView()
    const frame = await lib.service.frameOf('cn', view)
    const marker = await frame.call('renderContent', { type: 'entries', entries: [
      '{@spell 火球术|PHB|5e 火球术}、{@spell 火球术|XPHB|5.5e 火球术}',
      '{@book 目标小节|PHB|1|战斗|2}，{@filter 一环法术|spells|level=1}，{@link 作者站|https://5e.tools/}',
    ] })
    const corpus = await lib.service.corpus('cn-official', 'book', 'PHB', view)
    let repeat = null
    for (const [chapter, entry] of corpus.bookData.data.entries()) {
      const sections = new Map()
      const walk = x => {
        if (Array.isArray(x)) { x.forEach(walk); return }
        if (!x || typeof x !== 'object') return
        if (typeof x.name === 'string' && !x.name.includes('{@') && ['section', 'entries', 'inset', 'variant'].includes(x.type)) sections.set(x.name, (sections.get(x.name) ?? 0) + 1)
        walk(x.entries)
      }
      walk(entry)
      const hit = [...sections].find(([, count]) => count > 1)
      if (hit) { repeat = { chapter, name: hit[0] }; break }
    }
    const raw = await lib.service.parsed('cn-official', 'spell', view)
    const fireball = raw.items.find(x => x.name === '火球术' && x.source === 'PHB')
    const monsters = await lib.service.parsed('cn-official', 'monster', view)
    const monster = monsters.items.find(x => x.name === '灰烬先驱·驱魔师')
    if (!fireball || !monster || !repeat) throw new Error('测试资料库缺少中文官方书或内嵌块样本')
    const fixture = { ...fireball, source: 'T6LinkProbe', name: 'T6 章节跳转验证', entries: [
      `{@book 跳到第二个同名小节|PHB|${repeat.chapter}|${repeat.name}|1}`,
      '{@spell 火球术|ThisSourceIsNotInstalled|找不到的测试法术}',
      { type: 'statblockInline', statblockType: 'monster', statblockData: monster },
    ] }
    const file = { _meta: { sources: [{ json: 'T6LinkProbe', abbreviation: 'T6LinkProbe', full: 'T6LinkProbe', authors: [] }] }, spell: [fixture] }
    await lib.service.brewImport('cn-brew', [{ name: 'T6LinkProbe.json', text: JSON.stringify(file) }])
    await stores.get('library').refresh(app.svc())
    return { links: marker.links, repeat }
  }, P)
  result.info = info
  result.checks.metadata = info.links[0].meta.hash !== info.links[1].meta.hash && info.links[2].meta.part.ixNamedSection === 2 && info.links[3].kind === 'filter' && info.links[4].kind === 'external'
  const search = async name => {
    await page.getByRole('button', { name: '全库数据搜索', exact: true }).click()
    await page.getByLabel('搜索全部已开启的书').fill(name)
    await page.getByTestId('search-results').locator('button').filter({ has: page.getByText(name, { exact: true }) }).first().click()
  }
  const close = () => page.getByRole('button', { name: '关闭', exact: true }).click()
  const back = () => page.getByRole('button', { name: /^返回：/ }).click()
  const active = () => page.locator('.trpg-modal__page:not(.is-under)')
  const title = () => page.locator('.trpg-modal__title').innerText()
  await search('活化棺材')
  const attack = active().getByText('近战武器攻击:', { exact: true }).first()
  await attack.waitFor({ timeout: 4500 })
  await active().getByText('命中:', { exact: true }).first().waitFor({ timeout: 4500 })
  result.checks.attackAndHit = true
  await attack.scrollIntoViewIfNeeded()
  await page.screenshot({ path: join(profile, 'attack-terms.png') })
  await close()
  await search('法柏贾斯特')
  await active().getByText('近战 或 远程武器攻击:', { exact: true }).first().waitFor({ timeout: 4500 })
  result.checks.combinedAttack = true
  await close()
  await search('祝福术')
  await active().getByTestId('entry-author').getByText(/专注.*至多.*分钟/).waitFor()
  result.checks.concentration = true
  await close()
  await search('地衣巫妖')
  await active().getByRole('tab', { name: '正文' }).waitFor()
  const detailHeader = () => page.evaluate(() => {
    const root = document.querySelector('#trpg-assistant-root').shadowRoot
    const modal = root.querySelector('.trpg-modal')
    const tools = modal.querySelector('.trpg-modal__page:not(.is-under) .lib-dtools')
    const tab = modal.querySelector('.trpg-modal__page:not(.is-under) [role="tab"]')
    const lang = modal.querySelector('.lib-langsw')
    const style = getComputedStyle(lang)
    return {
      gap: Math.round(tab.getBoundingClientRect().top - tools.getBoundingClientRect().bottom),
      inset: style.boxShadow.includes('inset'),
      softBorder: style.borderTopColor === getComputedStyle(tools).borderBottomColor,
      selectedShadow: getComputedStyle(lang.querySelector('[aria-pressed="true"]')).boxShadow,
    }
  })
  result.header = { wide: await detailHeader() }
  await page.screenshot({ path: join(profile, 'detail-header-wide.png') })
  await page.setViewportSize({ width: 430, height: 800 })
  result.header.narrow = await detailHeader()
  await page.screenshot({ path: join(profile, 'detail-header-narrow.png') })
  await page.setViewportSize({ width: 1280, height: 850 })
  result.checks.detailHeader = Object.values(result.header).every(h => h.gap >= 8 && h.inset && h.softBorder && h.selectedShadow === 'none')
  const spell = active().getByTestId('entry-author').getByRole('button', { name: '侦测魔法', exact: true })
  await spell.waitFor()
  await spell.scrollIntoViewIfNeeded()
  await page.screenshot({ path: join(profile, 'spellcasting.png') })
  await spell.click()
  await active().getByRole('tab', { name: '正文' }).waitFor()
  result.checks.spellcasting = (await title()) === '侦测魔法'
  await back()
  result.checks.return = await spell.isVisible()
  await close()
  await search('奇械师')
  const tool = active().getByTestId('class-lines').getByRole('button', { name: '盗贼工具', exact: true }).first()
  await tool.waitFor()
  await page.screenshot({ path: join(profile, 'class-links.png') })
  await tool.click()
  result.checks.classLinks = (await title()) === '盗贼工具'
  await close()
  await page.evaluate(async P => {
    const s = eval(P)._s.get('app').svc().backend.library.service
    const frame = await s.frameOf('cn')
    const orig = frame.call.bind(frame)
    frame.call = (name, ...args) => name === 'tableRoll' ? orig(name, args[0], { ...args[1], points: [1, 1, 1, 1] }) : orig(name, ...args)
  }, P)
  await search('储藏处; 贮藏')
  await active().getByTestId('roll-header').first().click()
  const outcome = active().getByTestId('roll-text')
  await outcome.getByRole('button', { name: '野炊工具', exact: true }).waitFor()
  result.checks.roll = /【随机表 · [^】]+】/.test(await outcome.innerText())
  await outcome.scrollIntoViewIfNeeded()
  await page.screenshot({ path: join(profile, 'roll-links.png') })
  await outcome.getByRole('button', { name: '野炊工具', exact: true }).click()
  result.checks.rollNavigation = (await title()) === '野炊工具'
  await close()
  await page.locator('.trpg-seg button', { hasText: '我的库' }).first().click()
  await page.getByTestId('mylib-open').filter({ hasText: 'T6LinkProbe' }).first().click()
  await active().getByLabel('搜索这本书里的条目').fill('T6 章节跳转验证')
  await active().locator('.lib-list__row').filter({ hasText: 'T6 章节跳转验证' }).first().click()
  const jump = active().getByRole('button', { name: '跳到第二个同名小节', exact: true })
  await jump.waitFor()
  await active().getByTestId('dead-link').filter({ hasText: '找不到的测试法术' }).waitFor()
  result.checks.missing = true
  const embeddedLink = active().getByTestId('entry-author').getByRole('button', { name: '法师护甲', exact: true }).first()
  await embeddedLink.click()
  result.checks.embeddedLink = (await title()) === '法师护甲'
  await back()
  await jump.click()
  const reader = active().getByTestId('reader-page')
  await reader.getByTestId('reader-body').waitFor()
  const readerState = await page.evaluate(([P, info]) => {
    const root = document.querySelector('#trpg-assistant-root').shadowRoot
    const pane = root.querySelector('.trpg-modal__page:not(.is-under) [data-testid="reader-body"]')
    const headings = [...pane.querySelectorAll('[data-reader-heading]')].filter(e => e.dataset.readerHeading === info.repeat?.name)
    return { route: eval(P)._s.get('modal').top.props, headings: headings.length, focusedIndex: headings.indexOf(pane.querySelector('[data-reader-current]')), scrolled: pane.scrollTop > 0, warn: pane.querySelector('.lib-banner--warn')?.textContent }
  }, [P, info])
  result.reader = readerState
  result.checks.reader = readerState.focusedIndex === 1 && readerState.route.part.ixNamedSection === 1
  await page.screenshot({ path: join(profile, 'reader-jump.png') })
  await page.setViewportSize({ width: 430, height: 800 })
  await reader.getByTestId('reader-toc').click()
  const toc = reader.getByTestId('reader-toc-list')
  await toc.getByRole('button', { name: info.repeat.name, exact: true }).nth(1).waitFor()
  await page.screenshot({ path: join(profile, 'reader-narrow.png') })
  await toc.getByRole('button', { name: info.repeat.name, exact: true }).nth(0).click()
  result.checks.narrowReader = await reader.getByTestId('reader-body').locator('[data-reader-current]').count() === 1 && !(await toc.count())
} catch (e) {
  result.failure = String(e)
  process.exitCode = 1
} finally {
  const out = join(profile, 'result.json')
  await writeFile(out, JSON.stringify(result, null, 2))
  console.log(out, JSON.stringify(result))
  if (Object.values(result.checks).some(x => !x)) process.exitCode = 1
  await ctx.close()
  server.close()
  clearTimeout(limit)
}
