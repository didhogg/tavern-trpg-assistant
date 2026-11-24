// 测试公用：像用户一样答完「从库里加」的问答页（ui/person/ask/ImportAsk.vue）——看画面上是什么题就点什么，最后确认。
//   level：等级题选到第几级（不给 = 用已预选的）；prefer[题目] = 勾选题先勾哪些（按文字）；其余：是否题点「是」、下拉照默认、
//   勾选题从上往下勾满、起始装备每组选第一个方案（「任选一件」选第一个候选）、属性提升力量 +2。
//   onStep(题号, 题目, 截图前的页面) 给截图用。交回每一步：题目、做了什么、耗时毫秒。
const root = () => document.querySelector('#trpg-assistant-root').shadowRoot
/** firstPause：第一题出来后停多少毫秒再作答（真人要读题；后台趁这时预读资料）。 */
export async function answerImport(page, { level, prefer = {}, onStep, firstPause = 0 } = {}) {
  const ask = page.getByTestId('import-ask')
  const log = []
  const idle = () => page.waitForFunction(() => { const a = document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid=import-ask]'); return !a || !a.getAttribute('aria-busy') }, null, { timeout: 60000 })
  const changed = (title) => page.waitForFunction((t) => {
    const r = document.querySelector('#trpg-assistant-root').shadowRoot
    const a = r.querySelector('[data-testid=import-ask]')
    if (!a) return true
    if (a.getAttribute('aria-busy')) return false
    const h = r.querySelector('[data-testid=ask-title]')
    return !h || h.textContent !== t || !!r.querySelector('[data-testid=ask-ready]') || !!r.querySelector('[data-testid=ask-error]')
  }, title, { timeout: 60000 })
  void root
  for (let n = 1; n <= 30; n++) {
    await idle()
    if (!(await ask.count())) { log.push({ done: 'written' }); break }
    if (await page.getByTestId('ask-ready').count()) {
      const t0 = Date.now(); await page.getByTestId('ask-confirm').click()
      await page.waitForFunction(() => !document.querySelector('#trpg-assistant-root').shadowRoot.querySelector('[data-testid=import-ask]'), null, { timeout: 60000 })
      log.push({ done: 'confirmed', ms: Date.now() - t0 }); break
    }
    if (await page.getByTestId('ask-error').count()) { log.push({ error: await page.getByTestId('ask-error').innerText() }); break }
    const title = await page.getByTestId('ask-title').innerText()
    await onStep?.(n, title)
    if (n === 1 && firstPause) await page.waitForTimeout(firstPause)
    let did = ''
    if (await page.getByTestId('ask-yes').count()) {
      const t0 = Date.now(); await page.getByTestId('ask-yes').click(); await changed(title)
      log.push({ n, title, did: 'yes', ms: Date.now() - t0 }); continue
    }
    if (await page.locator('.ask-levels').count()) {
      // 指定了就点那一级；没指定、也没有预选（新加职业）就像用户一样点第一个能选的等级
      if (level) await page.getByTestId(`ask-level-${level}`).click()
      else if (!(await page.locator('.ask-levels .ask-row[data-on]').count())) await page.locator('.ask-levels input[type=radio]:not(:disabled)').first().check()
      did = `level ${level ?? '预选或第一级'}`
    }
    else if (await page.locator('.ask-equip').count()) {
      did = 'equip a'
      const groups = page.locator('.ask-equip .ask-group')
      for (let g = 0; g < await groups.count(); g++) {
        const radio = groups.nth(g).locator('input[type=radio]')
        if (await radio.count()) await radio.first().check()
        const sel = groups.nth(g).locator('.ask-equip-choice').first().locator('button[role=combobox]')
        for (let i = 0; i < await sel.count(); i++) { await sel.nth(i).click(); await page.getByRole('option').first().click() }
      }
    } else if (await page.locator('.ask-asi').count()) { did = 'asi str+2'; await page.getByTestId('ask-asi-str').click(); await page.getByTestId('ask-asi-str').click() }
    else if (await page.locator('.ask-group').count()) {
      did = 'pick'
      const groups = page.locator('.ask-group')
      for (let g = 0; g < await groups.count(); g++) {
        for (const want of prefer[title] ?? []) { const c = groups.nth(g).locator('.ask-chip').filter({ hasText: want }); if (await c.count()) await c.first().locator('input').click({ force: true }) }
        for (let i = 0; i < 40; i++) {
          if (!/还差/.test(await groups.nth(g).locator('.ask-group-head small').innerText())) break
          const free = groups.nth(g).locator('.ask-chip input:not(:checked):not(:disabled)')
          if (!(await free.count())) break
          await free.first().click({ force: true })
        }
      }
    }
    const next = page.getByTestId('ask-next')
    if (!(await next.isEnabled())) { log.push({ n, title, did, stuck: '下一步不亮' }); break }
    const t0 = Date.now(); await next.click(); await changed(title)
    log.push({ n, title, did, ms: Date.now() - t0 })
  }
  return log
}
