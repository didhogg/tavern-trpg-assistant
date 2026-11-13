// P5.5 B8-2 写条目：存一条、删、撤销、换包、改名后搬插件记录。写到哪由 pack 决定：
//   pack = 【我的库】一个包的身份 → 那个作者自制包（小窗 pack-commands.ts：复制整包 → 换那一条 → 作者 pUpdateBrew）；
//   pack 不给 → 作者可编辑自制（房规；B8-6 迁移前的「我的资料」）。
// 改名（作者编号 = 名字 + 来源）：同一次修改里把用 _copy 指向它的条目改指新名字（这个包里 + 可编辑自制里的房规），
// 插件的归类、房规链接、各层选的版本搬到新编号。战役记录和存档里的引用不在这里改（读档检查会列出来）。
import { docIdOf } from './custom-packs'
import { formatOfCodeSet } from './formats'
import type { SchemaIssue } from './brew-validate'
import type { ChoiceLevel, EditStep, HouseRuleLink, ManageStore } from './manage'
import type { AuthorFrame } from './runtime/host'
import type { LibraryService } from './service'
import { entryUnit, refKey, ruleScopes, type EntryRef } from './scopes'
import { SOURCES } from './sources'

export interface EntryDeps {
  lib: LibraryService
  manage: ManageStore
  /** 可编辑自制里「我的资料」的来源编号（不给包时新条目的来源）。 */
  mineSource: { json: string; full: string; abbreviation: string }
  validateEntry: (codeSet: string, prop: string, ent: Record<string, unknown>) => Promise<SchemaIssue[]>
}

export interface SaveOptions {
  rule?: string
  /** 【我的库】哪个包（包的身份）；不给 = 可编辑自制。 */
  pack?: string | null
  /** 改包里一条还没有 uniqueId 的（导入 / 复制来的）：按作者编号找到它换掉。 */
  replaceHash?: string
}

const brewSetOf = (codeSet: string) => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  return s
}

/** 撤销记录的键：数据集 | 类别 | 作者 uniqueId（改名、换包都不变）。 */
export const historyKey = (codeSet: string, prop: string, uniqueId: string): string => `${brewSetOf(codeSet).id}|${prop}|${uniqueId}`

/**
 * 在一次编辑里拿到小窗和这个包的本地编号、包自己的来源（包头最后一行），只写原文、不当场解析
 * （P5.5 U2：service.writeAuthor 记脏，后台批量解析）。不给包 = 可编辑自制（房规）。
 */
async function inStore<T>(d: EntryDeps, codeSet: string, kind: string, pack: string | null | undefined, run: (f: AuthorFrame, doc: { id: string; own: string } | null) => Promise<T>) {
  return d.lib.writeAuthor(codeSet, kind, async (view) => {
    const f = await d.lib.frameOf(codeSet, view)
    const index = (await f.call('brewDocIndex')) ?? []
    if (!pack) {
      const value = await run(f, null)
      const editable = ((await f.call('brewDocIndex')) ?? []).find((x) => x.isEditable)?.docIdLocal
      return { value, touched: editable ? [editable] : [] }
    }
    const id = await docIdOf(f, pack)
    const own = index.find((x) => x.docIdLocal === id)?.sources.at(-1)
    if (!own) throw new Error('这个包的包头没有来源')
    return { value: await run(f, { id, own }), touched: [id] }
  })
}

