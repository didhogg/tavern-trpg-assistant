// P5.5 界面第 1 批（u7-1…u7-5）：我的库只有包、新建包、包弹窗、管理、加英文版、导出两个文件、导入预览（顶掉哪个包）。
// 真实构建的插件 + 已装中英官方数据的测试资料夹副本（端口必须 47318），断网。截图在 work/e2e-lib/p55-ui-shots/1/。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-ui-1.mjs
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures, settle } from '../helpers.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const [, type, options] = engines[0]
const { server, url } = await startStatic({ port: 47318 })
const shots = `${work}/p55-ui-shots/1`
await mkdir(shots, { recursive: true })
const profile = `${work}/profile-p55ui1-chrome`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-b2-8a-chrome`, profile, { recursive: true, filter: (p) => !p.includes('Singleton') })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 }, acceptDownloads: true })
const page = await ctx.newPage()
page.setDefaultTimeout(180000)
const errors = []
page.on('pageerror', (e) => errors.push(String(e.message ?? e).slice(0, 200)))
await page.route((u) => !u.href.startsWith(url), (r) => r.abort())
const P = `(() => { const h = document.querySelector('#trpg-assistant-root'); return [...h.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean).config.globalProperties.$pinia })()`
await page.goto(url)
await page.waitForFunction(`!!(${P})._s.get('app')?.booted`)
await page.locator('.trpg-ball').click()
await settle(page, 600)
await page.locator('.trpg-window').getByRole('button', { name: '库', exact: true }).first().click()
await page.waitForSelector('[data-testid="shelf-tab"]')
await page.locator('.lib-top .trpg-seg button', { hasText: '我的库' }).click()
await page.waitForSelector('[data-testid="mylib-tab"]')
await page.waitForFunction(`(${P})._s.get('library').pairs !== null`)
await settle(page, 500)
await page.screenshot({ path: `${shots}/1-mylib.png` })
const closeAll = () => page.evaluate((P) => eval(P)._s.get('modal').close(true), P)

// u7-2 新建包：编号撞了已有的书 → 当场报错，不建
await page.getByTestId('mylib-newpack').click()
await page.waitForSelector('[data-testid="newpack-page"]')
await page.getByTestId('newpack-name').fill('海盗战役')
const suggested = await page.getByTestId('newpack-json').inputValue()
await page.getByTestId('newpack-json').fill('PHB')
await page.getByTestId('newpack-create').click()
await page.waitForSelector('[data-testid="newpack-err"]')
await page.screenshot({ path: `${shots}/2-newpack-taken.png` })
const err = await page.getByTestId('newpack-err').innerText()
check('新建包：编号按名字给建议；撞了已有的书当场报错', /^[A-Z0-9]+$/.test(suggested) && /PHB/.test(err), JSON.stringify({ suggested, err }))
await page.getByTestId('newpack-json').fill('PIRATE')
await page.getByTestId('newpack-create').click()
await page.waitForSelector('[data-testid="pack-page"]')
await settle(page, 600)
await page.screenshot({ path: `${shots}/3-pack-opened.png` })
const headTitle = await page.locator('.trpg-modal__title').first().innerText()
check('建好直接打开这个包', /海盗战役/.test(headTitle), headTitle)

// u7-4 管理：名字（编号锁住）、规则与版本
await page.locator('.trpg-modal__head .trpg-more').click()
await page.locator('.trpg-dropdown__item', { hasText: '管理' }).click()
await page.waitForSelector('[data-testid="mypack-manage"]')
await settle(page, 400)
await page.screenshot({ path: `${shots}/4-manage-name.png` })
await page.locator('[data-testid="mypack-name"] input').first().fill('海盗战役（改）')
await page.locator('[data-testid="mypack-name"] button[type="submit"]').click()
await page.waitForFunction(`(${P})._s.get('library').pairs?.some((p) => p.zh?.own.full === '海盗战役（改）')`)
await page.locator('[data-testid="mypack-manage"] .trpg-seg button', { hasText: '规则与版本' }).click()
await page.waitForSelector('[data-testid="mypack-rule"]')
await settle(page, 300)
await page.screenshot({ path: `${shots}/5-manage-rule.png` })
const ruleText = await page.getByTestId('mypack-rule').innerText()
check('管理：改名生效；规则与版本默认当前战役的规则', /5e/.test(ruleText), ruleText.replace(/\n/g, ' | '))
await closeAll(); await settle(page, 400)

// 加英文版 → 一行带「中」「En」
const row = page.locator('[data-testid="mylib-row"]', { hasText: '海盗战役（改）' }).first()
await row.locator('.trpg-more').click()
await page.locator('.trpg-dropdown__item', { hasText: '加英文版' }).click()
await page.waitForFunction(`(${P})._s.get('library').pairs?.some((p) => p.id === 'pirate' && p.zh && p.en)`)
await settle(page, 400)
const rowText = await row.innerText()
await page.screenshot({ path: `${shots}/6-mylib-pair.png` })
check('加英文版：同一行带「中」「En」', /中/.test(rowText) && /En/.test(rowText), rowText.replace(/\n/g, ' | '))

// 导出：中英两个文件
const downloads = []
page.on('download', (d) => downloads.push(d.suggestedFilename()))
await row.getByTestId('mylib-export').click()
await page.waitForTimeout(2000)
check('导出双语包：两个文件', downloads.length === 2, JSON.stringify(downloads))

// u7-5 导入预览：同编号 → 写明会顶掉已有的包；取消不导入
const fixture = `${work}/p55-ui-import.json`
await writeFile(fixture, JSON.stringify({ _meta: { sources: [{ json: 'PIRATE', full: '海盗战役', abbreviation: 'P', authors: [], version: '1' }], dateAdded: 0, dateLastModified: 0 }, spell: [{ name: '火焰鹦鹉', ENG_name: 'Fire Parrot', source: 'PIRATE', level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'feet', amount: 150 } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['羽毛。'] }] }))
await page.getByTestId('mylib-file').setInputFiles(fixture)
await page.waitForSelector('[data-testid="import-preview"]')
await settle(page, 500)
await page.screenshot({ path: `${shots}/7-import-replace.png` })
const pre = await page.getByTestId('import-preview').innerText()
check('导入预览：认出中文文件，写明会顶掉已有的包，主按钮写后果', /中文/.test(pre) && /顶掉/.test(pre) && /确认导入（顶掉 1 个包）/.test(pre), pre.replace(/\n/g, ' | ').slice(0, 300))
await page.locator('[data-testid="import-preview"] .trpg-btn', { hasText: '取消' }).click()
await settle(page, 400)

// 窄屏
await page.setViewportSize({ width: 390, height: 800 })
await settle(page, 800)
await page.screenshot({ path: `${shots}/8-mylib-narrow.png` })
await page.getByTestId('mylib-newpack').click()
await page.waitForSelector('[data-testid="newpack-page"]')
await settle(page, 400)
await page.screenshot({ path: `${shots}/9-newpack-narrow.png` })
await closeAll()

const real = errors.filter((m) => !/网络错误|Network error|gendata-nav-adventure-book-index/.test(m))
check('页面没有未处理的错误（断网预期的除外）', real.length === 0, real.slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
