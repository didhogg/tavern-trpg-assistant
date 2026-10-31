import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Entry } from '../../../src/schemas/pack'
import { REPO_ROOT } from '../lib/io'

export interface EnglishPass { entries: Entry[]; tableOrder: string[] }

/** 在子进程里对着英文原版数据把「规划 + 转换」再跑一遍（环境变量只在子进程里设）。 */
export function runEnglishPass(): EnglishPass {
  const dir = mkdtempSync(join(tmpdir(), 'trpg-en-'))
  const out = join(dir, 'english.json')
  try {
    const result = spawnSync(join(REPO_ROOT, 'node_modules', '.bin', 'tsx'), ['tools/data/english.ts', out], {
      cwd: REPO_ROOT,
      env: { ...process.env, TRPG_DATA_DIR: 'data-bak', TRPG_DATA_LANG: 'en' },
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    })
    if (result.status !== 0) throw new Error(`英文那一遍失败（退出码 ${result.status}）：${(result.stderr || result.stdout).split('\n').filter((line) => !line.startsWith('FLUFF DEBUG')).slice(-12).join('\n')}`)
    return JSON.parse(readFileSync(out, 'utf8')) as EnglishPass
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
