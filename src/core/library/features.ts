import { hashValue } from '../hash'
import type { WorkspaceData } from '../../schemas/campaign'
import type { InstalledPack, PackFeature } from '../../schemas/pack'
import { featureSupport } from '../../rules/dnd5e2014/data/features'
import { featureKey, libraryOf, withLibrary, type FeatureRecord } from './types'

const featuresOf = (pack: InstalledPack): PackFeature[] => (pack.content?.features ?? []) as PackFeature[]

/** 启用扩展包：功能定义全部复制进存档；规则选项的初始值写入 featureState（已有值不覆盖）。 */
export function enableFeatures(data: WorkspaceData, pack: InstalledPack, now: number): WorkspaceData {
  const lib = libraryOf(data)
  const features = { ...lib.features }
  const featureState = { ...lib.featureState }
  for (const def of featuresOf(pack)) {
    const key = featureKey(pack, def.id)
    const existing = features[key]
    features[key] = existing ? { ...existing, enabled: true } : { def: structuredClone(def), packId: pack.id, version: pack.version, enabled: true, pinnedAt: now }
    if (def.kind === 'ruleOptions' && !(key in featureState)) featureState[key] = !!def.defaultEnabled
  }
  return withLibrary(data, { features, featureState })
}

/** 停用扩展包：功能的 enabled 改为否，定义与 featureState 保留。 */
export function disableFeatures(data: WorkspaceData, packId: string): WorkspaceData {
  const features: Record<string, FeatureRecord> = {}
  for (const [key, rec] of Object.entries(libraryOf(data).features)) features[key] = rec.packId === packId ? { ...rec, enabled: false } : rec
  return withLibrary(data, { features })
}

/** 规则选项开关：值写在 featureState。 */
export function setRuleOption(data: WorkspaceData, key: string, value: boolean): WorkspaceData {
  const lib = libraryOf(data)
  if (!lib.features[key] || lib.features[key].def.kind !== 'ruleOptions') return data
  return withLibrary(data, { featureState: { ...lib.featureState, [key]: value } })
}

export interface RuleOptionRow {
  key: string
  name: string
  summary: string
  text: string
  packId: string
  /** 规则引擎认识这个选项，会改变结算；否则只是说明。 */
  implemented: boolean
  on: boolean
}

/** 本存档中已启用扩展包带来的规则选项。 */
export function ruleOptionRows(data: WorkspaceData): RuleOptionRow[] {
  const lib = libraryOf(data)
  return Object.entries(lib.features)
    .filter(([, rec]) => rec.enabled && rec.def.kind === 'ruleOptions')
    .map(([key, rec]) => {
      const d = rec.def.data as { summary?: string; text?: string; implemented?: boolean }
      const text = typeof d.text === 'string' && d.text.trim() !== '[]' ? d.text : ''
      return { key, name: rec.def.name, summary: d.summary ?? '', text, packId: rec.packId, implemented: d.implemented === true, on: lib.featureState[key] === true }
    })
}

/** 库里的包有比存档已复制的更新的功能定义：返回每个包的数量（L1 §3.16「有新版功能定义 N 个」）。 */
export function featureUpdates(data: WorkspaceData, installed: Map<string, InstalledPack>): Map<string, number> {
  const lib = libraryOf(data)
  const out = new Map<string, number>()
  for (const [key, rec] of Object.entries(lib.features)) {
    const pack = installed.get(rec.packId)
    if (!pack) continue
    const def = featuresOf(pack).find((f) => featureKey(pack, f.id) === key)
    if (def && hashValue(def) !== hashValue(rec.def)) out.set(rec.packId, (out.get(rec.packId) ?? 0) + 1)
  }
  return out
}

/** 更新功能定义：stateVersion 相同直接替换，不同时保留旧定义（状态迁移由功能所属模块负责，M3 没有这类模块）。 */
export function updateFeatures(data: WorkspaceData, pack: InstalledPack, now: number): { data: WorkspaceData; updated: string[]; kept: Array<{ key: string; reason: string }> } {
  const lib = libraryOf(data)
  const features = { ...lib.features }
  const updated: string[] = []
  const kept: Array<{ key: string; reason: string }> = []
  for (const def of featuresOf(pack)) {
    const key = featureKey(pack, def.id)
    const old = features[key]
    if (!old) continue
    if (hashValue(def) === hashValue(old.def)) continue
    if ((old.def.stateVersion ?? 1) !== (def.stateVersion ?? 1)) {
      kept.push({ key, reason: `「${old.def.name}」的数据格式有变化，这个版本不能自动迁移，已保留旧定义` })
      continue
    }
    features[key] = { ...old, def: structuredClone(def), version: pack.version, pinnedAt: now }
    updated.push(key)
  }
  return { data: withLibrary(data, { features }), updated, kept }
}

/** 包里有本版本运行不了的功能种类（预留或未知）。 */
export function unsupportedKinds(pack: InstalledPack): Array<{ kind: string; count: number }> {
  const counts = new Map<string, number>()
  for (const f of featuresOf(pack)) if (featureSupport(f.kind) !== 'supported') counts.set(f.kind, (counts.get(f.kind) ?? 0) + 1)
  return [...counts].map(([kind, count]) => ({ kind, count }))
}
