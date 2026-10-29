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

  list(ruleId?: string): Promise<InstalledPack[]> {
    return this.deps.packs.list({ ruleId }).then((all) => all.filter((p) => p.source === 'user'))
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
      dataVersion: 1,
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
    let name = `${src.name}（我的）`
    for (let n = 2; peers.some((p) => p.source === 'user' && sameName(p.name, name)); n++) name = `${src.name}（我的 ${n}）`
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

  /** 保存条目（新建或修改）：校验条目结构；每次保存版本号末位加 1。条目编辑器（U11）经这里写入。 */
  async saveEntry(packId: string, entry: Entry): Promise<InstalledPack> {
    const pack = await this.mine(packId)
    if (!entryIdSchema.safeParse(entry.id).success) throw new TrpgError('E_BAD_ENTRY', '条目编号只能用小写字母、数字、点与短横线')
    const parsed = entrySchema.safeParse(entry)
    if (!parsed.success) throw new TrpgError('E_BAD_ENTRY', `条目内容不合法：${parsed.error.issues[0]?.message ?? ''}`)
    const { id, ...rest } = parsed.data
    await this.db.entries.put({ ...rest, entryId: id, packId, ruleId: pack.ruleId } as StoredEntry)
    return this.refresh(packId, true)
  }

  async deleteEntry(packId: string, entryId: string): Promise<InstalledPack> {
    await this.mine(packId)
    await this.db.entries.delete([packId, entryId])
    return this.refresh(packId, true)
  }

  /** 移到另一个我的包；目标里已有同 id 条目时换成新 id。 */
  async moveEntry(fromId: string, toId: string, entryId: string): Promise<void> {
    await this.mine(fromId)
    const to = await this.mine(toId)
    const stored = await this.db.entries.get([fromId, entryId])
    if (!stored) throw new TrpgError('E_NOT_FOUND', '没有找到这个条目')
    const newId = (await this.db.entries.get([toId, entryId])) ? `${entryId}-${Date.now().toString(36)}` : entryId
    await this.db.transaction('rw', [this.db.entries], async () => {
      await this.db.entries.delete([fromId, entryId])
      await this.db.entries.put({ ...stored, packId: toId, ruleId: to.ruleId, entryId: newId })
    })
    await this.refresh(fromId, true)
    await this.refresh(toId, true)
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
