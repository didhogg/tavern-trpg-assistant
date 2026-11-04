import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Added, Allow, AllowRequires } from './types'

/**
 * U5R2 数据修复（D3–D5）的放行：条目 id 与路径形状都由"改动前的包 ↔ 重建后的包"逐条对比**生成**（数据文件 u5r-d-allow.json），不手写。
 * 差异清单见 docs/probes/U5R2_D3_差异清单.md、docs/probes/U5R2_D4_时长借用.md。
 */
interface Data { ids: string[]; shapes: string[]; duration: { borrowed: string[]; overlay: string[] }; added: string[] }
const data = JSON.parse(readFileSync(join(process.cwd(), 'tests/data/g2-allow/u5r-d-allow.json'), 'utf8')) as Data

export const ALLOW: Allow[] = [
  {
    name: 'u5r-d3-text-revision',
    station: 5,
    ids: data.ids,
    path: new RegExp(data.shapes.join('|')),
    expect: data.ids.length,
    reason: 'D3 新版 5etools（2.39.0）译文润色（僵尸→丧尸、滑膛枪→火铳、特点→性格特点……）与转换器保留列表自带标题（致谢「5et汉化」、怪物背景描述里的小标题）：只动名称、摘要、正文、目录标题等文字路径，无编号、数值、引用变化',
  },
  {
    name: 'u5r-d4-duration-borrowed',
    station: 5,
    ids: data.duration.borrowed,
    path: /^\/data\/(?:duration|extra(?:\/durationFrom)?)$/,
    expect: data.duration.borrowed.length,
    reason: 'D4 2024 版（XPHB / XDMG）foundry 时长借给同名 2014 条目：只借 duration 并标 extra.durationFrom；2014 正文有不同时长的不借',
  },
  {
    name: 'u5r-d4-duration-overlay',
    station: 5,
    ids: data.duration.overlay,
    path: /^\/data\/duration(?:\/|$)/,
    expect: data.duration.overlay.length,
    reason: 'D4 两版规则不同的条目读 2014 原文核对后写入 overlay（tools/data/overlay/U5R2-时长核对.json，带书页出处）',
  },
  {
    name: 'u5r-d8-condition-notes',
    station: 5,
    ids: ['condition.charmed.phb', 'condition.exhaustion.phb'],
    path: /^\/data\/effects\/\d+\/text$/,
    expect: 2,
    reason: 'D8 状态要点里漏译的英文词（charmed 的 targeting、exhaustion 的 levels）改成中文（tools/data/config/conditionEffects.ts）',
  },
  {
    name: 'u5r-d8-rule-numbers',
    station: 5,
    ids: ['rule.quickref-step-by-step-characters.phb', 'rule.customizing-ability-scores.phb'],
    path: /^\/data\/(?:standardArray|pointBuyBudget)$/,
    expect: 2,
    reason: 'D8/T2 标准数组、购点总点数：读 PHB 原文核对后写入 overlay（tools/data/overlay/U5R2-规则数值.json），界面读它而不是在代码里写数',
  },
]
export const ADDED: Added[] = data.added.map((id) => ({ id, pack: 'dnd5e2014-srd', station: 5, basis: 'D5 名称表：转换器从 parser.js 与已转换的规则条目生成（tools/data/convert/glossary.ts）' }))
export const ALLOW_REQUIRES: AllowRequires[] = []
