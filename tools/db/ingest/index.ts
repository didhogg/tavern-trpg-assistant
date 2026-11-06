import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { REF, RAW_DB } from '../lib/paths'
import { walkFiles } from './fsWalk'
import { ingestCode, recountCode } from './ingestCode'
import { ingest5etools, splitRecords } from './ingest5etools'
import { makeWriters, openFresh, type Lib } from './rawDb'

export interface IngestResult { lib: Lib; label?: string; files: number; records: number; assets?: number; images?: number; expected: number; ok: boolean }

/** 退出条件的"另数一遍"：重新读源文件，用不同的数法数条数，和库里的条数比。 */
function recount5etools(root: string): number {
  let n = 0
  for (const rel of walkFiles(root)) {
    if (!rel.endsWith('.json')) {
      if (/\.(md|txt|html|htm|xml|csv)$/i.test(rel)) n += 1
      continue
    }
    n += splitRecords(JSON.parse(readFileSync(join(root, rel), 'utf8'))).length
  }
  return n
}

export function runIngest(): IngestResult[] {
  const db = openFresh(RAW_DB)
  const w = makeWriters(db)
  const results: IngestResult[] = []
  db.exec('BEGIN')
  const cn = ingest5etools('cn', REF.cn, w)
  const en = ingest5etools('en', REF.en, w)
  const bak = ingest5etools('bak', REF.cnBak, w)
  const codeCn = ingestCode('cn', w)
  const codeEn = ingestCode('en', w)
  db.exec('COMMIT')
  const count = (lib: Lib): number => (db.prepare('SELECT COUNT(*) AS n FROM raw WHERE lib=?').get(lib) as { n: number }).n
  results.push({ lib: 'cn', ...cn, expected: recount5etools(REF.cn), ok: count('cn') === recount5etools(REF.cn) })
  results.push({ lib: 'en', ...en, expected: recount5etools(REF.en), ok: count('en') === recount5etools(REF.en) })
  results.push({ lib: 'bak', label: '中文仓库自带英文原版 data-bak', ...bak, expected: recount5etools(REF.cnBak), ok: count('bak') === recount5etools(REF.cnBak) })
  for (const [lib, got] of [['cn', codeCn], ['en', codeEn]] as const) {
    const exp = recountCode(lib).total
    const nCode = (db.prepare('SELECT COUNT(*) AS n FROM code WHERE lib=?').get(lib) as { n: number }).n
    const nAsset = (db.prepare("SELECT COUNT(*) AS n FROM assets WHERE lib=? AND note='仓库里的非文本文件'").get(lib) as { n: number }).n
    results.push({ lib, label: '上游仓库其余文件(文本+非文本登记)', files: got.files, records: nCode, assets: nAsset, expected: exp, ok: nCode + nAsset + got.images === exp, images: got.images })
  }
  const errors = (db.prepare('SELECT COUNT(*) AS n FROM file_log WHERE error IS NOT NULL').get() as { n: number }).n
  db.prepare('INSERT INTO meta VALUES (?,?)').run('ingest', JSON.stringify({ results, errors, skippedImages: w.skippedImages() }))
  console.log('图片文件（按规定不入库，只数个数）：', JSON.stringify(w.skippedImages()))
  db.close()
  return results
}
