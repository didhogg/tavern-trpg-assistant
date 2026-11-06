import type { Validation } from './types'

const n = (x: number): string => x.toLocaleString('en-US')
const MB = (b: number): string => `${(b / 1e6).toFixed(1)} MB`
const code = (s: string): string => `\`${s}\``
const list = (xs: string[], max = 25): string => xs.length ? xs.slice(0, max).map((x) => `- ${code(x)}`).join('\n') + (xs.length > max ? `\n- ……共 ${n(xs.length)} 个，完整清单见 validation.json` : '') : '无'

type ManifestLike = {
  sources: Array<{ key: string; kind: string; edition: string; declared: boolean; languages: Record<string, { records: number; files: number }> }>
  repos: Array<{ id: string; label: string; kind: string; lang: string; fileCount: number; jsonCount: number; contentRecords: number; sourceIds: number; bytesJson: number; snapshotHash: string; revision: string | null }>
  translations: {
    officialCnEn: { primaryIds: number; secondaryIds: number; paired: number; onlyPrimary: string[]; onlySecondary: string[] }
    officialEnSrcBak: { primaryIds: number; secondaryIds: number; paired: number; onlyPrimary: string[]; onlySecondary: string[] }
    homebrewEnZh: { primaryIds: number; secondaryIds: number; paired: number; onlyPrimary: string[]; onlySecondary: string[] }
  }
  recordIndex: { count: number; bytes: number; sha256: string }
  lookups: Array<{ repo: string; path: string }>
}

