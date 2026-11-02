import { SUPPORTED_DATA_VERSION } from '../../schemas/common'
import type { TrpgDatabase } from '../db'
import { TrpgError } from '../errors'
import { sha256Hex } from '../hash'
import { uuid } from '../ids'
import type { PackService } from '../packs/installer'
import { bumpPatch } from '../semver'
import type { RuleRegistry } from '../../rules/registry'
import { entrySchema, type Entry, type InstalledPack, type PackCategory, type StoredEntry } from '../../schemas/pack'
import { entryIdSchema } from '../../schemas/common'
import { SCHEMA_VERSIONS } from '../../schemas/common'
import { structuralRefs } from '../../rules/dnd5e2014/data/refs'

export interface MineDeps {
  db: TrpgDatabase
  packs: PackService
  rules: RuleRegistry
  now: () => number
}

function randomId(): string {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  return `u-${Array.from(bytes, (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')}`
}

const sameName = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase()
const randomEntryId = (type: string): string => `${type.charAt(0).toLowerCase()}-${Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')}`

export const DEFAULT_MINE_NAME = '未分组'
export const defaultMinePackId = (ruleId: string): string => `u-unsorted-${ruleId}`
export type StoreMode = 'update' | 'new'
export interface StoreResult { packId?: string; entryId?: string; version?: string; conflict?: { entryId: string } }

/** 「我的库」的数据层与库内编辑（L1 §3.17）：我的包是 `source: 'user'` 的扩展包，可以直接增删改条目。 */
export class MyLibrary {
  constructor(private readonly deps: MineDeps) {}

  private get db(): TrpgDatabase {
    return this.deps.db
  }

  private async mine(packId: string): Promise<InstalledPack> {
    const pack = await this.db.packs.get(packId)
    if (!pack) throw new TrpgError('E_NOT_FOUND', '没有找到这个包')
    if (pack.source !== 'user') throw new TrpgError('E_NOT_MINE', '只有「我的」里的包可以直接编辑；可以先复制为我的包')
    return pack
  }

  private async assertFreeName(ruleId: string, name: string, exceptId?: string): Promise<void> {
    const peers = await this.db.packs.where('ruleId').equals(ruleId).toArray()
    if (peers.some((p) => p.id !== exceptId && p.source === 'user' && sameName(p.name, name))) throw new TrpgError('E_BAD_NAME', `「我的」里已经有叫「${name}」的包`)
  }

  async list(ruleId?: string): Promise<InstalledPack[]> {
    if (ruleId) await this.ensureDefault(ruleId)
    return (await this.deps.packs.list({ ruleId })).filter((p) => p.source === 'user')
  }

  /** 每个规则始终有一个「未分组」包；编号固定，打开【我的】与存条目时都确保存在。 */
  async ensureDefault(ruleId: string): Promise<InstalledPack> {
    if (!this.deps.rules.has(ruleId)) throw new TrpgError('E_RULE_MISSING', '这个规则没有安装')
    const id = defaultMinePackId(ruleId)
    const found = await this.db.packs.get(id)
    if (found) return found
    const pack: InstalledPack = {
      id,
      ruleId,
      category: 'rules',
      name: DEFAULT_MINE_NAME,
      version: '1.0.0',
      license: '',
      attribution: '',
      description: '',
      lineage: uuid(),
      entryCount: 0,
      typeCounts: {},
      contributes: { entries: 0, tables: 0, variants: 0, adventures: 0, ruleOptions: 0 },
      relationships: { requires: [], recommends: [], conflicts: [] },
      blobs: [],
      dataVersion: SUPPORTED_DATA_VERSION,
      source: 'user',
      byteSize: 0,
      sha256: '',
      installedAt: this.deps.now(),
      schemaVersion: SCHEMA_VERSIONS.pack,
      blobHashes: [],
      content: { features: [], adventure: {}, fallback: [] },
    }
    await this.db.packs.put(pack)
    return this.refresh(id, false)
  }

