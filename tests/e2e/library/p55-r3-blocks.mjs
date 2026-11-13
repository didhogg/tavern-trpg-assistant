// P5.5 §16.10 第 3 步：真实作者字段表 + 编辑器保存路径。ENGINE=webkit 切换浏览器。
import assert from 'node:assert/strict'
import { openLibrary, P } from './p55-ui-common.mjs'

const { ctx, page, server, shots, tab, closeAll, svc, realErrors } = await openLibrary('r3', { width: 900, height: 760 })
page.setDefaultTimeout(35_000)
const main = page.getByTestId('editor-main')
const field = (name) => main.locator(`[data-field="${name}"]`)
const valid = (prop, entry) => svc((s, [prop, entry]) => s.backend.library.custom.validateEntry('cn', prop, entry), [prop, entry])
const previewData = async () => {
  await page.getByTestId('editor-done').click()
  await page.getByTestId('save-page').waitFor()
  return page.evaluate((P) => eval(P)._s.get('modal').top.props.ctx.main.after, P)
}
const newEntry = async (name) => {
  await closeAll()
  await page.getByTestId('mylib-open').filter({ hasText: '表单验证包' }).click()
  await page.getByTestId('pack-new-entry').click()
  await page.getByTestId('type-item').filter({ hasText: new RegExp(`^${name}$`) }).first().click()
  await page.getByTestId('start-next').click()
  await field('name').locator('input').fill(`测试${name}`)
}
try {
  await svc((s) => s.backend.library.custom.createPack('cn', { json: 'P55GRID', full: '表单验证包', abbreviation: 'GRID' }, { rule: 'dnd5e2014' }))
  await tab('我的库')
  await newEntry('表格')
  const grid = field('rows').getByTestId('edit-grid')
  await grid.getByRole('textbox', { name: '第 1 列标题' }).fill('事件')
  await grid.getByRole('textbox', { name: '第 1 行第 1 格' }).fill('遇见行商')
  await grid.getByRole('button', { name: '列', exact: true }).click()
  await grid.getByRole('textbox', { name: '第 2 列标题' }).fill('地点')
  await grid.getByRole('textbox', { name: '第 1 行第 2 格' }).fill('码头')
  await grid.getByRole('button', { name: '行', exact: true }).click()
  await grid.getByRole('textbox', { name: '第 2 行第 1 格' }).fill('下雨')
  assert.equal(await field('tables').count(), 0)
  await page.screenshot({ path: `${shots}/single.png` })
  const single = await previewData()
  assert.deepEqual(single.rows, [['遇见行商', '码头'], ['下雨', '']])
  assert.deepEqual(single.colLabels, ['事件', '地点'])
  assert.deepEqual(await valid('table', single), [])
  await page.getByTestId('save-go').click()
  await page.locator('.trpg-toast', { hasText: '已保存「测试表格」' }).waitFor()
  await page.getByTestId('mine-edit').first().click()
  assert.equal(await grid.getByRole('textbox', { name: '第 1 行第 2 格' }).inputValue(), '码头')
  await main.getByRole('button', { name: '表格组', exact: true }).click()
  await page.getByTestId('confirm-page').getByRole('button', { name: '取消', exact: true }).click()
  assert.equal(await grid.getByRole('textbox', { name: '第 1 行第 2 格' }).inputValue(), '码头')

  await newEntry('表格')
  await main.getByRole('button', { name: '表格组', exact: true }).click()
  assert.equal(await field('rows').count(), 0)
  const groupGrid = field('tables').getByTestId('edit-grid').first()
  await groupGrid.getByRole('textbox', { name: '第 1 行第 1 格' }).fill('组中的格子')
  const group = await previewData()
  assert.equal(group.type, 'tableGroup')
  assert.deepEqual(group.tables[0].rows, [['组中的格子']])
  assert.deepEqual(await valid('table', group), [])

  await svc(async (s) => {
    const lib = s.backend.library
    await lib.custom.saveEntry('cn', 'table', {
    name: '带特殊格子的表', type: 'table',
    colLabelRows: [[{ type: 'cellHeader', entry: '结果', width: 2 }], ['骰点', '物品']],
    rows: [{ type: 'row', style: 'row-indent-first', row: [{ type: 'cell', roll: { min: 1, max: 3, pad: true } }, '药水'] }],
    }, { pack: 'p55grid' })
    await lib.brewQueue.settled()
  })
  await closeAll()
  await page.getByTestId('mylib-open').filter({ hasText: '表单验证包' }).click()
  await page.locator('.lib-list__row').filter({ hasText: '带特殊格子的表' }).getByTestId('mine-edit').click()
  await grid.getByRole('textbox', { name: '表头第 1 行，第 1 列标题' }).fill('发生什么')
  await grid.getByRole('textbox', { name: '第 1 行第 2 格' }).fill('两瓶药水')
  await page.screenshot({ path: `${shots}/structured.png` })
  const structured = await previewData()
  assert.deepEqual(structured.colLabelRows, [[{ type: 'cellHeader', entry: '发生什么', width: 2 }], ['骰点', '物品']])
  assert.deepEqual(structured.rows, [{ type: 'row', style: 'row-indent-first', row: [{ type: 'cell', roll: { min: 1, max: 3, pad: true } }, '两瓶药水'] }])

  await newEntry('职业')
  if (!await field('classTableGroups').count()) await main.getByTestId('form-more').click()
  const groups = field('classTableGroups')
  const classGrid = groups.getByTestId('edit-grid').first()
  await classGrid.getByRole('textbox', { name: '第 1 列标题' }).fill('一环')
  await classGrid.getByRole('textbox', { name: '第 1 行第 1 格' }).fill('一个职业值')
  const menu = groups.getByRole('button', { name: /换一种写法/ }).first()
  await menu.click()
  await page.getByRole('menuitem', { name: /rowsSpellProgression/ }).click()
  assert.equal(await page.evaluate(() => document.body.style.pointerEvents), '')
  await groups.getByRole('spinbutton', { name: '第 1 行第 1 格' }).fill('2')
  await page.screenshot({ path: `${shots}/class.png` })
  const klass = await previewData()
  assert.deepEqual(klass.classTableGroups[0].rowsSpellProgression, [[2]])
  assert.deepEqual(klass.classTableGroups[0].colLabels, ['一环'])

  assert.deepEqual(realErrors(), [])
  console.log('PASS 单表保存重开、表格组、职业进度表')
} finally {
  await ctx.close()
  server.close()
}
