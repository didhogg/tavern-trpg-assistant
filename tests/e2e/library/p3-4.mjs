// P3-4 真实【库】完整链路：安装官方数据 → 建战役 → 绑定规则/选书 → 存引用 → 打一场（写入 HP）→
// 关书报缺 → 开书完整 → 读档 → 状态/引用不丢。Chrome / WebKit 各一遍。
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { chromium, webkit } from 'playwright-core'
import { root, startStatic } from './static.mjs'

const work = `${root}work/e2e-lib`
await mkdir(work, { recursive: true })
await build({ configFile: `${root}vite.config.ts`, root, logLevel: 'error' })
await build({ configFile: false, root, logLevel: 'error', build: {
  lib: { entry: `${root}tests/e2e/library/harness.ts`, formats: ['es'], fileName: () => 'harness.js' },
  outDir: work, emptyOutDir: false,
} })
const { server, url } = await startStatic({ port: 47320 })
const engines = [
  ['chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true }],
  ['webkit', webkit, { headless: true }],
]

async function run(page) {
  return page.evaluate(async () => {
    const h = await import('/work/e2e-lib/harness.js')
    const set = await h.offlineAudit('cn-official')
    if (set.set?.status !== 'installed' || set.ok !== set.planFiles) await h.install('cn-official')
    h.service.reset()
    const parsed = await h.service.parsed('cn-official', 'spell')
    const index = parsed.items.findIndex((item, i) => item.name === '火球术' && parsed.sources[i] === 'PHB')
    if (index < 0) throw new Error('没有火球术 PHB')
    const ref = { set: 'cn-official', prop: 'spell', hash: parsed.hashes[index] }
    await h.userDb.workspaces.clear()
    await h.userDb.saves.clear()

    const owner = { ownerKey: 'char:p34.png', ownerLabel: 'P3-4' }
    const { save } = await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: 'P3-4 链路' })
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const kernel = {
      rule: 'dnd5e2014', kernelVersion: 1, library,
      dataVersion: { official: 'test', brews: {} },
      actors: [{
        id: 'hero', name: '测试角色',
        refs: [{ kind: 'spell', ...ref, label: '火球术' }],
        choices: { prepared: ['fireball'] },
        state: { actor: { _id: 'hero', system: { attributes: { hp: { value: 10 } }, spells: { spell1: { value: 2 } } } }, items: [], effects: [] },
        adjustments: { name: '测试角色' }, dice: [3, 1, 4],
      }],
      revision: 0, undo: [],
    }
    const bound = await h.kernelSave.bind(owner.ownerKey, kernel)
    const savedBefore = await h.campaign.saveCurrent(owner.ownerKey)
    const checkBefore = await h.kernelSave.check(owner.ownerKey)
    const preview = await h.kernelSave.preview(owner.ownerKey, [{
      action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.hero',
      data: { system: { attributes: { hp: { value: 4 } }, spells: { spell1: { value: 1 } } } },
    }])
    const applied = await h.kernelSave.apply(owner.ownerKey, [{
      action: 'update', type: 'Actor', pack: null, parentUuid: 'Actor.hero',
      data: { system: { attributes: { hp: { value: 4 } }, spells: { spell1: { value: 1 } } } },
    }], preview.revision)
    await h.campaign.saveCurrent(owner.ownerKey)
    const checkAfterWrite = await h.kernelSave.check(owner.ownerKey)

    const closed = { ...library, exclude: [h.entryUnit(ref)] }
    await h.kernelSave.setLibrary(owner.ownerKey, closed)
    const checkClosed = await h.kernelSave.check(owner.ownerKey)
    const refsSurvive = (await h.kernelSave.read(owner.ownerKey)).actors[0].refs.length === 1
    await h.kernelSave.setLibrary(owner.ownerKey, library)
    const checkOpen = await h.kernelSave.check(owner.ownerKey)
    await h.campaign.loadSave(owner, save.id)
    const loaded = await h.kernelSave.read(owner.ownerKey)
    const checkLoaded = await h.kernelSave.check(owner.ownerKey)
    const undo = await h.kernelSave.undo(owner.ownerKey, loaded.revision)

    return {
      bound: bound.rule,
      saved: { id: savedBefore.workspace.currentSaveId === save.id, changed: savedBefore.changed },
      checkBefore: { bound: checkBefore.bound, missing: checkBefore.missing.length, checked: checkBefore.checked },
      previewRows: preview.rows.length,
      appliedRevision: applied.kernel.revision,
      checkAfterWrite: checkAfterWrite.missing.length,
      closed: { missing: checkClosed.missing.map((m) => ({ reason: m.reason, label: m.ref.label })), refsSurvive },
      open: checkOpen.missing.length,
      loaded: { refs: loaded.actors[0].refs.length, hp: loaded.actors[0].state.actor.system.attributes.hp.value, dice: loaded.actors[0].dice },
      checkLoaded: checkLoaded.missing.length,
      undoRevision: undo?.kernel.revision,
      undoHp: undo?.kernel.actors[0].state.actor.system.attributes.hp.value,
    }
  })
}

const verdict = (o) => ({
  bound: o.bound === 'dnd5e2014',
  saved: o.saved.id && o.saved.changed,
  checkBefore: o.checkBefore.bound && o.checkBefore.missing === 0 && o.checkBefore.checked === 1,
  write: o.previewRows === 1 && o.appliedRevision === 1 && o.checkAfterWrite === 0,
  closed: o.closed.missing.length === 1 && o.closed.missing[0].reason === 'excluded' && o.closed.missing[0].label === '火球术' && o.closed.refsSurvive,
  open: o.open === 0,
  loaded: o.loaded.refs === 1 && o.loaded.hp === 4 && JSON.stringify(o.loaded.dice) === '[3,1,4]' && o.checkLoaded === 0,
  undo: o.undoRevision === 2 && o.undoHp === 10,
})

const results = []
for (const [name, type, options] of engines) {
  if (process.env.ENGINE && process.env.ENGINE !== name) continue
  const profile = `${work}/profile-p3-1-${name}`
  if (process.env.KEEP === '0') await rm(profile, { recursive: true, force: true })
  const ctx = await type.launchPersistentContext(profile, options)
  const page = await ctx.newPage()
  page.setDefaultTimeout(3600000)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.stack.split('\n').slice(0, 2).join(' | ')))
  const r = { engine: name }
  try {
    await page.goto(url)
    r.out = await run(page)
    r.verdict = verdict(r.out)
    r.passed = Object.values(r.verdict).every(Boolean)
  } catch (e) { r.fatal = e.stack; r.passed = false } finally { r.errors = errors; await ctx.close() }
  results.push(r)
  await writeFile(`${work}/p3-4-${name}.json`, JSON.stringify(r, null, 2))
  console.log(name, r.passed ? 'PASS' : 'FAIL', JSON.stringify(r.verdict ?? r.fatal))
}
server.close()
process.exit(results.every((r) => r.passed) ? 0 : 1)
