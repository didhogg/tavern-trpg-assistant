// 自定义库（D2-P3 整体设计 §2.3、§2.5、§2.6）：写新条目、房规、文字转条目、新条目模板、导出、导入预览。
// 条目内容全部走作者的可编辑自制（作者格式）；插件只记"房规 → 目标"的链接和范围设置。
// 改完都走同一条路：作者包管理器 → 重新解析 → 同编号挂备选（LibraryService.afterBrewChange）。
import { copyRawSource } from './copy-source'
import type { BrewValidation, SchemaIssue } from './brew-validate'
import { formatOfCampaign, formatOfCodeSet, splitRecognized } from './formats'
import { findCollisions, type DocIndex } from './versions'
import type { Counterpart } from './counterpart'
import type { LibraryDatabase } from './db'
import { parsedKey } from './install'
import type { ManageStore } from './manage'
import type { ParsedProp } from './runtime/frame/commands'
import type { LibraryService } from './service'
import type { ScopedLibrary } from './scoped'
import registry from './custom.json'
import { entryUnit, refKey, ruleScopes, type Assignment, type CampaignLibrary, type EntryRef, type ScopeDef } from './scopes'
import { officialSourceOf, SOURCES, type SourceEntry } from './sources'

interface CustomSource {
  json: string
  full: string
  abbreviation: string
}

/** 插件建在可编辑自制里的来源（登记在 custom.json）：house = 房规，mine = 自己写的新条目。 */
const CUSTOM = registry.sources as Record<'house' | 'mine', CustomSource>

