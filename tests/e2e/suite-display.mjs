// S1：详情页显示——抽样渲染扫描（界面层）、随机表单元格里的引用、卓尔装备系列与家族成员表、背景描述、未装目标的可选授予与安装确认。
import { check, clearToasts, gotoPage, modalCount, settle } from './helpers.mjs'

const RAW_ID = /\b(?:feature|spell|item|monster|class|subclass|race|subrace|background|feat|rule|table|condition|disease|status|deity|language|reward|cult|hazard|object|vehicle|book|lore|monsterpart)\.[a-z0-9][a-z0-9-]*\.[a-z0-9]+(?:-\d+)?\b/

/** 一批会暴露显示问题的条目：随机表里带引用的单元格、职业的可选授予、怪物制作部件占位符、背景描述、家族…… */
const SAMPLES = [
  ['dnd5e2014-srd', '邪魔宗主·邪魔宗主扩展法术'], ['dnd5e2014-phb', '光明领域·光明领域法术'], ['dnd5e2014-phb', '狂野魔法浪涌'], ['dnd5e2014-srd', '结社法术·海岸'],
  ['dnd5e2014-srd', '德鲁伊'], ['dnd5e2014-srd', '底栖魔鱼'], ['dnd5e2014-srd', '火球术'], ['dnd5e2014-srd', '吸血鬼'], ['dnd5e2014-srd', '长剑 +1'],
  ['dnd5e2014-mm', '卓尔装备·匕首 +1'], ['dnd5e2014-mm', '卓尔装备（系列）'], ['dnd5e2014-mm', '酸液喷射（掘地虫）'], ['dnd5e2014-srd', '龙鳞甲（系列）'], ['dnd5e2014-dmg', '宝藏堆·挑战等级 0-4'],
]

async function closeModals(page) {
  for (const id of ['entry-detail', 'pack-detail']) {
    for (let i = 0; i < 8 && (await page.getByTestId(id).count()) && (await page.getByTestId(id).last().isVisible()); i++) { await page.keyboard.press('Escape'); await settle(page, 250) }
  }
}

/** 库 › 扩展 › 某个包 › 搜索 › 点这一条（虚拟列表：一屏屏往下找），返回 true 表示打开了详情。 */
async function openEntry(page, pack, name) {
  await closeModals(page)
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId(`ext-${pack}`).locator('.trpg-term').click()
  await page.getByTestId('pack-detail').waitFor()
  await page.getByRole('searchbox', { name: '搜索条目' }).fill(name)
  await settle(page, 400)
  const rows = page.locator('.trpg-vlist__row .trpg-term')
  let hit = -1
  for (let n = 0; n < 40 && hit < 0; n++) {
    const count = await rows.count()
    for (let i = 0; i < count; i++) if ((await rows.nth(i).innerText()).trim() === name) { hit = i; break }
    if (hit >= 0 || !(await page.locator('.trpg-vlist').count())) break
    const moved = await page.locator('.trpg-vlist').evaluate((el) => { const before = el.scrollTop; el.scrollTop += el.clientHeight - 40; return el.scrollTop !== before })
    if (!moved) break
    await settle(page, 200)
  }
  if (hit < 0) return false
  await rows.nth(hit).click()
  await page.getByTestId('entry-detail').waitFor()
  await settle(page, 500)
  return true
}

const detailText = (page) => page.getByTestId('entry-detail').last().innerText()

