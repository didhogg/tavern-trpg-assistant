// G1：升级场景——模拟真实设备：新扩展 + 已装旧版书（数据仓库提交 a6a22e5 的 1.0.x 包）+ 旧目录 → 目录更新后检查更新 → 全部更新 → 内容出现。
// 只用 E2E_SUITE=upgrade 单独跑（它会把书装成旧版，不能和别的套件混在同一个页面里）。
import { execFileSync } from 'node:child_process'
import { basename } from 'node:path'
import { check, clearToasts, gotoPage, settle } from './helpers.mjs'

const DATA_REPO = process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data'
const OLD_COMMIT = 'a6a22e5'
const git = (...args) => execFileSync('git', ['-C', DATA_REPO, ...args], { maxBuffer: 1 << 28 })

/** 旧目录与旧包文件：从数据仓库的 git 历史里读出，地址改到本地模拟路径。 */
function loadOld() {
  const catalog = JSON.parse(git('show', `${OLD_COMMIT}:catalog.json`).toString('utf8'))
  const files = new Map()
  catalog.packs = catalog.packs.map((p) => {
    const name = basename(p.url)
    files.set(name, git('show', `${OLD_COMMIT}:packs/dnd5e2014/${name}`))
    return { ...p, url: `/mock-data/old-packs/${name}` }
  })
  return { catalog, files }
}

