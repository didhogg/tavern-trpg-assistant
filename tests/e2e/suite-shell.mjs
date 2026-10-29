// P1：外壳布局、控件、全局弹窗宿主、「⋯ 更多」菜单、提示条。依赖「设置 › 诊断」里的控件演示。
import { check, bodyPointerEvents, gotoPage, modalCount, openDiagnostics, settle } from './helpers.mjs'

const inShadowFocus = (locator) => locator.evaluate((el) => el === el.getRootNode().activeElement)
const activeInsideModal = (page) =>
  page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root').shadowRoot
    const el = root.activeElement
    return !!el && !!el.closest('.trpg-modal')
  })

async function layoutTests(page, label, { width, height }) {
  const narrow = width <= 480
  const win = page.locator('.trpg-window')
  check(`[${label}] 布局档位正确`, (await win.getAttribute('data-layout')) === (narrow ? 'narrow' : 'wide'))
  const box = await win.boundingBox()
  if (narrow) {
    check(`[${label}] 窄屏窗口铺满视口`, Math.round(box.width) === width && Math.round(box.height) === height, JSON.stringify(box))
    check(`[${label}] 窄屏底部标签栏 56px，标题栏 48px`, Math.round((await page.locator('.trpg-tabs').boundingBox()).height) === 56 && Math.round((await page.locator('.trpg-head').boundingBox()).height) === 48)
    check(`[${label}] 窄屏只有首页、库、设置三个标签`, (await page.locator('.trpg-tab').count()) === 3)
    const tabs = await page.locator('.trpg-tab').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
    check(`[${label}] 标签按钮触控高度 ≥44px`, tabs.every((h) => h >= 44), JSON.stringify(tabs))
  } else {
    check(`[${label}] 宽屏默认窗口 960×640`, Math.round(box.width) === 960 && Math.round(box.height) === 640, JSON.stringify(box))
    check(`[${label}] 宽屏侧栏 176px，只有首页、库、设置`, Math.round((await page.locator('.trpg-side').boundingBox()).width) === 176 && (await page.locator('.trpg-nav').count()) === 3)
    const navs = await page.locator('.trpg-nav').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
    check(`[${label}] 侧栏按钮触控高度 ≥44px`, navs.every((h) => h >= 44), JSON.stringify(navs))
    // 缩放到中宽
    const handle = page.locator('.trpg-resize')
    const hb = await handle.boundingBox()
    await page.mouse.move(hb.x + 10, hb.y + 10)
    await page.mouse.down()
    await page.mouse.move(hb.x - 390, hb.y + 10, { steps: 6 })
    await page.mouse.up()
    await settle(page)
    check(`[${label}] 缩到 570px 宽：中宽布局，侧栏 56px`, (await win.getAttribute('data-layout')) === 'mid' && Math.round((await page.locator('.trpg-side').boundingBox()).width) === 56, `${await win.getAttribute('data-layout')}`)
    const small = await win.boundingBox()
    await page.mouse.move(small.x + small.width - 10, small.y + small.height - 10)
    await page.mouse.down()
    await page.mouse.move(small.x + small.width + 380, small.y + small.height - 10, { steps: 6 })
    await page.mouse.up()
    await settle(page)
    check(`[${label}] 拉回后恢复宽屏布局`, (await win.getAttribute('data-layout')) === 'wide')
    const minimum = await win.boundingBox()
    await page.mouse.move(minimum.x + minimum.width - 10, minimum.y + minimum.height - 10)
    await page.mouse.down()
    await page.mouse.move(minimum.x + 20, minimum.y + 20, { steps: 6 })
    await page.mouse.up()
    const floor = await win.boundingBox()
    check(`[${label}] 窗口缩放不小于 360×480`, Math.round(floor.width) >= 360 && Math.round(floor.height) >= 480, JSON.stringify(floor))
    await page.mouse.move(floor.x + floor.width - 10, floor.y + floor.height - 10)
    await page.mouse.down()
    await page.mouse.move(floor.x + 700, floor.y + 500, { steps: 6 })
    await page.mouse.up()
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  check(`[${label}] 没有整页横向滚动`, !overflow)
}

async function switchTests(page, label) {
  const sw = page.getByRole('switch', { name: '演示开关' })
  await sw.scrollIntoViewIfNeeded()
  const thumb = sw.locator('.trpg-switch__thumb')
  const offset = async () => (await thumb.boundingBox()).x - (await sw.boundingBox()).x
  check(`[${label}] 开关默认关：圆钮在左（○━）`, (await sw.getAttribute('aria-checked')) === 'false' && (await offset()) < 8, `x=${await offset()}`)
  await sw.click()
  await settle(page)
  check(`[${label}] 点击后开：圆钮在右（━●），状态文字同步`, (await sw.getAttribute('aria-checked')) === 'true' && (await offset()) > 14 && (await page.getByTestId('switch-state').innerText()) === '开', `x=${await offset()}`)
  await sw.focus()
  await page.keyboard.press('Space')
  await settle(page)
  check(`[${label}] 空格键可切回关`, (await sw.getAttribute('aria-checked')) === 'false' && (await offset()) < 8)
}

async function modalTests(page, label, { width }) {
  const opener = page.getByRole('button', { name: '点我打开演示弹窗' })
  await opener.scrollIntoViewIfNeeded()
  await opener.click()
  await page.locator('.trpg-modal').waitFor()
  await settle(page)
  check(`[${label}] 点术语打开弹窗，且只有一个弹窗`, (await modalCount(page)) === 1 && (await page.getByTestId('lab-page-1').isVisible()))
  check(`[${label}] 弹窗打开后焦点进入弹窗`, await activeInsideModal(page))
  const page1 = page.locator('.trpg-modal__page').first()
  await page1.evaluate((el) => { el.scrollTop = 240 })
  const before = await page1.evaluate((el) => el.scrollTop)
  // 用 dispatchEvent 而不是 click：click 会先把按钮滚进视野，改变刚设好的滚动位置
  await page.getByRole('button', { name: '同一个弹窗里' }).dispatchEvent('click')
  await settle(page)
  check(`[${label}] 弹窗内点术语：同一个弹窗换到第 2 页，仍只有一个弹窗`, (await modalCount(page)) === 1 && (await page.getByTestId('lab-page-2').isVisible()) && !(await page.getByTestId('lab-page-1').isVisible()))
  check(`[${label}] 第 2 页标题栏出现「‹ 演示弹窗」返回`, await page.getByRole('button', { name: '返回：演示弹窗' }).isVisible())
  await page.getByRole('button', { name: '返回：演示弹窗' }).click()
  await settle(page)
  const after = await page1.evaluate((el) => el.scrollTop)
  check(`[${label}] 点「‹」返回：第 1 页滚动位置恢复（${before}→${after}）`, (await page.getByTestId('lab-page-1').isVisible()) && Math.abs(after - before) <= 2)

  // 弹窗内确认：作为一页显示，不叠加第二个弹窗
  await page.getByRole('button', { name: '弹窗内确认' }).click()
  await settle(page)
  check(`[${label}] 弹窗内确认以换页显示，仍只有一个弹窗`, (await modalCount(page)) === 1 && (await page.getByRole('button', { name: '确认', exact: true }).isVisible()))
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] Esc 取消确认页并回到第 1 页`, (await modalCount(page)) === 1 && (await page.getByTestId('lab-page-1').isVisible()))

  // Tab 循环不跑出弹窗
  let stayed = true
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab')
    stayed = stayed && (await activeInsideModal(page))
  }
  check(`[${label}] Tab 键循环不会跑出弹窗`, stayed)
  const shellInert = await page.locator('.trpg-shell').evaluate((el) => el.hasAttribute('inert'))
  check(`[${label}] 弹窗打开时背景不可操作（inert）`, shellInert)

  // Esc 逐页返回，再关闭，焦点回到术语
  await page.getByRole('button', { name: '同一个弹窗里' }).click()
  await settle(page)
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] Esc 先退回第 1 页`, (await modalCount(page)) === 1 && (await page.getByTestId('lab-page-1').isVisible()))
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] 再按 Esc 关闭弹窗，焦点回到触发术语`, (await modalCount(page)) === 0 && (await inShadowFocus(opener)))

  if (width > 480) {
    await opener.click()
    await page.locator('.trpg-modal').waitFor()
    await settle(page)
    const scrim = await page.locator('.trpg-modal').boundingBox()
    await page.mouse.click(scrim.x + 6, scrim.y + 6)
    await settle(page)
    check(`[${label}] 点遮罩关闭弹窗，背后页面不受影响`, (await modalCount(page)) === 0 && (await page.getByTestId('diagnostics').isVisible()))
  }

  // 页面上直接触发的确认：小确认窗；取消后提示条
  await page.getByRole('button', { name: '危险确认' }).scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: '危险确认' }).click()
  await page.locator('.trpg-modal[data-variant="confirm"]').waitFor()
  check(`[${label}] 页面直接触发的确认：只有一个确认窗，默认焦点在「取消」`, (await modalCount(page)) === 1 && (await page.evaluate(() => document.getElementById('trpg-assistant-root').shadowRoot.activeElement?.textContent?.trim())) === '取消')
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await settle(page)
  check(`[${label}] 确认窗取消后关闭并提示「已取消」`, (await modalCount(page)) === 0 && (await page.getByText('已取消').isVisible()))
}

async function menuTests(page, label) {
  const trigger = page.getByRole('button', { name: '演示条目 的更多操作' })
  await trigger.scrollIntoViewIfNeeded()
  for (const wait of [0, 150, 800]) {
    await trigger.click()
    await page.waitForTimeout(wait)
    await page.getByRole('menuitem', { name: '复制为我的包' }).click()
    await settle(page)
    check(`[${label}] 「⋯ 更多」打开后等 ${wait}ms 点菜单项，选择生效且菜单关闭`, (await page.getByTestId('menu-pick').innerText()).includes('copy') && (await page.getByRole('menu').count()) === 0 && (await bodyPointerEvents(page)) === '')
    await page.evaluate(() => {})
  }
  await trigger.click()
  await settle(page)
  const disabled = await page.getByRole('menuitem', { name: /不可用项/ }).getAttribute('data-disabled')
  check(`[${label}] 不可用菜单项标记为禁用，危险项红色在最后`, disabled !== null && (await page.getByRole('menuitem').last().innerText()).includes('卸载'))
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] Esc 关闭菜单后焦点回到「⋯」按钮`, await inShadowFocus(trigger))
}

