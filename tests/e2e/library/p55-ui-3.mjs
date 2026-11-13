// P5.5 界面第 3 批（u7-7 … u7-9）：包里 [新建条目] → 选类型 → 选起点（简易 / 详细 / 从已有的 / 文字转条目 / 粘贴 JSON）。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-ui-3.mjs（截图 work/e2e-lib/p55-ui-shots/3/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, realErrors } = await openLibrary('3')
await page.evaluate(async (P) => { const lib = eval(P)._s.get('app').svc().backend.library; await lib.custom.createPack('cn', { json: 'PIRATE', full: '海盗战役', abbreviation: 'PIR' }, { rule: 'dnd5e2014' }) }, P)
await tab('我的库')
await page.locator('[data-testid="mylib-open"]', { hasText: '海盗战役' }).first().click()
await page.waitForSelector('[data-testid="pack-page"]')
const pop = () => page.evaluate((P) => eval(P)._s.get('modal').pop(), P)
const top = (testid) => page.locator(`.trpg-modal__page:not(.is-under) [data-testid="${testid}"]`)
const popTo = async (testid) => { for (let i = 0; i < 8 && !(await top(testid).count()); i++) { await pop(); await settle(page, 350) } }
// 代码编辑框只画看得见的几行：直接取交给编辑页的那一条
const startText = () => page.evaluate((P) => JSON.stringify(eval(P)._s.get('modal').top.props.session.ent), P)

// ① 选类型
await page.getByTestId('pack-new-entry').click()
await page.waitForSelector('[data-testid="type-item"]')
await settle(page, 400)
await page.screenshot({ path: `${shots}/1-type.png` })
const common = await page.getByTestId('type-common').allInnerTexts()
const groupCount = await page.locator('.lib-tgroup').count()
check('选类型：常用（作者有模板或转换器）+ 按作者的页分组', common.includes('法术') && groupCount >= 5, JSON.stringify({ common, groupCount }))

// ② 选起点（法术五种都有）
await page.getByTestId('type-common').filter({ hasText: /^法术$/ }).first().click()
await page.waitForSelector('[data-testid="new-start"]')
await settle(page, 300)
await page.screenshot({ path: `${shots}/2-start-spell.png` })
const opts = await page.getByTestId('start-option').allInnerTexts()
check('法术的起点：简易 / 详细 / 从已有的 / 文字转条目 / 粘贴 JSON', opts.length === 5 && /简易表单/.test(opts[0]) && /详细表单/.test(opts[1]), opts.map((x) => x.split('\n')[0]).join(' | '))

// 简易表单 → 进编辑（本批先进 JSON 页）：只有必填项、没有来源
await page.getByTestId('start-next').click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="json-box"]')
const blank = JSON.parse(await startText())
check('简易表单：按作者结构定义只放必填项，不带来源', 'name' in blank && !('source' in blank), Object.keys(blank).join(','))
await popTo('new-start')

// 详细表单：先看作者模板的样子
await page.getByTestId('start-option').nth(1).click()
await page.getByTestId('start-next').click()
await page.waitForSelector('[data-testid="start-template"] [data-testid="embedded-author"]')
await settle(page, 300)
await page.screenshot({ path: `${shots}/3-template.png` })
await page.getByTestId('template-go').click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="json-box"]')
const tpl = JSON.parse(await startText())
check('详细表单：作者模板预填（字段比简易表单多），不带来源', Object.keys(tpl).length > Object.keys(blank).length && !('source' in tpl), Object.keys(tpl).length + ' 项')
await popTo('new-start')

// 从已有的开始：只列法术 → 搜火球 → 预览 → 复制它开始改
await page.getByTestId('start-option').nth(2).click()
await page.getByTestId('start-next').click()
await page.waitForSelector('[data-testid="pick-row"]')
await page.locator('[data-testid="start-existing"] input[type="search"]').fill('火球')
await settle(page, 400)
await page.screenshot({ path: `${shots}/4-existing.png` })
await page.getByTestId('pick-row').first().click()
await page.waitForSelector('[data-testid="pick-preview"] [data-testid="embedded-author"]')
await settle(page, 300)
await page.screenshot({ path: `${shots}/5-existing-preview.png` })
await page.getByTestId('pick-go').click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="json-box"]')
const copied = JSON.parse(await startText())
check('从已有的开始：复制那一条（名字、环节都在），来源去掉（存时按包写）', /火球/.test(copied.name) && copied.level === 3 && !('source' in copied), JSON.stringify({ name: copied.name, level: copied.level, source: copied.source ?? null }))
await popTo('new-start')

// 文字转条目：填入作者示例 → 转换 → 作者渲染 → 进编辑
await page.getByTestId('start-option').nth(3).click()
await page.getByTestId('start-next').click()
await page.waitForSelector('[data-testid="start-convert"]')
await page.getByTestId('convert-sample').click()
await settle(page, 600)
await page.getByTestId('convert-run').click()
await page.waitForSelector('[data-testid="start-convert"] [data-testid="embedded-author"]', { timeout: 120000 })
await settle(page, 400)
await page.screenshot({ path: `${shots}/6-convert.png` })
await page.getByTestId('convert-go').click()
await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="json-box"]')
const conv = JSON.parse(await startText())
check('文字转条目：作者示例转成一条法术，进编辑', typeof conv.name === 'string' && conv.name.length > 0 && 'level' in conv, JSON.stringify({ name: conv.name, level: conv.level }))
await popTo('new-start')

// 粘贴 JSON：写错 → [检查] 标出行号
await page.getByTestId('start-option').nth(4).click()
await page.getByTestId('start-next').click()
await page.waitForSelector('[data-testid="start-json"] .cm-content')
await page.locator('[data-testid="start-json"] .cm-content').click()
await page.keyboard.press('ControlOrMeta+a')
await page.keyboard.type('{\n"name": "测试",\n"level": 12\n')
await page.getByTestId('json-check').click()
await page.waitForSelector('[data-testid="json-issues"]')
await settle(page, 300)
await page.screenshot({ path: `${shots}/7-json-error.png` })
const issues = await page.getByTestId('json-issues').innerText()
check('粘贴 JSON：写错时 [检查] 标出第几行', /第 \d+ 行/.test(issues), issues.replace(/\n/g, ' | ').slice(0, 200))
await popTo('new-type')

// 神祇：作者没有模板和转换器 → 起点更少
await page.locator('[data-testid="new-type"] input[type="search"]').fill('神祇')
await settle(page, 300)
await page.getByTestId('type-item').first().click()
await page.waitForSelector('[data-testid="new-start"]')
const deity = await page.getByTestId('start-option').allInnerTexts()
await page.screenshot({ path: `${shots}/8-start-deity.png` })
check('没有作者模板 / 转换器的类型：起点只列有的几种', deity.length < 5 && !deity.some((x) => /详细表单/.test(x)), deity.map((x) => x.split('\n')[0]).join(' | '))

// 窄屏
await page.setViewportSize({ width: 390, height: 800 })
await popTo('new-type')
await settle(page, 600)
await page.screenshot({ path: `${shots}/9-type-narrow.png` })

check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
