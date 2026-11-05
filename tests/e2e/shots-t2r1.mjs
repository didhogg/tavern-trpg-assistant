// U5R2 T2r-1 截图（标准数组/购点保留、加减控件）：npx tsx tests/e2e/shots-t2r1.mjs ；SHOT_SIZE=1440|390、SHOT_SCHEME=light|dark
// 环境变量：SHOT_SIZE=1440|900|390、SHOT_SCHEME=light|dark、SHOT_ONLY=关键字。
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import { root, startServer } from './server.mjs'
import { callStore } from './store.mjs'
import { emptyBlock, emptyPerson } from '../../src/ui/people/fromEntry'

const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const out = join(root, 'docs/probes/U5R2_T2r1_截图')
mkdirSync(out, { recursive: true })
const allSizes = [['1440', 1440, 900], ['390', 390, 780]]
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
    nameEn: 'Gale', avatar, hp: { current: 12, temp: 3, deathSaves: { success: 1, fail: 0 } }, effects: [{ id: 'fx-1', ref: 'spell.bless.phb', category: 'spell', name: '祝福术', duration: { type: 'timed', amount: 1, unit: 'minute', concentration: true }, concentration: true, effects: [{ kind: 'rollBonus', on: 'save', dice: '1d4' }], addedAt: now }, { id: 'fx-2', category: 'condition', name: '目盲', concentration: false, addedAt: now }],
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
async function openPerson(page, name) {
  if (await page.getByTestId('person-card-back').count()) { await page.getByTestId('person-card-back').click(); await page.getByTestId('people-page').waitFor() }
  await page.getByTestId('people-category-all').click()
  await row(page, name).click()
  await page.getByTestId('person-card').waitFor()
  await page.getByTestId('person-card-abilities').waitFor()
  await wait(page, 500)
}



const NAME = '卡牌测试'
const srdPerson = () => ({
  id: `p-srd-${Date.now()}`, name: NAME, nameEn: 'Card Test', categoryId: 'party', tags: [], pinned: false,
  hp: { current: 12, temp: 3, deathSaves: { success: 1, fail: 0 } }, effects: [],
  block: { ...emptyBlock(), classes: [{ class: 'class.wizard.phb', level: 3 }], race: 'race.human.phb', abilities: { str: 8, dex: 14, con: 12, int: 18, wis: 12, cha: 10 } },
  giveAi: 'auto', createdAt: Date.now(), touchedAt: Date.now(),
})

async function shoot(page, name, tag, scheme) {
  await page.emulateMedia({ colorScheme: scheme })
  await wait(page, 200)
  await page.screenshot({ path: join(out, `${name}-${tag}-${scheme}.png`) })
}

async function main() {
  const { server, url } = await startServer()
  const browser = await chromium.launch({ executablePath: chrome, headless: true })
  try {
    for (const [tag, width, height] of sizes) {
      // ── A：装了 PHB 等包 ──
      {
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: 'light' })
        const page = await context.newPage()
        await page.addInitScript(() => localStorage.setItem('trpg-assistant:window', JSON.stringify({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight })))
        page.on('pageerror', (e) => console.error('pageerror', e.message))
        await setup(page, url)
        await seed(page)
        await openPerson(page, '盖尔')
        await page.getByTestId('person-card-abilities-edit').click()
        await page.getByTestId('ab-row-str').waitFor()
        await wait(page, 500)
        for (const scheme of schemes) await shoot(page, '01-PHB-标准数组', tag, scheme)
        await page.getByRole('button', { name: '购点', exact: true }).click(); await wait(page, 400)
        for (const scheme of schemes) await shoot(page, '02-PHB-购点', tag, scheme)
        const plus = (n) => page.locator('.trpg-ab__row [aria-label$="基础 加一"]').nth(n)
        await plus(0).click(); await plus(0).click(); await plus(1).click(); await wait(page, 300)
        for (const scheme of schemes) await shoot(page, '03-PHB-购点-已加点', tag, scheme)
        await context.close()
      }
      // ── B：只装 SRD ──
      {
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: 'light' })
        const page = await context.newPage()
        await page.addInitScript(() => localStorage.setItem('trpg-assistant:window', JSON.stringify({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight })))
        page.on('pageerror', (e) => console.error('pageerror', e.message))
        await page.addInitScript(() => { window.__name = (f) => f })
        await page.goto(url)
        await page.locator('.trpg-ball').click()
        for (let i = 0; i < 60 && !(await callStore(page, 'campaign', (s) => !!s.owner)); i++) await page.waitForTimeout(250)
        await callStore(page, 'campaign', (s) => s.startNew({ ruleId: 'dnd5e2014', packIds: [], name: 'SRD' }))
        await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).waitFor({ timeout: 30000 })
        await page.locator('.trpg-window nav').getByRole('button', { name: '人物', exact: true }).click()
        await page.getByTestId('people-page').waitFor()
        await callStore(page, 'people', (s, p) => s.create(p), srdPerson())
        await wait(page, 500)
        await openPerson(page, NAME)
        await page.getByTestId('person-card-abilities-edit').click()
        await page.getByTestId('ab-row-str').waitFor()
        await wait(page, 500)
        for (const scheme of schemes) await shoot(page, '04-只装SRD-标准数组', tag, scheme)
        await page.getByRole('button', { name: '购点', exact: true }).click(); await wait(page, 400)
        const plus = (n) => page.locator('.trpg-ab__row [aria-label$="基础 加一"]').nth(n)
        await plus(0).click(); await plus(0).click(); await plus(1).click(); await wait(page, 300)
        for (const scheme of schemes) await shoot(page, '05-只装SRD-购点', tag, scheme)
        await context.close()
      }
    }
  } finally {
    await browser.close()
    server.close()
  }
}

await main()