/** 存一条（新写或改）。record：记一步撤销（撤销自己存回去时不记）。 */
export async function persist(d: EntryDeps, codeSet: string, prop: string, ent: Record<string, unknown>, { rule, record, pack, replaceHash }: SaveOptions & { record: boolean }) {
  const result = await inStore(d, codeSet, 'custom-entry', pack, async (f, doc) => {
    const full: Record<string, unknown> = { source: doc ? doc.own : d.mineSource.json, ...ent }
    // 新写的一条：这一类在作者结构定义里能自带版本（字段说明表 edition）就写上规则的版本（P5.5 B1）。用户自己写了就不动。
    if (rule && !ent.uniqueId && !replaceHash && full.edition === undefined && (await formatOfCodeSet(codeSet).fields(prop))?.edition) full.edition = ruleScopes(rule).style
    let put
    if (doc) put = await f.call('packPut', doc.id, prop, full, replaceHash ? { replaceHash } : {})
    else {
      await f.call('editableEnsureSource', d.mineSource)
      put = await f.call('editablePut', prop, full)
    }
    const prev = put.previous
    let retargeted = 0
    if (prev && put.previousHash !== put.hash) {
      const to = { name: String(full.name ?? ''), source: String(full.source) }
      if (doc) retargeted += await f.call('packRetargetCopies', doc.id, prop, prev, to)
      retargeted += await f.call('editableRetargetCopies', prop, prev, to)
    }
    return { ...put, retargeted }
  })
  const { previousEntity, ...saved } = result.value
  const set = brewSetOf(codeSet).id
  if (record) await d.manage.pushHistory(historyKey(codeSet, prop, saved.uniqueId), { at: Date.now(), prop, before: previousEntity ?? null, pack: pack ?? null })
  const renamed = saved.hash && saved.previousHash && saved.previousHash !== saved.hash ? { from: { set, prop, hash: saved.previousHash }, to: { set, prop, hash: saved.hash }, retargeted: saved.retargeted } : null
  if (renamed) await carryRefs(d.manage, renamed.from, renamed.to)
  else if (saved.hash && !saved.previousHash && rule) await d.manage.setAssignment(entryUnit({ set, prop, hash: saved.hash }), { scopes: [...ruleScopes(rule).defaultScopes], global: false })
  // 解析在后台（pending）；另一种语言对上了谁要等解析完才知道，到时用 counterparts 再查
  return { ...saved, renamed, pending: true as const, issues: await d.validateEntry(codeSet, prop, ent) }
}

/** 删条（按 uniqueId）；record：每条记一步撤销（撤销 = 用原来的 uniqueId 加回去）。返回删掉的原文。 */
export async function remove(d: EntryDeps, codeSet: string, prop: string, uniqueIds: string[], { record, link, pack, carry }: { record: boolean; link?: HouseRuleLink; pack?: string | null; carry?: EditStep['carry'] }) {
  const result = await inStore(d, codeSet, 'custom-delete', pack, async (f, doc) => doc ? f.call('packRemove', doc.id, prop, uniqueIds) : f.call('editableRemove', prop, uniqueIds))
  if (record) for (const before of result.value) await d.manage.pushHistory(historyKey(codeSet, prop, String(before.uniqueId)), { at: Date.now(), prop, before, pack: pack ?? null, ...(link ? { link } : {}), ...(carry ? { carry } : {}) })
  return result
}

/** 一条的编号变了：插件管理记录里认旧编号的（归类、房规链接两头、各层选的版本）搬到新编号。不写作者内容。 */
export async function carryRefs(manage: ManageStore, from: EntryRef, to: EntryRef): Promise<void> {
  const oldUnit = entryUnit(from)
  const a = (await manage.assignments()).get(oldUnit)
  if (a) { await manage.setAssignment(entryUnit(to), a); await manage.setAssignment(oldUnit, null) }
  const same = (x: EntryRef): boolean => refKey(x) === refKey(from)
  for (const link of await manage.houseRules()) {
    if (same(link.house)) { await manage.unlinkHouseRule(link.house); await manage.linkHouseRule({ house: to, target: link.target }) }
    else if (same(link.target)) await manage.linkHouseRule({ house: link.house, target: to })
  }
  const oldAlt = `house:${from.hash}`
  for (const c of await manage.allChoices()) {
    const level = c.level as ChoiceLevel
    const altId = c.altId === oldAlt ? `house:${to.hash}` : c.altId
    if (c.target === refKey(from)) { await manage.setChoice(level, c.target, null); await manage.setChoice(level, refKey(to), altId) }
    else if (altId !== c.altId) await manage.setChoice(level, c.target, altId)
  }
}