export async function displaySuite(page, label) {
  // ① 抽样渲染扫描：详情页的文字里没有 {{ }}、<$ $>、裸编号
  const bad = []
  for (const [pack, name] of SAMPLES) {
    if (!(await openEntry(page, pack, name))) { bad.push(`${name}（找不到）`); continue }
    const text = await detailText(page)
    if (/\{\{|\}\}|<\$|\$>/.test(text) || RAW_ID.test(text)) bad.push(`${name}：${(text.match(/\{\{[^}]*\}\}|<\$[^$]*\$>|[a-z]+\.[a-z0-9-]+\.[a-z0-9]+/) ?? [''])[0]}`)
  }
  check(`[${label}] 抽样渲染扫描：${SAMPLES.length} 个条目详情页都没有裸标记、裸编号`, bad.length === 0, bad.join('；'))

  // ② 随机表单元格里的引用可点
  await openEntry(page, 'dnd5e2014-srd', '邪魔宗主·邪魔宗主扩展法术')
  const burning = page.getByTestId('entry-detail').last().locator('td .trpg-term', { hasText: '燃烧之手' })
  check(`[${label}] 随机表：单元格里的「燃烧之手」是可点术语`, (await burning.count()) >= 1)
  if (await burning.count()) {
    await burning.first().click()
    await settle(page, 600)
    check(`[${label}] 点单元格里的法术：同一个弹窗换到法术详情`, (await modalCount(page)) === 1 && (await detailText(page)).includes('燃烧之手'))
  }

  // ③ 卓尔装备：系列标注、家族页成员表
  await openEntry(page, 'dnd5e2014-mm', '卓尔装备·匕首 +1')
  const series = page.getByTestId('entry-detail').last().locator('.trpg-facts__value .trpg-term', { hasText: /^卓尔装备$/ })
  const itemText = await detailText(page)
  check(`[${label}] 卓尔物品详情页：有「系列：卓尔装备」与「基础物品」`, (await series.count()) === 1 && itemText.includes('系列') && itemText.includes('基础物品') && itemText.includes('匕首') && itemText.includes('Drow Equipment: Dagger +1'))
  if (await series.count()) {
    await series.first().click()
    await settle(page, 700)
    const rows = await page.locator('.trpg-facts__member-row').count()
    const familyText = await detailText(page)
    check(`[${label}] 家族页：按「武器」「护甲」分组的成员表（每种基础物品一行，后面是 +1 +2 +3）`, rows > 20 && familyText.includes('武器') && familyText.includes('护甲') && familyText.includes('匕首') && !familyText.includes('{{'), `${rows} 行`)
  }

  // ④ 背景描述
  await openEntry(page, 'dnd5e2014-srd', '底栖魔鱼')
  const loreText = await detailText(page)
  check(`[${label}] 背景描述：SRD 底栖魔鱼有「背景描述」一节，注明出自《怪物图鉴》`, (await page.getByTestId('entry-lore').count()) === 1 && loreText.includes('背景描述') && /背景描述出自《怪物图鉴/.test(loreText))

  // ⑤ 塔莎没装时：职业里的可选特性显示名字与「需要《塔莎的万事坩埚》」，点它出现安装确认
  await closeModals(page)
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId('ext-dnd5e2014-tce').locator('.trpg-term').click()
  await page.getByTestId('pack-detail').waitFor()
  await page.locator('.trpg-modal__head').getByRole('button', { name: /的更多操作/ }).click()
  await page.getByRole('menuitem', { name: '卸载' }).click()
  await settle(page)
  await page.getByRole('button', { name: '卸载', exact: true }).last().click()
  await page.getByText('已卸载「塔莎的万事坩埚」').waitFor()
  await settle(page, 400)
  await clearToasts(page)
  await openEntry(page, 'dnd5e2014-srd', '德鲁伊')
  const druid = await detailText(page)
  const optional = page.getByTestId('entry-detail').last().locator('.trpg-term', { hasText: '荒野伙伴（可选 · 需要《塔莎的万事坩埚》）' })
  check(`[${label}] 塔莎未装：德鲁伊的特性里有「荒野伙伴（可选 · 需要《塔莎的万事坩埚》）」，没有编号`, (await optional.count()) === 1 && !/feature\./.test(druid))
  if (await optional.count()) {
    await optional.first().click()
    await page.getByText('要现在安装吗').waitFor({ timeout: 10000 })
    check(`[${label}] 点未安装的特性：出现「这个条目在《塔莎的万事坩埚》里，要现在安装吗？」`, (await page.locator('.trpg-modal, [role=dialog]').allInnerTexts()).join('').includes('塔莎的万事坩埚'))
    await page.getByRole('button', { name: '取消' }).click()
    await settle(page, 300)
  }
  // 装回塔莎，不影响后面的步骤
  await closeModals(page)
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await clearToasts(page)
  await page.getByTestId('ext-dnd5e2014-tce').getByRole('button', { name: /安装/ }).click()
  await page.getByText('已安装「塔莎的万事坩埚」').waitFor({ timeout: 60000 })
  await settle(page, 400)
  await closeModals(page)
}