  /** 新建：名称、分组、简介；id 为 `u-` + 10 位随机字符，新的 lineage，版本 1.0.0。 */
  async create(input: { ruleId: string; name: string; category?: PackCategory; description?: string }): Promise<InstalledPack> {
    const name = input.name.trim()
    if (!name || name.length > 80) throw new TrpgError('E_BAD_NAME', '名称需要 1–80 个字')
    if (!this.deps.rules.has(input.ruleId)) throw new TrpgError('E_RULE_MISSING', '这个规则没有安装')
    await this.assertFreeName(input.ruleId, name)
    const pack: InstalledPack = {
      id: randomId(),
      ruleId: input.ruleId,
      category: input.category ?? 'rules',
      name,
      version: '1.0.0',
      license: '',
      attribution: '',
      description: (input.description ?? '').slice(0, 400),
      lineage: uuid(),
      entryCount: 0,
      typeCounts: {},
      contributes: { entries: 0, tables: 0, variants: 0, adventures: 0, ruleOptions: 0 },
      relationships: { requires: [], recommends: [], conflicts: [] },
      blobs: [],
      dataVersion: SUPPORTED_DATA_VERSION, // 新建的自制包用当前格式：与官方包走同一套严格校验
      source: 'user',
      byteSize: 0,
      sha256: '',
      installedAt: this.deps.now(),
      schemaVersion: SCHEMA_VERSIONS.pack,
      blobHashes: [],
      content: { features: [], adventure: {}, fallback: [] },
    }
    await this.db.packs.put(pack)
    return this.refresh(pack.id, false)
  }

  /** 改名与简介：只改说明，不算内容改动，版本号不变。 */
  async rename(packId: string, input: { name: string; description?: string }): Promise<InstalledPack> {
    const pack = await this.mine(packId)
    const name = input.name.trim()
    if (!name || name.length > 80) throw new TrpgError('E_BAD_NAME', '名称需要 1–80 个字')
    if (pack.id === defaultMinePackId(pack.ruleId) && name !== DEFAULT_MINE_NAME) throw new TrpgError('E_BAD_NAME', '默认包不能改名')
    await this.assertFreeName(pack.ruleId, name, packId)
    const next = { ...pack, name, description: (input.description ?? pack.description).slice(0, 400) }
    await this.db.packs.put(next)
    return next
  }

  /** 复制为我的包：任何已安装的扩展包都可以，新 id、新 lineage，derivedFrom 记录原包。 */
  async duplicate(srcId: string): Promise<InstalledPack> {
    const src = await this.db.packs.get(srcId)
    if (!src) throw new TrpgError('E_NOT_FOUND', '没有找到这个包')
    const peers = await this.db.packs.where('ruleId').equals(src.ruleId).toArray()
    const isDefault = src.id === defaultMinePackId(src.ruleId)
    const base = isDefault ? `${DEFAULT_MINE_NAME}（副本）` : `${src.name}（我的）`
    let name = base
    for (let n = 2; peers.some((p) => p.source === 'user' && sameName(p.name, name)); n++) name = isDefault ? `${DEFAULT_MINE_NAME}（副本 ${n}）` : `${src.name}（我的 ${n}）`
    const id = randomId()
    const copy = { ...structuredClone(src), id, name, lineage: uuid(), version: '1.0.0', source: 'user' as const, installedAt: this.deps.now(), derivedFrom: { id: src.id, lineage: src.lineage, version: src.version } }
    const entries = (await this.db.entries.where('packId').equals(srcId).toArray()).map((e) => ({ ...structuredClone(e), packId: id }))
    await this.db.transaction('rw', [this.db.packs, this.db.entries], async () => {
      await this.db.packs.put(copy)
      await this.db.entries.bulkPut(entries)
    })
    return this.refresh(id, false)
  }

  /** 删除：先把完整包文件放进库回收站，再删除。 */
  async remove(packId: string): Promise<void> {
    const pack = await this.mine(packId)
    if (pack.id === defaultMinePackId(pack.ruleId)) throw new TrpgError('E_BAD_CONTENT', '默认包不能删除')
    await this.db.packTrash.put({ id: pack.id, name: pack.name, ruleId: pack.ruleId, bytes: await this.deps.packs.exportPack(pack.id), deletedAt: this.deps.now() })
    await this.deps.packs.remove(packId)
  }

