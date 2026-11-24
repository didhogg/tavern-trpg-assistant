import { engines } from '../../tests/e2e/library/chain-common.mjs'
const [, chromium, opts] = engines[0]
const b = await chromium.launch(opts)
const p = await b.newPage({ viewport: { width: 1400, height: 900 } })
const errs = []
p.on('pageerror', (e) => errs.push(String(e.message).slice(0, 300)))
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)) })
await p.goto(process.argv[2] ?? 'http://localhost:47400/')
for (let i = 0; i < 90; i++) { const t = await p.locator('#status').evaluate((e) => e.hidden ? '' : e.textContent); if (!t || /出错/.test(t)) { console.log('status:', t); break } await p.waitForTimeout(1000) }
await p.waitForTimeout(2500)
await p.screenshot({ path: process.argv[3] ?? '/tmp/x.png' })
console.log(errs.slice(0, 15).join('\n'))
await b.close()
