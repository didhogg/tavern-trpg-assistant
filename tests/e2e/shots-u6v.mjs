// U6 美化：按视觉规格 §6 清单拍截图（深浅色 × 1440 / 900 / 390），保存到 docs/probes/U6_美化截图/。
// 用法：npx tsx tests/e2e/shots-u6v.mjs   （环境变量：SHOT_SIZE=1440|900|390 只拍一种宽度；SHOT_SCHEME=light|dark；SHOT_ONLY=关键字只拍名字里带它的）
// 数据：真实怪物（地精、地精头目）、一个上传了头像的玩家角色（盖尔）、一个没有图片的人（影心、雅格拉）。
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'
import { callStore } from './store.mjs'
import { emptyBlock, emptyPerson } from '../../src/ui/people/fromEntry'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const out = join(root, 'docs/probes/U6_美化截图')
mkdirSync(out, { recursive: true })
const allSizes = [['1440', 1440, 900], ['900', 900, 700], ['390', 390, 780]]
const sizes = allSizes.filter(([tag]) => !process.env.SHOT_SIZE || process.env.SHOT_SIZE === tag)
const schemes = ['light', 'dark'].filter((s) => !process.env.SHOT_SCHEME || process.env.SHOT_SCHEME === s)
const only = process.env.SHOT_ONLY
const wait = (page, ms = 400) => page.waitForTimeout(ms)
const goPage = (page, name) => page.locator('.trpg-window nav').getByRole('button', { name, exact: true }).click()

