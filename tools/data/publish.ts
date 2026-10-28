import { join } from 'node:path'
import { readJson, REPO_ROOT, writeText } from './lib/io'
import type { Published } from './version'

interface ReportPack {
  id: string
  version: string
  sha256: string
}

interface Report {
  packs: ReportPack[]
}

/** 把本次构建的版本与哈希写入 published.json；推送与打标签仍需驾驶员授权。 */
async function main(): Promise<void> {
  const report = await readJson<Report>(join(REPO_ROOT, 'tools', 'data', 'out', 'report.json'))
  const published = await readJson<Published>(join(REPO_ROOT, 'tools', 'data', 'published.json')).catch(() => ({ formatVersion: 1, packs: {} }) as Published)
  for (const pack of report.packs) published.packs[pack.id] = { version: pack.version, sha256: pack.sha256 }
  await writeText(join(REPO_ROOT, 'tools', 'data', 'published.json'), `${JSON.stringify(published, null, 2)}\n`)
  console.log(`已记录 ${report.packs.length} 个包的发布版本（未推送、未打标签）`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
