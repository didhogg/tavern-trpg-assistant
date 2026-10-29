// 键盘走查：记录各界面的 Tab 顺序与 Esc 行为，写入 docs/probes/M3_键盘走查.md。用法：npm run keys
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'
import { callStore } from './store.mjs'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const { server, url } = await startServer()
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const lines = ['# M3 键盘走查', '', '由 `npm run keys` 在 Chrome 桌面宽度生成：用真实按键 Tab / Shift+Tab / Enter / Esc 走一遍，记录焦点停留的位置。', '']
const active = () =>
  page.evaluate(() => {
    const el = document.getElementById('trpg-assistant-root').shadowRoot.activeElement
    if (!el) return '（无）'
    const name = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent.trim().replace(/\s+/g, ' ').slice(0, 24) || el.tagName.toLowerCase()
    return `${name}${el.getAttribute('role') ? `〔${el.getAttribute('role')}〕` : ''}${el.disabled ? '〔禁用〕' : ''}`
  })

async function tabs(title, count) {
  const seen = []
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab')
    seen.push(await active())
  }
  lines.push(`### ${title}`, '', seen.map((s, i) => `${i + 1}. ${s}`).join('\n'), '')
}

try {
  await page.goto(url)
  await page.locator('.trpg-ball').focus()
  await page.keyboard.press('Enter')
  await page.getByTestId('start-banner').waitFor({ timeout: 30000 })
  lines.push('## 外壳', '', '悬浮球用键盘聚焦后按 Enter 打开窗口。', '')
  await page.getByTestId('start-banner').focus()
  await tabs('没有战役的首页：从横幅开始按 Tab', 6)
  await page.getByTestId('start-banner').focus()
  await page.keyboard.press('Enter')
  await page.getByTestId('wizard').waitFor()
  lines.push('## 开局向导（弹窗）', '', 'Enter 打开向导后，焦点进入弹窗；Tab 在弹窗内循环，不会跑到背景。', '')
  await tabs('向导第 ① 步', 8)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
  await page.waitForTimeout(1500)
  await tabs('向导第 ② 步（前 8 个停留点）', 8)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  lines.push(`Esc 在没有选过内容时直接关闭向导：弹窗数 ${await page.locator('.trpg-modal').count()}。`, '')
  await page.getByTestId('start-banner').click()
  await page.getByTestId('wizard').waitFor()
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
  await page.waitForFunction(() => !document.getElementById('trpg-assistant-root').shadowRoot.querySelector('.trpg-progress'), null, { timeout: 90000 })
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('banner-title').waitFor({ timeout: 30000 })
  await callStore(page, 'campaign', (s) => { s.updateData((d) => ({ ...d, instances: [...d.instances, { id: 'k', type: 'monster', name: '怪', data: {} }] })) })
  await page.getByTestId('save-chip').focus()
  await page.keyboard.press('Enter')
  await page.getByTestId('save-drawer').waitFor()
  await page.waitForTimeout(400)
  lines.push('## 存档抽屉', '', '页头存档芯片聚焦后按 Enter 打开。', '')
  await tabs('存档抽屉', 10)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  lines.push(`Esc 关闭抽屉后焦点回到：${await active()}。`, '')
  await page.locator('.trpg-window nav').getByRole('button', { name: '库', exact: true }).click()
  await page.getByTestId('save-tab').waitFor()
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId('ext-dnd5e2014-phb').waitFor()
  lines.push('## 库与包详情弹窗', '')
  const term = page.getByTestId('ext-dnd5e2014-phb').locator('.trpg-term')
  await term.focus()
  await page.keyboard.press('Enter')
  await page.getByTestId('pack-detail').waitFor()
  await page.locator('.trpg-vlist__row').first().waitFor()
  await tabs('包详情弹窗（前 8 个停留点）', 8)
  await page.locator('.trpg-vlist__row .trpg-term').first().focus()
  await page.keyboard.press('Enter')
  await page.getByTestId('entry-detail').waitFor()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  lines.push(`在条目详情按 Esc：回到包的条目列表（${await page.getByTestId('pack-detail').isVisible()}）。`, '')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  lines.push(`再按 Esc：关闭弹窗，焦点回到：${await active()}。`, '')
  lines.push('## 骰盘悬浮窗', '')
  await page.getByRole('button', { name: '掷骰', exact: true }).focus()
  await page.keyboard.press('Enter')
  await page.locator('.trpg-dice').waitFor()
  await page.locator('.trpg-dice').getByRole('button', { name: /^加一颗 d4/ }).focus()
  await tabs('骰盘（从 d4 开始）', 14)
  await page.locator('.trpg-dice').getByRole('textbox', { name: '骰式' }).fill('2d6+3')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(700)
  lines.push(`骰式输入框回车：掷出 ${await page.getByTestId('dice-line').innerText()}。`, '')
  lines.push('## 已知限制', '', '- macOS 的 WebKit（Safari 与 TauriTavern 的网页内核）默认不让 Tab 停在按钮上，这是系统「键盘导航」设置决定的。弹窗内的 Tab 由我们自己接管，不受影响；主窗口侧栏与页面内的按钮沿用系统行为。', '')
  writeFileSync(join(root, 'docs/probes/M3_键盘走查.md'), lines.join('\n'))
  console.log('已写入 docs/probes/M3_键盘走查.md')
} finally {
  await browser.close()
  server.close()
}
