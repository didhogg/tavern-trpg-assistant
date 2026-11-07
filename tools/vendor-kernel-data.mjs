// 结算小窗随插件带的数据（蓝图 §3.1、决定 8 的录制做法），生成到 vendor/foundry/：
//   packs/<系统>.<包>.json      dnd5e 作者资料包：作者 YAML 原样转 JSON（不改内容；去掉目录记录，与官方服务器一致）
//   modules/<模块>/<路径>        结算对答案时小窗实际读过的模块自带文件（录在 work/p3-2-a/module-files-*.json），从原包原样拷贝
// 先跑 KERNEL_FILES=reference node tests/e2e/kernel/convert.mjs 与 candidate.mjs 录下读过的文件，再运行本工具。
import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import { assets, output, pack, root, systemRoot } from '../tests/e2e/kernel/assets.mjs'

const vendor = join(root, 'vendor/foundry')
const rawManifest = JSON.parse(await readFile(join(systemRoot, 'system.json'), 'utf8'))

await rm(join(vendor, 'packs'), { recursive: true, force: true })
await mkdir(join(vendor, 'packs'), { recursive: true })
const packs = {}
for (const description of rawManifest.packs) {
  const id = `${rawManifest.id}.${description.name}`
  const text = JSON.stringify(await pack(description.name))
  await writeFile(join(vendor, 'packs', `${id}.json`), text)
  packs[id] = text.length
}

// dnd5e 代码为 MIT：许可原文须随附
await copyFile(join(systemRoot, 'LICENSE.txt'), join(vendor, 'systems/dnd5e/LICENSE.txt'))

const lists = (await readdir(output)).filter(name => /^module-files-.+\.json$/.test(name))
// 驾驶员定 A：Plutonium 读 5etools 数据由【库】回答，这里只带录到的、【库】没有的原包文件；没有录制清单时只生成资料包
if (!lists.length) console.warn('没有录到的模块文件清单：本次只生成资料包')
const wanted = new Set()
for (const name of lists) for (const path of JSON.parse(await readFile(join(output, name), 'utf8'))) wanted.add(path)
const { moduleRoots } = await assets()
const copied = []
for (const path of [...wanted].sort()) {
  const [, id, rest] = /^modules\/([^/]+)\/(.+)$/.exec(path) ?? []
  if (!id || !moduleRoots[id]) throw Error(`不认识的模块文件：${path}`)
  const from = resolve(moduleRoots[id], rest)
  if (!from.startsWith(resolve(moduleRoots[id]) + sep)) throw Error(`路径越界：${path}`)
  const to = join(vendor, 'modules', id, rest)
  await mkdir(dirname(to), { recursive: true })
  await copyFile(from, to)
  copied.push(path)
}

const manifestPath = join(vendor, 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
manifest.kernelData = { packs, moduleFiles: copied, recordedFrom: lists.sort() }
await writeFile(manifestPath, JSON.stringify(manifest, null, 1) + '\n')
console.log(JSON.stringify({ packs: Object.keys(packs).length, packBytes: Object.values(packs).reduce((a, b) => a + b, 0), moduleFiles: copied.length, lists }))
