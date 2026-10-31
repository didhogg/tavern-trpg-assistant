import { join } from 'node:path'
import type { ConversionResult } from '../convert'
import type { RawData } from '../extract/load'
import { BOOK_NAMES } from '../config/books'
import { writeText } from '../lib/io'

const TYPE_NAMES: Record<string, string> = {
  spell: '法术', monster: '怪物', item: '物品', class: '职业', subclass: '子职业', feature: '特性', race: '种族', subrace: '亚种族', background: '背景', feat: '专长', condition: '状态', disease: '疾病', status: '状态（持续）', table: '随机表', rule: '规则', language: '语言', deity: '神祇', reward: '奖励', cult: '教团', hazard: '陷阱与危害', object: '物件', vehicle: '载具', monsterPart: '怪物部件', recipe: '配方', charoption: '角色创建选项', lore: '设定补丁',
}

export async function writeReport(root: string, result: ConversionResult, outputs: Map<string, { bytes: Uint8Array; sha256: string }>, _data: RawData): Promise<void> {
  const lines: string[] = ['# D1 构建报告', '', `生成时间：${new Date().toISOString()}`, '', '## 包清单', '', '| 包 | 版本 | 条目 | 随机表 | 规则选项 | 压缩后 | sha256（前 16 位） | 依赖 |', '|---|---:|---:|---:|---:|---:|---|---|']
  let total = 0
  for (const pack of result.packs) {
    const out = outputs.get(pack.manifest.id)
    const size = out?.bytes.length ?? 0
    total += size
    const tables = pack.entries.filter((e) => e.type === 'table').length
    const rules = pack.features.filter((f) => f.kind === 'ruleOptions').length
    lines.push(`| ${pack.manifest.id} | ${pack.manifest.version} | ${pack.entries.length} | ${tables} | ${rules} | ${(size / 1024).toFixed(1)} KB | ${(out?.sha256 ?? '').slice(0, 16)} | ${pack.manifest.relationships.requires.map((r) => r.id).join('、') || '—'} |`)
  }
  lines.push('', `合计：${(total / 1024 / 1024).toFixed(2)} MB（上限 12MB；单包上限 3MB）。`, '', '## 按类型', '', '| 类型 | 数量 |', '|---|---:|')
  const typeCounts: Record<string, number> = {}
  for (const pack of result.packs) for (const entry of pack.entries) typeCounts[entry.type] = (typeCounts[entry.type] ?? 0) + 1
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) lines.push(`| ${TYPE_NAMES[type] ?? type} | ${count} |`)
  lines.push('', '## 来源分布', '', '| 来源 | 数量 | 许可 |', '|---|---:|---|')
  const creditCounts: Record<string, number> = {}
  const licenseByCredit: Record<string, string> = { 不全书: 'GPL-3.0', 共库: 'CC-BY-NC-SA-4.0', 共库机翻: 'CC-BY-NC-SA-4.0', 'dnd-data': 'MIT', 本项目: 'CC-BY-NC-SA-4.0' }
  for (const pack of result.packs) for (const entry of pack.entries) {
    const by = (entry.data.credit as { by?: string } | undefined)?.by ?? '未知'
    creditCounts[by] = (creditCounts[by] ?? 0) + 1
  }
  for (const [by, count] of Object.entries(creditCounts).sort((a, b) => b[1] - a[1])) lines.push(`| ${by} | ${count} | ${licenseByCredit[by] ?? '—'} |`)
  lines.push('', '## R11 引用标签', '', '| 标签 | 已转引用 | 保持文字（目标不在依赖闭包或不存在） |', '|---|---:|---:|')
  for (const tag of ['deity', 'hazard', 'language', 'object', 'reward', 'cult', 'vehicle']) {
    const stat = result.stats.refStats[tag] ?? { ref: 0, text: 0 }
    lines.push(`| ${tag} | ${stat.ref} | ${stat.text} |`)
  }
  lines.push('', '## 校验与统计', '', `- 软引用（写成纯文字）：${result.stats.prunedRefs} 处。`, `- 只保留文本的行动：${result.stats.textOnlyActivities} 个。`, `- 重名加后缀的 id：${result.stats.duplicateIds} 个。`, `- 缺页码：${result.stats.missingPages} 条；缺中文名称：${result.stats.missingNames} 条（用英文名兜底）。`, `- 跳过的无名称抽象亚种族：${result.stats.skippedSubraces} 条（原数据只有模板，没有名称）。`, `- 跳过找不到所属职业/子职业的特性：${result.stats.skippedFeatures} 条。`)
  const v = result.stats.versions
  lines.push(`- 重印标记 supersededBy：${v.superseded} 条；未能解析的范围内重印：${v.unresolvedReprints.length} 条（${v.unresolvedReprints.map((x) => `${x.entry}→${x.target}`).join('、') || '无'}）；指向 D1.2b 书的重印（到 D1.2b 补）：${v.deferredReprints.length} 条；NPC 种族 playable:false：${v.npcRaces.length} 条；同书同名加后缀：${v.nameSuffixed.length} 条（${v.nameSuffixed.map((x) => x.id).join('、') || '无'}）；特性同名组：${v.featureNameGroups} 组（只报数）。`, `- 备选版本 versionGroup：${v.versionGroups.length} 组，共 ${v.versionGroups.reduce((n, g) => n + g.members, 0)} 个备选版本；其中动作所属变体规则 fromVariantRule：${v.fromVariantRules} 条（未解析 ${v.unresolvedVariantRules.length} 条：${v.unresolvedVariantRules.map((x) => `${x.entry}→${x.target}`).join('、') || '无'}）；基础条目不存在（抽象无名称亚种族）的 ${v.versionGroups.filter((g) => !g.hasBase).length} 组：${v.versionGroups.filter((g) => !g.hasBase).map((g) => g.group).join('、') || '无'}。`)
  const textRequires = result.packs.flatMap((p) => p.entries).filter((e) => {
    const req = e.data.requires as { all?: Array<{ text?: string }> } | undefined
    return req?.all?.some((r) => r.text)
  }).length
  lines.push(`- 只保留原文的 requires：${textRequires} 条。`, '', '## 书与包', '', '| 来源 | 书名 |', '|---|---|')
  for (const [source, name] of Object.entries(BOOK_NAMES)) lines.push(`| ${source} | ${name} |`)
  lines.push('', '## 说明', '', '- 2024 版（XPHB、XDMG、XMM）一律未收；未顺着 reprintedAs 跳转。',
  '- 子职业按「名称 + 来源」去重，2024 重印条目与跨书重印特性未重复计入；无名称的 5 个抽象亚种族跳过，见上方统计。',
  '- 只收第一列是骰子范围的表；范围必须恰好覆盖骰子全部结果。', '- 魔法变体已展开为具体物品（如长剑 +1）。', '- 完整报告数据在 `tools/data/out/report.json`（不提交）。', '')
  await writeText(join(root, 'docs', 'probes', 'D1_构建报告.md'), lines.join('\n'))
}
