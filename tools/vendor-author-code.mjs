// 把作者程序原样拷进插件（D2-P2 B1 设计 §7 B）。
// 只按源登记表（src/library/sources.json）锁定的提交取作者仓库的 js/、lib/，不改任何文件；
// 小窗加载哪些脚本、什么顺序，取自作者自己的页面：作者所有列表页（用作者列表页框架 listpage.js 的页面）都加载的脚本，
// 按页面里的先后排，只取会被拷进插件的 js/、lib/ 下的脚本；页面骨架照搬作者列表页。不手抄名单，不碰数据。
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const registry = JSON.parse(await readFile(join(root, 'src/library/sources.json'), 'utf8'))
const workDir = join(root, 'work/vendor-src')
const LIST_PAGE = 'js/listpage.js'
const COPIED_DIRS = ['js', 'lib']
// 作者发布网站时会跑的一步（.github/workflows/pages.yml、main.yml）：把 js/utils.js 的 IS_DEPLOYED 设成发布标签。
// 原样运行作者的脚本；脚本用 GNU sed 的写法，Mac 上用 Homebrew 的 gnu-sed（驾驶员 2026-11-06 选 A1 并授权安装）。
const DEPLOY_FLAG = '.github/set-deployed-flag.sh'

function runAuthorDeployFlag(dir, tag) {
  git(dir, 'checkout', '-q', '--', 'js/utils.js')
  const gnubin = `${execFileSync('brew', ['--prefix', 'gnu-sed'], { encoding: 'utf8' }).trim()}/libexec/gnubin`
  execFileSync('bash', [DEPLOY_FLAG, tag], { cwd: dir, stdio: 'inherit', env: { ...process.env, PATH: `${gnubin}:${process.env.PATH}` } })
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
}

async function checkout(id, { repo, commit }) {
  const dir = join(workDir, id)
  const sparse = [...COPIED_DIRS.map((d) => `/${d}/`), '/*.html', '/LICENSE*', `/${DEPLOY_FLAG}`]
  if (existsSync(join(dir, '.git')) && git(dir, 'rev-parse', 'HEAD') === commit) {
    git(dir, 'sparse-checkout', 'set', '--no-cone', ...sparse)
    return dir
  }
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  git(dir, 'init', '-q')
  git(dir, 'remote', 'add', 'origin', `https://github.com/${repo}.git`)
  git(dir, 'sparse-checkout', 'set', '--no-cone', ...sparse)
  git(dir, 'fetch', '-q', '--depth', '1', '--filter=blob:none', 'origin', commit)
  git(dir, 'checkout', '-q', 'FETCH_HEAD')
  if (git(dir, 'rev-parse', 'HEAD') !== commit) throw new Error(`${id}: 取到的提交与登记不符`)
  return dir
}

async function pageScripts(dir) {
  const pages = (await readdir(dir)).filter((f) => f.endsWith('.html')).sort()
  const result = []
  for (const page of pages) {
    const html = await readFile(join(dir, page), 'utf8')
    const tags = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map((m) => ({ tag: m[0], src: m[1] }))
    if (tags.some((t) => t.src === LIST_PAGE)) result.push({ page, html, tags })
  }
  if (!result.length) throw new Error('没有找到作者的列表页')
  return result
}

function commonScripts(pages) {
  const [first, ...rest] = pages
  return first.tags.filter((t) => COPIED_DIRS.some((d) => t.src.startsWith(`${d}/`)) && rest.every((p) => p.tags.some((o) => o.src === t.src)))
}

// 小窗页面的骨架照搬作者第一个列表页的 <body>（驾驶员 2026-11-06 选 A）：
// 作者的导航栏、搜索框等界面零件要往骨架里固定的位置画东西；只去掉作者页面里的全部脚本标签，
// 换成上面的加载列表，其余原样。
function authorBody(html) {
  const m = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/)
  if (!m) throw new Error('作者列表页没有 <body>')
  return m[1].replace(/<script\b[\s\S]*?<\/script>/g, '').trim()
}

async function listFiles(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await listFiles(full)))
    else out.push(full)
  }
  return out
}

for (const [id, set] of Object.entries(registry.codeSets)) {
  const src = await checkout(id, set)
  const tag = `v${set.version}`
  runAuthorDeployFlag(src, tag)
  if (!(await readFile(join(src, 'js/utils.js'), 'utf8')).includes(`globalThis.IS_DEPLOYED="${tag}"`)) throw new Error(`${id}: 作者发布脚本没有生效`)
  const pages = await pageScripts(src)
  const scripts = commonScripts(pages)
  const out = join(root, 'vendor', id)
  await rm(out, { recursive: true, force: true })
  await mkdir(out, { recursive: true })
  for (const d of COPIED_DIRS) await cp(join(src, d), join(out, d), { recursive: true })
  for (const f of await readdir(src)) if (f.startsWith('LICENSE')) await cp(join(src, f), join(out, f))
  const files = {}
  let bytes = 0
  for (const file of (await listFiles(out)).sort()) {
    const body = await readFile(file)
    bytes += (await stat(file)).size
    files[relative(out, file)] = createHash('sha256').update(body).digest('hex')
  }
  const frame = [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"><title>author runtime</title>',
    '<script src="../../dist/frame-early.js"></script>',
    '</head><body>',
    `<!-- 以下骨架原样取自作者列表页 ${pages[0].page}（已去掉其中的脚本标签） -->`,
    authorBody(pages[0].html),
    ...scripts.map((s) => s.tag),
    '<script type="module" src="../../dist/frame.js"></script>',
    '</body></html>',
    '',
  ].join('\n')
  await writeFile(join(out, 'frame.html'), frame)
  const manifest = {
    codeSet: id, repo: set.repo, commit: set.commit, version: set.version,
    scriptsFrom: `所有加载 ${LIST_PAGE} 的作者列表页（${pages.length} 个）都加载的 js/、lib/ 脚本`,
    skeletonFrom: pages[0].page,
    deployStep: `已按作者发布流程运行 ${DEPLOY_FLAG} ${tag}`,
    scripts: scripts.map((s) => s.src), bytes, files,
  }
  await writeFile(join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`${id}: ${set.repo}@${set.commit.slice(0, 7)}  页面 ${pages.length}  脚本 ${scripts.length}  文件 ${Object.keys(files).length}  ${(bytes / 1e6).toFixed(1)}MB`)
  console.log(`  ${scripts.map((s) => s.src).join(' ')}`)
}
