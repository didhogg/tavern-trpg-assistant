// U5 UNIT2 视觉截图：浅/深色 × 1440/900/390。用法：npx tsx tests/e2e/shots-u5.mjs
// 环境变量：SHOT_SIZE=1440|900|390、SHOT_SCHEME=light|dark、SHOT_ONLY=关键字。
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'
import { callStore } from './store.mjs'
import { emptyBlock, emptyPerson } from '../../src/ui/people/fromEntry'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const out = join(root, 'docs/probes/U5_截图')
mkdirSync(out, { recursive: true })
const allSizes = [['1440', 1440, 900], ['900', 900, 700], ['390', 390, 780]]
const sizes = allSizes.filter(([tag]) => !process.env.SHOT_SIZE || process.env.SHOT_SIZE === tag)
const schemes = ['light', 'dark'].filter((s) => !process.env.SHOT_SCHEME || process.env.SHOT_SCHEME === s)
const only = process.env.SHOT_ONLY
const wait = (page, ms = 300) => page.waitForTimeout(ms)

function portrait() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b98b5e"/><stop offset="1" stop-color="#3d2c42"/></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#g)"/>
    <circle cx="400" cy="360" r="150" fill="#e6c5a4"/><path d="M150 1000c20-270 150-390 250-390s230 120 250 390" fill="#6b3340"/>
    <path d="M250 340c20-150 90-230 150-230s130 80 150 230c-30-45-80-70-150-70s-120 25-150 70" fill="#3a2b25"/>
    <circle cx="350" cy="380" r="12" fill="#35251f"/><circle cx="450" cy="380" r="12" fill="#35251f"/>
    <path d="M370 450q30 20 60 0" fill="none" stroke="#8f5e54" stroke-width="8" stroke-linecap="round"/>
  </svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

async function setup(page, url) {
  await page.addInitScript(() => { window.__name = (f) => f })
  await page.goto(url)
  await page.locator('.trpg-ball').click()
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
  await wait(page)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('banner-title').waitFor({ timeout: 30000 })
  await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
  await page.getByTestId('people-page').waitFor()
}

async function seed(page) {
  const ids = await callStore(page, 'app', async (s) => {
    const rows = await s.svc().db.entries.toArray()
    const pick = (type, name) => rows.find((r) => r.type === type && r.name === name)?.entryId ?? ''
    const pack = (id) => rows.find((r) => r.entryId === id)?.packId ?? ''
    return {
      wizard: pick('class', '法师'), cleric: pick('class', '牧师'), fighter: pick('class', '战士'),
      human: pick('race', '人类'), halfElf: pick('race', '半精灵'), dwarf: pick('race', '矮人'),
      acolyte: pick('background', '侍僧'), goblinPack: pack('monster.goblin.mm'),
    }
  })
  const avatar = portrait()
  const now = Date.now()
  const mk = (name, categoryId, extra = {}, block = {}) => ({ ...emptyPerson({ name, categoryId, now }), ...extra, block: { ...emptyBlock(), ...block } })
  const gale = await callStore(page, 'people', (s, p) => s.create(p), mk('盖尔', 'party', {
    nameEn: 'Gale', avatar, hp: { current: 12, temp: 3, deathSaves: { success: 1, fail: 0 } }, effects: [{ name: '祝福' }],
  }, { classes: [{ class: ids.wizard, level: 3 }], race: ids.human, abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 12, cha: 10 }, ac: [{ value: 12 }] }))
  const assetHash = 'a'.repeat(64)
  await callStore(page, 'app', async (s, dataUrl) => {
    const bytes = new Uint8Array(await (await fetch(dataUrl)).arrayBuffer())
    await s.svc().db.blobs.put({ hash: 'a'.repeat(64), bytes, mime: 'image/svg+xml', size: bytes.length, createdAt: Date.now() })
  }, avatar)
  await callStore(page, 'people', (s, a) => s.saveDraft(a.id, { avatar: { $asset: a.hash }, avatarSource: { asset: { $asset: a.hash }, crop: { x: 0, y: 0, w: 1, h: 1 } } }), { id: gale.id, hash: assetHash })
  await callStore(page, 'people', (s, p) => s.create(p), mk('影心', 'party', {
    nameEn: 'Shadowheart', hp: { current: 11, temp: 0, deathSaves: { success: 0, fail: 0 } },
  }, { classes: [{ class: ids.cleric, level: 1 }], race: ids.halfElf, abilities: { str: 10, dex: 12, con: 12, int: 10, wis: 16, cha: 12 }, ac: [{ value: 13 }] }))
  await callStore(page, 'people', (s, p) => s.create(p), mk('卡菈克', 'party', {
    nameEn: 'Karlach', hp: { current: 22, temp: 6, deathSaves: { success: 0, fail: 0 } },
  }, { classes: [{ class: ids.fighter, level: 3 }, { class: ids.wizard, level: 2 }], race: ids.human, abilities: { str: 20, dex: 14, con: 16, int: 8, wis: 10, cha: 10 }, speed: { walk: 25 } }))
  await callStore(page, 'people', (s, p) => s.create(p), mk('档案人', 'npc', {
    nameEn: 'Archivist', hp: { current: 6, temp: 0, deathSaves: { success: 0, fail: 0 } },
  }, {
    classes: [{ class: ids.wizard, level: 1 }], race: ids.human, background: ids.acolyte,
    resist: ['fire', 'cold', 'lightning', 'acid'], immune: ['poison', 'psychic'], vulnerable: ['necrotic', 'thunder'],
    conditionImmune: ['charmed', 'frightened', 'poisoned', 'prone'], senses: ['darkvision 60 ft.'],
    proficiencies: {
      languages: [{ id: 'elvish', sources: [] }, { id: 'dwarvish', sources: [] }, { id: 'draconic', sources: [] }, { id: 'sylvan', sources: [] }],
      weapons: [{ category: 'simple', sources: [] }, { category: 'martial', sources: [] }, { name: '弯刀', sources: [] }],
      armor: [{ category: 'light', sources: [] }, { category: 'medium', sources: [] }],
      tools: [{ name: "smith's tools", level: 'proficient', sources: [] }, { name: "thieves' tools", level: 'expertise', sources: [] }],
    },
  }))
  await callStore(page, 'people', (s, p) => s.create(p), mk('雅格拉', 'npc', { hp: { current: null, temp: 0, deathSaves: { success: 0, fail: 0 } } }))
  await callStore(page, 'people', (s, a) => s.addFromEntry(a), { ref: { packId: ids.goblinPack, entryId: 'monster.goblin.mm' }, count: 1, categoryId: 'enemy' })
  await wait(page, 600)
  return { ...ids, galeId: gale.id }
}

