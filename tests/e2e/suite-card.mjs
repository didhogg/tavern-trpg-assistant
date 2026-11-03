// U5 UNIT2：人物卡概览带。真实构建产物 + Chrome/WebKit。
import { check, clearToasts, gotoPage, modalCount, settle } from './helpers.mjs'
import { callStore } from './store.mjs'
import { fileURLToPath } from 'node:url'

const CARD_NAME = '卡牌测试'
const picture = fileURLToPath(new URL('../../docs/img/盖尔的奇幻角色界面（仅作为风格参考）.png', import.meta.url))

const prepared = () => ({
  id: `p-card-${Date.now()}`,
  name: CARD_NAME,
  nameEn: 'Card Test',
  categoryId: 'party',
  tags: [],
  pinned: false,
  hp: { current: 12, temp: 3, deathSaves: { success: 1, fail: 0 } },
  effects: [{ name: '祝福' }],
  block: {
    src: { book: '自制', page: 0 }, credit: { by: '本项目', license: 'CC-BY-NC-SA-4.0' },
    size: ['M'], creatureType: { type: 'humanoid', tags: [] }, ac: [{ value: 10 }], hp: { average: 0 }, speed: { walk: 30 },
    abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 12, cha: 10 },
    senses: [], languages: [], resist: [], immune: [], vulnerable: [], conditionImmune: [],
    traits: [], actions: [], bonusActions: [], reactions: [], spellcasting: [],
    classes: [{ class: 'class.wizard.phb', level: 3 }], race: 'race.human.phb',
  },
  giveAi: 'auto', createdAt: Date.now(), touchedAt: Date.now(),
})

