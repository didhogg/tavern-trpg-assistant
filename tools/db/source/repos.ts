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
    id: 'official-en-src', kind: 'official', lang: 'en', label: '5etools 英文上游',
    root: REF.en, repoRoot: join(REF.en, '..'), repoUrl: 'https://github.com/5etools-mirror-3/5etools-src', branch: 'main',
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

/** 参考库里没有的两个仓库：中文自制（约 100MB）、2014 版独立站。首次运行会下载到输出目录。 */
export function ensureClonedRepos(): void {
  sparseClone({ url: 'https://github.com/tjliqy/homebrew-deploy.git', root: HOMEBREW_ZH, marker: join('_generated', 'index-sources.json'), patterns: ['*.json'], label: '中文自制仓库', envHint: 'TRPG_HOMEBREW_ZH' })
  sparseClone({ url: 'https://github.com/5etools-mirror-3/5etools-2014-src.git', root: OFFICIAL_2014, marker: join('data', 'books.json'), patterns: ['/data/**/*.json'], label: '2014 版独立站', envHint: 'TRPG_OFFICIAL_2014' })
}

export function repoRevision(repo: RepoConfig): string | null {
  const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo.repoRoot, encoding: 'utf8' })
  return r.status === 0 && r.stdout.trim() ? r.stdout.trim() : null
}
