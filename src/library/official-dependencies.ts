import type { FileList } from './fetcher'
import type { OfficialPlan } from './plan'
import type { SourceFiles } from './runtime/frame/directory-commands'

type SourceMap = SourceFiles['maps']
type ReadRaw = (path: string) => Promise<string | null>
type RawFile = Record<string, unknown> & {
  _meta?: {
    dependencies?: Record<string, string[]>
    includes?: Record<string, string[]>
    otherSources?: Record<string, Record<string, string>>
  }
}

/** 只追作者按来源拆出的原件；共用/职业文件已经在基础计划中，由作者负责合并。 */
export async function officialDependencies(roots: string[], maps: SourceMap, read: ReadRaw, concurrency = 6) {
  const indexes = new Map<string, Set<string>>()
  const byProp = new Map(Object.entries(maps).filter(([, map]) => map.bySource).map(([prop, map]) =>
    [prop, new Map(Object.entries(map.index).map(([key, file]) => [key.toLowerCase(), { key, path: `data/${map.dir}/${file}`, index: map.indexPath }]))]))
  const seen = new Set(roots)
  const dependencies = new Set<string>()
  let pending = roots.filter((path) => path.startsWith('data/'))
  while (pending.length && byProp.size) {
    const wave = pending
    pending = []
    const need = (prop: string, source: string): void => {
      const match = byProp.get(prop)?.get(source.toLowerCase())
      if (!match) return
      const keys = indexes.get(match.index) ?? new Set<string>()
      keys.add(match.key)
      indexes.set(match.index, keys)
      if (seen.has(match.path)) return
      seen.add(match.path)
      dependencies.add(match.path)
      pending.push(match.path)
    }
    let cursor = 0
    await Promise.all(Array.from({ length: Math.min(concurrency, wave.length) }, async () => {
      while (cursor < wave.length) {
        const path = wave[cursor++]
        const text = await read(path)
        if (text === null) continue
        const data = JSON.parse(text) as RawFile | null
        if (!data) continue
        for (const [prop, sources] of Object.entries(data._meta?.dependencies ?? {})) {
          if (Array.isArray(data[prop])) for (const source of sources) need(prop, source)
        }
        for (const [prop, sources] of Object.entries(data._meta?.includes ?? {})) for (const source of sources) need(prop, source)
        for (const [prop, sources] of Object.entries(data._meta?.otherSources ?? {})) for (const source of Object.keys(sources)) need(prop, source)
        for (const prop of byProp.keys()) {
          const entries = data[prop]
          if (!Array.isArray(entries)) continue
          for (const entry of entries) {
            const source = entry?._copy?.source
            if (typeof source === 'string') need(prop, source)
          }
        }
      }
    }))
  }
  return { files: [...dependencies].sort(), indexes }
}

export async function extendOfficialPlan(plan: OfficialPlan, list: FileList, codeSet: string, read: ReadRaw, concurrency?: number) {
  if (!plan.sourceFiles || plan.sources === null) return { plan, dependencies: [] as string[] }
  const deps = await officialDependencies(plan.files, plan.sourceFiles.maps, read, concurrency)
  const files = deps.files.filter((path) => !!list[path])
  const sourceIndexes = { ...plan.sourceIndexes }
  for (const [path, keys] of deps.indexes) {
    const key = `${codeSet}|${path}`
    if (sourceIndexes[key] !== null) sourceIndexes[key] = [...new Set([...(sourceIndexes[key] ?? []), ...keys])].sort()
  }
  const bytes = files.reduce((sum, path) => sum + list[path].size, 0)
  return {
    plan: { ...plan, files: [...plan.files, ...files], bytes: plan.bytes + bytes, sourceIndexes,
      bySource: { files: [...plan.bySource.files, ...files], bytes: plan.bySource.bytes + bytes } },
    dependencies: files,
  }
}