async function comboTests(page, label) {
  const input = page.getByRole('combobox', { name: '可搜索下拉演示' })
  await input.scrollIntoViewIfNeeded()
  await input.click()
  await page.getByRole('listbox').waitFor()
  await settle(page)
  const count = page.locator('.trpg-combo__count')
  check(`[${label}] 可搜索下拉：打开显示「共 300 条」，只渲染前 200 行`, (await count.innerText()).includes('共 300 条') && (await page.getByRole('option').count()) === 200)
  await input.fill('法术-02')
  await settle(page, 400)
  check(`[${label}] 边输边筛：结果数同步为「共 10 条」`, (await count.innerText()).includes('共 10 条') && (await page.getByRole('option').count()) === 10)
  await page.getByRole('option', { name: /法术-025/ }).click()
  await settle(page)
  check(`[${label}] 点选项：值变化，列表关闭，页面恢复可点击`, (await page.getByTestId('combo-model').innerText()).includes('s24') && (await page.getByRole('listbox').count()) === 0 && (await bodyPointerEvents(page)) === '')
  await input.click()
  await input.fill('法术-1')
  await settle(page, 300)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await settle(page, 300)
  check(`[${label}] 键盘：↑↓ 移动、Enter 选择`, /s(9|1)\d/.test(await page.getByTestId('combo-model').innerText()) && (await page.getByRole('listbox').count()) === 0, await page.getByTestId('combo-model').innerText())
  await input.click()
  await page.keyboard.press('Escape')
  await settle(page, 300)
  check(`[${label}] Esc 关闭列表`, (await page.getByRole('listbox').count()) === 0 && (await bodyPointerEvents(page)) === '')
  const pill = page.getByRole('button', { name: '移除盖尔的『队伍成员』标签' })
  await pill.click()
  check(`[${label}] 药丸标签：点 × 移除，× 的名称写明是谁的哪个标签`, (await page.getByRole('button', { name: '移除盖尔的『队伍成员』标签' }).count()) === 0 && (await page.getByRole('button', { name: '移除盖尔的『风暴岛』标签' }).count()) === 1)
}

