import { join } from 'node:path'
import { cp, mkdir } from 'node:fs/promises'
import type { ConvertedPack } from '../convert'
import { BOOKS, SRD_PACK_ID } from '../config/books'
import { writeText } from '../lib/io'

const PLACEHOLDER_TAG = 'v0.0.0-placeholder'

export async function writeDataRepo(repo: string, packs: ConvertedPack[], outputs: Map<string, { bytes: Uint8Array; sha256: string }>): Promise<void> {
  await mkdir(join(repo, 'packs', 'dnd5e2014'), { recursive: true })
  await mkdir(join(repo, 'LICENSES'), { recursive: true })
  for (const file of ['GPL-3.0.txt', 'CC-BY-NC-SA-4.0.txt', 'CC-BY-4.0.txt', 'MIT.txt']) {
    await cp(join(process.cwd(), 'packs', 'LICENSES', file), join(repo, 'LICENSES', file))
  }
  const catalog = {
    formatVersion: 1,
    rules: [],
    packs: BOOKS.map((book) => {
      const pack = packs.find((p) => p.manifest.id === book.packId)!
      const out = outputs.get(book.packId)!
      const typeCounts: Record<string, number> = {}
      for (const entry of pack.entries) typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1
      const contributes = {
        entries: pack.entries.length,
        tables: pack.entries.filter((e) => e.type === 'table').length,
        variants: pack.entries.filter((e) => (e as { override?: unknown }).override !== undefined).length,
        adventures: 0,
        ruleOptions: pack.features.filter((f) => f.kind === 'ruleOptions').length,
      }
      return {
        id: pack.manifest.id,
        ruleId: pack.manifest.ruleId,
        category: pack.manifest.category,
        name: pack.manifest.name,
        nameEn: pack.manifest.nameEn,
        version: pack.manifest.version,
        byteSize: out.bytes.length,
        sha256: out.sha256,
        url: `https://cdn.jsdelivr.net/gh/didhogg/tavern-trpg-data@${PLACEHOLDER_TAG}/packs/dnd5e2014/${pack.manifest.id}-${pack.manifest.version}.trpgpack`,
        license: pack.manifest.license,
        description: pack.manifest.description,
        typeCounts,
        contributes,
        relationships: pack.manifest.relationships,
        lineage: pack.manifest.lineage,
        updatedAt: new Date().toISOString(),
        recommended: book.recommended,
        group: book.group,
      }
    }),
  }
  await writeText(join(repo, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`)
  await writeText(join(repo, 'NOTICE.md'), notice())
  await writeText(join(repo, 'README.md'), readme(packs))
  void SRD_PACK_ID
}

function notice(): string {
  return `# 数据仓库声明

本仓库是「TRPG 跑团助手」的 D&D 5e（2014）官方扩展数据仓库，由构建脚本生成。

## 版权与许可

- 非 SRD 的官方内容版权归 Wizards of the Coast；本项目非商用，权利方要求时下架。
- 中文译文来自 5etools 中文共库：标注「不全书」的译文按 GPL-3.0 使用；其余中文译文与机翻按 CC BY-NC-SA 4.0 使用。每个条目在 \`credit\` 中单独标明。
- SRD 5.1 内容 © Wizards of the Coast，按 CC BY 4.0 使用。
- 5etools 的英文原文与数据结构按 MIT 使用。
- 本项目原创的整理、摘要与结构化内容按 CC BY-NC-SA 4.0 使用。
- 同一个包中混有 GPL-3.0 与 CC BY-NC-SA 4.0 的内容，按条目分别适用。数据许可与扩展代码许可（AGPL-3.0）各自独立。

完整许可文本见 \`LICENSES/\`。
`
}

function readme(packs: ConvertedPack[]): string {
  return `# tavern-trpg-data

「TRPG 跑团助手」的 D&D 5e（2014）官方扩展数据仓库。

- \`catalog.json\`：扩展目录（扩展从 \`@main\` 读取）。
- \`packs/dnd5e2014/\`：十个书籍包，按固定标签经 jsDelivr 分发。
- \`NOTICE.md\`、\`LICENSES/\`：版权与许可。

SRD 基础规则包随扩展仓库的 \`packs/\` 分发，不在本仓库重复。

当前构建包含 ${packs.filter((p) => p.manifest.id !== 'dnd5e2014-srd').length} 个书籍包。
`
}
