import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Lib, Writers } from './rawDb'
import { isImageFile, walkFiles } from './fsWalk'

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string | null => (typeof v === 'string' ? v : null)

/** 一个文件的"记录数"：顶层数组里的每个元素算一条，顶层非数组的键各算一条。 */
export function splitRecords(top: unknown): Array<{ category: string; idx: number; kind: 'json' | 'value'; value: unknown }> {
  if (!isObj(top)) return [{ category: '(root)', idx: 0, kind: 'value', value: top }]
  const out: Array<{ category: string; idx: number; kind: 'json' | 'value'; value: unknown }> = []
  for (const [key, val] of Object.entries(top)) {
    if (Array.isArray(val)) val.forEach((el, i) => out.push({ category: key, idx: i, kind: isObj(el) ? 'json' : 'value', value: el }))
    else out.push({ category: key, idx: 0, kind: 'value', value: val })
  }
  return out
}

const TEXT_EXT = new Set(['md', 'txt', 'html', 'htm', 'xml', 'csv'])

export function ingest5etools(lib: Extract<Lib, 'cn' | 'en' | 'bak'>, root: string, w: Writers): { files: number; records: number } {
  let files = 0
  let records = 0
  for (const rel of walkFiles(root)) {
    // R1：排除名单为空。JSON 之外的文件：文本类原样存成一条文本记录；二进制只登记路径、大小、哈希。
    if (!rel.endsWith('.json')) {
      const full = join(root, rel)
      const ext = rel.includes('.') ? rel.slice(rel.lastIndexOf('.') + 1).toLowerCase() : ''
      if (TEXT_EXT.has(ext)) {
        const text = readFileSync(full, 'utf8')
        w.row({ lib, file: rel, category: rel.split('/')[0]!, idx: 0, kind: 'text', name: null, nameEn: null, source: null, body: text })
        w.log(lib, rel, 1, null)
        files += 1
        records += 1
      } else if (isImageFile(rel)) {
        w.skipImage(lib)
      } else {
        w.asset(lib, rel, statSync(full).size, createHash('sha256').update(readFileSync(full)).digest('hex'), ext || null)
      }
      continue
    }
    let top: unknown
    try { top = JSON.parse(readFileSync(join(root, rel), 'utf8')) } catch (e) { w.log(lib, rel, 0, String(e)); continue }
    const recs = splitRecords(top)
    for (const r of recs) {
      const o = isObj(r.value) ? r.value : null
      const source = o ? str(o.source) ?? str(o.id) : null
      const name = o ? str(o.name) : null
      const nameEn = o ? str(o.ENG_name) ?? (lib === 'en' || lib === 'bak' ? name : null) : null
      w.row({ lib, file: rel, category: r.category, idx: r.idx, kind: r.kind, name, nameEn, source, body: JSON.stringify(r.value) })
    }
    w.log(lib, rel, recs.length, null)
    files += 1
    records += recs.length
  }
  return { files, records }
}
