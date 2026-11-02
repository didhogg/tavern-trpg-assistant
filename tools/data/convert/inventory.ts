import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ConvertContext } from './context'
import { BOOKS, SRD_PACK_ID } from '../config/books'

type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v : '')

/** 一行来源物品的解析结果：id、显示名与来源包。 */
export interface InventorySource {
  id: string
  name: string
  fromAc: boolean
}

export interface InventoryStats {
  monsters: number
  refs: number
  names: number
  acRefs: number
  acNames: number
  attachedRefs: number
  attachedNames: number
  backfilledAcItems: number
}

export const inventoryStats: InventoryStats = { monsters: 0, refs: 0, names: 0, acRefs: 0, acNames: 0, attachedRefs: 0, attachedNames: 0, backfilledAcItems: 0 }

const CATALOG = join(process.env.TRPG_DATA_REPO ?? '/Users/xxx/tavern-trpg-data', 'catalog.json')
let catalogReach: Map<string, Set<string>> | undefined

/** 依赖闭包只取构建前数据仓库里已经存在的依赖；背包不会凭空新增包依赖。 */
function loadCatalogReach(): Map<string, Set<string>> {
  if (catalogReach) return catalogReach
  const out = new Map<string, Set<string>>()
  try {
    const raw = JSON.parse(readFileSync(CATALOG, 'utf8')) as { packs?: Array<{ id?: unknown; relationships?: { requires?: Array<{ id?: unknown }> } }> }
    for (const pack of raw.packs ?? []) {
      if (typeof pack.id !== 'string') continue
      const requires = new Set<string>([pack.id, SRD_PACK_ID])
      for (const dep of pack.relationships?.requires ?? []) if (typeof dep.id === 'string') requires.add(dep.id)
      out.set(pack.id, requires)
    }
  } catch (error) {
    console.warn(`[trpg-assistant] 读取数据目录依赖失败，背包只使用政策表依赖：${error instanceof Error ? error.message : String(error)}`)
  }
  catalogReach = out
  return out
}

function policyReach(packId: string): Set<string> {
  const out = new Set<string>([packId, SRD_PACK_ID])
  const visit = (id: string): void => {
    const book = BOOKS.find((b) => b.packId === id)
    for (const source of book?.requires ?? []) {
      const dep = BOOKS.find((b) => b.source === source)?.packId
      if (dep && !out.has(dep)) { out.add(dep); visit(dep) }
    }
  }
  visit(packId)
  return out
}

/** 物品所在的包是否已经在怪物包的现有依赖闭包里。 */
export function itemPackAllowed(monsterPackId: string, itemPackId: string): boolean {
  if (monsterPackId === itemPackId || itemPackId === SRD_PACK_ID) return true
  const reach = loadCatalogReach().get(monsterPackId) ?? policyReach(monsterPackId)
  return reach.has(itemPackId)
}

function packOf(ctx: ConvertContext, id: string): string | undefined {
  for (const list of ctx.index.byTypeName.values()) for (const target of list) if (target.id === id) return target.packId
  return undefined
}

function displayName(raw: string, fallback: string): string {
  const parts = raw.split('|')
  const named = parts[2] || parts[0] || fallback
  return named.replace(/^\{@item\s+/, '').replace(/[{}]/g, '').trim() || fallback
}

function itemTagNames(raw: Rec, resolve: (uid: string) => string | undefined): Map<string, string> {
  const out = new Map<string, string>()
  for (const ac of Array.isArray(raw.ac) ? raw.ac : []) {
    if (!isObj(ac)) continue
    for (const from of Array.isArray(ac.from) ? ac.from : []) {
      for (const match of str(from).matchAll(/\{@item ([^}|]+)(?:\|([^}|]*))?(?:\|([^}|]*))?[^}]*\}/g)) {
        const id = resolve(`${match[1]}|${match[2] ?? ''}`)
        if (id) out.set(id, (match[3] || match[1]).trim())
      }
    }
  }
  return out
}

