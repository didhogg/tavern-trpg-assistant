// T4：重建多职业人物时，把存档 choices 里记录的进阶值补回；只改官方 Advancement 的 value，不手写规则。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
export async function restoreRecordedChoices(actor: any, choices: Record<string, any[] | undefined>, planRows: Array<{ refKey?: string; entry?: any }> = []): Promise<void> {
  for (const item of actor.items) {
    const f = item.flags?.plutonium
    if (!f?.propDroppable || !f.source || !f.hash) continue
    const planRow = planRows.find((row) => row.entry?.name === item.name)
    const rows = (planRow?.refKey ? choices[planRow.refKey] : undefined) ?? choices[`${f.propDroppable}|${f.source}|${f.hash}`] ?? []
    for (const row of rows) {
      const adv = item.advancement?.byId?.[row.id]
      if (!adv) continue
      const current = item.toObject().system?.advancement?.[row.id]?.value ?? adv.value?.toObject?.() ?? adv.value
      if (JSON.stringify(current) === JSON.stringify(row.data)) continue
      await item.update({ [`system.advancement.${row.id}.value`]: row.data })
    }
  }
}
