/** T3 源清单：这里只描述“源文件与来源”，不描述 DND 字段、书单或界面。 */
export type Lang = 'zh' | 'en'
export type SourceKind = 'official' | 'homebrew'
export type FileKind = 'content' | 'lookup' | 'index' | 'other' | 'error'

export interface RepoConfig {
  id: string
  kind: SourceKind
  lang: Lang
  label: string
  /** 本地只读参考目录（或 T3 自己下载到输出目录的缓存）。 */
  root: string
  /** 上游仓库根（用于把文件路径变成 URL）；默认等于 root。 */
  repoRoot: string
  repoUrl: string
  branch: string
  /** 文件路径加到它后面就是可直连的原始文件地址。 */
  baseUrl: string
  fallbackBaseUrl: string
  /** 用来探测直连是否可用的文件（相对仓库根）。 */
  probePath: string
  /** 这个源在清单里的角色；不决定库界面默认启用。 */
  role: 'primary' | 'translation' | 'reference'
}

export type RecordShape = 'named' | 'copy' | 'container' | 'section' | 'abbreviation' | 'unnamed'

export interface RecordRow {
  category: string
  index: number
  name: string | null
  nameEn: string | null
  source: string | null
  edition: string
  shape: RecordShape
}

export interface CategoryCount {
  records: number
  content: number
  meta: number
  sources: string[]
}

export interface MetaSource {
  id: string
  full?: string
  abbreviation?: string
  authors?: string[]
  convertedBy?: string[]
  url?: string
  version?: string
  dateReleased?: string
  license?: string
}

export interface JsonScan {
  topKeys: string[]
  fileEdition: string | null
  metaSources: MetaSource[]
  records: RecordRow[]
  contentRecords: number
  metaRecords: number
  categories: Record<string, CategoryCount>
  sourceIds: string[]
  missingSourceRecords: number
  missingNameRecords: number
}

export interface FileEntry {
  repo: string
  lang: Lang
  path: string
  kind: FileKind
  bytes: number
  sha256: string
  contentRecords: number
  metaRecords: number
  sourceIds: string[]
  categories: Record<string, number>
  editionCounts: Record<string, number>
  error?: string
}

export interface RepoScan {
  config: RepoConfig
  files: FileEntry[]
  fileCount: number
  jsonCount: number
  contentFileCount: number
  bytesJson: number
  otherByExt: Record<string, number>
  contentRecords: number
  metaRecords: number
  sourceIds: Set<string>
  declaredSourceIds: Set<string>
  metaSources: MetaSource[]
  indexSources: Record<string, string>
  indexMissing: Array<{ id: string; path: string }>
  snapshotHash: string
}

export interface SourceLanguageInfo {
  records: number
  contentRecords: number
  files: number
  categories: Record<string, number>
}

export interface SourceEntry {
  key: string
  id: string
  kind: SourceKind
  name: string | null
  nameEn: string | null
  abbreviation: string | null
  published: string | null
  edition: string
  declared: boolean
  license: string | null
  url: string | null
  version: string | null
  authors: string[]
  convertedBy: string[]
  languages: Partial<Record<Lang, SourceLanguageInfo>>
}

export interface PairCoverage {
  primary: string
  secondary: string
  primaryIds: number
  secondaryIds: number
  paired: number
  onlyPrimary: string[]
  onlySecondary: string[]
}

export interface TranslationCoverage {
  officialCnEn: PairCoverage
  officialEnSrcBak: PairCoverage
  homebrewEnZh: PairCoverage
}

export interface FileError {
  repo: string
  path: string
  error: string
}

export interface DuplicateGroup {
  key: string
  count: number
  locations: string[]
}

export interface Validation {
  fileErrors: FileError[]
  totals: {
    repos: number
    files: number
    jsonFiles: number
    contentFiles: number
    bytesJson: number
    contentRecords: number
    namedRecords: number
    sourceNamedRecords: number
    metaRecords: number
    sourceIds: number
  }
  shapeCounts: Record<string, number>
  byRepo: Record<string, {
    files: number
    jsonFiles: number
    contentFiles: number
    bytesJson: number
    contentRecords: number
    metaRecords: number
    sourceIds: number
    otherByExt: Record<string, number>
  }>
  missingSource: { count: number; byCategory: Record<string, number>; examples: string[] }
  missingName: { count: number; byCategory: Record<string, number>; examples: string[] }
  unresolvedSourceRefs: { count: number; ids: string[]; examples: string[] }
  duplicateRecords: { total: number; groups: DuplicateGroup[] }
  sourceMetadataConflicts: Array<{ id: string; field: string; values: string[]; files: string[] }>
  indexMismatches: {
    en: { ids: number; files: number; missing: Array<{ id: string; path: string }>; extraFiles: number }
    zh: { ids: number; files: number; missing: Array<{ id: string; path: string }>; extraFiles: number }
  }
  editions: {
    official: Record<string, number>
    homebrew: Record<string, number>
    unknown: string[]
    mixed: string[]
  }
  translations: TranslationCoverage
  remoteIndexes: {
    homebrewEn: { url: string; remote: number; local: number; remoteOnly: string[]; localOnly: string[] } | null
    homebrewZh: { url: string; remote: number; local: number; remoteOnly: string[]; localOnly: string[] } | null
  }
  fetchProbes: Array<{
    repo: string
    url: string
    ok: boolean
    status: number | null
    bytes: number | null
    contentType: string | null
    ms: number
    error: string | null
  }>
  manifestHash: string
  recordsHash: string | null
}
