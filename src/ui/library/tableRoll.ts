import { useAppStore } from '../../stores/app'
import { useDiceStore } from '../../stores/dice'
import { useLibraryStore } from '../../stores/library'
import { useToastStore } from '../../stores/toast'
import { copyText } from '../../host/clipboard'
import { appendToInput } from '../../host/input'
import { rollExpression, rollTable, tableCopyText, type TableRoll } from '../../rules/dice/table'

type Obj = Record<string, unknown>
export interface TableLike { id: string; name: string; data: Obj }

/**
 * 随机表的界面动作：掷、复制、提示条 [填入输入框]/[继续掷]、掷表历史。
 * 纯规则仍在 rules/dice/table.ts；这里只负责把结果接到界面。
 */
export function useTableRoll() {
  const app = useAppStore()
  const library = useLibraryStore()
  const dice = useDiceStore()
  const toast = useToastStore()

  async function announce(t: TableLike, roll: TableRoll, label = t.name): Promise<TableRoll> {
    const text = tableCopyText([{ label, roll }])
    const ok = await copyText(text)
    const actions = [{ label: '填入输入框', run: () => { appendToInput(text) } }]
    if (roll.then) actions.push({ label: '继续掷', run: () => continueTable(roll.then!.table, label, roll.then!.times) })
    toast.push('info', `🎲 ${t.name} ${roll.formula} = ${roll.total}${ok ? ' 已复制，Ctrl+V 粘贴' : ' 复制失败'}`, { actions })
    dice.recordTable(t.id, t.name, `${roll.total}${roll.text ? ` ${roll.text}` : ''}`)
    return roll
  }

  async function rollOne(t: TableLike, label = t.name): Promise<TableRoll> {
    return announce(t, rollTable(t.data as never, Math.random), label)
  }

  async function rollGroup(list: TableLike[]): Promise<void> {
    const results = list.map((t) => ({ label: t.name, roll: rollTable(t.data as never, Math.random) }))
    if (!results.length) return
    const text = tableCopyText(results)
    const ok = await copyText(text)
    toast.push('info', `🎲 ${results.length} 张表${ok ? ' 已复制' : ' 复制失败'}`, { actions: [{ label: '填入输入框', run: () => { appendToInput(text) } }] })
    for (const r of results) dice.recordTable('group', r.label, `${r.roll.total}${r.roll.text ? ` ${r.roll.text}` : ''}`)
  }

  /** 单元格里的 `{{roll:2d8}}`：掷一次、复制「2d8 = 9」，不写表历史。 */
  async function rollCell(text: string): Promise<void> {
    const m = /\{\{roll:([^}|]+)/.exec(text)
    const formula = m?.[1]?.trim() ?? (/^[0-9dD+\-\s]+$/.test(text.trim()) ? text.trim() : '')
    if (!formula) return
    const total = rollExpression(formula, Math.random)
    const out = `${formula} = ${total}`
    const ok = await copyText(out)
    toast.push('info', `🎲 ${out}${ok ? ' 已复制，Ctrl+V 粘贴' : ' 复制失败'}`, { actions: [{ label: '填入输入框', run: () => { appendToInput(out) } }] })
  }

  async function continueTable(id: string, previous: string, times: number): Promise<void> {
    const packId = await library.packOfEntry(id)
    if (!packId) { toast.info('下一张表所在的扩展包还没有安装'); return }
    const row = await app.svc().db.entries.get([packId, id])
    if (!row || row.type !== 'table') { toast.info('没有找到下一张表'); return }
    for (let i = 0; i < Math.max(1, times); i++) await rollOne({ id: row.entryId, name: row.name, data: row.data as Obj }, `${previous} → ${row.name}`)
  }

  return { rollOne, rollGroup, rollCell, continueTable }
}
