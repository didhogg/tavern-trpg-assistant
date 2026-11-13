// P5.5 第 5 步：六类中文表单字段名 / 提示，以及 English 栏不被中文标签污染。
// 用法：SKIP_BUILD=1 node tests/e2e/library/p55-r5-labels.mjs（截图 work/e2e-lib/p55-ui-shots/r5-labels/）
import { check, failures, settle } from '../helpers.mjs'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, closeAll, realErrors } = await openLibrary('r5-labels', { width: 900, height: 760 })
page.setDefaultTimeout(60000)
await page.evaluate(async (P) => {
  const lib = eval(P)._s.get('app').svc().backend.library
  await lib.custom.createPack('cn', { json: 'R5LABEL', full: '字段翻译验证包', abbreviation: 'R5L' }, { rule: 'dnd5e2014' })
}, P)
await tab('我的库')
await page.locator('[data-testid="mylib-open"]', { hasText: '字段翻译验证包' }).first().click()
await page.waitForSelector('[data-testid="pack-page"]')

const types = await page.evaluate(async (P) => {
  const c = eval(P)._s.get('app').svc().backend.library.custom
  return Object.fromEntries((await c.entryTypes('cn')).map((x) => [x.prop, x.name]))
}, P)
const wanted = ['monster', 'spell', 'item', 'race', 'class', 'background']
const converted = await page.evaluate(async (P) => {
  const lib = eval(P)._s.get('app').svc().backend.library
  return (await lib.service.frameOf('cn')).call('valueLabels', [['walk', 'burrow', 'fly']])
}, P)
check('作者 Parser 转换函数补上 C10 没有的值名', converted?.[0]?.walk === '步行' && converted?.[0]?.burrow === '掘穴' && converted?.[0]?.fly === '飞行', JSON.stringify(converted))
for (const prop of wanted) {
  await page.getByTestId('pack-new-entry').click()
  await page.waitForSelector('[data-testid="type-common"]')
  const typeName = new RegExp(`^${String(types[prop]).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
  await page.locator('[data-testid="type-common"], [data-testid="type-item"]').filter({ hasText: typeName }).first().click()
  await page.waitForSelector('[data-testid="new-start"]')
  await page.getByTestId('start-next').click()
  await page.waitForSelector('.trpg-modal__page:not(.is-under) [data-testid="editor"] [data-testid="entry-form"]')
  await settle(page, 900)
  await page.screenshot({ path: `${shots}/${prop}.png`, animations: 'disabled' })
  const main = page.getByTestId('editor-main')
  const labels = await main.locator('.lib-tfield > label').allInnerTexts()
  const obviousEnglish = /^(Skills|Armor Class|Hit Points|formula|fly|unit|faces|anyStandard|from)$/
  const badLabels = labels.filter((x) => obviousEnglish.test(x.trim()))
  check(`${prop} 中文表单没有把常用字段留成英文`, labels.length > 0 && badLabels.length === 0, badLabels.length ? badLabels.join(' | ') : labels.slice(0, 20).join(' | '))
  if (prop === 'monster') {
    const tip = await main.locator('[data-field="senseTags"] .lib-tip').getAttribute('title').catch(() => null)
    check('monster 感官标签有提示', !!tip && /筛选/.test(tip), tip ?? '')
    check('monster AC 保持缩写', labels.some((x) => x.trim() === 'AC'))
  }
  if (prop === 'spell') {
    check('spell 中文表单仍有环节 / 学派', labels.some((x) => /环节/.test(x)) && labels.some((x) => /学派/.test(x)), labels.slice(0, 12).join(' | '))
    const english = await page.getByTestId('editor-side').locator('.lib-tfield > label').allInnerTexts()
    check('English 栏仍显示原字段名', english.some((x) => /level/.test(x)) && !english.some((x) => /环节/.test(x)), english.slice(0, 12).join(' | '))
  }
  if (prop === 'class') {
    const tip = await main.locator('[data-field="classTableGroups"] .lib-tip').first().getAttribute('title').catch(() => null)
    check('class 职业表格相关字段有提示', !!tip && /表格组|每一格只填写数字/.test(tip), tip ?? '')
  }
  await closeAll()
  await settle(page, 300)
  // 包详情本身在库弹窗里；关闭新建表单会一并关掉包详情，下一类重新打开同一个包。
  await tab('我的库')
  await page.locator('[data-testid="mylib-open"]', { hasText: '字段翻译验证包' }).first().click()
  await page.waitForSelector('[data-testid="pack-page"]')
}
check('页面没有未处理的错误（断网预期的除外）', realErrors().length === 0, realErrors().slice(0, 2).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
