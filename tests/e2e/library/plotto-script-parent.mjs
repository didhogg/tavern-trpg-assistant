import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
const page = await ctx.newPage()
const errors=[]
page.on('pageerror', e => errors.push(String(e.stack ?? e)))
page.on('console', m => { if (m.type()==='error') errors.push(m.text()) })
await page.goto('http://127.0.0.1:47343/parent.html')
await page.waitForSelector('#plotto-generator-fab', { timeout: 10000 })
console.log('fab-in-parent', await page.locator('#plotto-generator-fab').count())
await page.click('#plotto-generator-fab')
await page.waitForSelector('#plotto-generator-overlay:not([hidden])')
await page.fill('#plotto-a', '林默')
await page.fill('#plotto-b', '苏晚')
await page.click('#plotto-generate')
await page.waitForFunction(() => (document.querySelector('#plotto-output')?.value ?? '').length > 100)
const out = await page.evaluate(() => ({
  text: document.querySelector('#plotto-output').value,
  hasA: document.querySelector('#plotto-output').value.includes('林默'),
  hasB: document.querySelector('#plotto-output').value.includes('苏晚'),
  len: document.querySelector('#plotto-output').value.length,
}))
console.log(JSON.stringify({ out: { ...out, text: out.text.slice(0, 900) }, errors }, null, 1))
await browser.close()