/**
 * 条目换包（P5.5 B3 → B8）：同一次修改里从原来的包取出、换成目标包自己的来源存进去（uniqueId 不变，撤销记录接着用）、
 * 从原来的包删掉，用 _copy 指向它的（原来的包里、房规）改指新编号；之后搬插件记录。先用 backend.entryChangeImpact 看影响。
 * 撤销两步：先回到原来的包（插件记录跟着搬回），再从目标包删掉。
 * 限制：撤销时不把别的条目的 _copy 改指回去（第二步撤销后它们指向的是已删掉的那条，作者合并会报找不到）。
 */
export async function moveEntries(d: EntryDeps, codeSet: string, prop: string, uniqueIds: string[], fromPack: string, toPack: string) {
  if (fromPack === toPack) return []
  const set = brewSetOf(codeSet).id
  const result = await d.lib.writeAuthor(codeSet, 'custom-move', async (view) => {
    const f = await d.lib.frameOf(codeSet, view)
    const fromId = await docIdOf(f, fromPack)
    const toId = await docIdOf(f, toPack)
    const toOwn = (await f.call('brewDocIndex')).find((x) => x.docIdLocal === toId)?.sources.at(-1)
    if (!toOwn) throw new Error('目标包的包头没有来源')
    const moved = []
    for (const id of uniqueIds) {
      const got = await f.call('packEntity', fromId, prop, { uniqueId: id })
      if (!got) throw new Error(`找不到这一条：${id}`)
      const ent = { ...got.entity, source: toOwn }
      const put = await f.call('packPut', toId, prop, ent)
      await f.call('packRemove', fromId, prop, [id])
      const from = { name: String(got.entity.name ?? ''), source: String(got.entity.source ?? '') }
      const to = { name: String(ent.name ?? ''), source: toOwn }
      const retargeted = (await f.call('packRetargetCopies', fromId, prop, from, to)) + (await f.call('editableRetargetCopies', prop, from, to))
      moved.push({ uniqueId: id, before: got.entity, oldHash: got.hash, newHash: put.hash, retargeted })
    }
    return { value: moved, touched: [fromId, toId] }
  })
  for (const m of result.value) {
    const carry = m.oldHash && m.newHash ? { from: { set, prop, hash: m.oldHash }, to: { set, prop, hash: m.newHash } } : undefined
    await d.manage.pushHistory(historyKey(codeSet, prop, m.uniqueId), { at: Date.now(), prop, before: null, pack: toPack })
    await d.manage.pushHistory(historyKey(codeSet, prop, m.uniqueId), { at: Date.now(), prop, before: m.before, pack: fromPack, ...(carry ? { carry } : {}) })
    if (carry) await carryRefs(d.manage, carry.from, carry.to)
  }
  return result.value.map(({ before: _b, ...rest }) => rest)
}

/**
 * 撤销这一条最近一步（P5.5 B2）：之前没有这一条 → 删掉（是房规的连链接一起去掉）；
 * 之前有 → 把那时的原文存回去（同一个 uniqueId、同一个包；改过名的自动改回，指向它的 _copy 和插件记录跟着回来；删掉的加回来，房规链接恢复）。
 */
export async function undo(d: EntryDeps, codeSet: string, prop: string, uniqueId: string) {
  const step = await d.manage.popHistory(historyKey(codeSet, prop, uniqueId))
  if (!step) throw new Error('这一条没有可以撤销的修改')
  const left = async () => (await d.manage.history(historyKey(codeSet, prop, uniqueId))).length
  if (step.before === null) {
    await remove(d, codeSet, prop, [uniqueId], { record: false, pack: step.pack })
    if (step.link) await d.manage.unlinkHouseRule(step.link.house)
    return { undone: 'created' as const, left: await left() }
  }
  const entry = await persist(d, codeSet, prop, step.before, { record: false, pack: step.pack })
  if (step.link && entry.hash) await d.manage.linkHouseRule({ house: { ...step.link.house, hash: entry.hash }, target: step.link.target })
  if (step.carry) await carryRefs(d.manage, step.carry.to, step.carry.from)
  return { undone: 'restored' as const, entry, left: await left() }
}
