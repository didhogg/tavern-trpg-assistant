// 记录 Plutonium 通用进阶读的原始字段，以及合并时实际保留下来的进阶。
/* eslint-disable @typescript-eslint/no-explicit-any -- 锁定的作者模块没有类型声明。 */
import { hashValue } from '../../../core/hash'
import { plutoniumBuild } from './plutonium-build'

const SCOPE = 'tavern-trpg-assistant'
const FLAG = 'automaticTraitOrigins'

interface Origin { field: string; input: string }

export function traitOrigins(data: any): Record<string, Origin> {
  return data.flags?.[SCOPE]?.[FLAG] ?? {}
}

export function stripTraitOrigins(data: any): void {
  const scope = data.flags?.[SCOPE]
  if (!scope || !(FLAG in scope)) return
  delete scope[FLAG]
  if (!Object.keys(scope).length) delete data.flags[SCOPE]
}

const keys = (pool: Iterable<string> = []) => [...pool].sort()
const signature = (adv: any) => hashValue({
  type: adv.type, level: adv.level ?? 0, restriction: adv.classRestriction || null,
  name: adv.name ?? '', hint: adv.hint ?? '', mode: adv.configuration?.mode ?? 'default',
  grants: keys(adv.configuration?.grants), allowReplacements: Boolean(adv.configuration?.allowReplacements),
  choices: (adv.configuration?.choices ?? []).map((slot: any) => [slot.count ?? 1, keys(slot.pool)]),
})

/** importEntry 串行换算。临时观察两处原方法，换算结束立即恢复。 */
export async function traceTraitOrigins(convert: () => Promise<any>): Promise<any> {
  const api = plutoniumBuild
  if (!api) return convert()
  const generic = api.UtilAdvancementsEntry
  const merge = api.UtilAdvancements
  const build = generic.getGenericAdvancements
  const assemble = merge.getAdvancementsObject
  const fields = new WeakMap<object, Origin>()
  const merged = new Map<string, { origin: Origin; signature: string }>()
  generic.getGenericAdvancements = function (entry: any, ...args: any[]) {
    const observed = new Proxy(this, { get(target, key, receiver) {
      const method = Reflect.get(target, key, receiver)
      if (typeof method !== 'function' || typeof key !== 'string' || !key.startsWith('_getGenericAdvancements_')) return method
      return (input: object, ...opts: any[]) => {
        // 每条通用分支只有实际读取的数组字段可作为出处。读到多处时，保留原进阶。
        const read = new Map<string, unknown[]>()
        const rows = method.call(target, new Proxy(input, { get(obj, field, proxy) {
          const value = Reflect.get(obj, field, proxy)
          if (typeof field === 'string' && Array.isArray(value)) read.set(field, value)
          return value
        } }), ...opts)
        if (read.size === 1 && rows.some((row: any) => row.type === 'Trait')) {
          const [[field, input]] = read
          const origin = { field, input: hashValue(input) }
          for (const row of rows) if (row.type === 'Trait') fields.set(row, origin)
        }
        return rows
      }
    } })
    return build.call(observed, entry, ...args)
  }
  merge.getAdvancementsObject = function (...args: any[]) {
    const output = assemble.apply(this, args)
    for (const [id, adv] of Object.entries(output) as [string, any][]) {
      const origin = fields.get(adv)
      if (origin) merged.set(id, { origin, signature: signature(adv) })
      else merged.delete(id)
    }
    return output
  }
  try {
    const data = await convert()
    // 作者的补充 system 还能在合并之后覆盖进阶，只认内容也对得上的结果。
    const origins = Object.fromEntries(Object.entries(data.system?.advancement ?? {}).flatMap(([id, adv]) => {
      const origin = merged.get(id)
      return origin && origin.signature === signature(adv) ? [[id, origin.origin]] : []
    }))
    stripTraitOrigins(data)
    if (Object.keys(origins).length) {
      data.flags ??= {}
      data.flags[SCOPE] ??= {}
      data.flags[SCOPE][FLAG] = origins
    }
    return data
  } finally {
    generic.getGenericAdvancements = build
    merge.getAdvancementsObject = assemble
  }
}
