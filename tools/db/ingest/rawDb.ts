import { mkdirSync, rmSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export type Lib = 'cn' | 'en' | 'bak'

export interface RawRow {
  lib: Lib
  file: string
  category: string
  idx: number
  kind: 'json' | 'value' | 'html' | 'text'
  name: string | null
  nameEn: string | null
  source: string | null
  body: string
}

const SCHEMA = `
CREATE TABLE raw (
  id INTEGER PRIMARY KEY,
  lib TEXT NOT NULL,        -- cn=5etools中文 en=5etools英文(src-main 2.36.1) bak=中文仓库自带的英文原版(data-bak 2.39.0) （不全书、Foundry 不入库，驾驶员决定）
  file TEXT NOT NULL,       -- 相对参考库根的路径
  category TEXT NOT NULL,   -- 类别（5etools=文件里的顶层键；foundry=第一级文件夹；chm=第一级文件夹）
  idx INTEGER NOT NULL,     -- 在文件里的序号
  kind TEXT NOT NULL,
  name TEXT, name_en TEXT, source TEXT,
  body TEXT NOT NULL
);
CREATE INDEX raw_lib_cat ON raw(lib, category);
CREATE INDEX raw_file ON raw(lib, file);
CREATE TABLE excluded (lib TEXT NOT NULL, file TEXT NOT NULL, reason TEXT NOT NULL);
CREATE TABLE assets (lib TEXT NOT NULL, file TEXT NOT NULL, bytes INTEGER NOT NULL, sha256 TEXT NOT NULL, note TEXT);
CREATE TABLE file_log (lib TEXT NOT NULL, file TEXT NOT NULL, records INTEGER NOT NULL, error TEXT, note TEXT);
CREATE TABLE code (lib TEXT NOT NULL, file TEXT NOT NULL, bytes INTEGER NOT NULL, sha256 TEXT NOT NULL, body TEXT NOT NULL); -- 上游代码文本（js、node、test），原样，供读取上游规则用
CREATE INDEX code_file ON code(lib, file);
CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`

export function openFresh(path: string): DatabaseSync {
  mkdirSync(dirname(path), { recursive: true })
  rmSync(path, { force: true })
  const db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode=OFF; PRAGMA synchronous=OFF;')
  db.exec(SCHEMA)
  return db
}

export function makeWriters(db: DatabaseSync) {
  const insRaw = db.prepare('INSERT INTO raw (lib,file,category,idx,kind,name,name_en,source,body) VALUES (?,?,?,?,?,?,?,?,?)')
  const insEx = db.prepare('INSERT INTO excluded (lib,file,reason) VALUES (?,?,?)')
  const insAsset = db.prepare('INSERT INTO assets (lib,file,bytes,sha256,note) VALUES (?,?,?,?,?)')
  const insCode = db.prepare('INSERT INTO code (lib,file,bytes,sha256,body) VALUES (?,?,?,?,?)')
  const insLog = db.prepare('INSERT INTO file_log (lib,file,records,error,note) VALUES (?,?,?,?,?)')
  const skipped: Record<string, number> = {}
  return {
    /** 图片文件：不入库，只数个数 */
    skipImage: (lib: Lib): void => { skipped[lib] = (skipped[lib] ?? 0) + 1 },
    skippedImages: (): Record<string, number> => ({ ...skipped }),
    row: (r: RawRow): void => { insRaw.run(r.lib, r.file, r.category, r.idx, r.kind, r.name, r.nameEn, r.source, r.body) },
    excluded: (lib: Lib, file: string, reason: string): void => { insEx.run(lib, file, reason) },
    asset: (lib: Lib, file: string, bytes: number, sha256: string, note: string | null): void => { insAsset.run(lib, file, bytes, sha256, note) },
    code: (lib: Lib, file: string, bytes: number, sha256: string, body: string): void => { insCode.run(lib, file, bytes, sha256, body) },
    log: (lib: Lib, file: string, records: number, error: string | null, note: string | null = null): void => { insLog.run(lib, file, records, error, note) },
  }
}
export type Writers = ReturnType<typeof makeWriters>
