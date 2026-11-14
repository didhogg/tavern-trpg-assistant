// 自制数据 skill（tools/skills/5etools-homebrew-author）产出的包 → 导入 TRPG 助手的实测（2026-11-14，驾驶员批准按 A / B / C 做，只跑 Chrome）。
//   A 中英成对：作者怪物样例的英文版 + skill「做中文版」流程译出的中文版 → 导入预览、按语言分开导入、配成一对、中文条目对得上英文原件。
//   B 只有中文：skill「生成」流程做出的试跑包（种族 / 专长 / 法术 / 怪物 / 子职 + 2 个子职特性 / 物品）→ 导入、读回、详情。
//   C 进结算内核：建战士升到 3 级加自制子职，用自制种族建人物，加自制专长 / 物品，建自制怪物（有英文对照的 / 只有中文的）；
//     只核对“加成功、条目在、没有明显异常值”，没有标准答案可比，不证明规则数值正确。
// 注意端口：profile-p3-1-chrome 里的官方数据是按“来源（地址 + 端口）”存的，换一个没有数据的端口会报“English官方资料没装”
// （2026-11-14 单变量实验：同一个探针只换端口，47342 成功、47345 失败）。本脚本用 47340，已确认有数据；新写脚本换端口前先验证。
// 输入放在 work/p58-fixtures/（work/ 被 git 忽略；来源见该目录 README.txt）。
// 用法：node tests/e2e/library/p58-skill-brew-import.mjs（SKIP_BUILD=1 跳过构建）。结果写进 work/e2e-lib/p58-skill-brew-chrome.json。
// 基于 profile-p3-1-chrome 的副本（add-to-actor / kernel-enter 同一个底；中英官方数据都已装，含 PHB 战士），断网。
// （p57 的资料夹按这种读法读不到职业数据，b2-8a 也一样，所以没用。）
import { cp, readFile, rm, writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'
import { check, failures } from '../helpers.mjs'

const fixtures = `${work}/../p58-fixtures`
const read = (name) => readFile(`${fixtures}/${name}`, 'utf8').catch(() => { throw new Error(`缺测试输入 ${fixtures}/${name}（见该目录 README.txt）`) })
const FILES = {
  en: { name: 'Sample - Giddy; Oaken Bolter.json', text: await read('Sample - Giddy; Oaken Bolter.json') },
  zh: { name: 'Sample - Giddy; 橡木投射机.json', text: await read('Sample - Giddy; 橡木投射机.json') },
  cnOnly: { name: '试跑者; 试跑包.json', text: await read('试跑者; 试跑包.json') },
}

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome' // 默认 Chrome；ENGINE=webkit 跑 WebKit
const [, type, options] = engines[engineName === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47340 })
const profile = `${work}/profile-p58-${engineName}`
await rm(profile, { recursive: true, force: true })
await cp(`${work}/profile-p3-1-${engineName}`, profile, { recursive: true })
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(480_000)
const pageErrors = []
let curStep = ''
await page.exposeFunction('p58Step', (s) => { curStep = s })
page.on('pageerror', (e) => pageErrors.push(`[${curStep}] ${String(e.stack ?? e)}`.slice(0, 300)))
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push(`[${curStep}] console: ${m.text()}`.slice(0, 300)) })
await page.route((u) => !u.href.startsWith(url), (route) => route.abort())

