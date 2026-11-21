// 把 Foundry 核心样式表放进 vendor/foundry/css/（驾驶员 2026-11-21 批准下载）：建卡专用小窗显示作者窗口时，
// 窗口怎么摆（浮动、层叠、排列辅助类、表单结构）由 Foundry 自己的样式负责；长什么样由插件主题盖掉（src/ui/styles/build-frame.css）。
// 只取和 vendor 里 foundry.mjs 同一版本的文件：先比对演示站的 foundry.mjs 指纹，不一样就不下载。
// 样式里引用的字体、图片不带（插件主题换掉字体，作者窗口用不到那些图），缺了浏览器只是取不到，不影响排版。
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const out = join(root, 'vendor/foundry')
const manifestPath = join(out, 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
const DEMO = manifest.source.split(' ')[0]
// Foundry 14 窗口（ApplicationV2）的核心样式。演示站另有一份旧版 style.css：它不分层（没有 @layer），
// 会盖过作者分层的样式（Plutonium 的 @layer vetools 等），把作者排版撑坏，所以不带。
const STYLES = ['css/foundry2.css']
const sha = (buffer) => createHash('sha256').update(buffer).digest('hex')
const get = async (path) => {
  const response = await fetch(`${DEMO}/${path}`, { headers: { 'user-agent': 'trpg-assistant-vendor' } })
  if (!response.ok) throw Error(`下载失败（${response.status}）：${path}`)
  return Buffer.from(await response.arrayBuffer())
}

const local = sha(await readFile(join(out, manifest.entry)))
const remote = sha(await get(manifest.entry))
if (local !== remote) throw Error(`演示站的 Foundry 已不是 vendor 里这一版（${manifest.source}），不下载样式表，免得版本对不上`)
await mkdir(join(out, 'css'), { recursive: true })
for (const path of STYLES) await writeFile(join(out, path), await get(path))
manifest.styles = STYLES
manifest.files = [...new Set([...manifest.files, ...STYLES])].sort()
await writeFile(manifestPath, JSON.stringify(manifest, null, 1) + '\n')
console.log(`vendor/foundry/css：${STYLES.join('、')}（与 ${manifest.source} 同一版本）`)
