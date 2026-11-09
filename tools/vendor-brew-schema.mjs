// 把作者的自制数据结构定义原样拷进插件（P5 B-12）：
//   vendor/brew-schema/schema/…        作者结构包 5etools-utils（MIT）的 schema/brew，按固定版本从 npm 取，不改任何文件
//   vendor/brew-schema/remote/…        结构里唯一的外部引用（plutonium-scenes 的 shared.json），作者测试器联网取，这里取一份随插件带
//   vendor/brew-schema/SOURCE.json     来源、版本、取得日期
// 之后运行 tools/build-brew-validator.mjs 编译。版本换了才需要重跑本工具。
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const PACKAGE = '5etools-utils'
const VERSION = '0.17.24'
const REMOTE = 'https://raw.githubusercontent.com/TheGiddyLimit/plutonium-scenes/main/test/schema/shared.json'
const out = join(root, 'vendor/brew-schema')
const tmp = join(root, 'work/brew-schema-src')

await rm(tmp, { recursive: true, force: true })
await mkdir(tmp, { recursive: true })
const tarball = execFileSync('npm', ['pack', `${PACKAGE}@${VERSION}`, '--silent'], { cwd: tmp, encoding: 'utf8' }).trim().split('\n').pop()
execFileSync('tar', ['-xzf', tarball, 'package/schema/brew', 'package/package.json'], { cwd: tmp })

await rm(out, { recursive: true, force: true })
await mkdir(join(out, 'remote'), { recursive: true })
await cp(join(tmp, 'package/schema/brew'), join(out, 'schema'), { recursive: true })
const remote = await fetch(REMOTE)
if (!remote.ok) throw new Error(`取外部结构定义失败：${REMOTE} ${remote.status}`)
const remoteText = await remote.text()
JSON.parse(remoteText)
await writeFile(join(out, 'remote/plutonium-scenes-shared.json'), remoteText)
const pkg = JSON.parse(await readFile(join(tmp, 'package/package.json'), 'utf8'))
await writeFile(join(out, 'SOURCE.json'), `${JSON.stringify({ package: PACKAGE, version: pkg.version, license: pkg.license, remote: REMOTE, fetched: new Date().toISOString().slice(0, 10) }, null, 2)}\n`)
console.log(`已拷入 ${PACKAGE}@${pkg.version} 的 schema/brew 与外部引用 → vendor/brew-schema/`)