async function toastTests(page, label) {
  const btn = (name) => page.getByRole('button', { name, exact: true })
  const toasts = page.locator('.trpg-toast')
  await btn('成功提示').scrollIntoViewIfNeeded()
  await btn('失败提示').click()
  await btn('可撤销提示').click()
  await btn('成功提示').click()
  await settle(page, 350)
  check(`[${label}] 三种提示同时显示`, (await toasts.count()) === 3)
  await page.waitForTimeout(4300)
  check(`[${label}] 成功提示 4 秒后自动消失，其余仍在`, (await toasts.count()) === 2 && (await page.getByText('下载失败：网络中断').isVisible()))
  await page.waitForTimeout(2000)
  check(`[${label}] 可撤销提示 6 秒后自动消失`, (await toasts.count()) === 1)
  await page.waitForTimeout(2000)
  check(`[${label}] 失败提示 8 秒后自动消失，没有常驻提示`, (await toasts.count()) === 0)
  for (let i = 0; i < 4; i++) await btn('成功提示').click()
  await settle(page, 350)
  check(`[${label}] 同时最多显示 3 条`, (await toasts.count()) === 3)
  await btn('可撤销提示').click()
  await page.getByRole('button', { name: '撤销', exact: true }).click()
  await settle(page, 100)
  check(`[${label}] 点「撤销」执行撤销动作`, await page.getByText('已撤销').isVisible())
}

export async function shellSuite(page, label, ctx) {
  await layoutTests(page, label, ctx)
  await openDiagnostics(page)
  await switchTests(page, label)
  await modalTests(page, label, ctx)
  await menuTests(page, label)
  await comboTests(page, label)
  await toastTests(page, label)
  await gotoPage(page, '首页')
}
