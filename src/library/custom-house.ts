// 房规：写一条、或直接改已有的一条（从 custom.ts 拆出，P5.5 §16.7 第 5 条）。
// 条目内容走作者的可编辑自制（作者 _copy 只记改动）；插件只记"房规 → 目标"的链接、归类和撤销。
import { carryRefs, historyKey } from './custom-entries'
import { formatOfCampaign } from './formats'
import { topLevelChanges } from './house-diff'
import type { ManageStore } from './manage'
import type { LibraryService } from './service'
import type { ScopedLibrary } from './scoped'
import { entryUnit, refKey, ruleScopes, type CampaignLibrary, type EntryRef } from './scopes'
import { rawEntry, type RawDeps } from './custom-raw'

export type HouseEdit = { mod?: Record<string, unknown>; entity?: Record<string, unknown>; edited?: Record<string, unknown> }
export interface HouseDeps {
  lib: LibraryService & RawDeps['lib']
  manage: ManageStore
  choose: ScopedLibrary['choose']
  /** 插件登记的房规来源（custom.json）。 */
  houseSource: { json: string; full: string; abbreviation: string }
  /** 这套资料集的自制编号（房规条目在那里）。 */
  houseSet: (codeSet: string) => string
}

/**
 * 房规：在可编辑自制里写一条，用作者 _copy 指向原件、只写改动。三种给法：
 *   edited：改完的整条（P5.5 B1，编辑器用）——后端和原件逐个顶层字段比，只存改过的，删掉的写 null；改了名字就用新名字；
 *   mod：作者的 _mod 写法（JSON 高级入口）；entity：整条覆盖（不再跟原件走）。
 * 原件不动；房规挂在原件下当备选。activate：在本战役立即生效（默认），返回改好的战役选书设置。
 * replace：直接改这条已有的房规（§16.7 第 5 条）——作者按 uniqueId 覆盖同一条（作者编辑器改已有条目的做法），
 * 用到它的地方一起变；仍只记和原件不一样的；撤销退回房规的上一版；改了名编号会变，插件记录跟着搬（carryRefs）。
 */
export async function createHouseRule(d: HouseDeps, c: CampaignLibrary, target: EntryRef, edit: HouseEdit, { activate = true, replace }: { activate?: boolean; replace?: EntryRef } = {}) {
  formatOfCampaign(c)
  // 原件、要改的那条房规、重名都读现在的原文（C2：刚存的还没解析也读得到，不用等后台）
  const orig = await rawEntry(d, target)
  if (!orig) throw new Error(`找不到要改的条目：${refKey(target)}`)
  const base = orig.entity as { name?: string; source?: string }
  if (!base.name || !base.source) throw new Error(`原件没有名字或来源，作者的 _copy 指不到它：${refKey(target)}`)
  const baseSource = base.source
  const links = await d.manage.houseRules()
  const replacing = replace ? links.find((l) => refKey(l.house) === refKey(replace) && refKey(l.target) === refKey(target)) : undefined
  if (replace && !replacing) throw new Error('要改的房规不是这一条条目的房规，或者已经删掉了')
  const old = replacing ? await rawEntry(d, replacing.house) : null
  if (replacing && !old?.uniqueId) throw new Error('作者的可编辑自制里找不到要改的那条房规')
  const oldName = old ? String(old.entity.name ?? '') : undefined
  // 房规来源里同名的只能有一条（作者编号 = 名字 + 来源）；同名不同书的加书名缩写区分
  // 只读不建：读的小窗是只读版本，作者的 editableDoc 是「取，没有就建」，第一次建房规时会被拒（C2 回归里撞到）
  const f0 = await d.lib.frameOf(c.codeSet)
  const editableId = ((await f0.call('brewDocIndex')) ?? []).find((x) => x.isEditable)?.docIdLocal
  const body = ((editableId ? (await f0.call('brewRaw', [editableId]))[0]?.body : null) ?? {}) as Record<string, Array<{ name?: string; source?: string; uniqueId?: string }> | undefined>
  const taken = new Set((body[target.prop] ?? []).filter((x) => String(x?.source).toLowerCase() === d.houseSource.json.toLowerCase() && x?.uniqueId !== old?.uniqueId).map((x) => String(x?.name ?? '')))
  let changes: Record<string, unknown> = {}
  if (edit.edited) {
    const [was, now] = await Promise.all([f0.call('cleanEntity', base), f0.call('cleanEntity', edit.edited)])
    changes = topLevelChanges(was as Record<string, unknown>, now as Record<string, unknown>)
    if (!Object.keys(changes).length) throw new Error('和原件一样，没有改动，不用存房规')
  }
  const { name: renamedTo, ...fieldChanges } = changes
  const want = typeof renamedTo === 'string' && renamedTo ? renamedTo : oldName ?? base.name
  const name = taken.has(want) ? `${want}（${base.source}）` : want
  const ent = edit.entity
    ? { ...edit.entity, name, source: d.houseSource.json }
    : { ...fieldChanges, name, source: d.houseSource.json, _copy: { name: base.name, source: baseSource, ...(edit.mod ? { _mod: edit.mod } : {}) } }
  const result = await d.lib.writeAuthor(c.codeSet, 'custom-houserule', async (view) => {
    const f = await d.lib.frameOf(c.codeSet, view)
    await f.call('editableEnsureSource', d.houseSource)
    if (!edit.entity) await f.call('editableAddDependencies', { [target.prop]: [baseSource] })
    const put = await f.call('editablePut', target.prop, old?.uniqueId ? { ...ent, uniqueId: old.uniqueId } : ent)
    const editable = ((await f.call('brewDocIndex')) ?? []).find((x) => x.isEditable)?.docIdLocal
    return { value: put, touched: editable ? [editable] : [] }
  })
  const saved = result.value
  if (!saved.hash) throw new Error('作者算不出房规条目的编号')
  const house: EntryRef = { set: d.houseSet(c.codeSet), prop: target.prop, hash: saved.hash }
  if (replacing) {
    // 改已有的：撤销 = 存回上一版；改名了编号会变，归类、房规链接、各层选的版本跟着搬
    await d.manage.pushHistory(historyKey(c.codeSet, target.prop, saved.uniqueId), { at: Date.now(), prop: target.prop, before: saved.previousEntity ?? null, pack: null })
    if (refKey(house) !== refKey(replacing.house)) await carryRefs(d.manage, replacing.house, house)
  } else {
    await d.manage.setAssignment(entryUnit(house), { scopes: [...ruleScopes(c.rule).defaultScopes], global: false })
    await d.manage.linkHouseRule({ house, target })
    await d.manage.pushHistory(historyKey(c.codeSet, target.prop, saved.uniqueId), { at: Date.now(), prop: target.prop, before: null, link: { house, target } })
  }
  const altId = `house:${saved.hash}`
  return { house, altId, uniqueId: saved.uniqueId, changed: Object.keys(changes), pending: true as const, campaign: activate ? await d.choose(c, target, altId) : c }
}