export async function cardSuite(page, label) {
  await gotoPage(page, '人物')
  await page.getByTestId('people-page').waitFor()

  // 新建：名字在身份抽屉里改；保存前是草稿
  await page.getByTestId('people-new').click()
  await page.getByTestId('person-card').waitFor()
  check(`[${label}] 新建人物卡默认不在生命编辑态`, (await page.getByTestId('person-card-hp-done').count()) === 0)
  check(`[${label}] 新建人物卡默认是草稿`, (await page.getByTestId('person-card-status').innerText()).includes('未保存'))
  await page.getByText(/带小骰子的数字点一下去骰盘/).waitFor({ timeout: 3000 })
  check(`[${label}] 第一次打开人物卡出现一次操作提示`, true)
  await clearToasts(page)
  await page.getByTestId('person-card-name-open').click()
  await page.getByTestId('identity-drawer').waitFor()
  check(`[${label}] 身份抽屉只有一个模态`, (await modalCount(page)) === 1)
  await page.getByTestId('identity-name').fill('临时名字')
  await page.getByTestId('identity-name').press('Enter')
  await page.locator('.trpg-modal__close').click()
  await page.getByTestId('person-card-back').click()
  await page.getByTestId('people-page').waitFor()
  check(`[${label}] 不保存返回后新建人物不在列表`, (await page.locator('[data-testid^="people-row-"]').filter({ hasText: '临时名字' }).count()) === 0)

  // 准备好带职业/种族的真实可派生人物
  await callStore(page, 'people', (s, p) => s.create(p), prepared())
  await settle(page, 300)
  await page.locator('[data-testid^="people-row-"]').filter({ hasText: CARD_NAME }).first().click()
  await page.getByTestId('person-card').waitFor()
  await page.getByTestId('person-card-abilities').waitFor()
  check(`[${label}] 概览带显示名字、身份与生命`, (await page.getByTestId('person-card-name-open').innerText()).includes(CARD_NAME) && (await page.getByTestId('person-card-identity').innerText()).includes('法师 3 级') && (await page.getByTestId('person-card-vitals').innerText()).includes('12'))
  check(`[${label}] 宽项派生：智力 +4、熟练 +2、法术位 1 环 4 个`, (await page.getByTestId('person-card-ability-int').innerText()).includes('+4') && (await page.getByTestId('person-card-readout').innerText()).includes('+2') && (await page.getByTestId('person-card-statuses').innerText()).includes('4/4'))

  if ((page.viewportSize()?.width ?? 0) <= 480) {
    await page.getByTestId('person-card-tab-story').click()
    check(`[${label}] 窄屏分页可横向滚动且当前项滚入视野`, (await page.getByTestId('person-card-tab-story').getAttribute('aria-selected')) === 'true' && (await page.locator('.trpg-card-tabs').evaluate((el) => el.scrollLeft)) > 0 && (await page.getByTestId('person-card-placeholder').innerText()).includes('本分页尚未开放'))
    await page.getByTestId('person-card-tab-actions').click()
  }

  // 数字点击只预填骰盘，不自动掷
  await page.getByTestId('person-card-ability-int').getByRole('button', { name: /智力检定/ }).click()
  await page.locator('.trpg-dice').waitFor()
  check(`[${label}] 点属性检定打开骰盘并填好骰式与说明`, (await page.locator('#trpg-dice-formula').inputValue()) === '1d20+4' && (await page.locator('.trpg-dice input[aria-label="说明"]').inputValue()).includes(`${CARD_NAME} 智力检定`))
  check(`[${label}] 详情页点数字不自动掷`, (await page.getByTestId('dice-line').innerText()).includes('点「掷骰」'))
  await page.getByRole('button', { name: '关闭掷骰' }).click()

  // 生命原地编辑：当前/上限/临时一次提交
  await page.getByTestId('person-card-hp-edit').click()
  await page.getByTestId('person-card-hp-current-input').fill('5')
  await page.getByTestId('person-card-hp-max-input').fill('20')
  await page.getByTestId('person-card-hp-temp-input').fill('0')
  await page.getByTestId('person-card-hp-current-input').press('Enter')
  check(`[${label}] 生命编辑显示当前/上限/临时且上限进草稿`, /5\s*\/\s*20/.test(await page.getByTestId('person-card-vitals').innerText()) && (await page.getByTestId('person-card-status').innerText()).includes('未保存'))
  await page.getByTestId('person-card-undo').click()
  check(`[${label}] 一次生命编辑只占一步撤销，撤销恢复当前与上限`, /12\s*\/\s*17/.test(await page.getByTestId('person-card-vitals').innerText()))

  // 死亡豁免、生命骰、灵感、力竭、效果
  await page.getByRole('button', { name: '死亡豁免成功 2 次' }).click()
  check(`[${label}] 死亡豁免点第 2 个成功圆点`, (await page.locator('.trpg-dot--ok.is-on').count()) === 2)
  await page.getByRole('button', { name: '死亡豁免成功 2 次' }).click()
  check(`[${label}] 再点当前最高圆点清空成功组`, (await page.locator('.trpg-dot--ok.is-on').count()) === 0)
  await page.getByRole('button', { name: /生命骰 d6 第 1 颗/ }).click()
  check(`[${label}] 生命骰点实心变已用`, (await page.getByRole('button', { name: /生命骰 d6 第 1 颗/ }).getAttribute('aria-label')).includes('已用'))
  await page.getByTestId('person-card-inspiration').click()
  check(`[${label}] 灵感点击切换`, (await page.getByTestId('person-card-inspiration').getAttribute('aria-pressed')) === 'true')
  await page.keyboard.press('Control+z')
  check(`[${label}] Ctrl+Z 撤销灵感`, (await page.getByTestId('person-card-inspiration').getAttribute('aria-pressed')) === 'false')
  await page.getByRole('button', { name: '增加一级力竭' }).click()
  check(`[${label}] 力竭步进与说明`, (await page.getByTestId('person-card-exhaustion').innerText()) === '1' && (await page.getByTestId('person-card-statuses').innerText()).includes('属性检定具有劣势'))
  await page.getByRole('button', { name: '添加其他效果' }).click()
  await page.locator('.trpg-add-effect').getByRole('button', { name: '中毒' }).click()
  check(`[${label}] 添加效果后出现药丸`, (await page.getByTestId('person-card-statuses').innerText()).includes('中毒'))
  await page.getByRole('button', { name: '移除效果 中毒' }).click()
  check(`[${label}] 效果 × 移除`, !(await page.getByTestId('person-card-statuses').innerText()).includes('中毒'))

  // 占位按钮
  await page.getByTestId('person-card-rest').click()
  await page.getByText(/短休、长休在之后的「活动」里做/).waitFor()
  await clearToasts(page)
  await page.getByRole('button', { name: '升级' }).click()
  await page.getByText(/升级、降级面板之后再做/).waitFor()
  await clearToasts(page)

  // 身份抽屉与滑块
  await page.getByTestId('person-card-name-open').click()
  await page.getByTestId('identity-drawer').waitFor()
  check(`[${label}] 身份抽屉显示种族与亚种族`, (await page.getByRole('combobox', { name: '种族', exact: true }).inputValue()) === '人类' && (await page.getByTestId('identity-drawer').innerText()).includes('亚种族'))
  await page.getByRole('combobox', { name: '背景', exact: true }).click()
  await page.getByRole('option', { name: '侍僧' }).click()
  check(`[${label}] 身份抽屉选背景后显示侍僧`, (await page.getByRole('combobox', { name: '背景', exact: true }).inputValue()) === '侍僧')
  await page.locator('.trpg-modal__close').click()
  check(`[${label}] 身份草稿未保存`, (await page.getByTestId('person-card-status').innerText()).includes('未保存'))
  await page.getByTestId('person-card-undo').click()

  // 头像上传与重新截取
  await page.locator('[data-testid="person-card"] input[type=file]').setInputFiles(picture)
  await page.getByText('头像已更新').waitFor({ timeout: 15000 })
  await page.getByTestId('person-card-name-open').click()
  await page.getByTestId('identity-drawer').waitFor()
  check(`[${label}] 上传头像后身份抽屉出现重新截取`, await page.getByTestId('identity-recrop').isVisible())
  await page.getByTestId('identity-recrop').click()
  await page.getByTestId('recrop-page').waitFor()
  await page.locator('.trpg-recrop img').waitFor()
  await settle(page, 500)
  check(`[${label}] 重新截取页在原图内显示预览`, await page.getByTestId('recrop-page').getByRole('button', { name: '使用这个截取' }).isEnabled())
  await page.getByRole('button', { name: '使用这个截取' }).click()
  await page.getByTestId('identity-drawer').waitFor()
  check(`[${label}] 使用截取后回到身份页且仍只有一个模态`, (await modalCount(page)) === 1)
  await page.locator('.trpg-modal__close').click()

  // 套用模板、撤销
  await page.getByTestId('person-card-template').click()
  await page.getByTestId('template-picker').waitFor()
  await page.getByRole('searchbox', { name: '搜模板名字' }).fill('地精')
  await page.getByTestId('tpl-row-monster.goblin.mm').click()
  await page.getByTestId('tpl-apply').click()
  await page.getByTestId('person-card').waitFor()
  check(`[${label}] 套用模板后显示挑战等级与模板 AC`, (await page.getByTestId('person-card-identity').innerText()).includes('挑战 1/4') && (await page.getByTestId('person-card-readout').innerText()).includes('15'))
  await page.getByTestId('person-card-undo').click()
  check(`[${label}] 撤销套用模板恢复职业身份`, (await page.getByTestId('person-card-identity').innerText()).includes('法师 3 级'))

  // 保存、回列表、重新读取
  await page.getByTestId('person-card-hp-edit').click()
  await page.getByTestId('person-card-hp-current-input').fill('5')
  await page.getByTestId('person-card-hp-max-input').fill('20')
  await page.getByTestId('person-card-hp-temp-input').fill('0')
  await page.getByTestId('person-card-hp-current-input').press('Enter')
  await page.getByTestId('person-card-save').click()
  await page.getByText(/已保存/).waitFor()
  await page.getByTestId('people-page').waitFor()
  await page.locator('[data-testid^="people-row-"]').filter({ hasText: CARD_NAME }).first().click()
  await page.getByTestId('person-card').waitFor()
  await page.getByTestId('person-card-vitals').waitFor()
  check(`[${label}] 保存后重新进入生命值读回`, /5\s*\/\s*20/.test(await page.getByTestId('person-card-vitals').innerText()))
  check(`[${label}] 保存后撤销栈清空`, await page.getByTestId('person-card-undo').isDisabled())

  // 离开丢弃草稿且不弹框
  await page.getByTestId('person-card-inspiration').click()
  const before = await page.getByTestId('person-card-inspiration').getAttribute('aria-pressed')
  await page.getByTestId('person-card-back').click()
  await page.getByTestId('people-page').waitFor()
  check(`[${label}] 离开不弹确认`, (await modalCount(page)) === 0)
  await page.locator('[data-testid^="people-row-"]').filter({ hasText: CARD_NAME }).first().click()
  await page.getByTestId('person-card').waitFor()
  check(`[${label}] 离开后草稿丢弃`, (await page.getByTestId('person-card-inspiration').getAttribute('aria-pressed')) === before)

  // 存入我的库 → 库模式打开同一张卡 → 保存到库
  await clearToasts(page)
  await page.locator('.trpg-card-top .trpg-more').click()
  await page.getByRole('menuitem', { name: '存入我的库...' }).click()
  await page.getByTestId('save-to-library').waitFor()
  await page.getByTestId('save-to-library-submit').click()
  await page.getByText(/已存到《/).waitFor()
  await page.getByTestId('person-card-back').click()
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '我的', exact: true }).click()
  await page.getByTestId('mine-tab').waitFor()
  await page.locator('[data-testid^="mine-row-"]').filter({ hasText: '未分组（默认）' }).first().getByRole('button', { name: '编辑 ›' }).click()
  await page.getByTestId('mine-sub').waitFor()
  await page.locator('.trpg-vlist__row').filter({ hasText: CARD_NAME }).first().getByRole('button', { name: '打开 ›' }).click()
  await page.getByTestId('library-person-card').waitFor()
  check(`[${label}] 库模式打开同一张卡：顶栏是保存到库`, (await page.getByTestId('person-card-save').innerText()) === '保存到库')
  await page.getByTestId('person-card-save').click()
  await page.getByText(/已保存到《/).waitFor()
  check(`[${label}] 库模式保存后关闭`, (await page.getByTestId('library-person-card').count()) === 0)
}
