// 自定义库（D2-P3 整体设计 §2.3、§2.5、§2.6）：写新条目、房规、文字转条目、新条目模板、导出、导入预览。
// 条目内容全部走作者的可编辑自制（作者格式）；插件只记"房规 → 目标"的链接和范围设置。
// 改完都走同一条路：作者包管理器 → 重新解析 → 同编号挂备选（LibraryService.afterBrewChange）。
import { findCollisions, type DocIndex } from './versions'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import type { ManageStore } from './manage'
import type { ParsedProp } from './runtime/frame/commands'
import type { LibraryService } from './service'
import type { ScopedLibrary } from './scoped'
import registry from './custom.json'
import { refKey, ruleScopes, type Assignment, type CampaignLibrary, type EntryRef, type ScopeDef } from './scopes'
import { officialSourceOf, SOURCES, type SourceEntry } from './sources'

interface CustomSource {
  json: string
  full: string
  abbreviation: string
}

/** 插件建在可编辑自制里的来源（登记在 custom.json）：house = 房规，mine = 自己写的新条目。 */
const CUSTOM = registry.sources as Record<'house' | 'mine', CustomSource>

const brewSetOf = (codeSet: string): SourceEntry => {
  const s = SOURCES.find((x) => x.kind === 'brew' && x.codeSet === codeSet)
  if (!s) throw new Error(`作者程序 ${codeSet} 没有登记自制数据集`)
  return s
}

export interface ScopeConfig {
  format: 'trpg-library-scopes'
  version: 1
  scopes: ScopeDef[]
  /** 单位 → 归属（单位写法见 scopes.ts sourceUnit / entryUnit）。 */
  assignments: Record<string, Assignment>
}

export class CustomLibrary {
  constructor(private readonly lib: LibraryService, private readonly scoped: ScopedLibrary, private readonly db: LibraryDatabase) {}

  private get manage(): ManageStore {
    return this.scoped.manage
  }

  private async frame(codeSet: string) {
    return this.lib.frameOf(codeSet)
  }

  /** 改完以后：作者重解析 + 同编号挂备选；作者判断缓存清掉。 */
  private async after(codeSet: string) {
    this.scoped.reset()
    return this.lib.reparseBrew(brewSetOf(codeSet).id)
  }

  /** 作者新条目模板（法术、怪物、传奇组有作者构建器；别的类别 null）。 */
  async template(codeSet: string, prop: string): Promise<Record<string, unknown> | null> {
    return (await this.frame(codeSet)).call('entryTemplate', prop)
  }

  /** 作者有哪些文字转条目、各支持什么格式。 */
  async converters(codeSet: string) {
    return (await this.frame(codeSet)).call('converters')
  }

  /** 文字转条目（作者转换器）；版本风格按战役规则（2014 → 旧版标签）。只转换，不存。 */
  async convert(c: CampaignLibrary, prop: string, format: 'text' | 'markdown' | 'html', text: string) {
    return (await this.frame(c.codeSet)).call('convertText', prop, format, text, { source: CUSTOM.mine.json, styleHint: ruleScopes(c.rule).style })
  }

  /** 写一条新条目（或改：带作者的 uniqueId 就是改那一条）。来源默认是插件的"我的资料"。 */
  async saveEntry(codeSet: string, prop: string, ent: Record<string, unknown>) {
    const f = await this.frame(codeSet)
    await f.call('editableEnsureSource', CUSTOM.mine)
    const saved = await f.call('editablePut', prop, { source: CUSTOM.mine.json, ...ent })
    return { ...saved, parse: await this.after(codeSet) }
  }

  async deleteEntries(codeSet: string, prop: string, uniqueIds: string[]) {
    await (await this.frame(codeSet)).call('editableRemove', prop, uniqueIds)
    return this.after(codeSet)
  }

  /**
   * 房规：在可编辑自制里写一条，用作者 _copy 指向原件、只写改动（mod 是作者的 _mod 写法）；或给整条（entity）。
   * 原件不动；房规挂在原件下当备选。activate：在本战役立即生效（默认），返回改好的战役选书设置。
   */
  async createHouseRule(c: CampaignLibrary, target: EntryRef, edit: { mod?: Record<string, unknown>; entity?: Record<string, unknown> }, { activate = true }: { activate?: boolean } = {}) {
    const stored = await this.lib.storedItem(target.set, target.prop, target.hash)
    if (!stored) throw new Error(`找不到要改的条目：${refKey(target)}`)
    const base = stored.item as { name?: string; source?: string }
    if (!base.name || !base.source) throw new Error(`原件没有名字或来源，作者的 _copy 指不到它：${refKey(target)}`)
    // 房规来源里同名的只能有一条（作者编号 = 名字 + 来源）；同名不同书的加书名缩写区分
    const taken = new Set<string>()
    for (const l of await this.manage.houseRules()) {
      const it = (await this.lib.storedItem(l.house.set, l.house.prop, l.house.hash))?.item as { name?: string } | undefined
      if (l.house.prop === target.prop && it?.name) taken.add(it.name)
    }
    const name = taken.has(base.name) ? `${base.name}（${base.source}）` : base.name
    const ent = edit.entity
      ? { ...edit.entity, name, source: CUSTOM.house.json }
      : { name, source: CUSTOM.house.json, _copy: { name: base.name, source: base.source, ...(edit.mod ? { _mod: edit.mod } : {}) } }
    const f = await this.frame(c.codeSet)
    await f.call('editableEnsureSource', CUSTOM.house)
    if (!edit.entity) await f.call('editableAddDependencies', { [target.prop]: [base.source] })
    const saved = await f.call('editablePut', target.prop, ent)
    if (!saved.hash) throw new Error('作者算不出房规条目的编号')
    const house: EntryRef = { set: brewSetOf(c.codeSet).id, prop: target.prop, hash: saved.hash }
    await this.manage.linkHouseRule({ house, target })
    const parse = await this.after(c.codeSet)
    const altId = `house:${saved.hash}`
    return { house, altId, uniqueId: saved.uniqueId, parse, campaign: activate ? await this.scoped.choose(c, target, altId) : c }
  }

