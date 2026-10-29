// 骰盘悬浮窗：骰式构建器（点骰子只改骰式，只有「掷骰」才出结果）。
import { check, gotoPage, settle } from './helpers.mjs'
import { callStore } from './store.mjs'

const num = (text) => Number(text.trim())

export async function diceSuite(page, label, { width, height }) {
  const narrow = width <= 480
  await gotoPage(page, '首页')
  const tray = page.locator('.trpg-dice')
  const toggle = page.locator('.trpg-dice-btn') // 骰盘里的主按钮也叫「掷骰」，这里只取悬浮球
  const winBefore = await page.locator('.trpg-window').boundingBox()
  await toggle.click()
  await tray.waitFor()
  await settle(page)
  const winAfter = await page.locator('.trpg-window').boundingBox()
  check(`[${label}] 点 ⚄ 打开骰盘悬浮窗，主窗口位置与大小不变`, (await tray.isVisible()) && JSON.stringify(winBefore) === JSON.stringify(winAfter))
  const tb = await tray.boundingBox()
  if (narrow) check(`[${label}] 窄屏骰盘宽为视口的 92%，贴在标签栏上方`, Math.abs(tb.width - width * 0.92) <= 2 && tb.y + tb.height <= height - 56, JSON.stringify(tb))
  else check(`[${label}] 宽屏骰盘宽 360px 且在屏幕内`, Math.round(tb.width) === 360 && tb.x >= 0 && tb.y >= 0 && tb.x + tb.width <= width + 1 && tb.y + tb.height <= height + 1, JSON.stringify(tb))

  const formula = tray.getByRole('textbox', { name: '骰式' })
  const rollBtn = tray.getByTestId('dice-roll')
  const total = tray.getByTestId('dice-total')
  const line = tray.getByTestId('dice-line')
  const die = (n) => tray.getByRole('button', { name: new RegExp(`^加一颗 d${n}(，|$)`) })
  const rollNow = async () => {
    const before = await total.innerText()
    await rollBtn.click()
    await page.waitForFunction(() => {
      const r = document.getElementById('trpg-assistant-root').shadowRoot
      return !r.querySelector('.trpg-dice__hero.is-rolling')
    })
    return before
  }

  // 点骰子只改骰式，不出结果
  check(`[${label}] 刚打开：骰式为空，「掷骰」不可点，结果区是提示`, (await formula.inputValue()) === '' && (await rollBtn.isDisabled()) && (await line.innerText()).includes('点「掷骰」'))
  await die(20).click()
  await settle(page, 120)
  check(`[${label}] 点 d20 只把 1d20 加进骰式，不直接掷`, (await formula.inputValue()) === '1d20' && (await total.innerText()) === '')
  await die(6).click()
  await die(6).click()
  check(`[${label}] 再点两次 d6：骰式 2d6 + 1d20，d6 角标 ×2`, (await formula.inputValue()) === '2d6 + 1d20' && (await tray.getByText('×2').count()) === 1, await formula.inputValue())
  await tray.getByRole('button', { name: '减一颗 d6' }).click()
  check(`[${label}] 点 d6 角上的「−」减一颗`, (await formula.inputValue()) === '1d6 + 1d20')

  // 加减值写进骰式
  for (let i = 0; i < 5; i++) await tray.getByRole('button', { name: '加 1' }).click()
  check(`[${label}] 加减值调到 +5，骰式同步为 … + 5`, (await tray.getByTestId('dice-mod').innerText()) === '+5' && (await formula.inputValue()) === '1d6 + 1d20 + 5', await formula.inputValue())
  await formula.fill('1d20+3')
  check(`[${label}] 手写骰式后，加减值显示跟着变为 +3`, (await tray.getByTestId('dice-mod').innerText()) === '+3')

  // 掷骰
  const r1 = await rollNow()
  const t1 = num(await total.innerText())
  check(`[${label}] 点「掷骰」才出结果：1d20+3 在 4–23，明细含 = 总数`, r1 === '' && t1 >= 4 && t1 <= 23 && (await line.innerText()).includes(`= ${t1}`), await line.innerText())
  check(`[${label}] 结果下方显示每颗骰子的小骰面和 +3`, (await tray.locator('.trpg-dice__mini').count()) === 1 && (await tray.locator('.trpg-dice__const').innerText()) === '+3')

  // 优势劣势：只对单个 1d20
  await tray.getByRole('button', { name: '优势', exact: true }).click()
  await rollNow()
  const advLine = await line.innerText()
  check(`[${label}] 优势：明细标明取高与两颗点数，两颗骰面都显示，落选的变淡`, /优势/.test(advLine) && /取高 \d+\/\d+/.test(advLine) && (await tray.locator('.trpg-dice__mini').count()) === 2 && (await tray.locator('.trpg-dice__mini.is-dim').count()) === 1, advLine)
  await tray.getByRole('button', { name: '劣势', exact: true }).click()
  await rollNow()
  check(`[${label}] 劣势：明细标明取低`, /取低 \d+\/\d+/.test(await line.innerText()), await line.innerText())
  await tray.getByRole('button', { name: '普通', exact: true }).click()
  await formula.fill('2d6+3')
  check(`[${label}] 骰式不是单个 1d20 时，优势劣势灰掉并说明原因`, (await tray.getByRole('button', { name: '优势', exact: true }).isDisabled()) && (await tray.getByTestId('dice-hint').innerText()).includes('只对单个 1d20'))
  await formula.press('Enter')
  await page.waitForFunction(() => !document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-dice__hero.is-rolling'))
  const t2 = num(await total.innerText())
  check(`[${label}] 骰式框里回车也能掷：2d6+3 在 5–15`, t2 >= 5 && t2 <= 15, await line.innerText())

  // 不合法的骰式
  await formula.fill('abc')
  check(`[${label}] 骰式看不懂时就近提示原因，「掷骰」不可点，上次结果保留`, (await tray.getByRole('alert').innerText()).includes('骰式看不懂') && (await rollBtn.isDisabled()) && num(await total.innerText()) === t2)
  await tray.getByRole('button', { name: '清空' }).click()
  check(`[${label}] 清空：骰式为空，提示消失`, (await formula.inputValue()) === '' && (await tray.getByRole('alert').innerText()) === '')

  // 天然 20 / 天然 1
  await callStore(page, 'dice', (s) => { s.setRng(() => 0.9999) })
  await formula.fill('1d20')
  await rollNow()
  check(`[${label}] 天然 20：骰子金色并有文字「天然 20」`, (await tray.locator('.trpg-dice__hero.is-nat20').count()) === 1 && (await tray.getByText('天然 20').count()) === 1)
  await callStore(page, 'dice', (s) => { s.setRng(() => 0) })
  await rollNow()
  check(`[${label}] 天然 1：骰子红色并有文字「天然 1」`, (await tray.locator('.trpg-dice__hero.is-nat1').count()) === 1 && (await tray.getByText('天然 1').count()) === 1)
  await callStore(page, 'dice', (s) => { s.setRng(null) })

  // 填入输入框：保留原文、不发送；说明在结果卡里
  await formula.fill('1d20+5')
  await page.evaluate(() => { document.getElementById('send_textarea').value = '原有文字' })
  await tray.getByRole('textbox', { name: '说明' }).fill('感知检定')
  await rollNow()
  await tray.getByRole('button', { name: '填入输入框' }).click()
  const filled = await page.evaluate(() => document.getElementById('send_textarea').value)
  check(`[${label}] 填入输入框：原文保留，另起一行追加注释，说明写进注释`, /^原有文字\n<!-- \[掷骰\] 感知检定：1d20\+5 = \d+（.*） -->$/.test(filled), filled)
  check(`[${label}] 填入后没有自动发送`, (await page.evaluate(() => window.__mockInjected().length)) === 0)
  check(`[${label}] 按钮变为「已填入 ✓」`, await tray.getByRole('button', { name: '已填入 ✓' }).isVisible())
  await page.waitForTimeout(2300)
  check(`[${label}] 2 秒后按钮恢复`, await tray.getByRole('button', { name: '填入输入框' }).isVisible())
  await page.evaluate(() => { document.getElementById('send_textarea').id = 'send_textarea_x' })
  await tray.getByRole('button', { name: '填入输入框' }).click()
  check(`[${label}] 找不到输入框时显示「尚未填入」，结果与复制仍可用`, (await tray.getByRole('button', { name: /尚未填入/ }).isVisible()) && (await tray.getByRole('button', { name: '复制' }).isEnabled()))
  await page.evaluate(() => { document.getElementById('send_textarea_x').id = 'send_textarea' })
  await page.evaluate(() => { document.getElementById('send_textarea').value = '' })

  // 最近：默认折叠，点一行只载入骰式不掷
  const recent = tray.getByRole('button', { name: /^最近 \d+ 次/ })
  const items = tray.locator('.trpg-dice__list li')
  check(`[${label}] 「最近」默认折叠，只显示次数和上一次的结果`, (await recent.getAttribute('aria-expanded')) === 'false' && (await items.count()) === 0 && /上一次/.test(await recent.innerText()))
  await recent.click()
  const count = await items.count()
  check(`[${label}] 展开后按时间倒序列出（${count} 条）`, count >= 6 && count <= 20)
  await formula.fill('1d4')
  const lastTotal = await total.innerText()
  await items.first().getByRole('button').click()
  check(`[${label}] 点记录行：载入当时的骰式，不掷，结果不变`, (await formula.inputValue()) === '1d20 + 5' && (await total.innerText()) === lastTotal, await formula.inputValue())

  // 拖动、位置记忆、点外部不关闭
  const head = tray.locator('.trpg-dice__head')
  const hb = await head.boundingBox()
  await page.mouse.move(hb.x + 60, hb.y + 12)
  await page.mouse.down()
  await page.mouse.move(hb.x + 60, hb.y + 60, { steps: 6 })
  await page.mouse.up()
  const moved = await tray.boundingBox()
  const room = (narrow ? height - 64 : height) - tb.height - tb.y // 往下还能拖多远
  check(`[${label}] 可拖动（窄屏只上下）、不出屏幕、窄屏不盖住标签栏`, (room < 20 || Math.abs(moved.y - tb.y) > 20) && moved.y >= 0 && moved.y + moved.height <= (narrow ? height - 56 : height) + 1 && (!narrow || Math.abs(moved.x - tb.x) <= 1), JSON.stringify({ tb, moved, room }))
  check(`[${label}] 位置已记住`, !!(await page.evaluate(() => localStorage.getItem('trpg-assistant:dice'))))
  await page.mouse.click(width / 2, 20)
  await settle(page, 150)
  check(`[${label}] 点外部不会关闭骰盘`, await tray.isVisible())

  // 主窗口里打开模态弹窗时，骰盘不被遮住、仍可使用
  // 骰盘按设计浮在页面上，可能盖住下面的按钮，所以用 dispatchEvent 触发点击
  await gotoPage(page, '设置')
  await page.locator('.trpg-content').getByRole('button', { name: /^打开/ }).first().dispatchEvent('click')
  await page.getByTestId('diagnostics').waitFor()
  await page.getByRole('button', { name: '点我打开演示弹窗' }).dispatchEvent('click')
  await page.locator('.trpg-modal').waitFor()
  await settle(page)
  await formula.fill('1d100')
  await rollBtn.dispatchEvent('click')
  await page.waitForFunction(() => !document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-dice__hero.is-rolling'))
  const covered = await page.evaluate(() => {
    const root = document.getElementById('trpg-assistant-root').shadowRoot
    const r = root.querySelector('.trpg-dice').getBoundingClientRect()
    const hit = root.elementFromPoint(r.x + r.width / 2, r.y + 30)
    return !hit?.closest('.trpg-dice')
  })
  const after = num(await total.innerText())
  check(`[${label}] 弹窗打开时骰盘不被遮住，仍可掷骰`, !covered && after >= 1 && after <= 100 && (await page.locator('.trpg-modal').count()) === 1, String(after))
  await page.locator('.trpg-modal__close').dispatchEvent('click') // 骰盘可能盖住它
  await settle(page)

  await tray.getByRole('button', { name: '清空记录' }).click()
  check(`[${label}] 清空记录后列表为空`, (await items.count()) === 0)
  await tray.getByRole('button', { name: '关闭掷骰' }).click()
  check(`[${label}] ✕ 关闭骰盘`, (await tray.count()) === 0)
  await toggle.dispatchEvent('click') // 骰盘打开时可能盖住悬浮球，直接触发点击
  check(`[${label}] 再点 ⚄ 重新打开`, await tray.isVisible())
  await toggle.dispatchEvent('click')
  check(`[${label}] 再点一次关闭`, (await tray.count()) === 0)
  await gotoPage(page, '首页')
}
