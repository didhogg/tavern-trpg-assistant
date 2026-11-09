// 最近读过的整类解析结果留在内存里：读一次整类要几十毫秒（英文怪物整张表），按编号逐条取时每条都读一遍太慢。
// 【库】数据库的 derived 表一有写入（任何实例、任何标签页，Dexie storagemutated）就全部作废，所以不会读到旧的。
// 只留最近 4 类，不常驻整库（手机内存紧）。交出去的是同一份对象，调用方只读不改。
import Dexie from 'dexie'
import type { LibraryDatabase } from './db'

const LIMIT = 4

export class ParsedMemo {
  private readonly memo = new Map<string, Promise<unknown>>()

  constructor(private readonly db: LibraryDatabase) {
    const prefix = `idb://${db.name}/derived/`
    Dexie.on('storagemutated', (parts) => {
      if (Object.keys(parts).some((k) => k.startsWith(prefix))) this.memo.clear()
    })
  }

  /** derived 表里这一行的 value；没有返回 undefined。 */
  get(key: string): Promise<unknown> {
    const hit = this.memo.get(key)
    if (hit) {
      this.memo.delete(key)
      this.memo.set(key, hit)
      return hit
    }
    const p = this.db.derived.get(key).then((rec) => rec?.value)
    p.catch(() => this.memo.delete(key))
    this.memo.set(key, p)
    if (this.memo.size > LIMIT) this.memo.delete(this.memo.keys().next().value as string)
    return p
  }
}
