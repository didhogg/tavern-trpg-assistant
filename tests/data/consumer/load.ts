import { loadAllPacks } from '../r11-pack-helpers'
import { rec, type Rec } from './util'

export interface Row { id: string; type: string; name: string; nameEn?: string; pack: string; summary: string; keywords: string[]; data: Rec }

/** 11 个已构建的包合成的一个库：按编号、按类型取条目。读取器只通过它取数。 */
export class Lib {
  readonly rows: Row[]
  readonly byId = new Map<string, Row>()
  private readonly types = new Map<string, Row[]>()
  readonly packOrder: string[]

  constructor() {
    const packs = loadAllPacks()
    this.packOrder = packs.map((p) => p.id)
    this.rows = packs.flatMap((p) => p.entries.map((e) => ({ id: e.id, type: e.type, name: e.name, nameEn: e.nameEn, pack: p.id, summary: e.summary ?? '', keywords: e.keywords ?? [], data: rec(e.data) })))
    for (const r of this.rows) {
      this.byId.set(r.id, r)
      const list = this.types.get(r.type) ?? []
      list.push(r)
      this.types.set(r.type, list)
    }
  }

  of(type: string): Row[] { return this.types.get(type) ?? [] }
  get(id: string): Row | undefined { return this.byId.get(id) }
  need(id: string): Row {
    const r = this.byId.get(id)
    if (!r) throw new Error(`库里没有条目 ${id}`)
    return r
  }
}

let cached: Lib | undefined
export function lib(): Lib {
  cached ??= new Lib()
  return cached
}
