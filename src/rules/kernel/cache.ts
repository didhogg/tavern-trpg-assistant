// P3 性能改进 S3：Plutonium 换算结果缓存。换算结果只是本地副本，丢了能重算；存档仍只存引用/选择/状态差别。
// 条目换算钥匙 = 实际喂给 Plutonium 的条目内容摘要 + 官方数据版本 + 结算内核指纹（input.ts：manifest/设置/规则/小窗代码）。
// 不含自制包版本：结算小窗只读英文官方文件（host.ts libraryData），看不到自制包，改自制不影响官方条目的换算；
// 自制 / 房规条目自己的内容已在条目摘要里。人物重建基准（kernelBaseKey）仍含自制包版本：房规会改条目生效版本。
/* eslint-disable @typescript-eslint/no-explicit-any -- 内核命令结果原样转交，形状由 commands 决定 */
import type { LibraryDatabase } from '../../library/db'
import type { KernelDataVersion } from '../../schemas/kernel'
import { hashValue } from '../../core/hash'
import { gzipText, gunzipText } from '../../core/compress'
import type { KernelSession } from './host'

export interface KernelCacheBase {
  /** 内核输入摘要（input.ts 算好：manifest、设置、规则、插件版本）。 */
  base: string
  dataVersion: () => Promise<KernelDataVersion>
}

/** 一行缓存属于哪套：规则 + 结算内核指纹 + 官方数据版本。清理时同规则下不是这一套的就是旧的。 */
export interface KernelCacheScope { rule: string; base: string; official: string }

/** 换算结果缓存，存在【库】数据库的 derived 表（kc: 前缀）；没有就重算，不参与存档。 */
export class KernelCache {
  constructor(private readonly db: LibraryDatabase) {}

  async get(key: string): Promise<unknown | null> {
    const rec = await this.db.derived.get(`kc:${key}`)
    const value = rec?.value as { data?: unknown; z?: Uint8Array } | undefined
    if (!value) return null
    if (value.z) return JSON.parse(await gunzipText(value.z))
    return 'data' in value ? value.data ?? null : null
  }

  async put(key: string, data: unknown, scope: KernelCacheScope): Promise<{ raw: number; compressed: number }> {
    const text = JSON.stringify(data)
    const z = await gzipText(text)
    await this.db.derived.put({ key: `kc:${key}`, fingerprint: key, value: { z, raw: text.length, scope, savedAt: Date.now() }, savedAt: Date.now() })
    return { raw: text.length, compressed: z.byteLength }
  }

  /** 删掉同规则下不属于这一套的行（结算内核或官方数据换过之后的旧换算），以及没记套别的老格式行。返回删了几行。 */
  async sweep(scope: KernelCacheScope): Promise<number> {
    const stale: string[] = []
    await this.db.derived.where('key').startsWith('kc:').each((rec) => {
      const s = (rec.value as { scope?: KernelCacheScope } | undefined)?.scope
      if (!s || (s.rule === scope.rule && (s.base !== scope.base || s.official !== scope.official))) stale.push(rec.key)
    })
    await this.db.derived.bulkDelete(stale)
    return stale.length
  }
}

export async function kernelBaseKey(opts: {
  base: string
  dataVersion: KernelDataVersion
  actor: { id?: string; name?: string; seed?: string; refs: unknown; choices: unknown }
}): Promise<string> {
  return hashValue({
    base: opts.base,
    dataVersion: opts.dataVersion,
    kind: 'base',
    id: opts.actor.id ?? null,
    name: opts.actor.name ?? null,
    seed: opts.actor.seed ?? null,
    refs: opts.actor.refs,
    choices: opts.actor.choices,
  })
}

export async function kernelImportKey(opts: {
  base: string
  dataVersion: KernelDataVersion
  kind: 'build' | 'monster'
  prop: string
  entry: unknown
}): Promise<string> {
  return hashValue({
    base: opts.base,
    official: opts.dataVersion.official,
    kind: opts.kind,
    prop: opts.prop,
    entry: hashValue(opts.entry),
  })
}

const hit = (data: unknown): any => ({
  status: 'complete', result: data, sources: {}, changes: [], diceUsed: 0,
  missing: null, pending: null, unsupported: [],
})

/**
 * 带条目行的命令：行在哪个参数里。调用前给每行补上换算结果（row.data），小窗里就不再现场换算。
 * 建人物、读档重建、加到人物、批量建都走这里；新命令带条目行时在这里登记一行。
 */
const ROWS_OF: Record<string, (args: any[]) => any[]> = {
  buildCharacter: (a) => [...(a[0]?.items ?? []), ...(a[0]?.equipment ?? [])],
  rebuildCharacter: (a) => [...(a[0]?.items ?? []), ...(a[0]?.equipment ?? [])],
  addToActor: (a) => a[1] ?? [],
  createActorsBatch: (a) => a[0] ?? [],
}

/**
 * 给小窗包一层换算缓存：先查（装资料时已预换算好）；命中直接用，没命中才进 Plutonium 并写回。
 * 直接经 `KernelRuntime.session` 取小窗的调用方自动走这里；测试/底层探针可直接拿原始 session。
 */
export function wrapKernelSession(session: KernelSession, cache: KernelCache, base: string, dataVersion: () => Promise<KernelDataVersion>, rule = ''): KernelSession {
  const raw = session.call as unknown as (fn: string, ...args: any[]) => Promise<any>
  /** 一条条目的换算结果：缓存 → 现场换算并写回。 */
  const converted = async (prop: string, entry: unknown, versionOf: () => Promise<KernelDataVersion>): Promise<any> => {
    const version = await versionOf()
    const key = await kernelImportKey({ base, dataVersion: version, kind: prop === 'monster' ? 'monster' : 'build', prop, entry })
    const cached = await cache.get(key)
    if (cached !== null) return hit(cached)
    const result = await raw('importForBuild', prop, entry)
    if (result.status === 'complete' && result.result) await cache.put(key, result.result, { rule, base, official: version.official })
    return result
  }
  const call = async (fn: string, ...args: any[]): Promise<any> => {
    // 一次命令里资料版本只取一次（每次现取要读库），用到才取
    let cached: Promise<KernelDataVersion> | null = null
    const version = (): Promise<KernelDataVersion> => (cached ??= dataVersion())
    if (fn === 'importForBuild') return converted(args[0], args[1], version)
    if (fn === 'importMonsterActor' || fn === 'rebuildMonster') {
      const entry = fn === 'rebuildMonster' ? args[0]?.entry : args[0]
      const result = await converted('monster', entry, version)
      if (result.status !== 'complete' || !result.result) return result
      return fn === 'rebuildMonster' ? raw(fn, { ...args[0], data: result.result }) : raw('createActorFromData', result.result)
    }
    const rows = ROWS_OF[fn]?.(args)
    for (const row of rows ?? []) {
      if (row.data || !row.entry) continue
      const result = await converted(row.prop, row.entry, version)
      if (result.status !== 'complete' || !result.result) return result
      row.data = result.result
    }
    return raw(fn, ...args)
  }
  return { ...session, call } as unknown as KernelSession
}