/** 页面打开之前调用：目录与包文件都给旧版。 */
export async function upgradeSetup(page) {
  const old = loadOld()
  await page.route('**/mock-data/catalog.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(old.catalog) }))
  await page.route('**/mock-data/old-packs/*', (route) => {
    const body = old.files.get(basename(new URL(route.request().url()).pathname))
    return body ? route.fulfill({ status: 200, contentType: 'application/octet-stream', body }) : route.fulfill({ status: 404 })
  })
  return old
}

async function startWithOldBooks(page) {
  await page.getByTestId('start-banner').waitFor({ timeout: 30000 })
  await page.getByTestId('start-banner').click()
  await page.getByTestId('wizard').waitFor()
  await settle(page, 600)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('wizard-pack-dnd5e2014-phb').waitFor({ timeout: 30000 })
  await page.waitForFunction(() => {
    const r = document.getElementById('trpg-assistant-root').shadowRoot
    const metas = [...r.querySelectorAll('.trpg-wizard .trpg-row__meta')].map((e) => e.textContent)
    return metas.length >= 10 && !metas.some((t) => t.includes('未安装')) && !r.querySelector('.trpg-progress')
  }, null, { timeout: 120000 })
  await page.getByTestId('wizard-next').click()
  await settle(page, 600)
  await page.getByTestId('wizard-next').click()
  await page.getByTestId('banner-title').waitFor({ timeout: 60000 })
}

async function openEntry(page, pack, name) {
  await closeAll(page)
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByTestId(`ext-${pack}`).locator('.trpg-term').click()
  await page.getByTestId('pack-detail').waitFor()
  await page.getByRole('searchbox', { name: '搜索条目' }).fill(name)
  await page.locator('.trpg-vlist, .trpg-empty').first().waitFor({ timeout: 20000 })
  await settle(page, 400)
  const rows = page.locator('.trpg-vlist__row .trpg-term')
  let hit = -1
  for (let i = 0, n = await rows.count(); i < n; i++) if ((await rows.nth(i).innerText()).trim() === name) { hit = i; break }
  if (hit < 0) return ''
  await rows.nth(hit).click()
  await page.getByTestId('entry-detail').last().waitFor()
  await settle(page, 500)
  return page.getByTestId('entry-detail').last().innerText()
}

async function closeAll(page) {
  for (let i = 0; i < 8 && (await page.locator('.trpg-modal').count()); i++) { await page.keyboard.press('Escape'); await settle(page, 250) }
}

export async function upgradeSuite(page, label) {
  await startWithOldBooks(page)
  await clearToasts(page)
  const ext = async () => { await gotoPage(page, '库'); await page.getByRole('button', { name: '扩展', exact: true }).click() }
  const tceRow = () => page.getByTestId('ext-dnd5e2014-tce')

  // ① 旧书 + 旧目录：塔莎是 v1.0.1，没有更新提示；牧师页没有「可选特性」，也没有「需要《」
  await ext()
  check(`[${label}] 旧书：塔莎是 v1.0.1`, (await tceRow().innerText()).includes('v1.0.1'))
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '本存档', exact: true }).click()
  await settle(page, 500)
  check(`[${label}] 旧目录与已装版本相同：「本存档」页没有更新提示`, (await page.getByTestId('update-banner').count()) === 0)
  const oldCleric = await openEntry(page, 'dnd5e2014-srd', '牧师')
  check(`[${label}] 旧书：牧师页没有「可选特性」一行，也没有「需要《」`, oldCleric.length > 0 && !oldCleric.includes('可选特性') && !/需要《/.test(oldCleric))
  const oldAboleth = await openEntry(page, 'dnd5e2014-srd', '底栖魔鱼')
  check(`[${label}] 旧书：底栖魔鱼没有「背景描述」`, oldAboleth.length > 0 && !oldAboleth.includes('背景描述'))
  await closeAll(page)

  // ② 目录更新（撤掉拦截，相当于数据仓库发了新版）：点「检查更新」→ 提示条、列表标注
  await page.unroute('**/mock-data/catalog.json')
  await page.unroute('**/mock-data/old-packs/*')
  await ext()
  await clearToasts(page)
  await page.getByTestId('check-updates').click()
  await page.getByText(/个资料包有新版本/).first().waitFor({ timeout: 20000 })
  check(`[${label}] 检查更新：提示「有 N 个资料包有新版本」`, true)
  const note = await tceRow().getByTestId('update-note').innerText()
  check(`[${label}] 列表里塔莎标注「有新版本 v1.3.0」与「旧版数据」`, note.includes('有新版本 v1.3.0') && note.includes('旧版数据'), note)
  await gotoPage(page, '库')
  await page.getByRole('button', { name: '本存档', exact: true }).click()
  await page.getByTestId('update-banner').waitFor({ timeout: 10000 })
  const banner = await page.getByTestId('update-banner').innerText()
  check(`[${label}] 「本存档」页顶部有更新提示条：有 10 个资料包有新版本`, banner.includes('有 10 个资料包有新版本'), banner)

  // ③ 全部更新：等塔莎变成 v1.3.0
  await page.getByTestId('update-all').click()
  await page.waitForFunction(() => {
    const row = document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid="save-pack-dnd5e2014-tce"], [data-testid="ext-dnd5e2014-tce"]')
    return !!row
  }, null, { timeout: 10000 })
  await ext()
  await page.waitForFunction(() => {
    const row = document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid="ext-dnd5e2014-tce"]')
    return !!row && row.textContent.includes('v1.3.0')
  }, null, { timeout: 180000 })
  await page.waitForFunction(() => !document.getElementById('trpg-assistant-root').shadowRoot.querySelector('[data-testid="update-note"]'), null, { timeout: 180000 })
  check(`[${label}] 全部更新：塔莎是 v1.3.0，所有包的更新标注消失`, (await tceRow().innerText()).includes('v1.3.0') && (await page.getByTestId('update-note').count()) === 0)

  // ④ 更新后：牧师页出现塔莎登记的可选特性；底栖魔鱼出现背景描述
  const newCleric = await openEntry(page, 'dnd5e2014-srd', '牧师')
  check(`[${label}] 更新后：牧师页有「可选特性」一行，写着「神力掌控」与「塔莎的万事坩埚」，没有括号说明与编号`, newCleric.includes('可选特性') && newCleric.includes('神力掌控') && newCleric.includes('塔莎的万事坩埚') && !/需要《|可选 ·|feature\./.test(newCleric))
  const newAboleth = await openEntry(page, 'dnd5e2014-srd', '底栖魔鱼')
  check(`[${label}] 更新后：底栖魔鱼有「背景描述」一节`, newAboleth.includes('背景描述'))
  await closeAll(page)
}
