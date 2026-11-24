// 构建 Tidy5e 预览要用的两样（只做一次）：Tidy5e 模块（照它自己的 vite build）、dnd5e 官方样式（照它自己的 lessc）。
// 源码从参考目录复制到 work/tidy5e/ 再构建，参考目录只读。
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
const mkdir = (dir) => mkdirSync(dir, { recursive: true })
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const REF = '/Users/xxx/DND- reference（DO NO DELETE！）'
const work = join(root, 'work/tidy5e')
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })
mkdirSync(work, { recursive: true })
run('rsync', ['-a', '--exclude', 'node_modules', '--exclude', 'dist', `${REF}/foundry-vtt-tidy-5e-sheets-main/`, join(work, 'src/')])
if (!existsSync(join(work, 'src/node_modules'))) run('npm', ['ci', '--no-audit', '--no-fund'], join(work, 'src'))
run('npx', ['vite', 'build'], join(work, 'src'))
mkdirSync(join(work, 'dnd5e'), { recursive: true })
const dnd = `${REF}/dnd5e-6.1.x/`
run('rsync', ['-a', `${dnd}less`, `${dnd}fonts`, `${dnd}icons`, `${dnd}ui`, join(work, 'dnd5e/')])
run('npx', ['-y', 'less@4.2.0', 'less/dnd5e.less', 'dnd5e.css'], join(work, 'dnd5e'))
// 图标字体：Font Awesome 免费公开版（Foundry 带的是专业版，本机没有）
mkdir(join(work, 'fa'))
run('sh', ['-c', 'npm pack @fortawesome/fontawesome-free@7 --silent && tar -xzf fortawesome-fontawesome-free-*.tgz -C fa --strip-components=1'], work)
console.log('Tidy5e 预览已构建：node tools/tidy-preview/serve.mjs')
