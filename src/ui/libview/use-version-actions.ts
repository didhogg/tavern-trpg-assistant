// 版本的三个动作：改作用于哪一层（含「不使用」）、删除房规。条目页的【版本】、单条管理、书架 / 包 / 设置里的覆盖列表共用。
// 全部调后端现成的接口：scoped.choose（改层 / 不使用，本战役层要自己把新的选书设置写回战役）、custom.deleteHouseRule。
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { getSource } from '../../library/sources'
import { useAppStore } from '../../stores/app'
import { useCampaignStore } from '../../stores/campaign'
import { useLibViewStore } from '../../stores/libview'
import { useToastStore } from '../../stores/toast'
import { askConfirm } from '../kit/confirm'
import { NO_LEVEL, type VersionRow } from './version-rows'

export type ActionRow = Pick<VersionRow, 'level' | 'ref' | 'altId' | 'name' | 'kind'> & { house?: VersionRow['house'] }

/** 版本的动作（改作用范围 / 不使用 / 删房规）。afterChange：动作做完后各页自己重新读列表。 */
export function useVersionActions(afterChange: () => Promise<void>) {
  const app = useAppStore()
  const lib = useLibViewStore()
  const campaign = useCampaignStore()
  const toast = useToastStore()
  const levelName = (l: string): string => (l === NO_LEVEL ? '不使用' : l === 'campaign' ? '本战役' : l === 'global' ? '全局' : `规则：${app.svc().rules.get(l.replace(/^rule:/, ''))?.name ?? l.replace(/^rule:/, '')}`)

  /** 本战役层的选择在战役设置里：choose 只返回新设置，要自己写回。 */
  async function writeBack(next: CampaignLibrary): Promise<void> {
    const owner = campaign.owner?.ownerKey
    if (lib.bound && owner) { const ks = app.svc().backend.kernelSave; await ks.setLibrary(owner, { ...(await ks.libraryOf(owner)), choices: next.choices }) }
    await lib.refresh(app.svc())
  }

  /** 把这些版本改成作用于另一层；to = NO_LEVEL 就是不再使用（回到下一层或原件）。 */
  async function setLevel(rows: ActionRow[], to: string): Promise<boolean> {
    let cur = lib.campaignLib
    if (!cur || !rows.length) return false
    try {
      const choose = app.svc().backend.library.scoped.choose.bind(app.svc().backend.library.scoped)
      for (const r of rows) {
        if (r.level === to) continue
        if (r.level !== NO_LEVEL) cur = await choose(cur, r.ref, null, r.level as 'campaign')
        if (to !== NO_LEVEL) cur = await choose(cur, r.ref, r.altId, to as 'campaign')
      }
      await writeBack(cur)
      toast.success(to === NO_LEVEL ? '已改成不使用' : `已改成作用于${levelName(to)}`)
      await afterChange()
      return true
    } catch (e) { console.error('[trpg-assistant] 改作用范围失败', e); toast.error(e instanceof Error ? e.message : '没有改成'); return false }
  }

  /** 删房规（后端删条目 + 去掉链接；选过它的地方回到原件）。确认后才删。 */
  async function removeHouse(rows: ActionRow[]): Promise<boolean> {
    const list = rows.filter((r) => r.house)
    if (!list.length) return false
    const names = [...new Set(list.map((r) => r.name ?? ''))].join('、')
    const ok = await askConfirm({ title: list.length > 1 ? `删除这 ${list.length} 个房规？` : `删除房规「${names}」？`, message: '删除后，用到它的地方回到原件。别的版本和原件不受影响。', confirmLabel: '删除', danger: true })
    if (!ok) return false
    try {
      const custom = app.svc().backend.library.custom
      const choose = app.svc().backend.library.scoped.choose.bind(app.svc().backend.library.scoped)
      let cur = lib.campaignLib
      const done = new Set<string>()
      for (const r of list) {
        const h = r.house!
        const k = `${h.ref.set}|${h.ref.prop}|${h.ref.hash}`
        if (done.has(k)) continue
        done.add(k)
        await custom.deleteHouseRule(h.codeSet, h.ref, h.uniqueId)
        // 后端删房规不会清掉「选用它」的记录（只是生效时回到原件）：一起清掉，免得列表里留下点了没反应的行
        if (cur) for (const e of await custom.edits({ refs: [r.ref] }, cur)) if (e.altId === r.altId) cur = await choose(cur, e.ref, null, e.level as 'campaign')
      }
      if (cur) await writeBack(cur)
      await lib.refresh(app.svc())
      toast.success(list.length > 1 ? `已删除 ${list.length} 个房规` : '已删除房规')
      await afterChange()
      return true
    } catch (e) { console.error('[trpg-assistant] 删除房规失败', e); toast.error(e instanceof Error ? e.message : '没有删掉'); return false }
  }

  /**
   * 条目页【版本】里点一行：马上改用它，生效在设置里的「覆盖层级」（默认本战役）。altId = null 是改用原件：
   * 先取消这一层的选择；要是别的层（规则 / 全局）还选着别的版本、原件仍没生效，就在这一层明确选「原件」。
   */
  async function pickHere(ref: EntryRef, altId: string | null, name: string): Promise<boolean> {
    const c = lib.campaignLib
    if (!c) return false
    const setting = app.settings?.library.overrideLevel ?? 'campaign'
    if (setting === 'campaign' && !(campaign.owner?.ownerKey && lib.bound)) { toast.error('先创建战役，才能在本战役里选用版本'); return false }
    const level = (setting === 'rule' ? `rule:${c.rule}` : setting) as 'campaign'
    try {
      const scoped = app.svc().backend.library.scoped
      await writeBack(await scoped.choose(c, ref, altId, level))
      if (altId === null && lib.campaignLib) {
        const d = await scoped.detail(lib.campaignLib, ref, { browse: true })
        if (d && !('hidden' in d) && d.version.altId !== 'base') await writeBack(await scoped.choose(lib.campaignLib, ref, 'base', level))
      }
      toast.success(altId === null ? '已改用原件' : `已改用「${name}」`)
      await afterChange()
      return true
    } catch (e) { console.error('[trpg-assistant] 选用版本失败', e); toast.error('没有保存成功'); return false }
  }

  return { levelName, setLevel, removeHouse, pickHere }
}

/** 覆盖列表（书架 / 包 / 设置）里的一行没有房规的编号：向后端要全部版本，对上这一行选的那一份。 */
export async function houseOfRow(row: { ref: EntryRef; altId: string }, c: CampaignLibrary, detail: (c: CampaignLibrary, ref: EntryRef, o: { browse: boolean }) => Promise<unknown>): Promise<VersionRow['house'] | undefined> {
  const d = (await detail(c, row.ref, { browse: true })) as { alternatives?: Array<{ altId: string; kind: string; ref?: EntryRef; item: unknown }> } | null
  const a = d?.alternatives?.find((x) => x.altId === row.altId && x.kind === 'houserule')
  const uniqueId = (a?.item as { uniqueId?: unknown } | undefined)?.uniqueId
  return a?.ref && typeof uniqueId === 'string' ? { ref: a.ref, uniqueId, codeSet: getSource(a.ref.set).codeSet } : undefined
}