  /** 删房规：作者删条 + 去掉链接；选过它的地方自动回到原件（生效版本会标"选过的备选不在了"）。 */
  async deleteHouseRule(codeSet: string, house: EntryRef, uniqueId: string) {
    await this.manage.unlinkHouseRule(house)
    return this.deleteEntries(codeSet, house.prop, [uniqueId])
  }

  /** 导出一个包：作者格式原样（文件名 + 内容）。 */
  async exportBrew(codeSet: string, docIdLocal: string) {
    return (await this.frame(codeSet)).call('brewExport', docIdLocal)
  }

  /** 范围设置单独一个文件（可带可不带）：自建范围 + 归类。只给 units 就只导这些。 */
  async exportScopes(units?: string[]): Promise<ScopeConfig> {
    const all = await this.manage.assignments()
    const assignments = Object.fromEntries([...all].filter(([u]) => !units || units.includes(u)))
    return { format: 'trpg-library-scopes', version: 1, scopes: await this.manage.userScopes(), assignments }
  }

  /** 导入范围设置：自建范围补进来，归类按文件覆盖。 */
  async importScopes(cfg: ScopeConfig): Promise<{ scopes: number; assignments: number }> {
    if (cfg.format !== 'trpg-library-scopes' || cfg.version !== 1) throw new Error('不是范围设置文件，或版本不认识')
    for (const s of cfg.scopes) await this.manage.addScope(s)
    for (const [u, a] of Object.entries(cfg.assignments)) await this.manage.setAssignment(u, a)
    this.scoped.reset()
    return { scopes: cfg.scopes.length, assignments: Object.keys(cfg.assignments).length }
  }

  /**
   * 导入预览：在隔离的作者存储里（复制一份现有的）让作者把文件装上，看会新增多少条、有多少条和已有的同编号（会挂成备选）、
   * 作者报了什么错。真实存储不动；确认后再调 LibraryService.brewImport。
   */
  async previewImport(codeSet: string, files: Array<{ name: string; text: string }>) {
    const set = brewSetOf(codeSet)
    const scope = `${codeSet}:preview:${Date.now()}`
    const rows = await this.db.kv.where('scope').equals(codeSet).toArray()
    await this.db.kv.bulkPut(rows.map((r) => ({ ...r, scope })))
    const f = await this.lib.openFrameIn(codeSet, scope)
    try {
      const before = new Set((await f.call('brewDocIndex')).map((d) => d.docIdLocal))
      const added = await f.call('brewAddFiles', files)
      const docs: DocIndex[] = await f.call('brewDocIndex')
      const official = officialSourceOf(codeSet)
      const officialHashes: Record<string, Set<string>> = {}
      for (const prop of new Set(docs.flatMap((d) => Object.keys(d.props)))) {
        const rec = await this.db.derived.get(parsedKey(official.id, prop))
        if (rec) officialHashes[prop] = new Set((rec.value as ParsedProp).hashes.filter((h): h is string => !!h))
      }
      const fresh = docs.filter((d) => !before.has(d.docIdLocal))
      const freshIds = new Set(fresh.map((d) => d.docIdLocal))
      const collisions = findCollisions(officialHashes, docs).filter((c) => c.others.some((id) => freshIds.has(id)))
      return {
        set: set.id,
        files: fresh.map((d) => ({ filename: d.filename, entries: Object.values(d.props).reduce((n, hs) => n + hs.filter(Boolean).length, 0) })),
        newEntries: fresh.reduce((n, d) => n + Object.values(d.props).reduce((m, hs) => m + hs.filter(Boolean).length, 0), 0) - collisions.length,
        alternatives: collisions.map((c) => ({ prop: c.prop, hash: c.hash, base: c.base.kind === 'official' ? 'official' : c.base.docIdLocal })),
        notJson: added.value.notJson,
        authorErrors: added.errors,
      }
    } finally {
      f.close()
      await this.db.kv.where('scope').anyOf(scope, `${scope}:local`).delete()
    }
  }
}
