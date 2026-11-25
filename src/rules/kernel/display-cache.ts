// 显示出口的缓存（runtime.displayFor 用）：同一个结算小窗、同一份选书、同一串条目的显示出口只建一次。
// 每次写完重读整张人物都要它；人物条目越多建得越久（真机上一次 1～3 秒），以前每次重建，占了重读的一大半。
// 小窗重开（库发布了新版）是新的一份；选书变了钥匙跟着变；只留最近几份。建的过程分段计时写 console.debug。
import { stopwatch } from '../../core/stopwatch'
import type { CampaignLibrary, EntryRef } from '../../library/scopes'
import type { DisplayResult } from './display'

export interface DisplayFor { entries: unknown[]; show: <T>(value: T) => Promise<DisplayResult<T>> }

export class DisplayCache<O extends object> {
  private readonly byOpen = new WeakMap<O, Map<string, Promise<DisplayFor>>>()
  constructor(private readonly keep = 6) {}

  get(o: O, library: CampaignLibrary, refs: EntryRef[], build: (w: ReturnType<typeof stopwatch>) => Promise<DisplayFor>): Promise<DisplayFor> {
    let memo = this.byOpen.get(o)
    if (!memo) { memo = new Map(); this.byOpen.set(o, memo) }
    const key = JSON.stringify([library, refs.map((r) => [r.set, r.prop, r.hash])])
    const hit = memo.get(key)
    if (hit) return hit
    const w = stopwatch()
    const made = build(w).then((v) => { if (refs.length) console.debug('[trpg-assistant] 显示出口用时', JSON.stringify(w.done({ refs: refs.length }))); return v })
    memo.set(key, made)
    made.catch(() => memo!.delete(key))
    while (memo.size > this.keep) memo.delete(memo.keys().next().value!)
    return made
  }
}