/** 作者两个包管理器的存储键（BrewUtil2 / PrereleaseUtil）；备份按作者存储分类完整导出。 */
const BREW_STORAGE_KEY = 'HOMEBREW_2_STORAGE'
const PRERELEASE_STORAGE_KEY = 'PRERELEASE_STORAGE'

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
  /** counterpartHint：保存条目后顺带查它在另一种语言里对上了谁（只提示，不写任何东西；P5 G-3b）。 */
  constructor(private readonly lib: LibraryService, private readonly scoped: ScopedLibrary, private readonly db: LibraryDatabase, private readonly counterpartHint?: (ref: EntryRef) => Promise<Counterpart>) {}

  private get manage(): ManageStore {
    return this.scoped.manage
  }

  private async frame(codeSet: string) {
    return this.lib.frameOf(codeSet)
  }

  /** JSON 结构校验：按这套资料集登记的数据格式取校验器（formats.ts），传原文错误带行列，传对象只有路径。 */
  validate(codeSet: string, input: string | unknown): Promise<BrewValidation> {
    return formatOfCodeSet(codeSet).validate(input)
  }

  /** 单条条目在写入前的结构检查：套上"我的资料"的来源信息，只留这一条自己的错（来源信息等外壳的错不算）。 */
  validateEntry(codeSet: string, prop: string, ent: Record<string, unknown>): Promise<SchemaIssue[]> {
    return formatOfCodeSet(codeSet).validateEntry(prop, ent, CUSTOM.mine)
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
    formatOfCampaign(c)
    return (await this.frame(c.codeSet)).call('convertText', prop, format, text, { source: CUSTOM.mine.json, styleHint: ruleScopes(c.rule).style })
  }

  /**
   * 写一条新条目（或改：带作者的 uniqueId 就是改那一条）。来源默认是插件的"我的资料"。
   * 版本（P5.5 R78）：新写的一条归到 rule 这套规则的默认范围（2014 → 5e，2024 → 5.5e），之后用户可改；不给 rule 就是未归类。
   * 改已有的一条不动它的归类；改了名字（作者编号跟着变）把归类搬到新编号上。
   */
  async saveEntry(codeSet: string, prop: string, ent: Record<string, unknown>, { rule }: { rule?: string } = {}) {
    const result = await this.lib.mutateAuthor(codeSet, 'custom-entry', async (view) => {
      const f = await this.lib.frameOf(codeSet, view)
      await f.call('editableEnsureSource', CUSTOM.mine)
      return f.call('editablePut', prop, { source: CUSTOM.mine.json, ...ent })
    })
    const saved = result.value
    if (saved.hash) await this.carryAssignment({ set: brewSetOf(codeSet).id, prop, hash: saved.hash }, saved.previousHash ?? null, rule)
    // 另一种语言里有没有对上的条目（按英文名 + 来源）：只返回提示，保存时不改任何一边的条目
    const counterpart = saved.hash && this.counterpartHint ? await this.counterpartHint({ set: brewSetOf(codeSet).id, prop, hash: saved.hash }) : null
    return { ...saved, parse: result.parse, issues: await this.validateEntry(codeSet, prop, ent), counterpart }
  }

  /** 新条目按规则给默认归类；改名的把旧编号上的归类搬到新编号（只动插件的管理记录，不写作者内容）。 */
  private async carryAssignment(ref: EntryRef, previousHash: string | null, rule: string | undefined): Promise<void> {
    const unit = entryUnit(ref)
    if (previousHash) {
      if (previousHash === ref.hash) return
      const old = entryUnit({ ...ref, hash: previousHash })
      const a = (await this.manage.assignments()).get(old)
      if (!a) return
      await this.manage.setAssignment(unit, a)
      await this.manage.setAssignment(old, null)
      return
    }
    if (rule) await this.manage.setAssignment(unit, { scopes: [...ruleScopes(rule).defaultScopes], global: false })
  }

  async deleteEntries(codeSet: string, prop: string, uniqueIds: string[]) {
    const result = await this.lib.mutateAuthor(codeSet, 'custom-delete', async (view) => (await this.lib.frameOf(codeSet, view)).call('editableRemove', prop, uniqueIds))
    return result.parse
  }

  /**
   * 房规：在可编辑自制里写一条，用作者 _copy 指向原件、只写改动（mod 是作者的 _mod 写法）；或给整条（entity）。
   * 原件不动；房规挂在原件下当备选。activate：在本战役立即生效（默认），返回改好的战役选书设置。
   */
  async createHouseRule(c: CampaignLibrary, target: EntryRef, edit: { mod?: Record<string, unknown>; entity?: Record<string, unknown> }, { activate = true }: { activate?: boolean } = {}) {
    formatOfCampaign(c)
    const stored = await this.lib.storedItem(target.set, target.prop, target.hash)
    if (!stored) throw new Error(`找不到要改的条目：${refKey(target)}`)
    const base = stored.item as { name?: string; source?: string }
    if (!base.name || !base.source) throw new Error(`原件没有名字或来源，作者的 _copy 指不到它：${refKey(target)}`)
    const baseSource = base.source
    // 房规来源里同名的只能有一条（作者编号 = 名字 + 来源）；同名不同书的加书名缩写区分
    const taken = new Set<string>()
    for (const l of await this.manage.houseRules()) {
      const it = (await this.lib.storedItem(l.house.set, l.house.prop, l.house.hash))?.item as { name?: string } | undefined
      if (l.house.prop === target.prop && it?.name) taken.add(it.name)
    }
    const name = taken.has(base.name) ? `${base.name}（${base.source}）` : base.name
    const ent = edit.entity
      ? { ...edit.entity, name, source: CUSTOM.house.json }
      : { name, source: CUSTOM.house.json, _copy: { name: base.name, source: baseSource, ...(edit.mod ? { _mod: edit.mod } : {}) } }
    const result = await this.lib.mutateAuthor(c.codeSet, 'custom-houserule', async (view) => {
      const f = await this.lib.frameOf(c.codeSet, view)
      await f.call('editableEnsureSource', CUSTOM.house)
      if (!edit.entity) await f.call('editableAddDependencies', { [target.prop]: [baseSource] })
      return f.call('editablePut', target.prop, ent)
    })
    const saved = result.value
    if (!saved.hash) throw new Error('作者算不出房规条目的编号')
    const house: EntryRef = { set: brewSetOf(c.codeSet).id, prop: target.prop, hash: saved.hash }
    await this.carryAssignment(house, saved.previousHash ?? null, c.rule)
    await this.manage.linkHouseRule({ house, target })
    const altId = `house:${saved.hash}`
    return { house, altId, uniqueId: saved.uniqueId, parse: result.parse, campaign: activate ? await this.scoped.choose(c, target, altId) : c }
  }

  /** 删房规：作者删条 + 去掉链接；选过它的地方自动回到原件（生效版本会标"选过的备选不在了"）。 */
  async deleteHouseRule(codeSet: string, house: EntryRef, uniqueId: string) {
    const parse = await this.deleteEntries(codeSet, house.prop, [uniqueId])
    await this.manage.unlinkHouseRule(house)
    return parse
  }

  /**
   * 存入【我的库】（P5 B-27，驾驶员定：本地原样副本，不受源仓库更新、卸载影响；不是"变成可编辑态"）。
   * 官方的书 / 一条条目：用作者的办法（加载器对象 + DataUtil.cleanJson + 作者自制文件的 _meta.sources）存成作者格式文件，走作者的本地导入；
   * 下载来的自制包：作者格式原文原样再导入一份。副本进【我的库】（来历 = 导入），和原件同编号的按同编号规则并排显示成两条。
   * 重复存同一个来源 = 替换上一份副本（作者按来源认包）。结构问题只提示不拦截。
   */
  async saveToMine(codeSet: string, target: { kind: 'source'; source: string } | { kind: 'entry'; ref: EntryRef } | { kind: 'pack'; docIdLocal: string }) {
    const f = await this.frame(codeSet)
    const brewSet = brewSetOf(codeSet).id
    let name: string
    let body: unknown
    let counts: Record<string, number> = {}
    if (target.kind === 'pack') {
      const mine = (await this.lib.brewInstalled(brewSet)).find((b) => b.head.docIdLocal === target.docIdLocal)
      if (!mine) throw new Error('找不到这个包')
      if (mine.head.isEditable || !mine.head.url) throw new Error('这个包本来就在【我的库】里（自己写的或本地导入的）')
      const exported = await this.exportBrew(codeSet, target.docIdLocal)
      if (!exported) throw new Error('导出这个包失败')
      name = exported.filename ?? `${target.docIdLocal}.json`
      body = exported.body
    } else {
      let source: string
      if (target.kind === 'source') source = target.source
      else {
        const stored = await this.lib.storedItem(target.ref.set, target.ref.prop, target.ref.hash)
        if (!stored?.source) throw new Error(`找不到这一条或它没有来源：${refKey(target.ref)}`)
        if (SOURCES.find((x) => x.id === target.ref.set)?.kind === 'brew') throw new Error('这一条本来就在自制里')
        source = stored.source
      }
      // 这个来源已经有本地副本（以前存过）：并进去，不冲掉
      const docs = await f.call('brewDocIndex')
      const existing = docs.find((d) => !d.isEditable && !d.url && (d.sources ?? []).some((x) => x.toLowerCase() === source.toLowerCase()))
      const base = existing ? (await this.exportBrew(codeSet, existing.docIdLocal))?.body as Record<string, unknown> | undefined : undefined
      const view = await this.lib.currentView()
      const copy = await copyRawSource({ db: this.db, lib: this.lib, official: officialSourceOf(codeSet), source, view, ...(base ? { base } : {}), ...(target.kind === 'entry' ? { entry: { prop: target.ref.prop, hash: target.ref.hash } } : {}) })
      if (!Object.values(copy.counts).some((n) => n > 0) && !copy.corpora.length) throw new Error(`官方资料里没有来源 ${source} 的内容可存（还没下载？）`)
      counts = copy.counts
      body = copy.json
      name = existing?.filename ?? `${source}.json`
    }
    const issues = (await formatOfCodeSet(codeSet).validate(body)).issues
    const result = await this.lib.brewImport(brewSet, [{ name, text: JSON.stringify(body) }])
    this.scoped.reset()
    return { name, counts, issues, added: result.value.added, parse: result.parse, errors: result.errors }
  }

  /** 导出一个包：作者格式原样（文件名 + 内容）。 */
  async exportBrew(codeSet: string, docIdLocal: string) {
    try { return await (await this.frame(codeSet)).call('brewExport', docIdLocal) }
    catch {
      // 官方资料没装时作者窗口开不起来：直接读作者存储原文，包仍是作者格式（M5）
      const view = await this.lib.currentView()
      const raw = (await view.kvGet(codeSet, 'HOMEBREW_2_STORAGE')) as Array<{ head?: Record<string, unknown>; body?: unknown }> | null
      const hit = (raw ?? []).find((d) => String(d.head?.docIdLocal ?? '') === docIdLocal)
      return hit ? { filename: (hit.head?.filename as string | undefined) ?? `${docIdLocal}.json`, body: hit.body } : null
    }
  }

  /** 完整备份：自制（作者格式原样）+ 范围设置 + 房规链接；官方数据不进备份。 */
  async exportBackup(): Promise<Record<string, string>> {
    const files: Record<string, string> = {}
    const view = await this.lib.currentView()
    // 按源登记表遍历，不写死语言；官方没装时也能从作者存储原文导出自制（M5）
    for (const set of SOURCES.filter((s) => s.kind === 'brew')) {
      for (const [key, sub] of [[BREW_STORAGE_KEY, ''], [PRERELEASE_STORAGE_KEY, 'prerelease/']] as const) {
        const raw = (await view.kvGet(set.codeSet, key)) as Array<{ head?: Record<string, unknown>; body?: unknown }> | null
        for (const doc of Array.isArray(raw) ? raw : []) {
          const docId = String(doc.head?.docIdLocal ?? '')
          if (!docId) continue
          const filename = (doc.head?.filename as string | undefined) ?? `${docId}.json`
          files[`brew/${set.codeSet}/${sub}${filename}`] = JSON.stringify(doc.body)
        }
      }
    }
    files['scopes.json'] = JSON.stringify(await this.exportScopes())
    files['house-rules.json'] = JSON.stringify(await this.manage.houseRules())
    return files
  }

  /** 完整备份恢复：先按作者包管理器导入自制，再恢复范围设置与房规链接。 */
  async importBackup(files: Record<string, string>): Promise<{ brews: number; scopes: number; houseRules: number; errors: string[] }> {
    const errors: string[] = []
    let brews = 0
    let scopes = 0
    let houseRules = 0
    for (const [path, text] of Object.entries(files)) {
      if (!path.startsWith('brew/')) continue
      const [, codeSet, ...rest] = path.split('/')
      const set = SOURCES.find((s) => s.kind === 'brew' && s.codeSet === codeSet)
      if (!set) { errors.push(`不认识的自制来源：${codeSet}`); continue }
      try {
        const result = await this.lib.brewImport(set.id, [{ name: rest.join('/'), text }])
        brews += result.value?.added?.length ?? 0
        errors.push(...result.errors)
        for (const bad of result.value?.notJson ?? []) errors.push(`${path}：${bad.name} ${bad.error}`)
      } catch (error) {
        errors.push(`${path}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    const scopesRaw = files['scopes.json']
    if (scopesRaw) {
      try {
        const parsed = JSON.parse(scopesRaw) as ScopeConfig
        const restored = await this.importScopes(parsed)
        scopes = restored.scopes + restored.assignments
      } catch (error) {
        errors.push(`scopes.json: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    const houseRaw = files['house-rules.json']
    if (houseRaw) {
      try {
        const links = JSON.parse(houseRaw) as Array<{ house: EntryRef; target: EntryRef }>
        for (const link of links) { await this.manage.linkHouseRule(link); houseRules++ }
      } catch (error) {
        errors.push(`house-rules.json: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    this.scoped.reset()
    return { brews, scopes, houseRules, errors }
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
    const format = formatOfCodeSet(codeSet)
    // 先认格式（P5.5 A3）：不是这种格式的不交给作者试装，单独列出原因
    const { accepted, rejected } = splitRecognized(format, files)
    files = accepted
    const scope = `${codeSet}:preview:${Date.now()}`
    const view = await this.lib.currentView()
    const merged = new Map<string, unknown>()
    for (const s of [...(await view.kvScopes(codeSet))].reverse()) for (const row of await this.db.kv.where('scope').equals(s).toArray()) { if (row.deleted) merged.delete(row.key); else merged.set(row.key, row.value) }
    await this.db.kv.bulkPut([...merged].map(([key, value]) => ({ scope, key, value })))
    const f = await this.lib.openFrameIn(codeSet, scope, view)
    try {
      const before = new Set((await f.call('brewDocIndex')).map((d) => d.docIdLocal))
      const added = await f.call('brewAddFiles', files)
      const docs: DocIndex[] = await f.call('brewDocIndex')
      const official = officialSourceOf(codeSet)
      const officialHashes: Record<string, Set<string>> = {}
      for (const prop of new Set(docs.flatMap((d) => Object.keys(d.props)))) {
        const rec = await view.derivedGet(parsedKey(official.id, prop))
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
        rejected,
        authorErrors: added.errors,
        structure: await Promise.all(files.map(async (file) => ({ name: file.name, ...(await format.validate(file.text)) }))),
      }
    } finally {
      f.close()
      await this.db.kv.where('scope').anyOf(scope, `${scope}:local`).delete()
    }
  }
}
