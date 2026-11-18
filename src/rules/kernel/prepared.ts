// 运行时每个人物的准备账本（一战役一份，随结算小窗开关）：
//   base   完整基准：重建结果，原始来源与原始选择都在；换算缓存存的就是它；退回 / 撤销从它重新准备
//   view   取下后的视图：按取下安排处理后、叠游戏状态前；存档差别、回到自动、金线都相对它算（没有取下时就是 base）
//   choices 取下时作者 reverse 记下的原始选择（按作者来源）；保存时用它保护原始选择，不让「当前没应用」写成「原来没选」
// 只记账，不算规则。

export type ActorData = Record<string, unknown>
export type OffChoices = Record<string, Array<{ id: string; type: string; level: number; data: unknown }>>

interface Entry { base: ActorData; view: ActorData | null; choices: OffChoices }

export class PreparedActors {
  private readonly rows = new Map<string, Entry>()

  /** 记一个人：没给 view（没有取下）= 视图就是基准。 */
  set(id: string, base: ActorData, view?: ActorData | null, choices?: OffChoices | null): void {
    this.rows.set(id, { base, view: view ?? null, choices: choices ?? {} })
  }
  delete(id: string): void { this.rows.delete(id) }
  has(id: string): boolean { return this.rows.has(id) }
  /** 完整基准（缓存、重新准备用）。 */
  base(id: string): ActorData | null { return this.rows.get(id)?.base ?? null }
  /** 取下后的视图（差别、回到自动、金线用）。 */
  view(id: string): ActorData | null { const row = this.rows.get(id); return row ? row.view ?? row.base : null }

  /** 给人物加了条目：新条目同时进基准和视图（加条目不影响已有的取下安排）。 */
  addItems(id: string, items: Array<Record<string, unknown>>): void {
    const row = this.rows.get(id)
    if (!row) return
    for (const data of row.view ? [row.base, row.view] : [row.base]) {
      const list = data.items
      if (!Array.isArray(list)) continue
      for (const item of items) {
        const index = list.findIndex((x: Record<string, unknown>) => x._id === item._id)
        if (index >= 0) list[index] = item; else list.push(item)
      }
    }
  }

  /**
   * 保存时的成长选择：从当前人物记下的（captured）为主；取下时动过的那些成长，用取下前的原始选择覆盖
   * （同一作者来源、同一成长、同一级）。键都是作者来源（Plutonium 标记）。
   */
  protect(id: string, captured: Record<string, unknown>): Record<string, unknown> {
    const original = this.rows.get(id)?.choices ?? {}
    const out: Record<string, unknown> = { ...captured }
    for (const [key, rows] of Object.entries(original)) {
      const list = Array.isArray(out[key]) ? [...out[key] as Array<{ id: string; level: number }>] : []
      for (const row of rows) {
        const index = list.findIndex((x) => x.id === row.id && x.level === row.level)
        if (index >= 0) list[index] = row; else list.push(row)
      }
      out[key] = list
    }
    return out
  }
}
