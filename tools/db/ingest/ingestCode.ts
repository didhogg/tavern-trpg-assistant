import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { REPO } from '../lib/paths'
import { isImageFile, walkFiles } from './fsWalk'
import type { Lib, Writers } from './rawDb'

/** 仓库里已由数据入库流程处理的顶层文件夹（data → raw 表；data-bak → raw 表 lib=bak）。其余一切都在这里处理，没有名单。 */
const HANDLED_TOP = new Set(['data', 'data-bak'])

/** 上游仓库里除数据文件夹之外的全部文件（js、node、test、docs、languages、search、lib、网页、样式、说明文件……），不筛选：
 *  内容是合法 UTF-8 且不含空字节的 → 文本，原文存入 code 表；否则（图片、音频、字体、压缩包）→ 只登记路径、大小、哈希。 */
export function ingestCode(lib: Extract<Lib, 'cn' | 'en'>, w: Writers): { files: number; bytes: number; assets: number; images: number } {
  const root = REPO[lib]
  let files = 0
  let bytes = 0
  let assets = 0
  let images = 0
  for (const rel of walkFiles(root)) {
    if (HANDLED_TOP.has(rel.split('/')[0]!)) continue
    if (isImageFile(rel)) { w.skipImage(lib); images += 1; continue }
    const buf = readFileSync(join(root, rel))
    const sha = createHash('sha256').update(buf).digest('hex')
    let text: string | null = null
    if (!buf.includes(0)) { try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf) } catch { text = null } }
    if (text === null) { w.asset(lib, rel, buf.length, sha, '仓库里的非文本文件'); assets += 1; continue }
    w.code(lib, rel, buf.length, sha, text)
    w.log(lib, rel, 1, null, '代码仓库文本')
    files += 1
    bytes += buf.length
  }
  return { files, bytes, assets, images }
}

/** 另数一遍：换一种遍历方式只数总文件数（文本+非文本），和 code 表行数加 assets 登记数比。 */
export function recountCode(lib: Extract<Lib, 'cn' | 'en'>): { total: number } {
  const root = REPO[lib]
  let total = 0
  for (const e of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!e.isFile()) continue
    const top = relative(root, join(e.parentPath, e.name)).split('/')[0]!
    if (!HANDLED_TOP.has(top)) total += 1
  }
  return { total }
}

export const codeStatSize = (p: string): number => statSync(p).size