async function portraitDataUrl() {
  const res = await fetch('https://5e.kiwee.top/img/bestiary/MM/Archmage.webp')
  if (!res.ok) throw new Error(`取头像图失败 ${res.status}`)
  return `data:image/webp;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
}

/** 所有 img 加载完再拍（立绘来自网络）。 */
async function settleImages(page) {
  await page.waitForFunction(() => {
    const shadow = document.getElementById('trpg-assistant-root')?.shadowRoot
    return [...(shadow?.querySelectorAll('img') ?? [])].every((img) => img.complete)
  }, null, { timeout: 15000 }).catch((error) => console.warn('等待超时（继续拍）：', String(error).split('\n')[0]))
  await wait(page, 350)
}

async function setup(page, url) {
  // tsx 编译会给具名函数加 __name 包装，页面里要有这个函数 callStore 里的小函数才跑得起来
  await page.addInitScript(() => { window.__name = (f) => f })
  await page.goto(url)
  await page.locator('.trpg-ball').click()
  await page.getByTestId('start-banner').waitFor({ timeout: 30000 })
  await page.getByTestId('start-banner').click()
  await page.getByTestId('wizard').waitFor()
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
  await page.waitForFunction(() => {
    const r = document.getElementById('trpg-assistant-root').shadowRoot
    const metas = [...r.querySelectorAll('.trpg-wizard .trpg-row__meta')].map((e) => e.textContent ?? '')
    return metas.length >= 10 && !metas.some((t) => t.includes('未安装')) && !r.querySelector('.trpg-progress')
  }, null, { timeout: 120000 })
  await page.getByTestId('wizard-next').click()
  await wait(page, 300)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('banner-title').waitFor({ timeout: 30000 })
  await goPage(page, '人物')
  await page.getByTestId('people-page').waitFor()
}

async function seed(page) {
  const ids = await callStore(page, 'app', async (s) => {
    const rows = await s.svc().db.entries.toArray()
    const pick = (type, name) => rows.find((r) => r.type === type && r.name === name)?.entryId ?? ''
    const monster = (id) => rows.find((r) => r.entryId === id)?.packId ?? ''
    return {
      wizard: pick('class', '法师'), cleric: pick('class', '牧师'), fighter: pick('class', '战士'), trickery: pick('subclass', '诡术领域'),
      human: pick('race', '人类'), halfElf: pick('race', '半精灵'), dwarf: pick('race', '矮人'),
      goblinPack: monster('monster.goblin.mm'), bossPack: monster('monster.goblin-boss.mm'),
    }
  })
  console.log('种子数据', JSON.stringify(ids))
  const tagIds = {}
  for (const name of ['冒险者', '深水', '商人', '旅行者']) {
    tagIds[name] = (await callStore(page, 'people', (s, n) => s.createTag(n).id, name))
  }
  const now = Date.now()
  const avatar = await portraitDataUrl()
  const mk = (name, categoryId, extra, block, personExtra = {}) => ({
    ...emptyPerson({ name, categoryId, now }), ...personExtra, ...extra, block: { ...emptyBlock(), ...block },
  })
  const people = [
    mk('盖尔', 'party', { nameEn: 'Gale', tags: [tagIds['冒险者'], tagIds['深水']], pinned: true, avatar, hp: { current: 12, temp: 0, deathSaves: { success: 0, fail: 0 } }, effects: [{ name: '祝福' }] }, { classes: [{ class: ids.wizard, level: 3 }], race: ids.human, hp: { average: 18 }, ac: [{ value: 12 }], passive: 11 }),
    mk('影心', 'party', { nameEn: 'Shadowheart', tags: [tagIds['冒险者']], hp: { current: 11, temp: 0, deathSaves: { success: 0, fail: 0 } } }, { classes: [{ class: ids.cleric, level: 1, ...(ids.trickery ? { subclass: ids.trickery } : {}) }], race: ids.halfElf, hp: { average: 11 }, ac: [{ value: 13 }], passive: 13 }),
    mk('卡菈克', 'party', { nameEn: 'Karlach', tags: [tagIds['冒险者'], tagIds['深水'], tagIds['旅行者'], tagIds['商人']], hp: { current: 22, temp: 6, deathSaves: { success: 0, fail: 0 } } }, { classes: [{ class: ids.fighter, level: 3 }, { class: ids.wizard, level: 2 }], race: ids.dwarf, hp: { average: 30 }, ac: [{ value: 16 }], passive: 10, speed: { walk: 25 } }),
    mk('雅格拉', 'npc', { nameEn: 'Yagra', tags: [tagIds['商人']] }, {}),
  ]
  for (const p of people) await callStore(page, 'people', (s, arg) => s.create(arg), p)
  await callStore(page, 'people', (s, a) => s.addFromEntry(a), { ref: { packId: ids.goblinPack, entryId: 'monster.goblin.mm' }, count: 2, categoryId: 'enemy' })
  await callStore(page, 'people', (s, a) => s.addFromEntry(a), { ref: { packId: ids.bossPack, entryId: 'monster.goblin-boss.mm' }, count: 1, categoryId: 'enemy' })
  await wait(page, 600)
}

const row = (page, name) => page.locator('[data-testid^="people-row-"]').filter({ hasText: name }).first()
const closeModal = async (page) => { await page.locator('.trpg-modal__close').click(); await wait(page, 300) }

async function main() {
  const { server, url } = await startServer()
  const browser = await chromium.launch({ executablePath: chrome, headless: true })
  try {
    for (const [tag, width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: 'light' })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (e) => errors.push(e.message))
      await setup(page, url)
      const shot = async (name, scheme) => {
        if (only && !name.includes(only)) return
        await page.evaluate(() => { const c = document.getElementById('trpg-assistant-root')?.shadowRoot?.querySelector('.trpg-content'); if (c) c.scrollTop = 0 })
        await page.mouse.move(1, 1)  // 鼠标停在提示条上它不会消失
        await page.waitForFunction(() => !document.getElementById('trpg-assistant-root')?.shadowRoot?.querySelector('.trpg-toast'), null, { timeout: 15000 }).catch((error) => console.warn('等待超时（继续拍）：', String(error).split('\n')[0]))
        await settleImages(page)
        await page.screenshot({ path: join(out, `${name}-${tag}-${scheme}.png`) })
      }
      const both = async (name, prepare) => {
        for (const scheme of schemes) {
          await page.emulateMedia({ colorScheme: scheme })
          await wait(page, 200)
          await prepare?.()
          await shot(name, scheme)
        }
      }
      // 空状态（还没有人物）
      await page.getByTestId('people-category-all').click()
      await both('01-全部空状态')
      await page.getByTestId('people-category-party').click()
      await both('02-分类空状态')
      await page.getByTestId('people-category-all').click()
      await page.getByTestId('people-search').fill('不存在的人')
      await wait(page, 500)
      await both('03-搜索空状态')
      await page.getByTestId('people-search').fill('')
      await wait(page, 400)
      await seed(page)

      await page.getByTestId('people-category-all').click()
      await both('04-全部')
      await page.getByTestId('people-category-enemy').click()
      await both('05-单个分类')
      await page.getByTestId('people-category-party').click()
      await both('06-队伍页')
      await page.getByTestId('people-category-all').click()
      // 筛选中：一个标签 + 搜索词
      await page.getByTestId('people-tag-filter').getByRole('combobox').click()
      await page.getByRole('option', { name: '冒险者' }).click()
      await wait(page, 300)
      await both('07-筛选中')
      await page.getByTestId('people-clear').click()
      // 多选
      await page.getByTestId('people-select').click()
      await page.locator('[data-testid^="people-row-"]').filter({ hasText: '盖尔' }).first().locator('input[type=checkbox]').check()
      await page.locator('[data-testid^="people-row-"]').filter({ hasText: '影心' }).first().locator('input[type=checkbox]').check()
      await both('08-多选')
      await page.getByRole('button', { name: '完成', exact: true }).click()
      // 行尾菜单与编辑标签
      await row(page, '盖尔').getByRole('button', { name: /的更多操作/ }).click()
      await both('09-行尾菜单')
      await page.getByRole('menuitem', { name: '编辑标签...' }).click()
      await page.getByTestId('tag-editor-edit').waitFor()
      await page.getByTestId('tag-editor-input').fill('旅')
      await both('10-编辑标签')
      await closeModal(page)
      // 存入我的库
      await row(page, '盖尔').getByRole('button', { name: /的更多操作/ }).click()
      await page.getByRole('menuitem', { name: '存入我的库...' }).click()
      await page.getByTestId('save-to-library').waitFor()
      await wait(page, 300)
      await both('11-存入我的库')
      await closeModal(page)
      // 模板
      await page.getByTestId('people-template').click()
      await page.getByTestId('template-picker').waitFor()
      await wait(page, 800)
      await page.getByRole('searchbox', { name: '搜模板名字' }).fill('地精')
      await wait(page, 500)
      await both('12-模板列表')
      await page.getByTestId('tpl-row-monster.goblin.mm').click()
      await page.getByTestId('entry-detail').waitFor({ timeout: 8000 })
      await wait(page, 500)
      await both(width < 1024 ? '13-模板资料卡页窄屏' : '13-模板选中')
      if (width >= 1024) {
        await page.getByTestId('tpl-row-monster.goblin-boss.mm').click()
        await wait(page, 500)
        await both('13b-模板选中头目')
      }
      if (width < 1024) await page.getByTestId('template-picker').getByRole('button', { name: '模板' }).click()
      await page.getByRole('button', { name: /^筛选/ }).click()
      await page.getByTestId('template-filter').waitFor()
      await both('14-模板筛选')
      await page.getByRole('button', { name: /完成，显示/ }).click()
      await closeModal(page)
      // 回收站与原地确认
      await row(page, '地精 2').getByRole('button', { name: /的更多操作/ }).click()
      await page.getByRole('menuitem', { name: '删除' }).click()
      await wait(page, 300)
      await page.getByTestId('people-page-menu').getByRole('button', { name: /更多操作/ }).click()
      await page.getByRole('menuitem', { name: /回收站/ }).click()
      await page.getByTestId('trash-page').waitFor()
      await wait(page, 400)
      await both('15-回收站')
      await page.locator('[data-testid^="trash-row-"]').first().getByRole('button', { name: '彻底删除' }).click()
      await wait(page, 300)
      await both('16-回收站原地确认')
      await page.getByRole('button', { name: '取消' }).click()
      await page.locator('[data-testid^="trash-row-"]').first().getByRole('button', { name: '恢复', exact: true }).click()
      await closeModal(page)
      // 标签管理
      await page.getByTestId('people-page-menu').getByRole('button', { name: /更多操作/ }).click()
      await page.getByRole('menuitem', { name: '标签管理' }).click()
      await page.getByTestId('tag-manage').waitFor()
      await wait(page, 300)
      await both('17-标签管理')
      await closeModal(page)
      // 临时人物卡页
      await page.getByTestId('people-new').click()
      await page.getByTestId('person-card').waitFor()
      await wait(page, 300)
      await both('18-临时人物卡')
      await page.getByTestId('person-card-back').click()
      await page.getByTestId('people-page').waitFor()
      // 带立绘的人物卡片的临时人物卡页
      await row(page, '地精').first().click()
      await page.getByTestId('person-card').waitFor()
      await both('19-临时人物卡带立绘')
      await page.getByTestId('person-card-back').click()
      if (errors.length) console.log(`[${tag}] 页面脚本错误：`, errors.join(' | '))
      await context.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
  console.log(`截图已保存到 ${out}`)
}
await main()
