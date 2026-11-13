// 【库】专用的独立数据库（D2-P2 B1 设计 §10）。和战役、人物所在的 tavern-trpg-assistant 分开。
import Dexie, { type Table } from 'dexie'

/** 官方原始文件的镜像：原文一个字不改。 */
export interface FileRecord {
  /** 源编号（源登记表里的 id，例 cn-official）。 */
  source: string
  /** 仓库里的路径，例 data/spells/spells-xphb.json。 */
  path: string
  commit: string
  text: string
  /** 按 Git 的算法算的指纹，和 GitHub 目录树里的值直接可比。 */
  gitSha: string
  size: number
  savedAt: number
}

/** 作者程序自己要存的东西（自制包、屏蔽表等），按作者程序那一套（cn / en）分开，内容原样。 */
export interface KvRecord {
  scope: string
  key: string
  value: unknown
  /** 版本层里的删除记号：读到它时当这个键不存在（父层同键也不再读）。 */
  deleted?: boolean
}

/** 官方数据集的安装记录（B2-3 起使用）。 */
export interface SetRecord {
  id: string
  [field: string]: unknown
}

/** 派生物：删了能重算（文件清单、全量解析结果、审计报告）。 */
export interface DerivedRecord {
  key: string
  fingerprint: string
  value: unknown
  savedAt: number
  /** 版本层里的删除记号：读到它时当这个键不存在（父层同键也不再读）。 */
  deleted?: boolean
}

/** 插件自己的版本清单（P5 后端重构 T1）：已发布版本与准备中的版本。正文仍在 files / derived / kv。 */
export interface RevisionRecord {
  id: string
  parent: string | null
  status: 'preparing' | 'published' | 'superseded' | 'aborted'
  /** 旧库接续的只读版本（R0）；它的内容就是原来的 files / derived / kv。 */
  legacy?: boolean
  official?: Record<string, OfficialSetState>
  brews?: Record<string, BrewSetState>
  /** 这个版本自己的作者存储写层；读取时先读它，再沿父版本往下读。 */
  kvScope?: string | null
  kvCodeSet?: string | null
  /** 读上下文里要把哪些来源索引文件过滤成哪些来源（路径 → 允许的来源；null = 不过滤）。 */
  sourceIndexes?: Record<string, string[] | null>
  /** 发布时算好的数据版本记号（N1）。 */
  dataVersion?: { official: string; brews: Record<string, string> }
  createdAt: number
  updatedAt: number
  publishedAt?: number
}

export interface OfficialSetState {
  commit: string
  status: 'installed' | 'missing'
  /** 这套资料里用户选中的书 / 来源；null = 旧整套安装，全部可见。 */
  sources: string[] | null
  /** 已装的书正文编号；null = 旧整套安装，按派生记录判断。 */
  books: string[] | null
  /** 已下载的冒险正文编号；null = 旧整套安装，按派生记录判断。 */
  adventures: string[] | null
  plan?: { files: number; bytes: number }
  /** 作者加载器需要，但不属于用户选中的资料。 */
  dependencyFiles?: string[]
  /** 单本更新先于整套提交时，这些路径固定在各自已核验的新版本。null 表示该路径已被上游移除。 */
  fileOverrides?: Record<string, { sha: string; size: number; commit: string } | null>
}

export interface BrewSetState {
  /** 已装包的管理记录；null = 旧版本，从作者存储现场读。 */
  packs: Array<{ docIdLocal: string; stableId: string | null; checksum: string | null }> | null
  /**
   * P5.5 U2：编辑只写原文就发布，解析交给后台。这里记原文改过、还没重新解析的包（作者本地编号）；
   * 后台解析发布后清空。读到的解析结果是上次的，脏的包要标「更新中」。
   */
  dirty?: string[]
}

/** 文件版本引用：新版本只记变化，没变的沿父版本回退；正文按内容哈希去重。 */
export interface FileVersionRecord {
  revision: string
  source: string
  path: string
  commit: string
  gitSha: string | null
  size: number
  /** true = 正文在旧 files 表里（R0 或相同内容的旧原件），不复制。 */
  legacy?: boolean
  /** 这个版本把文件移除了（父版本还有，但本版本读不到）。 */
  removed?: boolean
  savedAt: number
}

/** 新下载的原件正文，按 source + path + gitSha 去重。 */
export interface FileContentRecord {
  source: string
  path: string
  gitSha: string
  text: string
  size: number
  savedAt: number
}

/** 可恢复的操作记录（下载 / 解析 / 发布）；刷新页面后能认出未完成的操作。 */
export interface OperationRecord {
  id: string
  kind: string
  set: string
  item: string | null
  base: string
  revision: string
  status: 'preparing' | 'publishing' | 'done' | 'partial' | 'failed' | 'cancelled' | 'interrupted'
  stage: string
  done: number
  total: number
  progressItem?: string
  error: string | null
  result?: unknown
  token: string
  createdAt: number
  updatedAt: number
}

/** 跨标签页的库修改租约。 */
export interface LockRecord {
  id: string
  token: string
  owner: string
  expiresAt: number
}

export interface StateRecord {
  id: string
  /** 已发布版本编号（published）或代数（generation）。 */
  revision?: string
  value?: unknown
  updatedAt: number
}

/**
 * 插件自己的管理记录（D2-P3 整体设计 §2.8）：范围归类、用户自建范围、版本选择、房规链接。
 * 不是作者内容；作者内容仍在 kv（作者包管理器）和 files（官方原件）里。
 */
export interface ManageRecord {
  /** assign：归类；scope：自建范围；choice：版本选择（全局 / 某规则）；houserule：房规 → 目标条目；history：自制条目的撤销记录（P5.5 B2）；draft：编辑器草稿（P5.5 B7，不碰条目本身）。 */
  kind: 'assign' | 'scope' | 'choice' | 'houserule' | 'history' | 'draft'
  key: string
  value: unknown
  updatedAt: number
}

export const LIBRARY_DB_NAME = 'tavern-trpg-library'

export class LibraryDatabase extends Dexie {
  files!: Table<FileRecord, [string, string]>
  kv!: Table<KvRecord, [string, string]>
  sets!: Table<SetRecord, string>
  derived!: Table<DerivedRecord, string>
  manage!: Table<ManageRecord, [string, string]>
  state!: Table<StateRecord, string>
  revisions!: Table<RevisionRecord, string>
  fileVersions!: Table<FileVersionRecord, [string, string, string]>
  fileContents!: Table<FileContentRecord, [string, string, string]>
  ops!: Table<OperationRecord, string>
  locks!: Table<LockRecord, string>

  constructor(name: string = LIBRARY_DB_NAME) {
    super(name)
    this.version(1).stores({
      files: '[source+path], source',
      kv: '[scope+key], scope',
      sets: 'id',
      derived: 'key',
    })
    // P3-1：加管理表（只加表，原有数据不动）
    this.version(2).stores({ manage: '[kind+key], kind' })
    // S1：派生表加预计算缓存键（pre:）；升版本时清掉旧缓存，第一次看资料按需重建。
    this.version(3).stores({}).upgrade((tx) => tx.table('derived').where('key').startsWith('pre:').delete())
    // P5 T1：版本清单、文件版本、操作记录、跨标签页租约。旧 files / derived / kv 不动，作为只读 R0。
    this.version(4).stores({
      state: 'id',
      revisions: 'id, status, parent',
      fileVersions: '[revision+source+path], revision, source',
      fileContents: '[source+path+gitSha], source',
      ops: 'id, status, updatedAt',
      locks: 'id',
    })
  }
}