let r
try {
  await page.goto(url)
  await page.waitForFunction(() => { const h = document.querySelector('#trpg-assistant-root'); const app = [...(h?.shadowRoot?.children ?? [])].map((c) => c.__vue_app__).find(Boolean); return app?.config.globalProperties.$pinia._s.get('app')?.booted })
  r = await page.evaluate(async (FILES) => {
    const out = { step: 'start', A: {}, B: {}, C: {} }
    const short = (v, n = 400) => JSON.stringify(v)?.slice(0, n)
    const at = async (s) => { out.step = s; await window.p58Step(s) }
    try {
      const host = document.querySelector('#trpg-assistant-root')
      const app = [...host.shadowRoot.children].map((c) => c.__vue_app__).find(Boolean)
      const lib = app.config.globalProperties.$pinia._s.get('app').svc().backend.library
      const b = lib.bilingual
      const library = { rule: 'dnd5e2014', codeSet: 'cn', scopes: ['5e2014'], include: ['src:giddycreature', 'src:testrunpack'], exclude: [], choices: {} }

      await at('control preview')
      const ctrl = { name: 'ctrl.json', text: JSON.stringify({ _meta: { sources: [{ json: 'P58CTRL', full: 'Ctrl', abbreviation: 'C', authors: [], version: '1' }], dateAdded: 0, dateLastModified: 0, edition: 'classic' }, spell: [{ name: 'Ctrl Spell', source: 'P58CTRL', level: 1, school: 'V', time: [{ number: 1, unit: 'action' }], range: { type: 'point', distance: { type: 'feet', amount: 30 } }, components: { v: true }, duration: [{ type: 'instant' }], entries: ['x'] }] }) }
      out.control = (await b.previewImport([ctrl])).map((x) => ({ authorErrors: x.preview.authorErrors ?? [], structure: x.preview.structure }))
      // ---------- A 中英成对 ----------
      await at('A preview')
      const pair = [FILES.en, FILES.zh]
      const prev = await b.previewImport(pair)
      out.A.preview = prev.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, authorErrors: x.preview.authorErrors ?? [], structure: x.preview.structure ?? null }))
      await at('A import')
      const imp = await b.importFiles(pair)
      out.A.import = imp.map((x) => ({ lang: x.lang, codeSet: x.codeSet, ok: x.result.ok, errors: x.result.errors ?? null }))
      await lib.brewQueue.settled()
      await at('A packs')
      const packs = await b.packs()
      out.A.packRows = packs.filter((p) => /giddycreature/i.test(p.id)).map((p) => ({ id: p.id, zh: !!p.zh, en: !!p.en }))
      await at('A counterparts')
      const zhMon = (await lib.service.query('cn-brew', 'monster')).filter((x) => x.source === 'GiddyCreature')
      const enMon = (await lib.service.query('en-brew', 'monster')).filter((x) => x.source === 'GiddyCreature')
      out.A.counts = { zhMon: zhMon.length, enMon: enMon.length }
      out.A.mon = []
      for (const row of zhMon) {
        const ref = { set: 'cn-brew', prop: 'monster', hash: row.hash }
        const d = await lib.scoped.detail(library, ref)
        const other = await b.otherEntry('cn', 'giddycreature', 'monster', { hash: row.hash })
        out.A.mon.push({ name: row.item.name, eng: row.item.ENG_name, hidden: !d || 'hidden' in d, detailEnglishStatus: d?.english?.status ?? null, otherState: other.state, otherName: other.entity?.name ?? null, otherReason: other.reason ?? null })
      }
      const zhLg = (await lib.service.query('cn-brew', 'legendaryGroup')).filter((x) => x.source === 'GiddyCreature')
      out.A.legendary = { groups: zhLg.map((x) => x.item.name), refs: zhMon.filter((x) => x.item.legendaryGroup).map((x) => x.item.legendaryGroup), resolves: zhMon.filter((x) => x.item.legendaryGroup).every((x) => zhLg.some((g) => g.item.name === x.item.legendaryGroup.name && g.source === x.item.legendaryGroup.source)) }

      // ---------- B 只有中文的试跑包 ----------
      await at('B import')
      const only = [FILES.cnOnly]
      const prevB = await b.previewImport(only)
      out.B.preview = prevB.map((x) => ({ lang: x.lang, codeSet: x.codeSet, newEntries: x.preview.newEntries, authorErrors: x.preview.authorErrors ?? [], structure: x.preview.structure ?? null }))
      const impB = await b.importFiles(only)
      out.B.import = impB.map((x) => ({ lang: x.lang, ok: x.result.ok, errors: x.result.errors ?? null }))
      await lib.brewQueue.settled()
      out.B.packRows = (await b.packs()).filter((p) => /testrunpack/i.test(p.id)).map((p) => ({ id: p.id, zh: !!p.zh, en: !!p.en }))
      await at('B read')
      out.B.entries = {}
      for (const prop of ['race', 'feat', 'spell', 'monster', 'subclass', 'subclassFeature', 'item']) {
        const rows = (await lib.service.query('cn-brew', prop)).filter((x) => x.source === 'TestRunPack')
        const list = []
        for (const row of rows) {
          const d = await lib.scoped.detail(library, { set: 'cn-brew', prop, hash: row.hash })
          list.push({ name: row.item.name, eng: row.item.ENG_name ?? null, hidden: !d || 'hidden' in d, isCopy: !!row.item._isCopy, className: row.item.className ?? null, classSource: row.item.classSource ?? null, hash: row.hash })
        }
        out.B.entries[prop] = list
      }

      // ---------- C 进结算内核 ----------
      await at('C setup')
      const h = await import('/work/e2e-lib/harness.js')
      const lib2 = { ...h.defaultCampaignLibrary('dnd5e2014', 'cn'), include: ['src:giddycreature', 'src:testrunpack'] }
      const pick = async (set, prop, book, pred) => {
        const p = await h.service.parsed(set, prop)
        for (let i = 0; i < p.items.length; i++) {
          if (book && p.sources[i] !== book) continue
          if (!pred(p.items[i])) continue
          const ref = { set, prop, hash: p.hashes[i] }
          const d = await h.scoped.detail(lib2, ref)
          if (d && !('hidden' in d) && (!book || d.english?.status === 'found')) return { ref, label: p.items[i].name }
        }
        return null
      }
      const mine = async (prop, name) => pick('cn-brew', prop, null, (it) => it.name === name && it.source === 'TestRunPack')
      const fighter = await pick('cn-official', 'class', 'PHB', (it) => it.name === '战士')
      const human = await pick('cn-official', 'race', 'PHB', (it) => !!it.size && !String(it.name).includes('('))
      const bg = await pick('cn-official', 'background', 'PHB', (it) => !!it.skillProficiencies || !!it.entries)
      const mRace = await mine('race', '月影猫人')
      const mFeat = await mine('feat', '老练斥候')
      const subRows = (await h.service.parsed('cn-brew', 'subclass'))
      const subs = subRows.items.map((it, i) => ({ it, hash: subRows.hashes[i] })).filter((x) => x.it.name === '月影斥候' && x.it.source === 'TestRunPack')
      const subOrig = subs.find((x) => !x.it._isCopy)
      const subCopy = subs.find((x) => x.it._isCopy)
      const mSub = subOrig ? { ref: { set: 'cn-brew', prop: 'subclass', hash: subOrig.hash }, label: '月影斥候' } : null
      const mSubCopy = subCopy ? { ref: { set: 'cn-brew', prop: 'subclass', hash: subCopy.hash }, label: '月影斥候（副本）' } : null
      out.C.subRows = subs.map((x) => ({ isCopy: !!x.it._isCopy, className: x.it.className, classSource: x.it.classSource }))
      const mItem = await mine('item', '月光灯笼')
      const mSpell = await mine('spell', '月光烛')
      const mMon = await mine('monster', '月影猫')
      const oMon = zhMon[0] ? { ref: { set: 'cn-brew', prop: 'monster', hash: zhMon[0].hash }, label: zhMon[0].item.name } : null
      out.C.picked = { fighter: !!fighter, human: !!human, bg: !!bg, mRace: !!mRace, mFeat: !!mFeat, mSub: !!mSub, mItem: !!mItem, mSpell: !!mSpell, mMon: !!mMon, oMon: !!oMon }
      const owner = { ownerKey: 'char:p58.png', ownerLabel: 'P58 自制导入' }
      await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
      await h.campaign.startNewCampaign({ ...owner, ruleId: 'dnd5e2014', name: owner.ownerLabel })
      await h.kernelSave.bind(owner.ownerKey, { rule: 'dnd5e2014', kernelVersion: 1, library: lib2, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
      const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, container: () => document.body,
        cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library: lib2, title: owner.ownerLabel }) })
      const bad = /@classes\.\.|undefined|NaN|\[object Object\]/
      const summary = async (id) => {
        const session = (await rt.session(owner.ownerKey)).session
        const a = await h.actorData(session, id)
        const text = JSON.stringify(a)
        const s = a.system ?? {}
        return {
          name: a.name, items: a.items.map((i) => `${i.type}:${i.name}`), speed: s.attributes?.movement?.walk ?? null, senses: s.attributes?.senses ?? null,
          abilities: s.abilities ? Object.fromEntries(Object.entries(s.abilities).map(([k, v]) => [k, v.value])) : null, classes: a.items.filter((i) => i.type === 'class').map((i) => ({ name: i.name, levels: i.system?.levels })),
          subclasses: a.items.filter((i) => i.type === 'subclass').map((i) => i.name), suspicious: [...new Set(text.match(new RegExp(bad.source, 'g')) ?? [])],
        }
      }
      const guard = async (fn) => { try { return await fn() } catch (e) { return { thrown: String(e?.stack ?? e).slice(0, 400) } } }

      await at('C hero1 fighter')
      const hero1 = await rt.buildCharacter(owner.ownerKey, { name: 'P58 战士', items: [human.ref, bg.ref, fighter.ref], equipment: [] })
      out.C.hero1 = { status: hero1.status, error: hero1.error ?? null }
      const id1 = hero1.id
      const sess = (await rt.session(owner.ownerKey)).session
      const cls = (await h.actorData(sess, id1)).items.find((i) => i.type === 'class')
      await at('C level up')
      out.C.levelUp = []
      for (let k = 0; k < 2; k++) out.C.levelUp.push(await guard(async () => { const u = await sess.call('levelUpApply', id1, cls._id, 1); return { status: u.status, level: u.result?.level ?? null, error: u.error ?? null } }))
      await at('C add subclass')
      out.C.addSub = await guard(async () => { const a = await rt.addToActor(owner.ownerKey, id1, [mSub.ref]); return { status: a.status, error: a.error ?? null, noEnglish: a.noEnglish?.map((x) => x.prop) ?? null, added: a.result?.added?.map((i) => `${i.type}:${i.name}`) ?? null, detail: a.status === 'complete' ? null : short(a.detail, 300) } })
      await at('C add official subclass (control)')
      // 对照：同一个入口 addToActor 加一个官方 PHB 战士子职，看这个入口本身支不支持加子职
      const offSubs = (await h.service.parsed('cn-official', 'subclass'))
      const offIdx = offSubs.items.findIndex((it, i) => offSubs.sources[i] === 'PHB' && !it._isCopy && (it.className === '战士' || it.className === 'Fighter'))
      const offRef = offIdx >= 0 ? { set: 'cn-official', prop: 'subclass', hash: offSubs.hashes[offIdx] } : null
      out.C.addOfficialSub = offRef ? await guard(async () => { const a = await rt.addToActor(owner.ownerKey, id1, [offRef]); return { name: offSubs.items[offIdx].name, className: offSubs.items[offIdx].className, status: a.status, error: a.error ?? null, noEnglish: a.noEnglish?.map((x) => x.prop) ?? null, added: a.result?.added?.map((i) => `${i.type}:${i.name}`) ?? null } }) : { notFound: true }
      await at('C add subclass copy (observe)')
      out.C.addSubCopy = mSubCopy ? await guard(async () => { const a = await rt.addToActor(owner.ownerKey, id1, [mSubCopy.ref]); return { status: a.status, error: a.error ?? null } }) : null
      await at('C add feat/item/spell')
      out.C.addFeat = await guard(async () => { const a = await rt.addToActor(owner.ownerKey, id1, [mFeat.ref]); return { status: a.status, error: a.error ?? null, noEnglish: a.noEnglish?.map((x) => x.prop) ?? null, added: a.result?.added?.map((i) => `${i.type}:${i.name}`) ?? null, detail: a.status === 'complete' ? null : short(a.detail, 500) } })
      out.C.addItem = await guard(async () => { const a = await rt.addToActor(owner.ownerKey, id1, [mItem.ref]); return { status: a.status, error: a.error ?? null, noEnglish: a.noEnglish?.map((x) => x.prop) ?? null, added: a.result?.added?.map((i) => `${i.type}:${i.name}`) ?? null } })
      out.C.addSpell = await guard(async () => { const a = await rt.addToActor(owner.ownerKey, id1, [mSpell.ref]); return { status: a.status, error: a.error ?? null, noEnglish: a.noEnglish?.map((x) => x.prop) ?? null, added: a.result?.added?.map((i) => `${i.type}:${i.name}`) ?? null } })
      out.C.hero1Summary = await guard(() => summary(id1))

      await at('C hero2 custom race')
      const hero2 = await rt.buildCharacter(owner.ownerKey, { name: 'P58 猫人', items: [mRace.ref, bg.ref, fighter.ref], equipment: [] })
      out.C.hero2 = { status: hero2.status, error: hero2.error ?? null, noEnglish: hero2.noEnglish?.map((x) => x.prop) ?? null, detail: hero2.status === 'complete' ? null : short(hero2.detail, 300) }
      out.C.hero2Summary = hero2.id ? await guard(() => summary(hero2.id)) : null

      await at('C monsters')
      for (const [key, m] of [['monsterPaired', oMon], ['monsterCnOnly', mMon]]) {
        out.C[key] = await guard(async () => {
          const c = await rt.createActors(owner.ownerKey, [m.ref])
          return { status: c.status, error: c.error ?? null, noEnglish: c.noEnglish?.map((x) => x.prop) ?? null, actorKeys: Object.keys(c.actors?.[0] ?? {}).slice(0, 14), actors: (c.actors ?? []).map((a) => ({ name: a.name ?? a.data?.name ?? null, id: a.id ?? a._id ?? a.data?._id ?? null, items: (a.items ?? a.data?.items ?? []).length, hp: (a.system ?? a.data?.system)?.attributes?.hp?.max ?? null })), suspicious: [...new Set(JSON.stringify(c.actors ?? []).match(new RegExp(bad.source, 'g')) ?? [])] }
        })
      }
      await rt.closeAllExcept(null)
      await at('done')
    } catch (e) { out.error = String(e?.stack ?? e).slice(0, 1500) }
    return out
  }, FILES)
} finally {
  await writeFile(`${work}/p58-skill-brew-${engineName}.json`, JSON.stringify({ r, pageErrors }, null, 2))
}

