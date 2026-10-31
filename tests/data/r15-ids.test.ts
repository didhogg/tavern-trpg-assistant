import { execFileSync } from 'node:child_process'
import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { ID_REDIRECTS } from '../../tools/data/config/idRedirects'
import { DATA_REPO, allEntries } from './r9-pack-helpers'

const PUBLISHED_DATA_COMMIT = 'a6a22e5'
const PUBLISHED_SRD_COMMIT = '12f0cce'

function idsIn(zip: Buffer): string[] {
  const out: string[] = []
  for (const [name, bytes] of Object.entries(unzipSync(new Uint8Array(zip)))) if (name.startsWith('entries/')) for (const entry of JSON.parse(strFromU8(bytes)) as Array<{ id: string }>) out.push(entry.id)
  return out
}

describe('R15 id 稳定：已发布 1.0.x 包里的每个条目 id 仍存在，或有登记的重定向', () => {
  it('十个书包（数据仓库 a6a22e5）与 SRD 包（扩展仓库 12f0cce）', () => {
    const now = new Set(allEntries().map((entry) => entry.id))
    const names = execFileSync('git', ['-C', DATA_REPO, 'ls-tree', '--name-only', PUBLISHED_DATA_COMMIT, 'packs/dnd5e2014/'], { encoding: 'utf8' }).split('\n').filter((n) => n.endsWith('.trpgpack'))
    expect(names).toHaveLength(10)
    const old: string[] = []
    for (const name of names) old.push(...idsIn(execFileSync('git', ['-C', DATA_REPO, 'show', `${PUBLISHED_DATA_COMMIT}:${name}`], { maxBuffer: 64 * 1024 * 1024 })))
    old.push(...idsIn(execFileSync('git', ['show', `${PUBLISHED_SRD_COMMIT}:packs/dnd5e2014-srd.trpgpack`], { maxBuffer: 64 * 1024 * 1024 })))
    expect(old.length).toBeGreaterThan(1000)
    const missing = old.filter((id) => !now.has(id) && !(ID_REDIRECTS[id] && now.has(ID_REDIRECTS[id].to)))
    expect(missing).toEqual([])
  }, 120_000)
})