const row = (page, name) => page.locator('[data-testid^="people-row-"]').filter({ hasText: name }).first()
const scroll = async (page, top) => page.locator('.trpg-content').evaluate((el, value) => { el.scrollTop = value }, top)
async function openPerson(page, name) {
  await page.getByTestId('people-category-all').click()
  await row(page, name).click()
  await page.getByTestId('person-card').waitFor()
  await page.getByTestId('person-card-abilities').waitFor()
  await wait(page, 500)
}
async function back(page) {
  await page.getByTestId('person-card-back').click()
  await page.getByTestId('people-page').waitFor()
}

async function main() {
  const { server, url } = await startServer()
  const browser = await chromium.launch({ executablePath: chrome, headless: true })
  try {
    for (const [tag, width, height] of sizes) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: 'light' })
      const page = await context.newPage()
      await page.addInitScript(() => localStorage.setItem('trpg-assistant:window', JSON.stringify({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight })))
      page.on('pageerror', (e) => console.error('pageerror', e.message))
      await setup(page, url)
      const ids = await seed(page)
      const state = async (name, prepare, top = 0, cleanup) => {
        if (only && !name.includes(only)) return
        await prepare()
        if (top !== null) await scroll(page, top)
        if (!name.includes('占位提示')) await page.waitForFunction(() => !document.getElementById('trpg-assistant-root')?.shadowRoot?.querySelector('.trpg-toast'), null, { timeout: 8000 }).catch(() => undefined)
        await wait(page, 350)
        for (const scheme of schemes) {
          await page.emulateMedia({ colorScheme: scheme })
          await wait(page, 180)
          await page.screenshot({ path: join(out, `${name}-${tag}-${scheme}.png`) })
        }
        await cleanup?.()
      }
      const closeModal = async () => { await page.locator('.trpg-modal__close').click(); await wait(page, 200) }
      const resetTop = () => scroll(page, 0)

      await state('01-人物卡-盖尔', async () => { await openPerson(page, '盖尔'); await resetTop() })
      await state('02-人物卡-盖尔-下半', async () => {}, 560)
      await state('03-模板怪物-地精', async () => { await back(page); await openPerson(page, '地精') }, 0, async () => { await back(page) })
      await state('04-空白新建', async () => { await page.getByTestId('people-new').click(); await page.getByTestId('person-card').waitFor(); await wait(page) }, 0, async () => { await back(page) })
      await state('05-生命编辑', async () => { await openPerson(page, '盖尔'); await page.getByTestId('person-card-hp-edit').click() }, 0, async () => { await page.getByTestId('person-card-hp-done').click() })
      await state('06-死亡豁免与生命骰', async () => { await page.getByRole('button', { name: '死亡豁免成功 2 次' }).click(); await page.getByRole('button', { name: /生命骰 d6 第 1 颗/ }).click() })
      await state('07-法术位与力竭2', async () => { await page.getByRole('button', { name: '增加一级力竭' }).click(); await page.getByRole('button', { name: '增加一级力竭' }).click() })
      await state('08-力竭6', async () => { for (let i = 0; i < 4; i++) await page.getByRole('button', { name: '增加一级力竭' }).click() })
      await state('09-无职业无槽-雅格拉', async () => { await callStore(page, 'people', (s, a) => s.setLive(a.id, { exhaustion: 0, hitDiceUsed: {}, hp: { deathSaves: { success: 1, fail: 0 } } }), { id: ids.galeId }); await back(page); await openPerson(page, '雅格拉') }, 0, async () => { await back(page) })
      await state('10-属性上限20-卡菈克', async () => { await openPerson(page, '卡菈克') }, 260, async () => { await back(page) })
      await state('11-档案区-全', async () => { await openPerson(page, '档案人') }, tag === '1440' ? 520 : tag === '900' ? 800 : 1020, async () => { await back(page) })
      await state('12-档案区-空', async () => { await openPerson(page, '影心') }, tag === '1440' ? 520 : tag === '900' ? 800 : 1020, async () => { await back(page) })
      await state('13-身份抽屉-有头像', async () => { await openPerson(page, '盖尔'); await page.getByTestId('person-card-name-open').click(); await page.getByTestId('identity-drawer').waitFor() }, 0, async () => { await closeModal() })
      await state('14-身份抽屉-无头像', async () => { await back(page); await openPerson(page, '影心'); await page.getByTestId('person-card-name-open').click(); await page.getByTestId('identity-drawer').waitFor() }, 0, async () => { await closeModal(); await back(page) })
      await state('15-重新截取', async () => { await openPerson(page, '盖尔'); await page.getByTestId('person-card-name-open').click(); await page.getByTestId('identity-drawer').waitFor(); await page.getByTestId('identity-recrop').click(); await page.getByTestId('recrop-page').waitFor(); await wait(page, 500) }, 0, async () => { await page.getByRole('button', { name: '取消', exact: true }).click(); await closeModal(); await back(page) })
      await state('16-添加效果', async () => { await openPerson(page, '盖尔'); await page.getByRole('button', { name: '添加其他效果' }).click(); await page.locator('.trpg-add-effect').waitFor() }, null, async () => { await page.getByRole('button', { name: '关闭添加效果' }).click(); await back(page) })
      await state('17-效果说明', async () => { await openPerson(page, '盖尔'); await page.locator('.trpg-effect-pill__name').first().click(); await wait(page, 250) }, null, async () => { await page.getByRole('button', { name: '关闭效果说明' }).click(); await back(page) })
      await state('18-页面帮助', async () => { await openPerson(page, '盖尔'); await page.locator('.trpg-card-top .trpg-card-help').click(); await wait(page, 200) }, 0, async () => { await page.getByRole('button', { name: '知道了' }).click(); await back(page) })
      await state('19-占位提示', async () => { await openPerson(page, '盖尔'); await page.getByTestId('person-card-rest').click(); await wait(page, 120) }, 0, async () => { await back(page) })
      await state('20-套用模板', async () => { await openPerson(page, '盖尔'); await page.getByTestId('person-card-template').click(); await page.getByTestId('template-picker').waitFor(); await page.getByRole('searchbox', { name: '搜模板名字' }).fill('地精'); await page.getByTestId('tpl-row-monster.goblin.mm').click(); await wait(page, 400) }, 0, async () => { await closeModal(); await back(page) })
      // 库模式：保存一张卡到未分组，再从库里打开
      await state('21-库模式', async () => {
        await openPerson(page, '盖尔')
        await callStore(page, 'people', (s, a) => s.saveToLibrary(a.id, { name: '盖尔' }), { id: ids.galeId })
        await page.getByTestId('person-card-back').click()
        await page.locator('.trpg-window nav').getByRole('button', { name: '库', exact: true }).click()
        await page.getByRole('button', { name: '我的', exact: true }).click()
        await page.getByTestId('mine-tab').waitFor()
        await page.locator('[data-testid^="mine-row-"]').filter({ hasText: '未分组（默认）' }).first().getByRole('button', { name: '编辑 ›' }).click()
        await page.getByTestId('mine-sub').waitFor()
        await page.locator('.trpg-vlist__row').filter({ hasText: '盖尔' }).first().getByRole('button', { name: '打开 ›' }).click()
        await page.getByTestId('library-person-card').waitFor()
        await wait(page, 400)
      }, 0, async () => { await page.getByTestId('library-person-card').getByRole('button', { name: '我的资料' }).click().catch(() => {}) })
      await context.close()
      console.log(`✓ ${tag}`)
    }
  } finally {
    await browser.close()
    server.close()
  }
  console.log(`截图已保存到 ${out}`)
}

await main()
