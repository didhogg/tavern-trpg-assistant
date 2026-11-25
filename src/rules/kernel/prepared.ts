// 运行时每个人物的准备账本（一战役一份，随结算小窗开关）：
//   base   完整基准：重建结果，原始来源与原始选择都在；换算缓存存的就是它；退回 / 撤销从它重新准备
//   view   取下后的视图：按取下安排处理后、叠游戏状态前；存档差别、回到自动、金线都相对它算（没有取下时就是 base）
//   choices 取下时作者 reverse 记下的原始选择（按作者来源）；保存时用它保护原始选择，不让「当前没应用」写成「原来没选」
// 只记账，不算规则。

export type ActorData = Record<string, unknown>
export type OffChoices = Record<string, Array<{ id: string; type: string; level: number; data: unknown }>>

interface Entry { base: ActorData; view: ActorData | null; choices: OffChoices; stored: boolean }

export class PreparedActors {
  private readonly rows = new Map<string, Entry>()
  /** 每次加条目新加进基准的物品编号（一次一批）：撤销 / 退回时存档里已没有这批，就从基准里拿掉。 */
  private readonly added = new Map<string, Array<Set<string>>>()

  /** 记一个人：没给 view（没有取下）= 视图就是基准；stored = 基准是存档里的完整数据（B′，作者整机建的人）。 */
  set(id: string, base: ActorData, view?: ActorData | null, choices?: OffChoices | null, stored = this.rows.get(id)?.stored ?? false): void {
    this.rows.set(id, { base, view: view ?? null, choices: choices ?? {}, stored })
  }
  /** 这个人按 B′ 存完整数据（读档直接建回，不按引用重建、不抓成长选择）。 */
  isStored(id: string): boolean { return this.rows.get(id)?.stored ?? false }
  delete(id: string): void { this.rows.delete(id); this.added.delete(id) }
  has(id: string): boolean { return this.rows.has(id) }
  /** 完整基准（缓存、重新准备用）。 */
  base(id: string): ActorData | null { return this.rows.get(id)?.base ?? null }
  /** 取下后的视图（差别、回到自动、金线用）。 */
  view(id: string): ActorData | null { const row = this.rows.get(id); return row ? row.view ?? row.base : null }
  /** 这个人现在有取下安排（记账时给了取下后的视图）：存档要存完整基准 + 安排 + 相对视图的差别，不能只存现在的样子。 */
  hasOff(id: string): boolean { return !!this.rows.get(id)?.view }

  /** 给人物加了条目：新条目同时进基准和视图（加条目不影响已有的取下安排）。 */
  addItems(id: string, items: Array<Record<string, unknown>>): void {
    const row = this.rows.get(id)
    if (!row) return
    const fresh = new Set<string>()
    for (const data of row.view ? [row.base, row.view] : [row.base]) {
      const list = data.items
      if (!Array.isArray(list)) continue
      for (const item of items) {
        const index = list.findIndex((x: Record<string, unknown>) => x._id === item._id)
        if (index >= 0) list[index] = item
        else { list.push(item); if (typeof item._id === 'string') fresh.add(item._id) }
      }
    }
    if (fresh.size) this.added.set(id, [...(this.added.get(id) ?? []), fresh])
  }

  /**
   * 按存档退回时取基准（引用建的人）：存档里这个人的条目引用（savedItemIds）一件都不含的那批新加物品，从基准和视图里拿掉
   * （加条目后又撤销：存档已没有这条引用，基准不能还留着它，不然退回会把它建回来）。一批里有引用在 = 整批保留（连带授予的特性）。
   */
  baseFor(id: string, refs: Array<{ itemId?: string }>): ActorData | null {
    this.dropUnsaved(id, new Set(refs.map((r) => r.itemId).filter((x): x is string => !!x)))
    return this.base(id)
  }
  private dropUnsaved(id: string, savedItemIds: Set<string>): void {
    const row = this.rows.get(id)
    const batches = this.added.get(id)
    if (!row || !batches?.length) return
    const gone = batches.filter((b) => ![...b].some((x) => savedItemIds.has(x)))
    if (!gone.length) return
    const drop = new Set(gone.flatMap((b) => [...b]))
    for (const data of row.view ? [row.base, row.view] : [row.base]) {
      if (Array.isArray(data.items)) data.items = data.items.filter((x: Record<string, unknown>) => !drop.has(x._id as string))
    }
    this.added.set(id, batches.filter((b) => !gone.includes(b)))
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
