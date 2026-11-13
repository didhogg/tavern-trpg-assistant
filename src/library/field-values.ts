// P5.5 C10：字段表（formats.fields）加上下拉 / 建议值的显示名。显示名按资料集从作者对照表取（小窗 valueLabels：中文版小窗给中文），
// 取不到的不给，界面显示原值。同一资料集、同一类别只取一次。
import type { FieldShape } from './brew-validate'
import { formatOfCodeSet, type FieldTable } from './formats'
import type { LibraryService } from './service'

const cache = new Map<string, Promise<FieldTable | null>>()

/** 形状里有值可选的地方（下拉、多选的 enum，文字的建议值），按找到的顺序。 */
function valueLists(shape: FieldShape | undefined, out: Array<{ shape: FieldShape & { labels?: Record<string, string> }; values: string[] }>): void {
  if (!shape || 'ref' in shape) return
  if ((shape.c === 'select' || shape.c === 'multiselect') && shape.enum.every((v) => typeof v === 'string')) out.push({ shape, values: shape.enum as string[] })
  else if (shape.c === 'text' && shape.suggest?.every((v) => typeof v === 'string')) out.push({ shape, values: shape.suggest as string[] })
  else if (shape.c === 'list' || shape.c === 'map') valueLists(shape.of, out)
  else if (shape.c === 'group') for (const p of shape.props) valueLists(p.shape, out)
  else if (shape.c === 'pick') for (const b of shape.branches) valueLists(b.shape, out)
}

/** 带显示名的字段表（formats.fields + 作者对照表）。 */
export function fieldTable(lib: Pick<LibraryService, 'frameOf'>, codeSet: string, prop: string): Promise<FieldTable | null> {
  const key = `${codeSet}|${prop}`
  let got = cache.get(key)
  if (!got) {
    got = (async () => {
      const raw = await formatOfCodeSet(codeSet).fields(prop)
      if (!raw) return null
      const t = structuredClone(raw)
      const lists: Parameters<typeof valueLists>[1] = []
      for (const f of t.fields) valueLists(f.shape, lists)
      for (const d of Object.values(t.defs)) valueLists(d, lists)
      if (lists.length) {
        const labels = await (await lib.frameOf(codeSet)).call('valueLabels', lists.map((l) => l.values))
        lists.forEach((l, i) => { if (labels[i]) l.shape.labels = labels[i]! })
      }
      return t
    })().catch((e: unknown) => { cache.delete(key); throw e })
    cache.set(key, got)
  }
  return got
}
