// T3/T4：重建时的存档状态键映射、成长选择补回、物品顺序；都只操作官方对象。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */

/** 对管理器没有恢复到的进阶选择，用官方 Advancement#restore 再补一次（幂等：值已相同就跳过）。 */
export async function restoreRecordedChoices(actor: any, choices: Record<string, any[] | undefined>, planRows: Array<{ refKey?: string; entry?: any }> = []): Promise<void> {
  for (const item of actor.items) {
    const f = item.flags?.plutonium
    if (!f?.propDroppable || !f.source || !f.hash) continue
    const planRow = planRows.find((row) => row.entry?.name === item.name)
    const rows = (planRow?.refKey ? choices[planRow.refKey] : undefined) ?? choices[`${f.propDroppable}|${f.source}|${f.hash}`] ?? []
    for (const row of rows) {
      const adv = item.advancement?.byId?.[row.id]
      if (!adv?.restore) continue
      const current = item.toObject().system?.advancement?.[row.id]?.value ?? adv.value?.toObject?.() ?? adv.value
      if (JSON.stringify(current) === JSON.stringify(row.data)) continue
      await item.update({ [`system.advancement.${row.id}.value`]: row.data })
    }
  }
}

function flagsOf(item: any): string | null {
  const f = item?.flags?.plutonium
  return f?.propDroppable && f.source && f.hash ? `${f.propDroppable}|${f.source}|${f.hash}` : null
}

/** 重建时导入器/管理器可能给物品换新 id；按作者编号把存档里的状态键改到新 id。 */
export function remapStateIds(state: any, actor: any, rows: Array<{ itemId?: string; entry: any }>): void {
  if (!state || typeof state !== 'object') return
  const map = new Map<string, string>()
  for (const row of rows) {
    if (!row.itemId) continue
    const flags = flagsOf(row.entry)
    const target = (flags ? [...actor.items].find((item: any) => flagsOf(item) === flags) : null)
      ?? [...actor.items].find((item: any) => item.name === row.entry?.name)
    if (target && target.id !== row.itemId) map.set(row.itemId, target.id)
  }
  for (const bucket of ['items', 'effects'] as const) {
    const source = state[bucket]
    if (!source || typeof source !== 'object') continue
    const next: any = {}
    for (const [key, value] of Object.entries(source)) next[map.get(key) ?? key] = value
    state[bucket] = next
  }
  if (Array.isArray(state.itemRemoved)) state.itemRemoved = state.itemRemoved.map((id: string) => map.get(id) ?? id)
  if (Array.isArray(state.effectRemoved)) state.effectRemoved = state.effectRemoved.map((id: string) => map.get(id) ?? id)
}

/** 重建时按存档 refs 的顺序排物品；只改显示顺序，不改内容。 */
export async function sortActorItems(actor: any, rows: Array<{ itemId?: string; order?: number; entry?: any }>): Promise<void> {
  const updates = []
  for (const row of rows) {
    if (typeof row.order !== 'number') continue
    const item = (row.itemId ? actor.items.get(row.itemId) : null)
      ?? [...actor.items].find((it: any) => it.name === row.entry?.name && (!row.entry?.type || it.type === row.entry.type))
    if (item) updates.push({ _id: item.id, sort: row.order })
  }
  if (updates.length) await actor.updateEmbeddedDocuments('Item', updates)
}