  trash(): Promise<Array<{ id: string; name: string; ruleId: string; deletedAt: number }>> {
    return this.db.packTrash.toArray().then((rows) => rows.map(({ bytes: _b, ...rest }) => rest).sort((a, b) => b.deletedAt - a.deletedAt))
  }

  async restore(trashId: string): Promise<InstalledPack> {
    const row = await this.db.packTrash.get(trashId)
    if (!row) throw new TrpgError('E_NOT_FOUND', '回收站里没有这个包')
    const rec = this.deps.packs.recognize(row.bytes)
    if (rec.type !== 'pack') throw new TrpgError('E_BAD_CONTENT', '回收站里的文件已损坏')
    const installed = await this.deps.packs.install(rec, { source: 'user', resolution: 'overwrite' })
    await this.db.packTrash.delete(trashId)
    return installed
  }

  async purge(trashId: string): Promise<void> {
    await this.db.packTrash.delete(trashId)
  }

  // ---------- 条目 ----------

  entries(packId: string): Promise<StoredEntry[]> {
    return this.db.entries.where('packId').equals(packId).toArray()
  }

  /** 保存条目（新建或修改）：校验条目结构与类型；每次保存版本号末位加 1。条目编辑器（U11）经这里写入。 */
  async saveEntry(packId: string, entry: Entry): Promise<InstalledPack> {
    const pack = await this.mine(packId)
    if (!entryIdSchema.safeParse(entry.id).success) throw new TrpgError('E_BAD_ENTRY', '条目编号只能用小写字母、数字、点与短横线')
    const parsed = entrySchema.safeParse(entry)
    if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', `条目内容不合法：${parsed.error.issues[0]?.message ?? ''}`)
    this.validateData(pack.ruleId, parsed.data.type, parsed.data.data)
    const { id, ...rest } = parsed.data
    await this.db.entries.put({ ...rest, entryId: id, packId, ruleId: pack.ruleId } as StoredEntry)
    return this.refresh(packId, true)
  }

  /** 存入我的库：校验、同名冲突、更新/另存、自动补依赖、检查包引用与版本 +1。 */
  async store(input: { ruleId: string; packId?: string; entry: Entry; mode?: StoreMode }): Promise<StoreResult> {
    const rule = this.deps.rules.get(input.ruleId)
    if (!rule) throw new TrpgError('E_RULE_MISSING', '这个规则没有安装')
    const pack = input.packId ? await this.mine(input.packId) : await this.ensureDefault(input.ruleId)
    if (pack.ruleId !== input.ruleId) throw new TrpgError('E_RULE_MISMATCH', '这个包不属于当前规则')
    this.validateData(pack.ruleId, input.entry.type, input.entry.data)
    const name = input.entry.name.trim()
    if (!name || name.length > 80) throw new TrpgError('E_BAD_NAME', '名称需要 1–80 个字')
    const existing = await this.entries(pack.id)
    const conflict = existing.find((e) => e.type === input.entry.type && sameName(e.name, name))
    if (conflict && !input.mode) return { conflict: { entryId: conflict.entryId } }
    const entryId = conflict && input.mode === 'update' ? conflict.entryId : randomEntryId(input.entry.type)
    const parsed = entrySchema.safeParse({ ...input.entry, id: entryId, name })
    if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', `条目内容不合法：${parsed.error.issues[0]?.message ?? ''}`)
    const stored: StoredEntry = { ...parsed.data, entryId, packId: pack.id, ruleId: pack.ruleId }
    const all = await this.db.entries.where('ruleId').equals(pack.ruleId).toArray()
    const byId = new Map(all.map((e) => [e.entryId, e]))
    byId.set(entryId, stored)
    const nextRequires = new Set(pack.relationships.requires.map((d) => d.id))
    for (const ref of structuralRefs(parsed.data.data, 'dependency')) {
      const target = byId.get(ref.id)
      if (target && target.packId !== pack.id && !rule.corePackIds.includes(target.packId)) nextRequires.add(target.packId)
    }
    const proposedPack: InstalledPack = { ...pack, relationships: { ...pack.relationships, requires: [...nextRequires].sort().map((id) => ({ id })) } }
    const proposedEntries = [...existing.filter((e) => e.entryId !== entryId), stored]
    await this.db.transaction('rw', [this.db.packs, this.db.entries], async () => {
      await this.db.packs.put(proposedPack)
      await this.db.entries.put(stored)
      if (rule.checkPack) {
        const problems = rule.checkPack({ packId: pack.id, entries: proposedEntries.map((e) => ({ id: e.entryId, type: e.type, data: e.data })), lookup: (id) => byId.get(id), reach: await this.reachOf(proposedPack, rule.corePackIds) })
        if (problems.length) throw new TrpgError('E_BAD_REFS', `条目引用不合规：${problems.slice(0, 3).join('；')}`)
      }
    })
    const done = await this.refresh(pack.id, true)
    return { packId: pack.id, entryId, version: done.version }
  }

