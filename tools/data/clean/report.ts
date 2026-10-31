import { join } from 'node:path'
import { writeText } from '../lib/io'
import type { HealthMetric } from '../validate/health'
import { latinLog } from './rules/latin'
import { loadTerms } from './terms'
import type { CleanReport } from './types'

/** 抽样复核的结论只对应「这一次」的 D1 改动总数；规则或词典一改，总数变化，报告会标出复核已过期，必须重新复核并更新这里。 */
const REVIEWED = { latinTotal: 2167, samples: 203, wrong: 0, by: '规划 agent 逐条目视核对（前后文、括号范围、替换是否重复翻译）' }

const BEFORE: Record<string, string> = { D1: '2,151', D2: '130', A5: '4（旧口径 5，含合法的 class.druid.level）', D4: '151', D5: '8（旧口径 10，旧正则把「环」也算进去）', D6: '1', D7: '4', B2b: '2' }
const BEFORE_KB: Record<string, number> = { 'dnd5e2014-srd': 1023.1, 'dnd5e2014-phb': 928.2, 'dnd5e2014-scag': 726.1, 'dnd5e2014-dmg': 920.7, 'dnd5e2014-mm': 1482.7, 'dnd5e2014-xge': 554.2, 'dnd5e2014-tce': 575.3, 'dnd5e2014-vgm': 973.8, 'dnd5e2014-mtf': 994.3, 'dnd5e2014-mpmm': 892.0, 'dnd5e2014-bmt': 652.3 }

export async function writeCleanReport(root: string, report: CleanReport, health: HealthMetric[], outputs: Map<string, { bytes: Uint8Array; sha256: string }>): Promise<void> {
  const h = new Map(health.map((m) => [m.id, m.count]))
  const terms = loadTerms()
  const kinds = { replace: 0, annotate: 0, paren: 0 }
  for (const c of latinLog) kinds[c.kind]++
  const stale = latinLog.length !== REVIEWED.latinTotal
  const sample = [...latinLog.filter((_, i) => i % 21 === 5).slice(0, 103), ...latinLog.filter((_, i) => i % 21 === 13).slice(0, 100)]
  const cell = (text: string): string => text.replace(/\n/g, ' ').replace(/\|/g, '\\|')
  const sizes = [...outputs].map(([id, out]) => ({ id, kb: out.bytes.length / 1024, sha: out.sha256 }))
  const total = sizes.reduce((n, s) => n + s.kb, 0)
  const lines = [
    '# D1.2a R14 文字清洁报告',
    '',
    '由 `npm run build:data` 生成，只写现状。',
    '',
    '## 体检前后',
    '',
    '| 项 | R13 之后 | 现在 |',
    '|---|---|---:|',
    ...['D1', 'D2', 'A5', 'D4', 'D5', 'D6', 'D7', 'B2b'].map((id) => `| ${id} | ${BEFORE[id]} | ${h.get(id) ?? '—'} |`),
    '',
    '## 每条规则改了多少',
    '',
    '| 规则 | 说明 | 条目 | 处 |',
    '|---|---|---:|---:|',
    ...Object.entries(report.rules).map(([id, r]) => `| ${id} | ${r.title} | ${r.entriesChanged} | ${r.changes} |`),
    '',
    '另有两项不是规则、而是转换器修正：`abilityDc` / `abilityAttackMod` 块展开成完整句子（中文 27 句、英文 27 句）；伤害类型推导补全别名后，99 个条目（怪物 82、法术 17，共 150 处）的 `damage[].type` 由 `force` 改成正确的 `necrotic`（旧写法「暗蚀伤害」没有进「标签→代码」表）。',
    '',
    '## D1：汉字后紧跟的英文',
    '',
    `- 共 ${latinLog.length} 处：机制类词汇直接换成中文 ${kinds.replace}、前文已是同义中文时加括号 ${kinds.annotate}、词典里没有的加括号 ${kinds.paren}。`,
    `- 词典：parser.js 对照表 ${terms.stats.parser} 对、数据里 ENG_name↔name 配对 ${terms.stats.data} 个英文词、手写补充 ${terms.stats.extra} 条；合计可用 ${terms.map.size} 个；歧义词 ${terms.ambiguous.size} 个（一个英文对应多个中文，不进词典）。`,
    `- 允许直接替换的只有四张表里的机制类词汇（伤害类型、属性、技能、状态）与手写补充；数据里的译名只用来判断「前文是否已是同义中文」，不用来替换，避免「弑龙者屠龙者」这类重复翻译。`,
    `- 例外表 \`config/latinExceptions.ts\`：空；白名单新增 DND（D&D 的无符号写法）。`,
    '',
    `### 抽样复核（${REVIEWED.samples} 处，${REVIEWED.by}）`,
    '',
    stale ? `> ⚠ 复核已过期：复核时 D1 改动共 ${REVIEWED.latinTotal} 处，现在是 ${latinLog.length} 处。规则或词典改过，必须重新复核并更新 \`clean/report.ts\` 里的 REVIEWED。` : `结论：${REVIEWED.samples} 处错误 ${REVIEWED.wrong} 处（复核时 D1 改动共 ${REVIEWED.latinTotal} 处，与现在相同）。`,
    '',
    '| 处理 | 前文 | 之后 |',
    '|---|---|---|',
    ...sample.map((c) => `| ${c.kind} | ${cell(c.before)} | ${cell(c.after)} |`),
    '',
    '## 体积（压缩后）',
    '',
    '| 包 | R13 后 KB | 现在 KB | sha256 |',
    '|---|---:|---:|---|',
    ...sizes.map((s) => `| ${s.id} | ${BEFORE_KB[s.id]?.toFixed(1) ?? '—'} | ${s.kb.toFixed(1)} | ${s.sha} |`),
    `| 合计 | ${Object.values(BEFORE_KB).reduce((a, b) => a + b, 0).toFixed(1)} | ${total.toFixed(1)} | |`,
    '',
    '## 未验证',
    '',
    '- 真机（TauriTavern）未验收；界面显示（`summary`、`restated`、伤害类型标签「暗蚀」）只经过 e2e 的模拟宿主。',
    '',
  ]
  await writeText(join(root, 'docs', 'probes', 'D1.2a_R14_清洁报告.md'), `${lines.join('\n')}\n`)
}
