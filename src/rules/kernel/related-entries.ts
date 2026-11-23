// 显示出口要的“文字出自哪些条目”：怪物还要带上它引用的传奇组（巢穴动作、区域效应的原文在那里，作者导入怪物时从传奇组取）。
// 传奇组编号由本战役作者小窗按作者自己的写法算（rawHashes，和库里“传奇组 ↔ 怪物”对照同一个入口，见 library/legendary-creatures.ts），不手拼。
import type { LibraryService } from '../../library/service'
import type { LibraryView } from '../../library/revision'
import type { EntryRef } from '../../library/scopes'

type Row = { ref: EntryRef; entry: unknown; zh: unknown | null }
type Pointer = { name?: unknown; source?: unknown }

export async function legendaryGroupRefs(service: LibraryService, codeSet: string, view: LibraryView, rows: Row[]): Promise<EntryRef[]> {
  const wants = rows.flatMap((row) => {
    // 指针取本战役语言的那份条目（库里的编号按它算）
    const p = ((row.zh ?? row.entry) as { legendaryGroup?: Pointer } | null)?.legendaryGroup
    return row.ref.prop === 'monster' && typeof p?.name === 'string' && typeof p.source === 'string' ? [{ set: row.ref.set, pointer: { name: p.name, source: p.source } }] : []
  })
  if (!wants.length) return []
  const hashes = await (await service.frameOf(codeSet, view)).call('rawHashes', 'legendaryGroup', wants.map((w) => w.pointer))
  return [...new Map(wants.flatMap((w, i) => hashes[i] ? [[`${w.set}|${hashes[i]}`, { set: w.set, prop: 'legendaryGroup', hash: hashes[i]! }]] : [])).values()]
}
