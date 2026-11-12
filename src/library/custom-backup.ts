// 自定义库的完整备份与范围设置文件（从 custom.ts 拆出，P5.5 B2 时为控制单文件长度；行为不变）。
// 备份 = 自制（作者格式原样）+ 范围设置 + 房规链接；官方数据不进备份。
import type { ManageStore } from './manage'
import type { LibraryService } from './service'
import type { Assignment, EntryRef, ScopeDef } from './scopes'
import { SOURCES } from './sources'

/** 作者两个包管理器的存储键（BrewUtil2 / PrereleaseUtil）；备份按作者存储分类完整导出。 */
const BREW_STORAGE_KEY = 'HOMEBREW_2_STORAGE'
const PRERELEASE_STORAGE_KEY = 'PRERELEASE_STORAGE'

export interface ScopeConfig {
  format: 'trpg-library-scopes'
  version: 1
  scopes: ScopeDef[]
  /** 单位 → 归属（单位写法见 scopes.ts sourceUnit / entryUnit）。 */
  assignments: Record<string, Assignment>
}

export interface BackupDeps {
  lib: LibraryService
  manage: ManageStore
  /** 改完范围 / 装完自制后让按战役看【库】的缓存重算。 */
  reset: () => void
}

/** 完整备份：自制（作者格式原样）+ 范围设置 + 房规链接；官方数据不进备份。 */
export async function exportBackup(d: BackupDeps): Promise<Record<string, string>> {
  const files: Record<string, string> = {}
  const view = await d.lib.currentView()
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
  files['scopes.json'] = JSON.stringify(await exportScopes(d))
  files['house-rules.json'] = JSON.stringify(await d.manage.houseRules())
  return files
}

/** 完整备份恢复：先按作者包管理器导入自制，再恢复范围设置与房规链接。 */
export async function importBackup(d: BackupDeps, files: Record<string, string>): Promise<{ brews: number; scopes: number; houseRules: number; errors: string[] }> {
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
      const result = await d.lib.brewImport(set.id, [{ name: rest.join('/'), text }])
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
      const restored = await importScopes(d, parsed)
      scopes = restored.scopes + restored.assignments
    } catch (error) {
      errors.push(`scopes.json: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  const houseRaw = files['house-rules.json']
  if (houseRaw) {
    try {
      const links = JSON.parse(houseRaw) as Array<{ house: EntryRef; target: EntryRef }>
      for (const link of links) { await d.manage.linkHouseRule(link); houseRules++ }
    } catch (error) {
      errors.push(`house-rules.json: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  d.reset()
  return { brews, scopes, houseRules, errors }
}

/** 范围设置单独一个文件（可带可不带）：自建范围 + 归类。只给 units 就只导这些。 */
export async function exportScopes(d: BackupDeps, units?: string[]): Promise<ScopeConfig> {
  const all = await d.manage.assignments()
  const assignments = Object.fromEntries([...all].filter(([u]) => !units || units.includes(u)))
  return { format: 'trpg-library-scopes', version: 1, scopes: await d.manage.userScopes(), assignments }
}

/** 导入范围设置：自建范围补进来，归类按文件覆盖。 */
export async function importScopes(d: BackupDeps, cfg: ScopeConfig): Promise<{ scopes: number; assignments: number }> {
  if (cfg.format !== 'trpg-library-scopes' || cfg.version !== 1) throw new Error('不是范围设置文件，或版本不认识')
  for (const s of cfg.scopes) await d.manage.addScope(s)
  for (const [u, a] of Object.entries(cfg.assignments)) await d.manage.setAssignment(u, a)
  d.reset()
  return { scopes: cfg.scopes.length, assignments: Object.keys(cfg.assignments).length }
}

