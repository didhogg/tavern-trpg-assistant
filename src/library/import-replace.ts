// P5.5 B8-7 导入会顶掉哪些已有的包：作者导入时按「包的身份」认包（utils-brew-base.js _getBrewId：有网址按网址，没有按
// _meta.sources 的来源编号组合，小写排序后连起来；插件 versions.ts packStableId 同一个算法），身份相同的旧包会被新文件整个替换。
// 导入预览里先列出来，让用户知道（例如再导入一遍同一个文件、或导入的文件和【我的库】里某个包同来源）。
import { packStableId } from './versions'

export interface ExistingPack { docIdLocal: string; filename: string | null; url?: string | null; isEditable: boolean; sources: string[] }
export interface ReplaceHit { file: string; pack: string; docIdLocal: string; filename: string | null; downloaded: boolean }

/** 文件里写的来源（不是合法 JSON、没有 _meta.sources 的不算，作者也认不出包）。 */
function sourcesOf(text: string): string[] | null {
  try {
    const meta = (JSON.parse(text) as { _meta?: { sources?: Array<{ json?: unknown }> } })?._meta
    const out = (meta?.sources ?? []).map((s) => String(s?.json ?? '')).filter(Boolean)
    return out.length ? out : null
  } catch { return null }
}

/** 哪些要导入的文件会顶掉哪个已有的包（可编辑自制不算：它是作者编辑器自己的那一份，导入不会替换它）。 */
export function importReplaces(existing: ExistingPack[], files: Array<{ name: string; text: string }>): ReplaceHit[] {
  const byId = new Map<string, ExistingPack>()
  for (const p of existing) {
    if (p.isEditable) continue
    const id = packStableId({ url: p.url ?? null, sources: p.sources })
    if (id) byId.set(id, p)
  }
  const out: ReplaceHit[] = []
  for (const f of files) {
    const sources = sourcesOf(f.text)
    const id = sources ? packStableId({ sources }) : null
    const hit = id ? byId.get(id) : undefined
    if (id && hit) out.push({ file: f.name, pack: id, docIdLocal: hit.docIdLocal, filename: hit.filename, downloaded: !!hit.url })
  }
  return out
}
