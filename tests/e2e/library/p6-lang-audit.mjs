// 中文战役「英文残留审计」（只读）：在真实结算小窗里，对官方的种族 / 背景 / 职业 / 专长各自单独建一个人，
// 再扫描三处「给人看的文字」里有没有不含中文的字符串，按字符串汇总（出现在哪些条目、哪一类位置）：
//   ① 人物数据里的名字 / 标题（物品名、进阶标题……，不含 flags）；② 建卡选项（people.buildOptions）里每一步的标题、候选名、「暂未支持」提示；
//   ③ 起始装备（people.startingEquipment）的选项文字 + 按默认选择的预演。
// 这是验收工具：改前跑一遍出清单，改后再跑对比。不改仓库任何数据，不设通过 / 失败（退出码 0），结果写 work/e2e-lib/p6-lang-audit-<内核>.json。
// 用法：ENGINE=chrome|webkit node tests/e2e/library/p6-lang-audit.mjs   （SKIP_BUILD=1 跳过构建；AUDIT_SOURCES=PHB,XPHB 改范围；AUDIT_LIMIT=每类最多条数，默认不限）
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, E2E_PORT, engines, freshFromBase, work } from './chain-common.mjs'

if (!process.env.SKIP_BUILD) await buildAll()
const engineName = process.env.ENGINE === 'webkit' ? 'webkit' : 'chrome'
const [, type, options] = engines.find((e) => e[0] === engineName)
const sources = (process.env.AUDIT_SOURCES ?? 'PHB,XPHB').split(',')
const limit = Number(process.env.AUDIT_LIMIT ?? 0)
const { server, url } = await startStatic({ port: E2E_PORT })
const profile = freshFromBase(engineName, 'p6-langaudit')
const killer = setTimeout(() => { console.error('超时 9 分钟'); process.exit(2) }, 9 * 60_000)
const ctx = await type.launchPersistentContext(profile, { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage(); page.setDefaultTimeout(9 * 60_000)
page.on('pageerror', (e) => console.error('pageerror', String(e.message ?? e).slice(0, 200)))
page.on('console', (m) => { if (m.text().startsWith('[audit]')) console.log(m.text()) })
const started = Date.now()
try {
  await page.goto(url)
  const result = await page.evaluate(async ({ sources, limit }) => {
    const h = await import('/work/e2e-lib/harness.js')
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const owner = 'char:p6langaudit.png'
    await h.userDb.workspaces.clear(); await h.userDb.saves.clear()
    await h.campaign.startNewCampaign({ ownerKey: owner, ownerLabel: '语言审计', ruleId: 'dnd5e2014', name: '语言审计' })
    await h.kernelSave.bind(owner, { rule: 'dnd5e2014', kernelVersion: 1, library, dataVersion: await h.dataVersion(), overrides: [], actors: [], revision: 0, undo: [] })
    const rt = new h.KernelRuntime({ revisions: h.revisions, pluginRoot: new URL('/', location.href), files: h.files, scoped: h.scoped, service: h.service, container: () => document.body,
      cache: { db: h.libraryDb, dataVersion: h.dataVersion }, campaignOf: async () => ({ rule: 'dnd5e2014', library, title: '语言审计' }) })
    const saves = new h.kernelSave.constructor({ ...h.kernelSave.deps, compactActors: (k, ids) => rt.compact(k, ids), mapRef: (k) => rt.mapRef(k) })
    const people = new h.KernelPeople({ runtime: rt, saves })

    const CJK = /[㐀-鿿]/
    const english = (s) => typeof s === 'string' && !CJK.test(s) && /[A-Za-z]{3}/.test(s)
    // 人物数据里要看的键：名字 / 标题 / 标签 / 备注名；flags 里是 Plutonium 的内部英文来源，不是给人看的
    const TEXT_KEYS = new Set(['name', 'title', 'label', 'displayName', 'text', 'rename'])
    const found = new Map() // 字符串 → { where: Set<'类别:位置'>, entries: Set<'种类 名字'>, byWhere: { 类别: Set<条目> } }
    const note = (str, where, entry) => {
      const s = str.trim(); if (!s) return
      const r = found.get(s) ?? { where: new Set(), entries: new Set(), byWhere: {} }
      r.where.add(where); r.entries.add(entry); (r.byWhere[where.split(':')[0]] ??= new Set()).add(entry); found.set(s, r)
    }
    const walk = (node, path, where, entry) => {
      if (Array.isArray(node)) { node.forEach((x) => walk(x, `${path}[]`, where, entry)); return }
      if (!node || typeof node !== 'object') return
      // 界面显示的是同级的中文 label（候选里的 name 只是放在中文旁边的英文小提示），这种 name 不算残留
      const labelShown = typeof node.label === 'string' && CJK.test(node.label)
      for (const [k, v] of Object.entries(node)) {
        if (k === 'flags' || k === '_stats' || k === 'raw' || (k === 'name' && labelShown)) continue
        const key = /^[A-Za-z0-9]{16}$/.test(k) ? '{id}' : k // 进阶 / 物品的键是随机编号
        if (typeof v === 'string') { if (TEXT_KEYS.has(k) && english(v)) note(v, `${where}:${path}.${k}`, entry) } else walk(v, `${path}.${key}`, where, entry)
      }
    }

    const stats = { built: 0, buildFailed: [], optionsFailed: [], startingFailed: [], previewFailed: [] }
    const rowsOf = async (prop) => (await h.scoped.query(library, prop, { expand: true })).filter((r) => sources.includes(r.item?.source))
    const props = ['race', 'background', 'class', 'feat']
    let n = 0
    for (const prop of props) {
      let rows = await rowsOf(prop)
      if (limit) rows = rows.slice(0, limit)
      console.log(`[audit] ${prop}：${rows.length} 条`)
      for (const row of rows) {
        const entry = `${prop} ${row.item.name}|${row.item.source}`
        // ① 单独建一个人，读人物数据
        const b = await rt.buildCharacter(owner, { name: '审计', items: [row.ref], blank: true }).catch((e) => ({ status: 'throw', error: String(e) }))
        if (b.status === 'complete' && b.id) {
          const data = await h.actorData((await rt.session(owner)).session, b.id)
          // 物品按类型分开记（race / class / feat / weapon / feat 里的 activity…），人物自己的键另记
          const { items = [], ...rest } = data ?? {}
          walk(rest, 'actor', '人物数据', entry)
          for (const it of items) walk(it, 'item', `人物数据:${it.type}`, entry)
          stats.built++
        } else stats.buildFailed.push(`${entry}：${b.status} ${String(b.error ?? '').slice(0, 80)}`)
        // ② 建卡选项的步骤标题
        const o = await people.buildOptions(owner, { items: [row.ref], blank: true }).catch((e) => ({ status: 'throw', error: String(e) }))
        if (o.status === 'complete') for (const it of o.items ?? []) {
          for (const s of it.steps ?? []) {
            if (english(s.title)) note(s.title, `建卡选项:步骤标题(${s.type})`, entry)
            if (s.options) walk(s.options, 'options', `建卡选项:候选(${s.type})`, entry)
          }
          for (const u of it.unsupported ?? []) if (english(u)) note(u, '建卡选项:暂未支持提示', entry)
        } else stats.optionsFailed.push(`${entry}：${o.status}`)
        // ③ 起始装备选项 + 默认选择的预演（只有职业 / 背景写着起始装备）
        if (prop === 'class' || prop === 'background') {
          const sx = await people.startingEquipment(owner, { items: [row.ref] }).catch((e) => ({ status: 'throw', error: String(e) }))
          if (sx.status === 'complete') {
            for (const sec of sx.sections ?? []) walk(sec.groups, 'groups', '起始装备选项', entry)
            const starting = {}
            for (const sec of sx.sections ?? []) starting[sec.refKey] = { choice: Object.fromEntries((sec.groups ?? []).filter((g) => g.choices.length > 1).map((g) => [g.index, g.choices[0].key])) }
            const pv = await people.startingEquipment(owner, { items: [row.ref], starting }).catch((e) => ({ status: 'throw', error: String(e) }))
            if (pv.status === 'complete') walk(pv.preview, 'preview', '起始装备预演', entry); else stats.previewFailed.push(`${entry}：${pv.status}`)
          } else stats.startingFailed.push(`${entry}：${sx.status}`)
        }
        if (++n % 20 === 0) { await rt.close(owner); await rt.session(owner); console.log(`[audit] 已处理 ${n} 条，目前 ${found.size} 个不同的英文串`) }
      }
    }
    await rt.close(owner)
    const list = [...found].map(([text, r]) => ({ text, entries: r.entries.size, where: [...r.where].slice(0, 6), sample: [...r.entries].slice(0, 4), byWhere: Object.fromEntries(Object.entries(r.byWhere).map(([k, v]) => [k, [...v].slice(0, 6)])) })).sort((a, b) => b.entries - a.entries)
    return { sources, limit, stats, count: list.length, list }
  }, { sources, limit })
  result.seconds = Math.round((Date.now() - started) / 1000)
  await writeFile(`${work}/p6-lang-audit-${engineName}.json`, JSON.stringify(result, null, 1))
  const s = result.stats
  console.log(`审计范围 ${result.sources.join('/')}，建成 ${s.built} 个人；建失败 ${s.buildFailed.length}、选项失败 ${s.optionsFailed.length}、装备失败 ${s.startingFailed.length}、预演失败 ${s.previewFailed.length}；耗时 ${result.seconds} 秒`)
  console.log(`没有中文的字符串共 ${result.count} 个（出现在越多条目里越靠前）：`)
  for (const x of result.list.slice(0, 60)) console.log(`  ${String(x.entries).padStart(4)}  ${x.text}   ← ${x.where[0]}`)
} catch (e) {
  console.error('审计流程中断：', String(e?.stack ?? e).slice(0, 900))
  process.exitCode = 1
} finally {
  clearTimeout(killer); await ctx.close(); server.close(); process.exit(process.exitCode ?? 0)
}
