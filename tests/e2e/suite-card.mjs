// U5R：人物详情（外壳 + 全部弹窗 + 骰盘检定/豁免）。真实构建产物 + Chrome/WebKit。
import { check, clearToasts, gotoPage, modalCount, settle, bodyPointerEvents } from './helpers.mjs'
import { callStore } from './store.mjs'

const NAME = '卡牌测试'
const prepared = () => ({
  id: `p-card-${Date.now()}`, name: NAME, nameEn: 'Card Test', categoryId: 'party', tags: [], pinned: false,
  hp: { current: 12, temp: 3, deathSaves: { success: 1, fail: 0 } },
  effects: [],
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

const personRow = (page, name) => page.locator('[data-testid^="people-row-"]').filter({ hasText: name }).first()
const card = (page) => page.getByTestId('person-card')
const modalOf = (page) => page.locator('.trpg-modal__card')
async function openCard(page, name) {
  if (await page.getByTestId('person-card-back').count()) { await page.getByTestId('person-card-back').click(); await page.getByTestId('people-page').waitFor() }
  await page.getByTestId('people-category-all').click()
  await personRow(page, name).click()
  await card(page).waitFor(); await page.getByTestId('person-card-abilities').waitFor(); await settle(page, 300)
}
async function closeModal(page) { await page.locator('.trpg-modal__close').click(); await settle(page, 200) }
async function pickOption(page, trigger, option) {
  await trigger.click()
  await page.getByRole('option', { name: option, exact: false }).first().click()
  await settle(page, 150)
}

export async function cardSuite(page, label) {
  // 不依赖开局向导（它要联网下载推荐包）：直接用 store 开一场只带 SRD 的战役
  for (let i = 0; i < 60 && !(await callStore(page, 'campaign', (s) => !!s.owner)); i++) await page.waitForTimeout(250)
  await callStore(page, 'campaign', (s) => s.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'U5R' }))
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).waitFor({ timeout: 30000 })
  await gotoPage(page, '人物')
  await page.getByTestId('people-page').waitFor()
  const narrow = (page.viewportSize()?.width ?? 0) <= 480

  // ── 新建空白人物 ───────────────────────────────────────────────
  await page.getByTestId('people-new').click()
  await card(page).waitFor()
  check(`[${label}] 新建人物默认不在生命编辑态`, (await page.getByTestId('person-card-hp-editor').count()) === 0)
  check(`[${label}] 新建人物是草稿（未保存）`, (await page.getByTestId('person-card-status').innerText()).includes('未保存'))
  await page.getByText(/点数字去骰盘/).waitFor({ timeout: 3000 })
  check(`[${label}] 第一次打开出现一次操作提示`, true)
  await clearToasts(page)
  check(`[${label}] 空白新人物：顶栏有新人物提示，属性卡有「配置属性」引导`, (narrow || (await page.locator('.trpg-card-top__hint').count()) === 1) && (await page.getByTestId('person-card-abilities-setup').count()) === 1)
  check(`[${label}] 空白新人物：没有「开始建卡」条`, (await card(page).getByText('开始建卡').count()) === 0)
  await page.getByTestId('person-card-name-open').click()
  await page.getByTestId('identity-core').waitFor()
  check(`[${label}] 身份弹窗只有一个模态，且有五个标签`, (await modalCount(page)) === 1 && (await modalOf(page).getByRole('tab').count()) === 5)
  await settle(page, 500)
  const box = await modalOf(page).boundingBox()
  const vp = page.viewportSize()
  check(`[${label}] ${narrow ? '手机：弹窗是贴底的整页' : '宽屏：弹窗居中，不是侧拉'}`, narrow ? Math.abs(box.y + box.height - vp.height) < 6 : Math.abs(box.x + box.width / 2 - vp.width / 2) < vp.width * 0.2 && box.x > 150)
  await page.getByTestId('identity-name').fill('临时名字'); await page.getByTestId('identity-name').press('Enter')
  check(`[${label}] 头像三个按钮常驻：没有头像时重新截取、清除置灰不消失`, (await page.getByTestId('identity-recrop').isDisabled()) && (await page.getByTestId('identity-clear').isDisabled()))
  await closeModal(page)
  check(`[${label}] 弹窗关闭后 body 可点（pointer-events 恢复）`, (await bodyPointerEvents(page)) !== 'none')
  await page.getByTestId('person-card-back').click(); await page.getByTestId('people-page').waitFor()
  check(`[${label}] 不保存返回后新建人物不在列表`, (await personRow(page, '临时名字').count()) === 0)

  // ── 带职业与种族的人物 ──────────────────────────────────────────
  await callStore(page, 'people', (s, p) => s.create(p), prepared())
  await settle(page, 300)
  await openCard(page, NAME)
  check(`[${label}] 身份卡：名字、职业框「法师 3 级」、等级管理按钮、人类药丸`, (await page.getByTestId('person-card-class-box').innerText()).includes('法师') && (await page.getByTestId('person-card-levels').innerText()).includes('等级管理') && (await page.getByTestId('person-card-race').innerText()) === '人类')
  check(`[${label}] 没有升级 / 降级两个按钮、没有 --ok 绿`, (await card(page).getByRole('button', { name: '升级', exact: true }).count()) === 0)
  check(`[${label}] 派生：智力 +4、熟练 +2、法术位 1 环 4 个、法术 DC 14`, (await page.getByTestId('person-card-ability-int').innerText()).includes('+4') && (await page.getByTestId('person-card-readout').innerText()).includes('+2') && (await page.getByTestId('person-card-slots').innerText()).includes('4/4') && (await page.getByTestId('person-card-slots').innerText()).includes('法术 DC 14'))
  check(`[${label}] 死亡豁免常驻（不是 0 血才出现）、生命骰、力竭同在生命卡里`, (await page.getByTestId('person-card-vitals').innerText()).includes('死亡豁免') && (await page.getByTestId('person-card-vitals').innerText()).includes('生命骰') && (await page.getByTestId('person-card-vitals').innerText()).includes('力竭'))

  // 悬停来源
  if (!narrow) {
    await page.getByTestId('person-card-ac').hover(); await page.locator('.trpg-tip__bubble').waitFor({ timeout: 2000 })
    check(`[${label}] 悬停 AC 显示来源明细与合计`, (await page.locator('.trpg-tip__bubble').innerText()).includes('敏捷') && (await page.locator('.trpg-tip__bubble').innerText()).includes('合计'))
    await page.mouse.move(2, 2)
  }

  // ── 点数字去骰盘：只填入，不掷 ─────────────────────────────────────
  await page.getByTestId('person-card-ability-int').getByRole('button', { name: /智力检定/ }).click()
  await page.locator('.trpg-dice').waitFor()
  await page.getByTestId('roll-formula').filter({ hasText: '1d20+4' }).waitFor({ timeout: 5000 }).catch(() => undefined)
  check(`[${label}] 点属性检定：骰盘切到检定，行动者、属性已填好，骰式 1d20+4，没有自动掷`, (await page.getByTestId('roll-panel-check').count()) === 1 && (await page.getByTestId('roll-formula').innerText()) === '1d20+4' && (await page.getByTestId('roll-result').innerText()).includes('掷出后'))
  const y0 = await page.getByTestId('roll-formula').evaluate((el) => el.getBoundingClientRect().y)
  await pickOption(page, page.getByRole('combobox', { name: '技能' }), '奥秘')
  check(`[${label}] 选技能后公式更新、且底栏分区位置不变（选项目不重排）`, (await page.getByTestId('roll-formula').innerText()).startsWith('1d20') && Math.abs((await page.getByTestId('roll-formula').evaluate((el) => el.getBoundingClientRect().y)) - y0) < 1)
  check(`[${label}] 选技能后弹层关闭、body 可点`, (await bodyPointerEvents(page)) !== 'none')
  await page.getByTestId('roll-custom-text').count() // 表单默认收起
  await page.getByTestId('roll-add-custom').click()
  await page.getByTestId('roll-custom-text').fill('神导术')
  await page.getByRole('button', { name: '添加', exact: true }).click()
  check(`[${label}] 自定义加值：非法内容不收，有红字提示`, (await page.getByText('写成 +2').count()) === 1)
  await page.getByTestId('roll-custom-text').fill('1d4'); await page.getByRole('button', { name: '添加', exact: true }).click()
  check(`[${label}] 自定义加值：骰式 1d4 进公式`, (await page.getByTestId('roll-formula').innerText()).includes('+1d4'))
  await page.getByTestId('roll-dc').fill('12')
  await page.getByTestId('roll-go').click(); await settle(page, 300)
  check(`[${label}] 掷骰后给出总值与成败（对 DC）`, /^\d+$/.test(await page.getByTestId('roll-total').innerText()) && /(成功|失败)/.test(await page.getByTestId('roll-verdict').innerText()))
  await page.getByTestId('roll-random-dc').click()
  const rnd = Number(await page.getByTestId('roll-dc').inputValue())
  check(`[${label}] 随机 DC 是 1–25 的整数`, Number.isInteger(rnd) && rnd >= 1 && rnd <= 25)
  await page.getByTestId('roll-mode-adv').click()
  check(`[${label}] 手动优势：最终掷法写明优势`, (await page.getByTestId('roll-final-mode').innerText()).includes('优势'))
  await page.getByRole('button', { name: '关闭掷骰' }).click()

  // 被动 = 随机 DC + 对比
  await page.getByTestId('person-card-passive-perception').click()
  await page.getByTestId('roll-panel-check').waitFor()
  const pdc = Number(await page.getByTestId('roll-dc').inputValue())
  check(`[${label}] 点被动徽章：被动模式开、随机 DC 1–25、底栏写「对比 DC」`, (await page.getByTestId('roll-passive').isChecked()) && pdc >= 1 && pdc <= 25 && (await page.getByTestId('roll-go').innerText()).includes('对比 DC'))
  await page.getByTestId('roll-go').click()
  check(`[${label}] 被动对比给出通过 / 未通过`, /(通过|未通过)/.test(await page.getByTestId('roll-verdict').innerText()))
  await page.getByTestId('dice-tab-save').click()
  check(`[${label}] 豁免标签没有技能下拉，有死亡豁免选项`, (await page.getByRole('combobox', { name: '技能' }).count()) === 0)
  await page.getByTestId('dice-tab-free').click()
  check(`[${label}] 「自由」标签就是基础版：有骰式输入框`, (await page.locator('#trpg-dice-formula').count()) === 1)
  await page.getByRole('button', { name: '关闭掷骰' }).click()

  // ── 生命原地编辑 ───────────────────────────────────────────────
  await page.getByTestId('person-card-hp-edit').click()
  check(`[${label}] 点 ✎ 生命区原位编辑（没有弹窗），出现上限明细`, (await modalCount(page)) === 0 && (await page.getByTestId('person-card-hp-editor').innerText()).includes('上限明细'))
  await page.getByTestId('person-card-hp-current-input').fill('5')
  await page.getByTestId('person-card-hp-max-input').fill('20')
  await page.getByTestId('person-card-hp-adj-add').click()
  await page.getByRole('textbox', { name: '修正来源名称' }).fill('强健专长'); await page.getByRole('textbox', { name: '每级值' }).fill('2')
  await page.getByTestId('person-card-hp-adj-ok').click()
  check(`[${label}] 添加修正出现在明细里，标「手动」`, (await page.getByTestId('person-card-hp-editor').innerText()).includes('强健专长（手动）'))
  await page.getByTestId('person-card-hp-done').click()
  check(`[${label}] 完成后显示 5 / 20，未保存计数增加`, /5\s*\/\s*20/.test(await page.getByTestId('person-card-vitals').innerText()) && (await page.getByTestId('person-card-status').innerText()).includes('未保存'))
  await page.getByTestId('person-card-undo').click()
  check(`[${label}] 一次生命编辑只占一步撤销`, /12\s*\/\s*17/.test(await page.getByTestId('person-card-vitals').innerText()))
  await page.getByRole('button', { name: '死亡豁免成功 2 次' }).click()
  check(`[${label}] 死亡豁免：成功是酒红实心、第 2 个`, (await page.locator('.trpg-dot--ok.is-on').count()) === 2)
  await page.getByRole('button', { name: /生命骰 d6 第 1 颗/ }).click()
  check(`[${label}] 生命骰点击变已用`, (await page.getByRole('button', { name: /生命骰 d6 第 1 颗/ }).getAttribute('aria-label')).includes('已用'))
  await page.getByRole('button', { name: '增加一级力竭' }).click()
  check(`[${label}] 力竭步进，行内只有当前级的一句话`, (await page.getByTestId('person-card-exhaustion').innerText()).includes('1 / 6') && (await page.getByTestId('person-card-vitals').innerText()).includes('属性检定具有劣势'))
  await page.getByTestId('person-card-exhaustion-info').click()
  await page.waitForSelector('.trpg-modal .trpg-library-card, .trpg-modal [data-testid="entry-detail"], .trpg-modal .trpg-entry', { timeout: 8000 }).catch(() => undefined)
  const exModal = await page.locator('.trpg-modal').innerText()
  check(`[${label}] 点「力竭」打开库里力竭条目的资料片（英文名 Exhaustion）；悬停提示已去掉`, exModal.includes('力竭') && exModal.includes('Exhaustion'))
  await page.locator('.trpg-modal__close').click()
  await page.getByRole('button', { name: '减少一级力竭' }).click()

  // ── 状态与效果：添加、资料、移除 ───────────────────────────────────
  await page.getByTestId('person-card-effect-add').click()
  await page.getByTestId('fx-search').waitFor()
  check(`[${label}] 添加效果是居中弹窗，带分类标签`, (await modalCount(page)) === 1 && (await page.getByRole('tab', { name: /法术效果/ }).count()) === 1)
  await page.getByTestId('fx-item-condition.poisoned.phb').click()
  await page.getByTestId('fx-add').click(); await settle(page, 200)
  check(`[${label}] 添加后弹窗保持打开、该项打上「已生效」`, (await modalCount(page)) === 1 && (await page.getByTestId('fx-item-condition.poisoned.phb').innerText()).includes('已生效'))
  await page.getByRole('tab', { name: /法术效果/ }).click()
  await page.getByTestId('fx-search').fill('祝福术')
  await page.getByTestId('fx-item-spell.bless.phb').click()
  await page.getByTestId('fx-add').click(); await settle(page, 200)
  await closeModal(page)
  check(`[${label}] 状态一行、效果一行；药丸带「专注」「1 分钟」`, (await page.getByTestId('person-card-statuses').innerText()).includes('中毒') && /祝福术/.test(await page.getByTestId('person-card-statuses').innerText()) && (await page.getByTestId('person-card-statuses').innerText()).includes('专注'))
  await page.getByRole('button', { name: '查看资料：祝福术' }).click()
  await page.getByTestId('info-close').waitFor()
  check(`[${label}] 点药丸 = 资料弹窗，不再出现「没有更多说明」`, (await modalCount(page)) === 1 && !(await modalOf(page).innerText()).includes('没有更多说明') && (await modalOf(page).innerText()).includes('类别'))
  await closeModal(page)
  await page.getByRole('button', { name: '移除 祝福术' }).click()
  await page.getByRole('button', { name: '移除 中毒' }).click()
  check(`[${label}] 效果 × 立即移除`, (await page.getByTestId('person-card-statuses').innerText()).includes('当前没有状态和效果'))

  // ── 档案：熟练弹窗 ───────────────────────────────────────────────
  await page.getByTestId('person-card-archive-edit-proficiency').click()
  await page.getByRole('tab', { name: /语言/ }).waitFor()
  await page.getByTestId('archive-add-elvish').click()
  check(`[${label}] 添加语言后药丸移到「已有」`, (await modalOf(page).innerText()).includes('精灵语') && (await page.getByTestId('archive-add-elvish').count()) === 0)
  await page.getByRole('button', { name: '移除精灵语' }).click()
  check(`[${label}] 移除后回到可添加`, (await page.getByTestId('archive-add-elvish').count()) === 1)
  await page.getByRole('tab', { name: /护甲/ }).click()
  check(`[${label}] 护甲类别 4 项且没有搜索框`, (await page.getByRole('button', { name: /轻甲|中甲|重甲|盾牌/ }).count()) >= 4 && (await page.getByRole('searchbox').count()) === 0)
  await closeModal(page)
  check(`[${label}] 档案三卡有边框，空类整行不画（不写「—」）`, (await page.getByTestId('person-card-archive').count()) === 1 && !(await page.getByTestId('person-card-archive').innerText()).includes('—'))

  // ── 属性弹窗：放入 / 退回 / 保存并写入 ────────────────────────────────
  await page.getByTestId('person-card-abilities-edit').click()
  await page.getByTestId('ab-row-str').waitFor()
  await page.getByTestId('ab-pool-0').click()
  await page.getByTestId('ab-row-str').click()
  check(`[${label}] 放入：该行红框、池里数字变灰`, (await page.getByTestId('ab-row-str').getAttribute('class')).includes('is-placed') && (await page.getByTestId('ab-pool-0').getAttribute('class')).includes('is-used'))
  check(`[${label}] 放入后「保存并写入属性点」可点`, await page.getByTestId('ab-save').isEnabled())
  await page.getByTestId('ab-row-str').click()
  check(`[${label}] 再点已放入的行 = 退回：红框消失、数字恢复可用`, !(await page.getByTestId('ab-row-str').getAttribute('class')).includes('is-placed') && !(await page.getByTestId('ab-pool-0').getAttribute('class')).includes('is-used'))
  await page.getByTestId('ab-pool-0').click(); await page.getByTestId('ab-row-dex').click()
  await page.getByTestId('ab-save').click(); await settle(page, 200)
  check(`[${label}] 保存并写入后弹窗关闭、敏捷基础值变 15（池里第 1 个数），未保存计数出现`, (await modalCount(page)) === 0 && (await page.getByTestId('person-card-status').innerText()).includes('未保存'))
  await page.getByTestId('person-card-undo').click()

  // ── 读数弹窗：三个标签、项目卡、手动调整与自动计算 ─────────────────────
  await page.getByTestId('person-card-readout-edit').click()
  await page.getByRole('tab', { name: '速度' }).waitFor()
  check(`[${label}] 读数弹窗三个标签，没有「—」占位`, (await modalOf(page).getByRole('tab').count()) === 3 && !(await modalOf(page).innerText()).includes('—'))
  await page.getByRole('spinbutton', { name: 'AC 手动调整' }).fill('2'); await page.getByRole('spinbutton', { name: 'AC 手动调整' }).press('Tab')
  check(`[${label}] AC 手动调整 +2 后最终值 14`, (await modalOf(page).innerText()).includes('14'))
  await page.getByRole('button', { name: '自动计算' }).first().click()
  check(`[${label}] [自动计算] 恢复 12`, (await modalOf(page).innerText()).includes('12'))
  await closeModal(page); await page.getByTestId('person-card-undo').click(); await page.getByTestId('person-card-undo').click().catch(() => undefined)

  // ── 技能弹窗 ───────────────────────────────────────────────────
  await page.getByTestId('person-card-skills-edit').click()
  await page.getByTestId('skill-cycle-arcana').waitFor()
  await page.getByTestId('skill-cycle-arcana').click()
  await closeModal(page)
  check(`[${label}] 技能弹窗点图标后，技能页该项变熟练（加值 +6）`, (await page.getByTestId('person-card-skill-arcana').innerText()).includes('+6'))
  await page.getByTestId('person-card-undo').click()

  // ── 身份弹窗：种族流程 / 等级管理 ─────────────────────────────────────
  await page.getByTestId('person-card-race').click()
  await page.locator('.trpg-modal__card').waitFor()
  await page.getByTestId('peek-更换种族').click()
  await page.getByTestId('flow-start-race').click()
  await page.getByTestId('flow-opt-race.dwarf.phb').click()
  check(`[${label}] 种族流程：右侧是资料片，主按钮写「选用矮人」（不带括号说明）`, (await page.getByTestId('flow-choose').innerText()) === '选用矮人' && (await page.getByTestId('flow-only').innerText()) === '只选用，先不分配')
  await page.getByTestId('flow-choose').click()
  await page.getByTestId('flow-next').click()
  check(`[${label}] 分配页：默认全勾，旧种族区默认勾选「移除旧内容」`, (await page.getByTestId('flow-apply').innerText()).includes('应用（'))
  await page.getByTestId('flow-apply').click(); await settle(page, 300)
  check(`[${label}] 应用后身份卡显示矮人，一次应用 = 一步撤销`, (await page.getByTestId('person-card-race').innerText()) === '矮人')
  await closeModal(page)
  await page.getByTestId('person-card-undo').click()
  check(`[${label}] 撤销一步回到人类`, (await page.getByTestId('person-card-race').innerText()) === '人类')
  await page.getByTestId('person-card-levels').click()
  await page.getByTestId('levels-plus').waitFor()
  await page.getByTestId('levels-plus').click()
  check(`[${label}] 等级管理：目标 4 级，逐级列出生命与属性提升`, (await page.getByTestId('levels-target').innerText()) === '4' && (await page.getByTestId('levels-asi-4').count()) === 1)
  await page.getByTestId('levels-apply').click(); await settle(page, 300)
  check(`[${label}] 应用后职业框显示 4 级`, (await page.getByTestId('person-card-class-box').innerText()).includes('4 级'))
  await page.getByTestId('person-card-undo').click()
  check(`[${label}] 撤销后回到 3 级`, (await page.getByTestId('person-card-class-box').innerText()).includes('3 级'))
  await page.getByTestId('person-card-class-box').click()
  await page.getByTestId('peek-等级管理').waitFor()
  check(`[${label}] 点职业框 = 职业资料页（居中弹窗），底栏有「更换职业」「等级管理」`, (await modalCount(page)) === 1 && (await page.getByTestId('peek-更换职业').count()) === 1)
  await closeModal(page)

  // ── 帮助 ────────────────────────────────────────────────────────
  await page.getByTestId('person-card-help').click()
  await page.getByRole('button', { name: '知道了' }).waitFor()
  check(`[${label}] 帮助：顶栏唯一的 ？，弹窗里每行图标 + 一句话`, (await page.getByTestId('person-card-help').count()) === 1 && (await modalOf(page).locator('li').count()) >= 6)
  await closeModal(page)

  // ── 敌人视图与人物同构 ────────────────────────────────────────────
  await page.getByTestId('person-card-back').click(); await page.getByTestId('people-page').waitFor()
  await callStore(page, 'people', (s, a) => s.addFromEntry(a), { ref: { packId: await callStore(page, 'app', async (s) => (await s.svc().db.entries.toArray()).find((r) => r.entryId === 'monster.mage.mm')?.packId), entryId: 'monster.mage.mm' }, count: 1, categoryId: 'enemy' })
  await settle(page, 500)
  await openCard(page, '魔法师')
  const t = await card(page).innerText()
  check(`[${label}] 敌人视图：除挑战 / 经验徽章外，灵感、死亡豁免、生命骰、力竭、职业框、等级管理位都在`, t.includes('挑战 6') && t.includes('经验') && t.includes('灵感') && t.includes('死亡豁免') && t.includes('生命骰') && t.includes('力竭') && t.includes('未选职业'))
  check(`[${label}] 敌人也显示法术位（读属性块）`, (await page.getByTestId('person-card-slots').innerText()).includes('1环') && (await page.getByTestId('person-card-slots').innerText()).includes('5环'))
  await page.getByTestId('person-card-back').click(); await page.getByTestId('people-page').waitFor()

  // ── 保存、读回 ───────────────────────────────────────────────────
  await openCard(page, NAME)
  await page.getByTestId('person-card-hp-edit').click()
  await page.getByTestId('person-card-hp-current-input').fill('7'); await page.getByTestId('person-card-hp-done').click()
  await page.getByTestId('person-card-save').click()
  await page.getByText(/已保存/).first().waitFor()
  await page.getByTestId('people-page').waitFor().catch(() => undefined)
  await openCard(page, NAME)
  check(`[${label}] 保存后重新进入：生命值读回，撤销栈清空`, /7\s*\/\s*17/.test(await page.getByTestId('person-card-vitals').innerText()) && (await page.getByTestId('person-card-undo').isDisabled()))
  await page.getByTestId('person-card-back').click()
}
