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
}

/**
 * 插件自己的管理记录（D2-P3 整体设计 §2.8）：范围归类、用户自建范围、版本选择、房规链接。
 * 不是作者内容；作者内容仍在 kv（作者包管理器）和 files（官方原件）里。
 */
export interface ManageRecord {
  /** assign：归类；scope：自建范围；choice：版本选择（全局 / 某规则）；houserule：房规 → 目标条目。 */
  kind: 'assign' | 'scope' | 'choice' | 'houserule'
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
  }
}
