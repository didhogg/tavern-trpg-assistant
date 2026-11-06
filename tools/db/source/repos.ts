import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { REF, OUT_ROOT } from '../lib/paths'
import type { RepoConfig } from './types'

const REF_ROOT = join(REF.cn, '..', '..')
const HOMEBREW_EN = process.env.TRPG_HOMEBREW_EN ?? join(REF_ROOT, 'homebrew-master')
const HOMEBREW_ZH = process.env.TRPG_HOMEBREW_ZH ?? join(OUT_ROOT, '_sources', 'homebrew-zh')
/** 5etools 的 2014 版独立站（镜像组织 5etools-mirror-3）。不在参考库里，只拉 data 下的 JSON 到输出目录。 */
const OFFICIAL_2014 = process.env.TRPG_OFFICIAL_2014 ?? join(OUT_ROOT, '_sources', '5etools-2014-src')

/** 5etools 英文本体（镜像组织 mirror-3）的现行版完整克隆。参考库里那份是 2.36.1，已落后，不再作为源。 */
const OFFICIAL_EN = process.env.TRPG_OFFICIAL_EN ?? join(OUT_ROOT, '_upstream', 'code', '5etools-src')
/** 作者的试玩稿仓库（Unearthed Arcana），自制格式；不在参考库里，只拉 JSON 到输出目录。 */
const PRERELEASE_UA = process.env.TRPG_UA ?? join(OUT_ROOT, '_sources', 'unearthed-arcana')
/** 作者的 5etools-utils：官方数据的 schema、校验与索引代码；这里只用它的官方来源清单。 */
const AUTHOR_UTILS = process.env.TRPG_5ETOOLS_UTILS ?? join(OUT_ROOT, '_sources', '5etools-utils')
export const AUTHOR_SOURCE_LIST = join(AUTHOR_UTILS, 'schema', 'site', 'sources-5etools.json')
export const AUTHOR_UTILS_ROOT = AUTHOR_UTILS

/**
 * 源登记。这里只有“哪个仓库、哪种语言、从哪里读”，没有书单、条目名单或字段名单。
 * 源 ID、记录、类别全部由扫描程序从文件里现读。
 */
export const REPOS: RepoConfig[] = [
  {
    id: 'official-cn', kind: 'official', lang: 'zh', label: '5etools 中文',
    root: REF.cn, repoRoot: join(REF.cn, '..'), repoUrl: 'https://github.com/tjliqy/5etools-cn', branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com/tjliqy/5etools-cn/main/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/tjliqy/5etools-cn@main/',
    probePath: 'data/books.json', role: 'primary',
  },
  {
    id: 'official-en-bak', kind: 'official', lang: 'en', label: '5etools 英文原版（data-bak）',
    root: REF.cnBak, repoRoot: join(REF.cn, '..'), repoUrl: 'https://github.com/tjliqy/5etools-cn', branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com/tjliqy/5etools-cn/main/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/tjliqy/5etools-cn@main/',
    probePath: 'data-bak/books.json', role: 'translation',
  },
  {
    id: 'official-en-src', kind: 'official', lang: 'en', label: '5etools 英文上游（现行版）',
    root: join(OFFICIAL_EN, 'data'), repoRoot: OFFICIAL_EN, repoUrl: 'https://github.com/5etools-mirror-3/5etools-src', branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/5etools-mirror-3/5etools-src@main/',
    probePath: 'data/books.json', role: 'reference',
  },
  {
    id: 'homebrew-en', kind: 'homebrew', lang: 'en', label: 'TheGiddyLimit/homebrew',
    root: HOMEBREW_EN, repoRoot: HOMEBREW_EN, repoUrl: 'https://github.com/TheGiddyLimit/homebrew', branch: 'master',
    baseUrl: 'https://raw.githubusercontent.com/TheGiddyLimit/homebrew/master/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/TheGiddyLimit/homebrew@master/',
    probePath: '_generated/index-sources.json', role: 'primary',
  },
  {
    id: 'homebrew-zh', kind: 'homebrew', lang: 'zh', label: 'tjliqy/homebrew-deploy',
    root: HOMEBREW_ZH, repoRoot: HOMEBREW_ZH, repoUrl: 'https://github.com/tjliqy/homebrew-deploy', branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com/tjliqy/homebrew-deploy/main/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/tjliqy/homebrew-deploy@main/',
    probePath: '_generated/index-sources.json', role: 'translation',
  },
  {
    id: 'official-2014-src', kind: 'official', lang: 'en', label: '5etools 2014 版独立站（5etools-2014-src）',
    root: join(OFFICIAL_2014, 'data'), repoRoot: OFFICIAL_2014, repoUrl: 'https://github.com/5etools-mirror-3/5etools-2014-src', branch: 'main',
    baseUrl: 'https://raw.githubusercontent.com/5etools-mirror-3/5etools-2014-src/main/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/5etools-mirror-3/5etools-2014-src@main/',
    probePath: 'data/books.json', role: 'reference',
  },
  {
    id: 'prerelease-ua', kind: 'prerelease', lang: 'en', label: 'TheGiddyLimit/unearthed-arcana（试玩稿）',
    root: PRERELEASE_UA, repoRoot: PRERELEASE_UA, repoUrl: 'https://github.com/TheGiddyLimit/unearthed-arcana', branch: 'master',
    baseUrl: 'https://raw.githubusercontent.com/TheGiddyLimit/unearthed-arcana/master/',
    fallbackBaseUrl: 'https://cdn.jsdelivr.net/gh/TheGiddyLimit/unearthed-arcana@master/',
    probePath: '_generated/index-sources.json', role: 'primary',
  },
]