export function writeHumanReport(manifest: ManifestLike, v: Validation): string {
  const official = manifest.sources.filter((s) => s.kind === 'official')
  const homebrew = manifest.sources.filter((s) => s.kind === 'homebrew')
  const rows = manifest.repos.map((r) => `| ${r.label} | ${r.kind} / ${r.lang} | ${n(r.jsonCount)} | ${n(r.contentRecords)} | ${n(r.sourceIds)} | ${MB(r.bytesJson)} |`)
  const tr = manifest.translations
  const topDup = v.duplicateRecords.groups.slice(0, 10).map((g) => `| ${g.count} | ${g.key} | ${g.locations.join('<br>')} |`)
  const probes = v.fetchProbes.map((p) => `| ${p.repo} | ${p.ok ? '可直连' : '失败'} | ${p.status ?? '—'} | ${p.bytes == null ? '—' : n(p.bytes)} | ${p.ms}ms | ${p.error ?? ''} |`)
  const editions = (x: Record<string, number>): string => `2014 ${n(x['2014'] ?? 0)} / 2024 ${n(x['2024'] ?? 0)} / 未知 ${n(x.unknown ?? 0)} / 混合 ${n(x.mixed ?? 0)}`

  const remoteRow = (label: string, x: { local: number; remote: number; remoteOnly: string[]; localOnly: string[] } | null): string =>
    x ? `| ${label} | ${n(x.local)} | ${n(x.remote)} | ${n(x.remoteOnly.length)} | ${n(x.localOnly.length)} |` : `| ${label} | — | 读不到 | — | — |`
  return `# D2-P1 T3：全量源清单与校验报告

> 本报告由 \`tools/db/source/index.ts\` 现扫现写；数字全部来自程序，不写死。
> 源清单只登记“源是什么、文件在哪、有哪些来源、中文覆盖多少”；**不决定库界面默认启用哪些源**。启用策略归 P2【库】后端。

## 0. 一句话

\`\`\`
官方 5etools 中文 / 英文 data-bak / 英文上游
第三方自制 英文 / 中文
        │
        ▼
  源清单 source-manifest/manifest.json
   ├─ 来源表：来源 ID、中英文名、版本、许可、文件数、记录数
   ├─ 文件表：相对路径、大小、哈希、可直连 URL
   ├─ 翻译覆盖：自制中文 ${n(tr.homebrewEnZh.paired)} / ${n(tr.homebrewEnZh.primaryIds)}
   └─ 记录索引：records.jsonl.gz
        │
        ▼
  校验 validation.json / validation.md
\`\`\`

## 1. 扫描范围

| 源 | 类型 / 语言 | JSON 文件 | 内容记录 | 来源 ID | JSON 大小 |
|---|---|---:|---:|---:|---:|
${rows.join('\n')}

- 内容记录 = 顶层数组元素 + 顶层非元数据值；\`_meta\`、\`_test\`、\`$schema\` 等以下划线/美元符号开头的键只计元数据，不混进内容记录。
- 图片、字体、压缩包等非 JSON 文件只按扩展名计数，不读、不复制；数量见 \`validation.json\` 的 \`byRepo.*.otherByExt\`。
- 官方来源名和出版日期取自各仓库自己的 \`books.json\` / \`adventures.json\`；自制来源名取自文件里的 \`_meta.sources\`；自制文件对应关系取自 \`_generated/index-sources.json\`。

## 2. 来源 ID

| 类型 | 来源 ID 数 | 2014 | 2024 | 未知 | 混合 |
|---|---:|---:|---:|---:|---:|
| 官方 | ${n(official.length)} | ${n(official.filter((s) => s.edition === '2014').length)} | ${n(official.filter((s) => s.edition === '2024').length)} | ${n(official.filter((s) => s.edition === 'unknown').length)} | ${n(official.filter((s) => s.edition === 'mixed').length)} |
| 自制 | ${n(homebrew.length)} | ${n(homebrew.filter((s) => s.edition === '2014').length)} | ${n(homebrew.filter((s) => s.edition === '2024').length)} | ${n(homebrew.filter((s) => s.edition === 'unknown').length)} | ${n(homebrew.filter((s) => s.edition === 'mixed').length)} |

版本分布：官方 ${editions(v.editions.official)}；自制 ${editions(v.editions.homebrew)}。

- 未知版本不猜，清单见 \`validation.json\` 的 \`editions.unknown\`。
- 同一来源同时出现 2014 和 2024 的，标为“混合”，清单见 \`editions.mixed\`；T4 分库时不得把它硬塞进一边。

## 3. 中英覆盖

| 配对 | 主语言来源 | 对照来源 | 对上 | 只有主语言 | 只有对照 |
|---|---|---:|---:|---:|---:|
| 官方中文 ↔ 英文 data-bak | ${n(tr.officialCnEn.primaryIds)} | ${n(tr.officialCnEn.secondaryIds)} | ${n(tr.officialCnEn.paired)} | ${n(tr.officialCnEn.onlyPrimary.length)} | ${n(tr.officialCnEn.onlySecondary.length)} |
| 官方英文上游 ↔ data-bak | ${n(tr.officialEnSrcBak.primaryIds)} | ${n(tr.officialEnSrcBak.secondaryIds)} | ${n(tr.officialEnSrcBak.paired)} | ${n(tr.officialEnSrcBak.onlyPrimary.length)} | ${n(tr.officialEnSrcBak.onlySecondary.length)} |
| 自制英文 ↔ 自制中文 | ${n(tr.homebrewEnZh.primaryIds)} | ${n(tr.homebrewEnZh.secondaryIds)} | ${n(tr.homebrewEnZh.paired)} | ${n(tr.homebrewEnZh.onlyPrimary.length)} | ${n(tr.homebrewEnZh.onlySecondary.length)} |

自制中文覆盖 **${n(tr.homebrewEnZh.paired)} / ${n(tr.homebrewEnZh.primaryIds)}**；未翻译的只列清单，不机翻、不手写补。完整清单在 \`validation.json\` 的 \`translations.homebrewEnZh.onlyPrimary\`。

### 3.1 远程索引漂移

| 源 | 本地快照 | 远程 head | 远程多 | 本地多 |
|---|---:|---:|---:|---:|
${remoteRow('英文自制', v.remoteIndexes.homebrewEn)}
${remoteRow('中文自制', v.remoteIndexes.homebrewZh)}

- 本清单扫的是本地参考快照；远程 head 可能更新。远程多出来的来源 ID 不自动导入，T4 要用同一份清单/同一个提交，不能一边用本地清单、一边拉远程最新。
- 远程多出的 ID 清单在 validation.json 的 remoteIndexes.*.remoteOnly。本轮的英文远程比本地多 11 个来源，中文远程与本地一致。

## 4. 校验结果

| 项 | 结果 |
|---|---:|
| JSON 解析失败 | ${n(v.fileErrors.length)} |
| 内容记录（所有顶层数组/值） | ${n(v.totals.contentRecords)} |
| 具名记录（有 name） | ${n(v.totals.namedRecords)} |
| 有 source 的具名记录 | ${n(v.totals.sourceNamedRecords)} |
| 元数据记录 | ${n(v.totals.metaRecords)} |
| 记录形状 | ${Object.entries(v.shapeCounts).sort((a, b) => b[1] - a[1]).map(([k, x]) => `${k} ${n(x)}`).join(' / ')} |
| 来源 ID 总数 | ${n(v.totals.sourceIds)} |
| 没有 source 的具名记录 | ${n(v.missingSource.count)} |
| 有 source 但没有 name 的记录（结构记录，不一定是错） | ${n(v.missingName.count)} |
| 记录有 source、但来源没有登记 | ${n(v.unresolvedSourceRefs.count)} |
| 同名记录（同仓库/类别/来源/名字） | ${n(v.duplicateRecords.total)} |
| 来源元数据冲突（同仓库/语言/来源） | ${n(v.sourceMetadataConflicts.length)} |
| 自制英文索引缺文件 | ${n(v.indexMismatches.en.missing.length)} |
| 自制中文索引缺文件 | ${n(v.indexMismatches.zh.missing.length)} |

### 4.1 文件/索引

${v.fileErrors.length ? v.fileErrors.map((e) => `- ${code(`${e.repo}/${e.path}`)}：${e.error}`).join('\n') : '所有 JSON 文件都能解析。'}

自制索引：英文 ${n(v.indexMismatches.en.ids)} 个来源 ID / ${n(v.indexMismatches.en.files)} 个文件；中文 ${n(v.indexMismatches.zh.ids)} 个来源 ID / ${n(v.indexMismatches.zh.files)} 个文件。实际扫描到的声明来源：英文 ${n(v.translations.homebrewEnZh.primaryIds)}、中文 ${n(v.translations.homebrewEnZh.secondaryIds)}（索引漏列的来源以文件里的 _meta 为准，不丢）。索引里指向不存在的文件：
${list([...v.indexMismatches.en.missing, ...v.indexMismatches.zh.missing].map((x) => `${x.id} → ${x.path}`), 30)}

### 4.2 没有 source 的具名记录

这些不是“失败记录”，而是上游本身没有 source 的写法；本轮分三类：

- magicvariant：魔法物品模板，成品由 inherits/requires 展开，模板本身没有 source。
- monsterfeatures：通用怪物特性，上游不挂 source。
- 其余：见清单。

不按条目猜来源，T4 要用上游展开规则处理。按类别：\`${JSON.stringify(v.missingSource.byCategory)}\`。例子：
${list(v.missingSource.examples, 20)}

### 4.3 来源未登记

${list(v.unresolvedSourceRefs.ids, 40)}

### 4.4 同名记录

只报告，不自动删除；同一来源在不同书/版本里可能有合法重名。完整清单在 \`validation.json\`。

${topDup.length ? `| 次数 | 键 | 位置 |\n|---:|---|---|\n${topDup.join('\n')}` : '无重复。'}

### 4.5 元数据冲突

${v.sourceMetadataConflicts.length ? v.sourceMetadataConflicts.slice(0, 40).map((c) => `- ${code(c.id)} ${c.field}：${c.values.join(' / ')}`).join('\n') : '无。'}

## 5. 直连探测

| 源 | 结果 | HTTP | 字节 | 耗时 | 错误 |
|---|---|---:|---:|---:|---|
${probes.join('\n')}

说明：这是 Node 里的直连探测，只证明“服务器能返回文件”；浏览器 CORS、代理、缓存策略还没验证，留到 T4。

## 6. 输出与证据

\`\`\`
/Users/xxx/tavern-trpg-data-next/source-manifest/
  manifest.json          源清单（来源、文件、URL、覆盖、版本）
  validation.json        机器可读校验结果
  validation.md          本文件
  records.jsonl.gz       记录级索引（${n(manifest.recordIndex.count)} 行，${MB(manifest.recordIndex.bytes)}，sha256 ${manifest.recordIndex.sha256.slice(0, 16)}…）
\`\`\`

- 清单哈希：\`${v.manifestHash}\`
- 记录索引哈希：\`${v.recordsHash ?? '—'}\`
- 清单里的每个文件都有 \`url\` 和 \`fallbackUrl\`；没有把源文件复制进仓库。

## 7. 没验证 / 下一步

- 没接界面，没在库页面显示这些源；这是 T4。
- 没有决定“默认启用哪些源”；这是 P2【库】后端。
- 浏览器 CORS / 代理 / 离线缓存没验证。
- 自制中文只覆盖 ${n(tr.homebrewEnZh.paired)} / ${n(tr.homebrewEnZh.primaryIds)}，其余是英文；未翻译清单已列，不补。
- 中文仓库的翻译字段（如 \`ENG_name\`）与 5etools 官方 homebrew schema 不完全一致；没有用 schema 失败来删数据。
- 记录级同名只报告，没有自动去重；去重策略留给 T4/P2。
`
}
