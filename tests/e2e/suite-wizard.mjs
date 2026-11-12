// P4：没有战役时的首页与开局向导（四步：规则 / 版本 / 资料 / 命名，P5-5 §13 改版）、库标签小环。联网路径见 suite-wizard-books.mjs（E2E_NET=1）。
import { check, gotoPage, modalCount, settle } from './helpers.mjs'

const stepsOf = (page) => page.locator('.trpg-steps li')

export async function wizardSuite(page, label, { width }) {
  const narrow = width <= 480
  await gotoPage(page, '首页')
  const banner = page.getByTestId('start-banner')
  await banner.waitFor({ timeout: 30000 })
  check(`[${label}] 没有战役：三个入口（首页、库、设置），首页是一块可点的横幅`, (await page.locator(narrow ? '.trpg-tab' : '.trpg-nav').count()) === 3 && (await banner.evaluate((el) => el.tagName)) === 'BUTTON')
  check(`[${label}] 横幅写明「开始一场新的冒险」与卡名，只有一个主动作`, /开始一场新的冒险/.test(await banner.innerText()) && /测试角色/.test(await banner.innerText()) && (await page.getByTestId('banner').count()) === 0)
  check(`[${label}] 没有存档时不显示「读取已有存档」`, (await page.getByTestId('load-existing').count()) === 0)

  await banner.click()
  await page.getByTestId('wizard').waitFor()
  await settle(page)
  check(`[${label}] 点横幅打开开局向导弹窗，只有一个弹窗`, (await modalCount(page)) === 1)
  check(`[${label}] 向导四步：规则、版本、资料、命名；第①步没有「上一步」`, (await stepsOf(page).count()) === 4 && (await page.getByRole('button', { name: '上一步' }).count()) === 0)
  check(`[${label}] 只有一个体系时自动选中，可以直接下一步`, (await page.getByRole('radio', { name: /D&D 5e/ }).getAttribute('aria-checked')) === 'true' && (await page.getByTestId('wizard-next').isEnabled()))

  // ② 版本：5e 预选；5.5e 结算还没接入，灰掉
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('version-card').first().waitFor()
  const v24 = page.getByTestId('version-card').filter({ hasText: '2024' })
  check(`[${label}] 第②步：5e（2014）预选，5.5e 灰掉并写「结算规则还没接入」`, (await page.getByTestId('version-card').filter({ hasText: '2014' }).getAttribute('aria-checked')) === 'true' && (await v24.getAttribute('aria-disabled')) === 'true' && (await v24.innerText()).includes('结算规则还没接入'))

  // ③ 资料：断网时书目取不到，只提示一句，不挡路；一本没勾就不下载
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-size-hint').waitFor()
  await page.getByTestId('wizard-nobooks').waitFor({ timeout: 30000 })
  check(`[${label}] 第③步：书目取不到只写一句「当前拉取不到书目，请之后再去库里添加」`, (await page.getByTestId('wizard-nobooks').innerText()).includes('当前拉取不到书目，请之后再去库里添加'))
  check(`[${label}] 第③步说明：勾选的在战役创建完成后、在后台【库】里下载`, (await page.getByTestId('wizard-size-hint').innerText()).includes('在战役创建完成后，在后台【库】里下载'))
  check(`[${label}] 一本没勾：写「已选 0 项 · 不下载新资料」，不挡「下一步」`, (await page.getByTestId('wizard-picked').innerText()).includes('已选 0 项 · 不下载新资料') && (await page.getByTestId('wizard-next').isEnabled()))

  // ④ 命名
  await page.getByTestId('wizard-next').click()
  const name = page.getByTestId('wizard-name')
  await name.waitFor()
  check(`[${label}] 第④步默认名称「规则简称 · 月日」`, /^D&D 5e · \d+月\d+日$/.test(await name.inputValue()))
  const summary = page.getByTestId('wizard-summary')
  check(`[${label}] 摘要块：将建立战役 / 体系 · 版本 / 资料不下载新的书 / 冒险未选择`, /将建立战役：D&D 5e · \d+月\d+日/.test(await summary.innerText()) && (await summary.innerText()).includes('D&D 5e · 版本 5e') && (await summary.innerText()).includes('这次不下载新的书') && (await summary.innerText()).includes('冒险：未选择'), await summary.innerText())
  await name.fill('')
  check(`[${label}] 名称为空：就近提示，「开始冒险」不可用，摘要写「（未命名）」`, (await page.getByText('请输入战役名称').isVisible()) && (await page.getByTestId('wizard-next').isDisabled()) && (await summary.innerText()).includes('（未命名）'))
  await name.fill('x'.repeat(41))
  check(`[${label}] 名称超过 40 字：提示，不可开始`, (await page.getByText(/最多 40 个字/).isVisible()) && (await page.getByTestId('wizard-next').isDisabled()))
  await name.fill('测试战役')

  // ✕ 直接回首页，不弹放弃确认
  await page.locator('.trpg-modal__close').click()
  await settle(page)
  check(`[${label}] 点 ✕：直接关闭回首页，不弹「放弃」确认`, (await modalCount(page)) === 0 && (await page.getByText('放弃这次新建').count()) === 0 && (await banner.isVisible()))
  await banner.click()
  await page.getByTestId('wizard').waitFor()
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] 按 Esc 同样直接关闭`, (await modalCount(page)) === 0)
  await banner.click()
  await page.getByTestId('wizard').waitFor()
  await settle(page)
  check(`[${label}] 重新打开：从第①步开始，已选内容不保留`, (await page.getByRole('radio', { name: /D&D 5e/ }).isVisible()) && (await stepsOf(page).nth(0).getAttribute('data-state')) === 'current')

  // 走到最后开始冒险（点已完成的步骤可以回去）
  for (let i = 0; i < 3; i++) await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-name').fill('测试战役')
  await page.getByRole('button', { name: '上一步' }).click()
  check(`[${label}] 上一步回到第③步；已完成的步骤条可点回第①步`, (await stepsOf(page).nth(2).getAttribute('data-state')) === 'current')
  if (!narrow) {
    await stepsOf(page).nth(0).getByRole('button').click()
    check(`[${label}] 点步骤条回第①步`, await page.getByRole('radio', { name: /D&D 5e/ }).isVisible())
    for (let i = 0; i < 3; i++) await page.getByTestId('wizard-next').click()
  } else await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-name').fill('测试战役')
  await page.getByTestId('wizard-name').press('Enter')
  await page.getByTestId('banner-title').waitFor({ timeout: 30000 })
  await settle(page)
  check(`[${label}] 开始冒险（回车也能触发）：弹窗关闭，首页变战役横幅，标题是战役名`, (await modalCount(page)) === 0 && (await page.getByTestId('banner-title').innerText()) === '测试战役')
  check(`[${label}] 提示条「已开始「测试战役」」`, await page.getByText('已开始「测试战役」').isVisible())
  check(`[${label}] 最近记录：说明文字 + 高亮的「掷一次骰子试试」，没有箭头`, (await page.getByTestId('dice-hint').isVisible()) && /还没有记录/.test(await page.locator('.trpg-empty').innerText()))

  // 横幅上的「创建新战役」：打开同一个向导
  check(`[${label}] 战役横幅上有「创建新战役」按钮，战役横幅没有被图片盖住（只有占位插画）`, (await page.getByTestId('banner-new').isVisible()) && (await page.locator('.trpg-banner img').count()) === 0)
  await page.getByTestId('banner-new').click()
  await page.getByTestId('wizard').waitFor()
  check(`[${label}] 点「创建新战役」：打开向导（从第①步开始）`, (await modalCount(page)) === 1 && (await stepsOf(page).nth(0).getAttribute('data-state')) === 'current')
  await page.locator('.trpg-modal__close').click()
  await settle(page)

  // 库标签的小环：断网时下载失败 → 虚线环 + 角标 !，悬停出小窗，只列失败项。
  // P5-5 §13 起向导没勾书就不下载，这里直接在【库】开一个官方资料下载（断网必失败）
  await page.evaluate(() => { const h = document.querySelector('#trpg-assistant-root'); const pinia = [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia; pinia._s.get('app').svc().backend.library.tasks.startOfficial('cn-official'); pinia._s.get('downloads').refresh() })
  await page.getByTestId('lib-ring').waitFor({ timeout: 60000 })
  await page.waitForFunction(() => document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid=lib-ring]')?.getAttribute('data-state') === 'warn', null, { timeout: 60000 })
  check(`[${label}] 库标签：下载失败时出现虚线小环 + 数字`, (await page.getByTestId('lib-ring').getAttribute('data-state')) === 'warn' && /^\d+$/.test((await page.locator('[data-testid=lib-ring] .trpg-count').innerText()).trim()))
  await page.getByTestId('nav-library').hover()
  await page.getByTestId('lib-pop').waitFor()
  const pop = await page.getByTestId('lib-pop').innerText()
  // P5 T6 起：悬浮窗每项可直接【重试】或关掉（驾驶员要求），不再写「请之后到库里重试」
  check(`[${label}] 悬停小窗：列出失败的「官方资料」并写明失败原因，带【重试】和关掉按钮`, pop.includes('官方资料') && pop.includes('失败') && (await page.getByTestId('pop-retry').count()) >= 1, pop)
  await page.mouse.move(2, 2)
  await settle(page, 600) // 移开后有 250 毫秒缓冲（方便鼠标移进小窗），再等一会
  check(`[${label}] 移开鼠标小窗即消失`, (await page.getByTestId('lib-pop').count()) === 0)
}
