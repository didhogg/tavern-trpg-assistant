// P3 性能改进 S3：Plutonium 换算结果缓存。换算结果只是本地副本，丢了能重算；存档仍只存引用/选择/状态差别。
// 钥匙 = 实际喂给 Plutonium 的条目内容摘要 + 数据版本记号 + 插件版本 + 内核输入（manifest/设置/规则）。
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

  async put(key: string, data: unknown): Promise<{ raw: number; compressed: number }> {
    const text = JSON.stringify(data)
    const z = await gzipText(text)
    await this.db.derived.put({ key: `kc:${key}`, fingerprint: key, value: { z, raw: text.length, savedAt: Date.now() }, savedAt: Date.now() })
    return { raw: text.length, compressed: z.byteLength }
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
    dataVersion: opts.dataVersion,
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
 * 给小窗包一层换算缓存：建卡/加怪物先查；命中直接用，没命中才进 Plutonium 并写回。
 * 直接经 `KernelRuntime.session` 取小窗的调用方自动走这里；测试/底层探针可直接拿原始 session。
 */
export function wrapKernelSession(session: KernelSession, cache: KernelCache, base: string, dataVersion: () => Promise<KernelDataVersion>): KernelSession {
  const raw = session.call as unknown as (fn: string, ...args: any[]) => Promise<any>
  const call = async (fn: string, ...args: any[]): Promise<any> => {
    if (fn === 'importForBuild') {
      const [prop, entry] = args
      const key = await kernelImportKey({ base, dataVersion: await dataVersion(), kind: prop === 'monster' ? 'monster' : 'build', prop, entry })
      const cached = await cache.get(key)
      if (cached !== null) return hit(cached)
      const result = await raw(fn, ...args)
      if (result.status === 'complete' && result.result) await cache.put(key, result.result)
      return result
    }
    if (fn === 'importMonsterActor') {
      const [entry] = args
      const key = await kernelImportKey({ base, dataVersion: await dataVersion(), kind: 'monster', prop: 'monster', entry })
      const cached = await cache.get(key)
      if (cached !== null) return raw('createActorFromData', cached)
      const data = await raw('importMonsterData', entry)
      if (data.status !== 'complete' || !data.result?.data) return data
      await cache.put(key, data.result.data)
      return raw('createActorFromData', data.result.data)
    }
    return raw(fn, ...args)
  }
  return { ...session, call } as unknown as KernelSession
}
