// 冒烟测试：在模拟宿主页中验证扩展挂载、探针接线、弹层不被裁切。不能代替真机验证。
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit } from 'playwright-core'

const root = fileURLToPath(new URL('../../', import.meta.url))
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }

const server = createServer(async (req, res) => {
  const requested = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
  if (requested === '/favicon.ico') {
    res.writeHead(204).end()
    return
  }
  const path = requested === '/' ? '/tests/e2e/mock-host.html' : requested
  try {
    const body = await readFile(join(root, path))
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, resolve))
const url = `http://127.0.0.1:${server.address().port}/`

const failures = []
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`)
  if (!ok) failures.push(name)
}

const settle = (page) => page.waitForTimeout(250)
const modelText = (page) => page.getByTestId('select-model').innerText()
const listCount = (page) => page.getByRole('listbox').count()
const bodyPointerEvents = (page) => page.evaluate(() => document.body.style.pointerEvents)
const clickCenter = async (page, locator) => {
  const box = await locator.boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

// 下拉控件的交互测试：必须真的选中选项，并在界面稳定后检查结果
async function selectTests(page, label) {
  const first = page.getByRole('combobox', { name: '测试下拉（8 项）' })
  const second = page.getByRole('combobox', { name: '测试下拉（3 项）' })
  await first.scrollIntoViewIfNeeded()

  for (const wait of [0, 150, 800]) {
    await clickCenter(page, first)
    await page.waitForTimeout(wait)
    await clickCenter(page, page.getByRole('option', { name: '3 环', exact: true }))
    await settle(page)
    check(`[${label}] 下拉打开后等 ${wait}ms 点选项，值变为「3 环」`, (await modelText(page)).includes('3 环 /'), await modelText(page))
    check(`[${label}] 选中后列表关闭且页面恢复可点击`, (await listCount(page)) === 0 && (await bodyPointerEvents(page)) === '')
    await clickCenter(page, first)
    await clickCenter(page, page.getByRole('option', { name: '戏法', exact: true }))
    await settle(page)
  }

  // 打开第一个下拉后，再点第二个下拉所在位置：任何时刻最多一个列表，且最终能恢复并选中
  await clickCenter(page, first)
  await settle(page)
  await clickCenter(page, second)
  await settle(page)
  check(`[${label}] 打开第一个后点第二个：最多只有一个列表`, (await listCount(page)) <= 1, `列表数 ${await listCount(page)}`)
  if ((await listCount(page)) > 0) await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] 上述操作后页面恢复可点击`, (await bodyPointerEvents(page)) === '')
  await clickCenter(page, second)
  await clickCenter(page, page.getByRole('option', { name: '金', exact: true }))
  await settle(page)
  check(`[${label}] 第二个下拉也能选中「金」`, (await modelText(page)).endsWith('/ 金'), await modelText(page))

  // 键盘：打开、移动、选择、Esc 关闭后焦点回到触发按钮
  await first.focus()
  await page.keyboard.press('Enter')
  await settle(page)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await settle(page)
  check(`[${label}] 键盘可打开并选择`, (await listCount(page)) === 0 && /下拉当前值：(?!未选)/.test(await modelText(page)), await modelText(page))
  await page.keyboard.press('Enter')
  await settle(page)
  await page.keyboard.press('Escape')
  await settle(page)
  check(`[${label}] Esc 关闭后焦点回到触发按钮`, await first.evaluate((el) => el === el.getRootNode().activeElement))
}

// 宿主 TauriTavern 使用 WebKit 内核，因此两种内核都要通过
const engines = [
  ['chrome', () => chromium.launch({ executablePath: chrome, headless: true })],
  ['webkit', () => webkit.launch({ headless: true })],
]
try {
  for (const [engine, launch] of engines) {
  const browser = await launch()
  for (const [viewLabel, width, height] of [['desktop', 1440, 900], ['narrow', 390, 780]]) {
    const label = `${engine}/${viewLabel}`
    const page = await browser.newPage({ viewport: { width, height } })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(url)
    await page.waitForSelector('#trpg-assistant-root', { state: 'attached' })
    check(`[${label}] 扩展挂载`, true)

    await page.locator('.trpg-ball').click()
    await page.waitForSelector('.trpg-window')
    check(`[${label}] 点击悬浮球打开窗口`, await page.locator('.trpg-window').isVisible())

    // 注释与注入：写入 → 模拟发送 → 判定
    await page.getByRole('button', { name: '写入测试注释到输入框' }).click()
    await page.getByRole('button', { name: '注入探针' }).click()
    await page.evaluate(() => window.__mockSend())
    const body = await page.locator('.trpg-window__body').innerText()
    check(`[${label}] 注释探针判定通过`, /注释原样进入了请求/.test(body))
    check(`[${label}] 注入探针判定通过`, /注入文本进入了请求/.test(body))
    check(`[${label}] 判定后探针注入已自动清除`, (await page.evaluate(() => window.__mockInjected())).every((v) => v === ''), JSON.stringify(await page.evaluate(() => window.__mockInjected())))
    await page.getByRole('button', { name: '运行输入框测试' }).click()
    check(`[${label}] 输入框读写通过`, /写入、读回、恢复都正常/.test(await page.locator('.trpg-window__body').innerText()))
    check(`[${label}] IndexedDB 探针运行`, /IndexedDB 第 \d+ 次启动读写正常/.test(await page.locator('.trpg-window__body').innerText()))

    // 隔离：宿主污染的勾选框样式不应影响面板内的勾选框
    const box = await page.locator('.trpg-check input').boundingBox()
    check(`[${label}] 样式隔离（勾选框 18×18）`, box && Math.round(box.width) === 18 && Math.round(box.height) === 18, JSON.stringify(box))

    // 下拉不被裁切：先把窗口拖到视口底部，再打开下拉
    const head = page.locator('.trpg-window__head')
    const hb = await head.boundingBox()
    await page.mouse.move(hb.x + 40, hb.y + 10)
    await page.mouse.down()
    await page.mouse.move(hb.x + 40, height - 40, { steps: 8 })
    await page.mouse.up()
    const win = await page.locator('.trpg-window').boundingBox()
    check(`[${label}] 窗口拖动后仍在屏幕内`, win.y >= 0 && win.y + win.height <= height + 1 && win.x >= 0, JSON.stringify(win))

    const trigger = page.getByRole('combobox', { name: '测试下拉（8 项）' })
    await trigger.scrollIntoViewIfNeeded()
    await trigger.click()
    await page.waitForSelector('.trpg-select-content')
    const list = await page.locator('.trpg-select-content').boundingBox()
    check(`[${label}] 下拉列表完整落在屏幕内`, list.x >= 0 && list.y >= 0 && list.x + list.width <= width + 1 && list.y + list.height <= height + 1, JSON.stringify(list))
    await page.keyboard.press('Escape')

    await selectTests(page, label)

    await page.screenshot({ path: join(root, `docs/reviews/M0-mock-${engine}-${viewLabel}.png`) })
    check(`[${label}] 页面无脚本错误`, errors.length === 0, errors.join(' | '))
    await page.close()
  }
  await browser.close()
  }
} finally {
  server.close()
}
if (failures.length) {
  console.error(`\n${failures.length} 项失败`)
  process.exit(1)
}