if (r.error) { console.log('STEP', r.step, r.error); await ctx.close(); server.close(); process.exit(1) }
const { A, B, C, control } = r
const NET = /Network error during JSON request|请求 JSON 时发生网络错误/
const nonNet = (errs) => (errs ?? []).filter((e) => !NET.test(e))
const structOk = (x) => (x.structure ?? []).every((f) => f.ok && !f.issues?.length)
const named = (rows, name) => rows?.find((x) => x.name === name)
const hasStep = (v) => v && !v.thrown
// 观察（不是断言）：有英文版的自制包，内核仍交中文条目——scoped.englishOf 只认官方配对，自制配对在 counterparts / brewPairs
console.log('观察 断网噪声对照：合成的最小包预览也有 authorErrors', JSON.stringify({ control: control[0].authorErrors.length, a: A.preview.map((x) => x.authorErrors.length), b: B.preview.map((x) => x.authorErrors.length) }))
check('A 预览：中文文件进中文那套、英文进英文那套', JSON.stringify([...A.preview.map((x) => `${x.lang}>${x.codeSet}`)].sort()) === JSON.stringify(['en>en', 'zh>cn']), JSON.stringify(A.preview.map((x) => [x.lang, x.codeSet])))
check('A 预览：作者结构校验两个文件都通过', A.preview.every(structOk), JSON.stringify(A.preview.map((x) => x.structure)))
check('A 预览：除断网的“网络请求失败”外没有别的作者错误（合成的最小包有同样的噪声）', A.preview.every((x) => !nonNet(x.authorErrors).length) && !nonNet(control[0].authorErrors).length && control[0].authorErrors.length > 0, JSON.stringify({ a: A.preview.map((x) => nonNet(x.authorErrors)), c: control[0].authorErrors }))
check('A 导入：两边都成功', A.import.every((x) => x.ok), JSON.stringify(A.import.map((x) => [x.lang, x.ok])))
check('A 配对：同一个包里中文、英文都有', A.packRows.length === 1 && A.packRows[0].zh && A.packRows[0].en, JSON.stringify(A.packRows))
check('A 条目数：中文 3 个怪物、英文 3 个怪物', A.counts.zhMon === 3 && A.counts.enMon === 3, JSON.stringify(A.counts))
check('A 每个中文怪物都能找到英文原件（界面用的 otherEntry），英文名等于 ENG_name', A.mon.length === 3 && A.mon.every((m) => !m.hidden && m.otherState === 'found' && m.otherName === m.eng), JSON.stringify(A.mon))
check('A 传说组引用能解析到同包的顶层传说组', A.legendary.resolves, JSON.stringify(A.legendary))
check('B 导入成功，包里只有中文', B.import.every((x) => x.ok) && B.packRows.length === 1 && B.packRows[0].zh && !B.packRows[0].en, JSON.stringify({ i: B.import, p: B.packRows }))
check('B 预览：作者结构校验通过', B.preview.every(structOk), JSON.stringify(B.preview.map((x) => x.structure)))
const want = { race: ['月影猫人', 1], feat: ['老练斥候', 1], spell: ['月光烛', 1], monster: ['月影猫', 1], subclassFeature: ['月下潜行', 1], item: ['月光灯笼', 1] }
check('B 种族 / 专长 / 法术 / 怪物 / 子职特性 / 物品都读得回来（名字、不隐藏）', Object.entries(want).every(([p, [n]]) => named(B.entries[p], n) && !named(B.entries[p], n).hidden), JSON.stringify(B.entries))
check('B 子职读得回来：原件 1 个（作者加载器另造的 _isCopy 副本不算）', B.entries.subclass.filter((x) => !x.isCopy).length === 1 && !B.entries.subclass.find((x) => !x.isCopy).hidden, JSON.stringify(B.entries.subclass.map((x) => [x.name, x.isCopy, x.className, x.classSource])))
check('B 每个条目都带 ENG_name', Object.values(B.entries).flat().every((x) => typeof x.eng === 'string' && x.eng), JSON.stringify(Object.values(B.entries).flat().map((x) => [x.name, x.eng])))
check('C 战士建成、升到 3 级（两次升级都成功）', C.hero1.status === 'complete' && C.levelUp.every((u) => hasStep(u) && u.status === 'complete'), JSON.stringify({ h: C.hero1, u: C.levelUp }))
// 自制子职加不到人物上：Plutonium 收到子职时会去自己的数据缓存（raw_subclass）取这个子职的原始数据，结算内核的数据源只有官方文件，
// 取不到 → null.classSource。2026-11-14 对照实验：试跑 AI 写的子职五种写法（中文 / 英文 shortName、有 / 无 3 级介绍特性、全英文）全部失败，
// 作者仓库里别人写的真实自制子职（Cosmic Domain）同样失败，官方子职（战斗大师）同一入口成功。所以是插件现有限制，不是生成写法的问题。
console.log('观察 自制子职加到人物（插件现有限制，作者真实自制子职同样失败）：', JSON.stringify({ addSub: C.addSub?.status, error: C.addSub?.error, 官方子职同入口: C.addOfficialSub?.status }))
check('C 对照成立：官方 PHB 战士子职同一入口 addToActor 成功（入口本身支持子职）', C.addOfficialSub?.status === 'complete' && (C.addOfficialSub?.added ?? []).some((x) => x.startsWith('subclass:')), JSON.stringify(C.addOfficialSub))
check('C 加自制专长：完成，或停在“需要选择”（专长有二选一的属性加值，要用户在小窗里选）', hasStep(C.addFeat) && ['complete', 'pending'].includes(C.addFeat.status), JSON.stringify(C.addFeat))
check('C 加自制物品、法术成功', hasStep(C.addItem) && C.addItem.status === 'complete' && hasStep(C.addSpell) && C.addSpell.status === 'complete', JSON.stringify({ i: C.addItem, s: C.addSpell }))
check('C 自制种族建人物成功，敏捷 +2 生效（10 → 12）', C.hero2?.status === 'complete' && C.hero2Summary?.items?.includes('race:月影猫人') && C.hero2Summary?.abilities?.dex === 12, JSON.stringify({ h: C.hero2, s: C.hero2Summary }))
check('C 两个人物里没有明显异常值（@classes..、undefined、NaN、[object Object]）', !C.hero1Summary?.suspicious?.length && !C.hero2Summary?.suspicious?.length, JSON.stringify({ a: C.hero1Summary?.suspicious, b: C.hero2Summary?.suspicious }))
check('C 自制怪物建成（有英文版的 / 只有中文的）', C.monsterPaired?.status === 'complete' && C.monsterPaired.actors?.length === 1 && C.monsterCnOnly?.status === 'complete' && C.monsterCnOnly.actors?.length === 1, JSON.stringify({ p: C.monsterPaired, c: C.monsterCnOnly }))
console.log('观察 对照：官方 PHB 战士子职用同一个入口 addToActor 加：', JSON.stringify(C.addOfficialSub))
console.log('观察 子职副本（_isCopy）加到人物：', JSON.stringify(C.addSubCopy), '；子职两行：', JSON.stringify(C.subRows))
console.log('观察 内核交的条目：', JSON.stringify({ 自制种族: C.hero2?.noEnglish, 有英文版的怪物: C.monsterPaired?.noEnglish, 只有中文的怪物: C.monsterCnOnly?.noEnglish }), '（["race"] 这类 = 交的是中文条目、标“无英文对照”）')
// local-set 只读错误：导入任何一个自制包（连合成的最小英文包也一样）之后，读包列表 / 查询时作者小窗都会请求写本地存储，被只读的库版本拒绝；
// 不导入时是 0 条（2026-11-14 探针，四个场景）。是插件现象，和 skill 生成的文件无关，这里只记数，不算失败。
const localSet = pageErrors.filter((m) => /local-set/.test(m))
console.log(`观察 local-set 只读错误 ${localSet.length} 条（导入任何自制包后都会有；与 skill 生成的文件无关，见探针）`)
// 预期内的 Plutonium 报错（都已有对照实验）：自制子职导入失败（上面的限制）；试跑包里的专长没有 list 类型条目，Plutonium 合并属性加值时报错
const plutoniumExpected = pageErrors.filter((m) => /Task ".*failed!|Could not find object of type "list"/.test(m))
console.log(`观察 预期内的 Plutonium 报错 ${plutoniumExpected.length} 条（自制子职导入失败；专长缺 list 条目——补上 list 后该报错消失，专长仍停在 pending 等用户选属性，官方同类专长也是 pending）`)
const realErrors = pageErrors.filter((m) => !/Task ".*failed!|Could not find object of type "list"|local-set|网络错误|Network error|gendata-nav-adventure-book-index|requires usable window dimensions|status of 404|api\/plutonium|Failed to load resource/.test(m))
check('页面没有未处理的错误（断网预期的除外）', realErrors.length === 0, realErrors.slice(0, 4).join(' | '))
await ctx.close()
server.close()
console.log(failures.length ? `FAIL ${failures.length}（见 work/e2e-lib/p58-skill-brew-chrome.json）` : 'ALL PASS')
process.exit(failures.length ? 1 : 0)
