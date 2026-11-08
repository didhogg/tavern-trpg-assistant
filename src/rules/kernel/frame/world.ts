// 世界数据组装：取代“连服务器取世界数据”（蓝图 §3.1）。形状与官方服务器下发给 Game 构造的一致。
/* eslint-disable @typescript-eslint/no-explicit-any -- 世界数据是官方原始结构。 */
import { serverPackageData } from '../packages'

export interface KernelInput {
  /** dnd5e 的 system.json 原文。 */
  system: any
  /** 启用模块的 module.json 原文。 */
  modules: any[]
  release: { generation: number; build: number; channel: string; node_version: number }
  world: { id: string; title: string }
  userId: string
  worldTime: number
  language: string
  /** 编号随机源的种子（同输入同结果）；缺省为 kernel。 */
  seed?: string
  /** 规则版本等世界设置（键 → 值）。 */
  settings: Record<string, unknown>
  /** 内核输入摘要（换算缓存的钥匙之一）。 */
  cacheKey?: string
  documents: { actors?: any[]; items?: any[]; folders?: any[]; combats?: any[]; scenes?: any[]; journal?: any[]; tables?: any[]; macros?: any[] }
}

export function assembleWorld(input: KernelInput): any {
  const g = globalThis as any
  const { CONST, CONFIG, foundry } = g
  const system = serverPackageData(input.system, 'system')
  const modules = input.modules.map(m => ({ ...serverPackageData(m, 'module'), active: true }))
  const version = `${input.release.generation}.${input.release.build}`
  const stats = { coreVersion: version, systemId: system.id, systemVersion: system.version }
  let n = 0
  const settings = Object.entries({
    ...input.settings,
    'core.moduleConfiguration': Object.fromEntries(modules.map(m => [m.id, true])),
  }).map(([key, value]) => ({ _id: `kernelSetting${String(++n).padStart(3, '0')}`, key, value: JSON.stringify(value), _stats: stats }))
  // 文档类型：核心登记 + 系统清单（每类含 base；文件夹含全部可归档类型），与服务器一致，不手写类型名单。
  const model = Object.fromEntries(CONST.ALL_DOCUMENT_TYPES.map((d: string) => {
    const types = new Set(['base', ...Object.keys(CONFIG[d]?.dataModels ?? {}), ...Object.keys(CONFIG[d]?.typeLabels ?? {}),
      ...Object.keys(system.documentTypes?.[d] ?? {}), ...(d === 'Folder' ? CONST.FOLDER_DOCUMENT_TYPES : [])])
    return [d, Object.fromEntries([...types].map(type => [type, {}]))]
  }))
  // 资料包描述先经官方清单模型展开默认值。
  const packs = [...new foundry.packages.System(system).packs].map((p: any) => ({ ...p, id: `${system.id}.${p.name}`,
    packageType: 'system', packageName: system.id, system: system.id, index: [], folders: [] }))
  const docs = input.documents
  return {
    userId: input.userId, release: input.release, system, modules, model, packs, settings,
    world: { id: input.world.id, title: input.world.title, system: system.id, coreVersion: version, systemVersion: system.version,
      flags: { [system.id]: { version: system.version } } },
    options: { language: input.language },
    users: [{ _id: input.userId, name: 'GM', role: CONST.USER_ROLES.GAMEMASTER }],
    actors: docs.actors ?? [], items: docs.items ?? [], folders: docs.folders ?? [], scenes: docs.scenes ?? [], combats: docs.combats ?? [],
    journal: docs.journal ?? [], macros: docs.macros ?? [], tables: docs.tables ?? [], playlists: [], cards: [], messages: [],
  }
}