function attachedNames(raw: Rec, resolve: (uid: string) => string | undefined): Map<string, string> {
  const out = new Map<string, string>()
  for (const uid of Array.isArray(raw.attachedItems) ? raw.attachedItems : []) {
    const id = resolve(str(uid))
    if (id) out.set(id, displayName(str(uid), str(uid).split('|')[0] || id))
  }
  return out
}

function quantityOf(name: string): number {
  const m = /(?:^|[×xX*]\s*)(\d+)\s*(?:件|个|把|支|面|张)?$/.exec(name.trim())
  return m ? Math.max(1, Number(m[1])) : 1
}

function put(out: Map<string, Record<string, unknown>>, id: string, name: string, equipped: boolean, fromAc: boolean): void {
  if (out.has(id)) return
  out.set(id, { ref: id, qty: quantityOf(name), equipped })
  inventoryStats.refs++
  if (fromAc) inventoryStats.acRefs++
  else inventoryStats.attachedRefs++
}

function putName(out: Map<string, Record<string, unknown>>, name: string, fromAc: boolean): void {
  const key = `name:${name}`
  if (out.has(key)) return
  out.set(key, { name, qty: quantityOf(name), equipped: true })
  inventoryStats.names++
  if (fromAc) inventoryStats.acNames++
  else inventoryStats.attachedNames++
}

/** 怪物转换的最后一步：把 `ac[].items` 与 `attachedItems` 汇总成与人物共用的 inventory。 */
export function addInventory(plan: { packId: string; raw: Rec }, data: Rec, ctx: ConvertContext, resolve: (uid: string) => string | undefined): void {
  const raw = plan.raw
  const acNames = itemTagNames(raw, resolve)
  const attNames = attachedNames(raw, resolve)
  const rawAc = Array.isArray(raw.ac) ? raw.ac : []
  const dataAc = Array.isArray(data.ac) ? data.ac : []
  const out = new Map<string, Record<string, unknown>>()
  dataAc.forEach((ac, i) => {
    if (!isObj(ac)) return
    const ids = Array.isArray(ac.items) ? ac.items : []
    for (const id of ids) {
      if (typeof id !== 'string') continue
      const name = acNames.get(id) ?? str(ac.from) ?? str(rawAc[i]) ?? id
      const pack = packOf(ctx, id)
      if (pack && itemPackAllowed(plan.packId, pack)) put(out, id, name, true, true)
      else putName(out, name, true)
    }
  })
  for (const id of Array.isArray(data.attachedItems) ? data.attachedItems : []) {
    if (typeof id !== 'string') continue
    const name = attNames.get(id) ?? id
    const pack = packOf(ctx, id)
    if (pack && itemPackAllowed(plan.packId, pack)) put(out, id, name, true, false)
    else putName(out, name, false)
  }
  if (out.size) {
    data.inventory = [...out.values()]
    inventoryStats.monsters++
  }
}

/** 来源 `ac[].from` 是纯文字护甲名时，按名称唯一对上物品才补 `ac[].items`；不新增包依赖。 */
export function backfillAcItems(plan: { packId: string; raw: Rec }, data: Rec, ctx: ConvertContext): void {
  const rawAc = Array.isArray(plan.raw.ac) ? plan.raw.ac : []
  const dataAc = Array.isArray(data.ac) ? data.ac : []
  if (rawAc.length !== dataAc.length) return
  rawAc.forEach((raw, i) => {
    if (!isObj(raw) || !isObj(dataAc[i]) || Array.isArray((dataAc[i] as Rec).items)) return
    for (const from of Array.isArray(raw.from) ? raw.from : []) {
      const name = str(from).trim()
      if (!name || includesTag(name)) continue
      const hits = [...(ctx.index.byTypeName.get(`item|${name}`) ?? []), ...(ctx.index.byTypeName.get(`base-item|${name}`) ?? [])]
      const unique = [...new Map(hits.map((h) => [h.id, h])).values()]
      if (unique.length !== 1) continue
      const target = unique[0]
      if (!itemPackAllowed(plan.packId, target.packId)) continue
      ;(dataAc[i] as Rec).items = [target.id]
      inventoryStats.backfilledAcItems++
      break
    }
  })
}

function includesTag(text: string): boolean {
  return /\{@[^}]+\}/.test(text)
}
