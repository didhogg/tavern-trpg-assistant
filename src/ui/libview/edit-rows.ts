// 编辑 / 覆盖（版本选择）的行：全局编辑页和包的【管理】页共用。数据来自 manage.allChoices（所有层级），名称问 scoped.storedItem；复原 = scoped.choose(…, null, 层级)。
import type { Services } from '../../core/services'
import type { ChoiceLevel } from '../../library/manage'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import { nameOf } from './pack-data'

export interface EditRow { level: string; target: string; ref: EntryRef; name: string; source: string | null; altId: string; picked: boolean }

export const levelText = (l: string): string => (l === 'campaign' ? '本战役' : l === 'global' ? '全局' : `规则：${l.replace(/^rule:/, '')}`)

/** 所有层级的编辑 / 覆盖；给了 source 就只留这本书 / 包里的。 */
export async function loadEditRows(s: Services, source?: string): Promise<EditRow[]> {
  const lib = s.backend.library
  const rows: EditRow[] = []
  for (const c of await lib.scoped.manage.allChoices()) {
    const [set, prop, ...hash] = c.target.split('|')
    const ref = { set, prop, hash: hash.join('|') }
    const stored = await lib.scoped.storedItem(ref)
    if (source && stored?.source !== source) continue
    rows.push({ ...c, ref, name: stored ? nameOf(stored.item) : '未知', source: stored?.source ?? null, picked: false })
  }
  return rows
}

/** 复原：本战役层的选择在战役设置里（scoped.choose 只返回新设置，要自己写回 kernelSave.setLibrary）；规则 / 全局层 choose 自己存。 */
export async function restoreRows(s: Services, c: CampaignLibrary, rows: EditRow[], ownerKey: string | null = null): Promise<void> {
  let cur = c
  for (const r of rows) cur = await s.backend.library.scoped.choose(cur, r.ref, null, r.level as 'campaign' | ChoiceLevel)
  if (ownerKey && rows.some((r) => r.level === 'campaign')) {
    const ks = s.backend.kernelSave
    await ks.setLibrary(ownerKey, { ...(await ks.libraryOf(ownerKey)), choices: cur.choices })
  }
}
