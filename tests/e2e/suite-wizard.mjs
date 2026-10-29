// P3：没有战役时的首页与开局向导。
import { check, gotoPage, modalCount, settle } from './helpers.mjs'

export async function wizardSuite(page, label, { width }) {
  const narrow = width <= 480
  await gotoPage(page, '首页')
  const banner = page.getByTestId('start-banner')
  await banner.waitFor({ timeout: 30000 })
  check(`[${label}] 没有战役：侧栏只有首页、库、设置，首页是一块可点的横幅`, (await page.locator(narrow ? '.trpg-tab' : '.trpg-nav').count()) === 3 && (await banner.evaluate((el) => el.tagName)) === 'BUTTON')
  check(`[${label}] 横幅写明「开始一场新的冒险」与卡名`, /开始一场新的冒险/.test(await banner.innerText()) && /测试角色/.test(await banner.innerText()))
  check(`[${label}] 没有存档时不显示「读取已有存档」`, (await page.getByTestId('load-existing').count()) === 0)

  await banner.click()
  await page.getByTestId('wizard').waitFor()
  await settle(page)
  check(`[${label}] 点横幅打开开局向导弹窗，只有一个弹窗`, (await modalCount(page)) === 1)
  check(`[${label}] 只有一个规则时自动选中，可以直接下一步`, (await page.getByRole('radio', { name: /D&D 5e/ }).getAttribute('aria-checked')) === 'true' && (await page.getByTestId('wizard-next').isEnabled()))
  const skipTitle = await page.locator('.trpg-steps li').nth(2).locator('button').getAttribute('title')
  check(`[${label}] 没有冒险包时第 ③ 步灰显并说明原因`, (await page.locator('.trpg-steps li').nth(2).getAttribute('data-skipped')) === 'true' && !!skipTitle, skipTitle ?? '')

  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
  const srd = page.getByRole('checkbox', { name: 'SRD 基础规则' })
  check(`[${label}] 第 ② 步：SRD 必需（已勾选且不可取消）`, (await srd.isChecked()) && (await srd.isDisabled()))
  // 推荐包在后台下载安装
  await page.waitForFunction(() => {
    const root = document.getElementById('trpg-assistant-root').shadowRoot
    const metas = [...root.querySelectorAll('.trpg-wizard .trpg-row__meta')].map((e) => e.textContent)
    return metas.length >= 10 && !metas.some((t) => t.includes('未安装')) && !root.querySelector('[data-testid=wizard-progress]') && !root.querySelector('.trpg-progress')
  }, null, { timeout: 90000 })
  const failed = await page.getByText('下载失败').count()
  const checked = await page.locator('.trpg-wizard input[type=checkbox]:checked').count()
  check(`[${label}] 推荐包全部装好，默认勾选 11 本，没有失败`, failed === 0 && checked === 11, `勾选 ${checked}，失败 ${failed}`)

  // 点书名：同一个弹窗里换到详情，返回后勾选不变
  await page.getByRole('button', { name: '玩家手册（2014）', exact: true }).click()
  await page.getByTestId('pack-detail').waitFor()
  await settle(page)
  check(`[${label}] 点书名：同一个弹窗换到包详情，仍只有一个弹窗`, (await modalCount(page)) === 1 && (await page.getByRole('button', { name: '返回：开始新冒险' }).isVisible()))
  await page.getByRole('button', { name: '返回：开始新冒险' }).click()
  await settle(page)
  check(`[${label}] 返回后回到第 ② 步，勾选保持不变`, (await page.locator('.trpg-wizard input[type=checkbox]:checked').count()) === 11)

  const mtf = page.getByRole('checkbox', { name: '魔邓肯的众敌卷册' })
  await mtf.uncheck()
  check(`[${label}] 可以取消勾选一本书`, (await page.locator('.trpg-wizard input[type=checkbox]:checked').count()) === 10)
  await page.getByRole('button', { name: '只留必需' }).click()
  check(`[${label}] 「只留必需」只剩 SRD`, (await page.locator('.trpg-wizard input[type=checkbox]:checked').count()) === 1)
  await page.getByRole('button', { name: '全选', exact: true }).click()
  await settle(page, 400)
  check(`[${label}] 「全选」勾上全部书`, (await page.locator('.trpg-wizard input[type=checkbox]:checked').count()) === 11)
  await mtf.uncheck()

  await page.getByTestId('wizard-next').click()
  check(`[${label}] ② 之后直接到 ④ 命名（冒险一步跳过）`, await page.getByRole('textbox', { name: '战役名称' }).isVisible())
  const name = page.getByRole('textbox', { name: '战役名称' })
  check(`[${label}] 默认名称「规则简称 · 月日」且已全选`, /^D&D 5e · \d+月\d+日$/.test(await name.inputValue()))
  check(`[${label}] 摘要写明规则、资料数与不带冒险`, (await page.getByTestId('wizard-summary').innerText()).includes('资料 10 本 · 不带冒险'))
  await name.fill('')
  check(`[${label}] 名称为空：就近提示，「开始冒险」不可用`, (await page.getByText('请输入战役名称').isVisible()) && (await page.getByTestId('wizard-next').isDisabled()))
  await name.fill('x'.repeat(41))
  check(`[${label}] 名称超过 40 字：提示，不可开始`, (await page.getByText(/最多 40 个字/).isVisible()) && (await page.getByTestId('wizard-next').isDisabled()))
  await name.fill('测试战役')

  // 关闭时先确认（在同一个弹窗里换页）
  await page.locator('.trpg-modal__close').click()
  await settle(page)
  check(`[${label}] 选过内容后关闭：弹窗换成「放弃这次新建？」确认页，不叠加弹窗`, (await modalCount(page)) === 1 && (await page.getByText('已经选好的内容不会保存。').isVisible()))
  await page.getByRole('button', { name: '继续填写' }).click()
  await settle(page)
  check(`[${label}] 选「继续填写」回到向导，已填内容保留`, (await page.getByRole('textbox', { name: '战役名称' }).inputValue()) === '测试战役')

  await page.getByRole('button', { name: '上一步' }).click()
  await page.getByRole('checkbox', { name: 'SRD 基础规则' }).waitFor()
  check(`[${label}] 上一步回到第 ② 步`, await page.getByRole('checkbox', { name: 'SRD 基础规则' }).isVisible())
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('banner-title').waitFor({ timeout: 30000 })
  await settle(page)
  check(`[${label}] 开始冒险：弹窗关闭，首页变为战役概览，标题是战役名`, (await modalCount(page)) === 0 && (await page.getByTestId('banner-title').innerText()) === '测试战役')
  check(`[${label}] 提示条「已开始「测试战役」」`, await page.getByText('已开始「测试战役」').isVisible())
  check(`[${label}] 概览格「库」显示已启用 10 个扩展包`, (await page.getByTestId('cell-library').innerText()).includes('已启用 10 个扩展包'))
}
