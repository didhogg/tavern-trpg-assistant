import { join } from 'node:path'
import { writeText } from '../lib/io'
import type { AlignResult } from './align'

const BEFORE_KB: Record<string, number> = { 'dnd5e2014-srd': 607.7, 'dnd5e2014-phb': 503.6, 'dnd5e2014-scag': 386.1, 'dnd5e2014-dmg': 567.6, 'dnd5e2014-mm': 751.6, 'dnd5e2014-xge': 343.2, 'dnd5e2014-tce': 322.7, 'dnd5e2014-vgm': 520.3, 'dnd5e2014-mtf': 534.6, 'dnd5e2014-mpmm': 486.4, 'dnd5e2014-bmt': 367.7 }

const pct = (a: number, b: number): string => (b ? `${((a / b) * 100).toFixed(2)}%` : '—')

/** 写 R13 对照报告：只写现状，数字全部来自这一次构建。 */
export async function writeI18nReport(root: string, aligned: AlignResult, englishCount: number, outputs: Map<string, { bytes: Uint8Array; sha256: string }>): Promise<void> {
  const types = Object.entries(aligned.stats).sort((a, b) => b[1].entries - a[1].entries)
  const sum = (key: 'entries' | 'withEnglish' | 'noEnglishEntry' | 'fields' | 'aligned' | 'derived' | 'blockCountDiffers' | 'summaries'): number => types.reduce((n, [, s]) => n + s[key], 0)
  const reasons: Record<string, number> = {}
  for (const miss of aligned.misses) reasons[miss.reason] = (reasons[miss.reason] ?? 0) + 1
  const sizes = [...outputs].map(([id, out]) => ({ id, kb: out.bytes.length / 1024, sha: out.sha256 }))
  const total = sizes.reduce((n, s) => n + s.kb, 0)
  const lines: string[] = [
    '# D1.2a R13 中英对照报告',
    '',
    '由 `npm run build:data` 生成，只写现状。',
    '',
    '## 结论',
    '',
    `- 条目 ${sum('entries')} 个，其中 ${sum('withEnglish')} 个带 \`i18n.en\`（英文那一遍产出 ${englishCount} 个条目）。`,
    `- 应对齐的文字字段 ${sum('fields')} 个，已对齐 ${sum('aligned')} 个，对齐率 ${pct(sum('aligned'), sum('fields'))}；未对齐 ${aligned.misses.length} 个。`,
    `- 由中文推导或配置里手写的结构字段（\`activities\`、\`effects\`、\`advancement\`、\`keyValue\`）${sum('derived')} 个，英文原版没有对应数据，不对齐、不计入上面的分母。`,
    `- 英文摘要写入 ${sum('summaries')} 个（摘要含汉字则不写）；英文正文块数与中文不同但整段存入的字段 ${sum('blockCountDiffers')} 个。`,
    `- 没有英文版的条目 ${sum('noEnglishEntry')} 个：都是只存在于中文侧的基线别名（旧编号的兼容条目）。`,
    '',
    '## 各类型',
    '',
    '| 类型 | 条目 | 有英文 | 无英文 | 应对齐字段 | 已对齐 | 对齐率 | 推导字段 | 块数不同 |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...types.map(([type, s]) => `| ${type} | ${s.entries} | ${s.withEnglish} | ${s.noEnglishEntry} | ${s.fields} | ${s.aligned} | ${pct(s.aligned, s.fields)} | ${s.derived} | ${s.blockCountDiffers} |`),
    '',
    '## 未对齐',
    '',
    aligned.misses.length ? `原因分布：${Object.entries(reasons).map(([k, v]) => `${k} ${v}`).join('、')}` : '没有未对齐的字段。',
    '',
    ...aligned.misses.slice(0, 200).map((m) => `- ${m.id}　${m.path}　${m.reason}`),
    '',
    `英文那一遍里没有对上中文条目的：${aligned.unmatchedEnglish.length} 个${aligned.unmatchedEnglish.length ? `（${aligned.unmatchedEnglish.slice(0, 30).join('、')}）` : ''}。`,
    '',
    '## 随机表配对',
    '',
    `随机表的 id 来自名字，英文与中文不同：先按「id 相同且结构签名相同」配对，剩下的按规划顺序做签名匹配。配对成功 ${aligned.tableMap.size} 张。英文里的 \`tableRef\` 换成对应的中文表 id 后与中文逐个比较，不一致的字段记「tableRefDiffers」。`,
    '',
    '## 英文那一遍里补了英文版的中文字样',
    '',
    '`命中：`、`未命中：`、`（充能N–6）`、近战/远程武器/法术攻击、活动名「（攻击）」「（豁免）」「消耗：」、法术列表的「戏法」「N 环」「每日 N 次」「随意施放」、伤害类型词、武器类别、特性类型（战斗风格等）、`+N尺`、随机表的列名与表名（名字、遭遇、成为…的原因、宝藏表、牌组内容、第N列）、物品「（系列）」、神系与种族名、Foundry 效果未映射提示等；这些只在英文那一遍生效，中文输出不变。',
    '',
    '仍是中文、不对齐的手写内容：配置里手写的状态与规则效果说明（`effects`、`activities`），计入「推导字段」。',
    '',
    '## 体积（压缩后）',
    '',
    '| 包 | R12 后 KB | 现在 KB | sha256 |',
    '|---|---:|---:|---|',
    ...sizes.map((s) => `| ${s.id} | ${BEFORE_KB[s.id]?.toFixed(1) ?? '—'} | ${s.kb.toFixed(1)} | ${s.sha} |`),
    `| 合计 | ${Object.values(BEFORE_KB).reduce((a, b) => a + b, 0).toFixed(1)} | ${total.toFixed(1)} | |`,
    '',
    `上限：单包 3 MB，合计 10.5 MB（驾驶员批准的线）；现在合计 ${(total / 1024).toFixed(2)} MB。`,
    '',
    '## 未验证',
    '',
    '- 真机（TauriTavern）未验收；界面还没有显示英文；入库（`StoredEntry`）尚未保留 `i18n`，留给 R15。',
    '',
  ]
  await writeText(join(root, 'docs', 'probes', 'D1.2a_R13_对照报告.md'), `${lines.join('\n')}\n`)
}