  /** 条目改名：同包同类型重名报错；版本 +1。 */
  async renameEntry(packId: string, entryId: string, name: string): Promise<InstalledPack> {
    await this.mine(packId)
    const stored = await this.db.entries.get([packId, entryId])
    if (!stored) throw new TrpgError('E_NOT_FOUND', '没有找到这个条目')
    const nextName = name.trim()
    if (!nextName || nextName.length > 80) throw new TrpgError('E_BAD_NAME', '名称需要 1–80 个字')
    const peers = await this.entries(packId)
    if (peers.some((e) => e.entryId !== entryId && e.type === stored.type && sameName(e.name, nextName))) throw new TrpgError('E_BAD_NAME', `这个包里已经有叫「${nextName}」的${stored.type}`)
    await this.db.entries.put({ ...stored, name: nextName })
    return this.refresh(packId, true)
  }

  /** 批量删除：一次事务，版本号只 +1 一次。 */
  async deleteEntries(packId: string, entryIds: string[]): Promise<InstalledPack> {
    const pack = await this.mine(packId)
    const ids = [...new Set(entryIds)]
    if (!ids.length) return pack
    await this.db.transaction('rw', [this.db.entries], async () => {
      for (const id of ids) await this.db.entries.delete([packId, id])
    })
    return this.refresh(packId, true)
  }

  /** 批量移动：一次事务，两个包版本各只 +1 一次；目标包需要的依赖自动补上。 */
  async moveEntries(fromId: string, toId: string, entryIds: string[]): Promise<void> {
    if (fromId === toId) throw new TrpgError('E_BAD_CONTENT', '不能移动到同一个包')
    const from = await this.mine(fromId)
    const to = await this.mine(toId)
    if (from.ruleId !== to.ruleId) throw new TrpgError('E_RULE_MISMATCH', '两个包不属于同一个规则')
    const ids = [...new Set(entryIds)]
    if (!ids.length) return
    const source = await this.entries(fromId)
    const moving = ids.map((id) => source.find((e) => e.entryId === id))
    if (moving.some((e) => !e)) throw new TrpgError('E_NOT_FOUND', '没有找到要移动的条目')
    const target = await this.entries(toId)
    const nextRequires = new Set(to.relationships.requires.map((d) => d.id))
    const all = await this.db.entries.where('ruleId').equals(from.ruleId).toArray()
    const byId = new Map(all.map((e) => [e.entryId, e]))
    for (const entry of moving as StoredEntry[]) for (const ref of structuralRefs(entry.data, 'dependency')) {
      const hit = byId.get(ref.id)
      if (hit && hit.packId !== toId && !(this.deps.rules.get(to.ruleId)?.corePackIds ?? []).includes(hit.packId)) nextRequires.add(hit.packId)
    }
    const proposed: InstalledPack = { ...to, relationships: { ...to.relationships, requires: [...nextRequires].sort().map((id) => ({ id })) } }
    await this.db.transaction('rw', [this.db.packs, this.db.entries], async () => {
      await this.db.packs.put(proposed)
      let n = 2
      for (const entry of moving as StoredEntry[]) {
        const taken = new Set(target.map((e) => e.entryId))
        let nextId = entry.entryId
        while (taken.has(nextId) || (await this.db.entries.get([toId, nextId]))) nextId = `${entry.entryId}-move${n++}`
        target.push({ ...entry, entryId: nextId, packId: toId, ruleId: to.ruleId })
        await this.db.entries.delete([fromId, entry.entryId])
        await this.db.entries.put({ ...entry, entryId: nextId, packId: toId, ruleId: to.ruleId })
      }
    })
    await this.refresh(fromId, true)
    await this.refresh(toId, true)
  }

