import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push(String(e.stack ?? e)))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto('file:///Users/xxx/Downloads/Plotto/%E9%85%92%E9%A6%86%E5%8A%A9%E6%89%8B%E8%84%9A%E6%9C%AC/test.html')
await page.waitForSelector('#plotto-generator-fab', { timeout: 10000 })
await page.click('#plotto-generator-fab')
await page.waitForSelector('#plotto-generator-overlay:not([hidden])')
await page.fill('#plotto-a', '林默')
await page.fill('#plotto-b', '苏晚')
await page.click('#plotto-generate')
await page.waitForFunction(() => (document.querySelector('#plotto-output')?.value ?? '').length > 100, null, { timeout: 10000 })
const out = await page.evaluate(() => ({
  text: document.querySelector('#plotto-output').value,
  hasA: document.querySelector('#plotto-output').value.includes('林默'),
  hasB: document.querySelector('#plotto-output').value.includes('苏晚'),
  len: document.querySelector('#plotto-output').value.length,
  status: document.querySelector('#plotto-status').textContent,
}))
await page.click('#plotto-copy')
await page.waitForTimeout(200)
let clip = ''
try { clip = await page.evaluate(() => navigator.clipboard.readText()) } catch (e) { clip = 'CLIP_ERR: ' + e.message }
console.log(JSON.stringify({ out: { ...out, text: out.text.slice(0, 1200) }, clip: clip.slice(0, 100), errors }, null, 1))
await browser.close()
