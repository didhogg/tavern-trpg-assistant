// 问答桥：作者起始装备窗口（EquipmentApp：标准起始装备 EquipmentCompPredefined + 金币 / 商店 EquipmentCompGold + 钱 EquipmentCurrencyManager）。
// 读：作者给的分组（startingEquipment.defaultData）→ 每组几个方案 → 每条按 commands-equipment.ts viewOf（物品名按作者编号、任选一件的候选按作者类别展开）；
// 写：作者自己的状态（std__choice__<组> = 方案序号，std__equi__<组>__<方案>__<第几个> = 物品 uid；改拿金币 = cpRolled），
//     再照作者「确认」按钮的合并写法交回（两个组件的表单数据 + 钱）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import type { AskAnswer, AskEquip, AskQuestion } from '../author-ask-types'
import { asData } from '../shown'
import { uiTextOf as ui } from './system-text'
import { viewOf } from './commands-equipment'

type Read = Omit<AskQuestion, 'index'>

async function entryOf(equi: any): Promise<AskEquip> {
  const v: any = await viewOf(equi)
  if (!v) return { kind: 'special', quantity: 1, text: asData(JSON.stringify(equi).slice(0, 80)) }
  if ('unsupported' in v) return { kind: 'special', quantity: 1, text: asData(String(v.unsupported)) }
  return {
    kind: v.kind, quantity: v.quantity,
    ...(v.name ? { name: v.displayName ?? v.name } : {}), ...(v.text ? { text: v.text } : {}), ...(v.cp ? { cp: v.cp } : {}),
    ...(v.candidates ? { candidates: v.candidates.map((c: any) => ({ uid: c.uid, name: c.name })), typeNames: v.typeNames ?? [] } : {}),
  }
}

export const equipmentApp = {
  async read({ comp }: { comp?: any }, kind: string): Promise<Read> {
    const data = comp._compCurrency.startingEquipment?.defaultData ?? []
    const groups = []
    for (const group of data) {
      const choices = []
      for (const [, list] of Object.entries(group)) choices.push({ entries: await Promise.all((list as any[]).map(entryOf)) })
      groups.push({ choices })
    }
    const gold = comp._compGold?.isAvailable ? comp._compCurrency.rollableExpressionGold ?? null : null
    return { kind, title: ui(comp._compCurrency.rollableExpressionGold ? 'Starting Equipment' : 'Equipment'), note: null, form: { type: 'equipment', groups, gold }, skippable: true }
  },
  async write({ comp }: { comp?: any }, answer: AskAnswer): Promise<unknown> {
    const def = comp._compDefault
    if (answer.gold != null) comp._compCurrency.cpRolled = Math.round(Number(answer.gold) * 100)
    else if (!answer.default) {
      const data = comp._compCurrency.startingEquipment?.defaultData ?? []
      data.forEach((group: any, g: number) => {
        const n = Object.keys(group).length
        const c = answer.choice?.[g] ?? (n === 1 ? 0 : null)
        if (c == null || c < 0 || c >= n) throw Error(`第 ${g + 1} 组还没选`)
        def._state[`std__choice__${g}`] = c
      })
      for (const [key, uid] of Object.entries(answer.slots ?? {})) {
        const [g, c, i] = key.split('.').map(Number)
        def._state[`std__equi__${g}__${c}__${i}`] = uid
      }
    }
    // 照作者「确认」：可用的组件各交表单数据，合并物品，钱单独交
    const active = [comp._compDefault, comp._compGold].filter((it: any) => it?.isAvailable)
    const forms = await Promise.all(active.map((it: any) => it.pGetFormData()))
    const unfinished = forms.find((f: any) => !f.isFormComplete)
    if (unfinished) throw Error('起始装备还有没选的')
    const currency = await comp._compCurrency.pGetFormData()
    return { isFormComplete: true, data: { equipmentItemEntries: forms.flatMap((f: any) => f.data?.equipmentItemEntries ?? []), currency: currency?.data?.currency } }
  },
}