  async deleteEntry(packId: string, entryId: string): Promise<InstalledPack> {
    return this.deleteEntries(packId, [entryId])
  }

  /** 移到另一个我的包；目标里已有同 id 条目时换成新 id。 */
  async moveEntry(fromId: string, toId: string, entryId: string): Promise<void> {
    await this.moveEntries(fromId, toId, [entryId])
  }

  private validateData(ruleId: string, type: string, data: Record<string, unknown>): void {
    const schema = this.deps.rules.get(ruleId)?.entryDataSchema?.(type)
    if (!schema) return
    const parsed = schema.safeParse(data)
    if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', `条目内容不合法：${parsed.error.issues[0]?.message ?? ''}`)
  }

  private async reachOf(pack: InstalledPack, core: string[]): Promise<Set<string>> {
    const packs = await this.db.packs.toArray()
    const deps = new Map(packs.map((p) => [p.id, p.relationships.requires.map((d) => d.id)]))
    deps.set(pack.id, pack.relationships.requires.map((d) => d.id))
    const reach = new Set<string>([pack.id, ...core])
    const visit = (id: string): void => { for (const dep of deps.get(id) ?? []) if (!reach.has(dep)) { reach.add(dep); visit(dep) } }
    visit(pack.id)
    return reach
  }

  async copyEntry(packId: string, entryId: string): Promise<string> {
    await this.mine(packId)
    const stored = await this.db.entries.get([packId, entryId])
    if (!stored) throw new TrpgError('E_NOT_FOUND', '没有找到这个条目')
    let n = 2
    while (await this.db.entries.get([packId, `${entryId}-copy${n === 2 ? '' : n}`])) n++
    const newId = `${entryId}-copy${n === 2 ? '' : n}`
    await this.db.entries.put({ ...structuredClone(stored), entryId: newId, name: `${stored.name}（副本）` })
    await this.refresh(packId, true)
    return newId
  }

  /** 有多少个存档固定了这个条目（删除前提示「已固定，不受影响」）。 */
  async usage(packId: string, entryId: string): Promise<number> {
    const key = `${packId}/${entryId}`
    const saves = (await this.db.saves.toArray()).filter((s) => s.deletedAt === undefined)
    return saves.filter((s) => key in (((s.snapshot as Record<string, unknown>).pins as Record<string, unknown>) ?? {})).length
  }

  /** 重新统计数量、体积与校验值；bump 为 true 时版本号末位加 1。 */
  private async refresh(packId: string, bump: boolean): Promise<InstalledPack> {
    const pack = (await this.db.packs.get(packId))!
    const entries = await this.db.entries.where('packId').equals(packId).toArray()
    const typeCounts: Record<string, number> = {}
    for (const e of entries) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1
    const features = (pack.content?.features ?? []) as Array<{ kind: string }>
    const next: InstalledPack = {
      ...pack,
      version: bump ? bumpPatch(pack.version) : pack.version,
      entryCount: entries.length,
      typeCounts,
      contributes: {
        entries: entries.length,
        tables: typeCounts.table ?? 0,
        variants: entries.filter((e) => e.override).length,
        adventures: 0,
        ruleOptions: features.filter((f) => f.kind === 'ruleOptions').length,
      },
      installedAt: this.deps.now(),
    }
    await this.db.packs.put(next)
    const bytes = await this.deps.packs.exportPack(packId)
    const done = { ...next, byteSize: bytes.length, sha256: sha256Hex(bytes) }
    await this.db.packs.put(done)
    return done
  }
}