/** 只拉 JSON 的稀疏克隆：不拉图片、字体。已有标志文件就跳过。 */
function sparseClone(opts: { url: string; root: string; marker: string; patterns: string[]; label: string; envHint: string }): void {
  if (existsSync(join(opts.root, opts.marker))) return
  mkdirSync(join(opts.root, '..'), { recursive: true })
  const clone = spawnSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', opts.url, opts.root], { stdio: 'inherit' })
  if (clone.status !== 0) throw new Error(`下载${opts.label}失败；可设置 ${opts.envHint} 指向已有目录`)
  const sparse = spawnSync('git', ['sparse-checkout', 'set', '--no-cone', ...opts.patterns], { cwd: opts.root, stdio: 'inherit' })
  if (sparse.status !== 0) throw new Error(`${opts.label} sparse-checkout 失败`)
  const rev = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: opts.root, encoding: 'utf8' })
  if (rev.status === 0 && rev.stdout.trim()) writeFileSync(join(opts.root, '.source-revision'), `${rev.stdout.trim()}\n`)
}

/** 参考库里没有的仓库：中文自制（约 100MB）、2014 版独立站、试玩稿、作者的 5etools-utils。首次运行会下载到输出目录。 */
export function ensureClonedRepos(): void {
  sparseClone({ url: 'https://github.com/tjliqy/homebrew-deploy.git', root: HOMEBREW_ZH, marker: join('_generated', 'index-sources.json'), patterns: ['*.json'], label: '中文自制仓库', envHint: 'TRPG_HOMEBREW_ZH' })
  sparseClone({ url: 'https://github.com/5etools-mirror-3/5etools-2014-src.git', root: OFFICIAL_2014, marker: join('data', 'books.json'), patterns: ['/data/**/*.json'], label: '2014 版独立站', envHint: 'TRPG_OFFICIAL_2014' })
  sparseClone({ url: 'https://github.com/TheGiddyLimit/unearthed-arcana.git', root: PRERELEASE_UA, marker: join('_generated', 'index-sources.json'), patterns: ['*.json'], label: '试玩稿仓库', envHint: 'TRPG_UA' })
  sparseClone({ url: 'https://github.com/TheGiddyLimit/5etools-utils.git', root: AUTHOR_UTILS, marker: join('schema', 'site', 'sources-5etools.json'), patterns: ['/schema/**', '/lib/**', '/bin/**', '/README.md', '/package.json'], label: '作者 5etools-utils', envHint: 'TRPG_5ETOOLS_UTILS' })
}

export function gitRevision(dir: string): string | null {
  const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' })
  return r.status === 0 && r.stdout.trim() ? r.stdout.trim() : null
}

export function repoRevision(repo: RepoConfig): string | null {
  return gitRevision(repo.repoRoot)
}
