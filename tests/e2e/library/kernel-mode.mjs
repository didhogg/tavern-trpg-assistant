// 结算模式验证（src/rules/kernel/input.ts 的 KERNEL_MODE_SETTINGS）：插件正式启动设置 vs 去掉结算模式的默认设置，
// 两个结算小窗导入同一批【库】真实条目（8 类，每类最多 LIMIT 条，由【库】数据决定），逐项比，只排除图片字段与随机编号。
// 通过 = 每类全部一致。同时报两边用时。ENGINE=webkit 换浏览器。
import { join } from 'node:path'
import { writeFile } from 'node:fs/promises'
import { startStatic } from './static.mjs'
import { buildAll, engines, work } from './chain-common.mjs'

await buildAll()
const LIMIT = Number(process.env.LIMIT ?? 40)
const [, type, options] = engines[process.env.ENGINE === 'webkit' ? 1 : 0]
const { server, url } = await startStatic({ port: 47341 })
const ctx = await type.launchPersistentContext(join(work, `profile-p3-1-${process.env.ENGINE ?? 'chrome'}`), { ...options, viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
page.setDefaultTimeout(600000)
try {
  await page.goto(url)
  const result = await page.evaluate(async (LIMIT) => {
    const h = await import('/work/e2e-lib/harness.js')
    const mode = await h.kernelInput({ pluginRoot: new URL('/', location.href), rule: 'dnd5e2014', world: { id: 'kernel-mode', title: 'kernel-mode' } })
    const base = structuredClone(mode)
    delete base.settings['plutonium.config']
    for (const id of ['cn-official', 'en-official']) {
      const audit = await h.offlineAudit(id)
      if (audit.set?.status !== 'installed' || audit.ok !== audit.planFiles) await h.install(id)
    }
    h.service.reset()
    for (const u of ['src:phb', 'src:mm', 'src:dmg']) await h.scoped.setAssignment(u, null)
    const library = h.defaultCampaignLibrary('dnd5e2014', 'cn')
    const pick = async (prop, books) => {
      const p = await h.service.parsed('cn-official', prop)
      const out = []
      for (let i = 0; i < p.items.length && out.length < LIMIT; i++) {
        if (!books.includes(p.sources[i])) continue
        const d = await h.scoped.detail(library, { set: 'cn-official', prop, hash: p.hashes[i] })
        if (d && !('hidden' in d) && d.english?.status === 'found') out.push({ prop, label: p.items[i].name, entry: d.english.item })
      }
      return out
    }
    const groups = {
      race: await pick('race', ['PHB']), background: await pick('background', ['PHB']), class: await pick('class', ['PHB']),
      item: await pick('item', ['PHB', 'DMG']), spell: await pick('spell', ['PHB']), feat: await pick('feat', ['PHB']),
      optionalfeature: await pick('optionalfeature', ['PHB']), monster: await pick('monster', ['MM']),
    }
    const A = (await h.startKernelSession(base)).session
    const B = (await h.startKernelSession(mode)).session
    const IMAGE_KEYS = new Set(['img', 'src'])
    const diff = (a, b, path = '', out = []) => {
      if (out.length > 10 || a === b) return out
      const last = path.split('.').pop()
      if (IMAGE_KEYS.has(last)) return out
      const ta = a === null ? 'null' : Array.isArray(a) ? 'array' : typeof a
      const tb = b === null ? 'null' : Array.isArray(b) ? 'array' : typeof b
      if (ta !== tb) { out.push({ path, a, b }); return out }
      if (ta === 'array') { if (a.length !== b.length) { out.push({ path: path + '.length', a: a.length, b: b.length }); return out } a.forEach((x, i) => diff(x, b[i], `${path}[${i}]`, out)); return out }
      if (ta === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], path ? `${path}.${k}` : k, out); return out }
      out.push({ path, a, b }); return out
    }
    // 随机编号不算差别：去掉 _id、以编号为键的表改成按内容排序的列表、字符串里的编号统一替换
    const ID = /\b[A-Za-z0-9]{16}\b/g
    const norm = (v) => {
      if (typeof v === 'string') return v.replace(ID, '#id')
      if (Array.isArray(v)) return v.map(norm)
      if (v && typeof v === 'object') {
        const keys = Object.keys(v)
        if (keys.length && keys.every((k) => /^[A-Za-z0-9]{16}$/.test(k))) return keys.map((k) => norm(v[k])).sort((x, y) => JSON.stringify(x) < JSON.stringify(y) ? -1 : 1)
        const out = {}
        for (const k of keys) if (k !== '_id') out[k.replace(ID, '#id')] = norm(v[k])
        return out
      }
      return v
    }
    const report = {}
    for (const [kind, list] of Object.entries(groups)) {
      const r = report[kind] = { count: 0, same: 0, imageOnly: 0, diffs: [], msA: 0, msB: 0 }
      for (const e of list) {
        r.count++
        let a, b
        if (e.prop === 'monster') {
          let t = performance.now(); const ia = await A.call('importMonsterActor', e.entry); r.msA += performance.now() - t
          t = performance.now(); const ib = await B.call('importMonsterActor', e.entry); r.msB += performance.now() - t
          const pa = (await A.call('preparedActors')).find((x) => x.source._id === ia.result?.id)
          const pb = (await B.call('preparedActors')).find((x) => x.source._id === ib.result?.id)
          a = { source: pa?.source, system: pa?.system }; b = { source: pb?.source, system: pb?.system }
        } else {
          let t = performance.now(); a = (await A.call('importForBuild', e.prop, e.entry)).result; r.msA += performance.now() - t
          t = performance.now(); b = (await B.call('importForBuild', e.prop, e.entry)).result; r.msB += performance.now() - t
        }
        const d = diff(norm(a), norm(b))
        if (!d.length) r.same++
        else if (r.diffs.length < 5) r.diffs.push({ label: e.label, d: d.slice(0, 4) })
      }
      r.msA = Math.round(r.msA); r.msB = Math.round(r.msB)
    }
    return report
  }, LIMIT)
  await writeFile(`${work}/kernel-mode-${process.env.ENGINE ?? 'chrome'}.json`, JSON.stringify(result, null, 1))
  for (const [k, r] of Object.entries(result)) console.log(`${k.padEnd(16)} ${r.count} 条：一致 ${r.same}，不一致 ${r.count - r.same}；默认用时 ${r.msA}ms → 结算模式 ${r.msB}ms`, r.diffs.length ? JSON.stringify(r.diffs).slice(0, 600) : '')
  const failed = Object.entries(result).filter(([, r]) => r.same !== r.count || !r.count)
  console.log(failed.length ? `FAIL：${failed.map(([k]) => k).join('、')}` : 'PASS：结算模式只改图片，规则数据逐项一致')
  process.exitCode = failed.length ? 1 : 0
} finally { await ctx.close(); server.close() }
