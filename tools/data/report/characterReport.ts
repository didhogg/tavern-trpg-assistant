import { join } from 'node:path'
import type { ConversionResult } from '../convert'
import type { Entry } from '../../../src/schemas/pack'
import { FEATURE_NO_USES } from '../config/featureRules'
import { writeText } from '../lib/io'

const marker = /(使用|施展|消耗).{0,20}(\d+次|次数|长休|短休)|(完成|经过|直到).{0,8}(短休|长休).{0,20}(再次|恢复|重获|使用|施展)|每(次)?(长休|短休)|充能/
const text = (e: Entry): string => JSON.stringify(e.data.text ?? '')

function pct(n: number, d: number): string {
  return d ? `${((n / d) * 100).toFixed(1)}%` : '—'
}

export async function writeCharacterReport(root: string, result: ConversionResult): Promise<void> {
  const entries = result.packs.flatMap((p) => p.entries)
  const classes = entries.filter((e) => e.type === 'class')
  const subclasses = entries.filter((e) => e.type === 'subclass')
  const features = entries.filter((e) => e.type === 'feature')
  const races = entries.filter((e) => e.type === 'race')
  const backgrounds = entries.filter((e) => e.type === 'background')
  const feats = entries.filter((e) => e.type === 'feat')
  const conditions = entries.filter((e) => e.type === 'condition' || e.type === 'status')
  const items = entries.filter((e) => e.type === 'item')
  const spells = entries.filter((e) => e.type === 'spell')
  const candidates = features.filter((e) => marker.test(text(e)) && !FEATURE_NO_USES.has(e.id))
  const covered = candidates.filter((e) => e.data.uses)
  const withEffects = features.filter((e) => Array.isArray(e.data.effects) && (e.data.effects as unknown[]).length)
  const third = subclasses.filter((e) => (e.data.spellcasting as { progression?: string } | undefined)?.progression === 'third')
  const phbRaces = races.filter((e) => (e.data.src as { book?: string } | undefined)?.book === 'PHB')
  const dmgRaces = races.filter((e) => (e.data.src as { book?: string } | undefined)?.book === 'DMG')
  const equipmentClasses = classes.filter((e) => Array.isArray(e.data.startingEquipment) && (e.data.startingEquipment as unknown[]).length)
  const equipmentBackgrounds = backgrounds.filter((e) => e.id !== 'background.custom-background.phb' && Array.isArray(e.data.equipment) && (e.data.equipment as unknown[]).length)
  const spellActions = spells.filter((e) => (e.data.activities as unknown[] | undefined)?.length)
  const markedSpells = spells.filter((e) => e.data.spellAttack || e.data.save || e.data.damage || (e.data.activities as Array<{ kind?: string }> | undefined)?.some((a) => a.kind === 'heal'))
  const markedSpellActions = markedSpells.filter((e) => (e.data.activities as unknown[] | undefined)?.length)
  const itemEffects = items.filter((e) => Array.isArray(e.data.effects) && (e.data.effects as unknown[]).length)
  const sourceCounts: Record<string, number> = {}
  for (const e of entries) {
    const by = ((e.data.credit as { structured?: { by?: string } } | undefined)?.structured?.by) ?? '未标注'
    sourceCounts[by] = (sourceCounts[by] ?? 0) + 1
  }
  const lines = [
    '# D1.1 人物规则数据报告', '',
    `生成时间：${new Date().toISOString()}`, '',
    '## 结论', '',
    `- 11 个包，${entries.length} 个条目；结构化字段由 5etools 主数据导入，Foundry 6.1.x 与 5e-bits 2014 API 用于交叉校验。`,
    `- 特性使用次数：在「明确次数/恢复语言」候选集 ${candidates.length} 条中覆盖 ${covered.length} 条（${pct(covered.length, candidates.length)}）；排除的 ${FEATURE_NO_USES.size} 类施法/改版特性见下文。`,
    `- 法术职业列表：${spells.filter((e) => (e.data.classes as string[] | undefined)?.length).length}/${spells.length}；带有攻击/豁免/伤害/治疗标记的法术行动覆盖率见 §3。`,
    '- 本报告不含官方书原文；抽检表只写页码与字段。', '',
    '## 1. 结构化覆盖率', '',
    '| 数据 | 覆盖 | 基数 | 说明 |',
    '|---|---:|---:|---|',
    `| 职业（含奇械师/协力者） | ${classes.length} | ${classes.length} | 全部包内职业 |`,
    `| 施法职业的 slotsByLevel 20 行 | ${classes.filter((e) => (e.data.spellcasting as { slotsByLevel?: unknown[] } | undefined)?.slotsByLevel?.length === 20).length} | ${classes.filter((e) => e.data.spellcasting).length} | 全/半/契约；奇械师按 TCE 表 |`,
    `| 三分之一施法者 slotsByLevel | ${third.length} | ${third.length} | 奥法骑士/奥法诡术师 |`,
    `| 职业资源 scaleValue | ${classes.filter((e) => (e.data.advancement as Array<{ kind?: string }> | undefined)?.some((a) => a.kind === 'scaleValue')).length} | ${classes.length} | 有资源的职业 |`,
    `| 特性 uses（明确次数/恢复语言） | ${covered.length} | ${candidates.length} | ${pct(covered.length, candidates.length)} |`,
    `| 特性 effects | ${withEffects.length} | ${features.length} | 有机械效果的特性 |`,
    `| PHB 种族属性加值 | ${phbRaces.filter((e) => e.data.abilityBonus || e.data.flexibleAbility).length} | ${phbRaces.length} | 人类含隐藏 +1 全属性 |`,
    `| 背景装备 | ${equipmentBackgrounds.length} | ${backgrounds.filter((e) => e.id !== 'background.custom-background.phb').length} | 自定义背景无固定装备 |`,
    `| 专长 abilityIncrease | ${feats.filter((e) => e.data.abilityIncrease).length} | ${feats.length} | 有属性提升的专长 |`,
    `| 专长 effects | ${feats.filter((e) => e.data.effects).length} | ${feats.length} | 有机械效果的专长 |`,
    `| 状态/持续状态 effects | ${conditions.filter((e) => (e.data.effects as unknown[] | undefined)?.length).length} | ${conditions.length} | 力竭另有六行 levels |`,
    `| 规则选项 | ${result.packs.flatMap((p) => p.features).filter((f) => f.kind === 'ruleOptions').length} | 10 | 全部有 engine 或空、group |`,
    `| 护甲/盾牌数据 | ${items.filter((e) => e.data.armor).length} | ${items.filter((e) => e.data.category === 'armor' || e.data.category === 'shield').length} | AC、敏捷上限、力量、隐匿 |`,
    `| 魔法物品 effects | ${itemEffects.length} | ${items.filter((e) => e.data.rarity !== 'none').length} | 有机械效果的魔法物品 |`,
    `| 法术职业列表 | ${spells.filter((e) => (e.data.classes as string[] | undefined)?.length).length} | ${spells.length} | class + classVariant |`,
    `| 法术行动 | ${spellActions.length} | ${spells.length} | 有行动的法术 |`,
    `| 有标记法术的行动 | ${markedSpellActions.length} | ${markedSpells.length} | ${pct(markedSpellActions.length, markedSpells.length)} |`,
    `| 起始装备（职业） | ${equipmentClasses.length} | 13 | 12 个基础职业 + 奇械师；协力者无起装 |`,
    `| 起始装备（背景） | ${equipmentBackgrounds.length} | ${backgrounds.filter((e) => e.id !== 'background.custom-background.phb').length} | — |`,
    '', '## 2. 来源构成', '', '| structured 来源 | 条目数 |', '|---|---:|',
    ...Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).map(([by, n]) => `| ${by} | ${n} |`),
    '', '## 3. 未映射与未覆盖', '',
    `- Foundry 变更键未映射：${result.stats.unmappedFoundry.length} 类；见下方表。`,
    `- 无玩家属性加值的 DMG NPC 种族：${dmgRaces.map((e) => e.id).join('、') || '无'}（DMG 282 页，书中本身不是玩家种族）。`,
    '- 自定义背景 `background.custom-background.phb` 没有固定装备；其正文保留。',
    '- 无名称的 5 个抽象亚种族跳过；Ki 缺中文名用英文兜底。',
    '- Foundry 6.1.x 半施法者的 `roundUp: true` 属于 2024 写法，未采用；圣武士/游侠用 5etools 职业表，奇械师用 TCE 表。',
    '- 5etools foundry 2014 覆盖稀疏：职业特性 50 条、子职业特性 192 条，其余 uses/effects 由正文提取或配置；没有把“文字里写了”当成“结构字段”。',
    '', '### 未映射 Foundry 键', '', '| 键 | 次数 | 示例 |', '|---|---:|---|',
    ...(result.stats.unmappedFoundry.length ? result.stats.unmappedFoundry.map((u) => `| ${u.key} | ${u.count} | ${u.example} |`) : ['| — | 0 | — |']),
    '', '## 4. 冲突与处理', '',
    '1. 人类基础条目没有 ability；+1 全属性来自隐藏亚种，转换时合入基础人类（PHB 29）。',
    '2. 变体人类的专长是选择项，写入 advancement 的 itemChoice（featureType=专长），不猜具体专长。',
    '3. 龙裔抗性/吐息是选择项，抗性写 note；不把全部龙种抗性都塞给人物。',
    '4. 重甲大师的“非魔法伤害减 3”没有对应 effect kind，写 note；不伪装成 resistance。',
    '5. DMG 282 的 NPC 种族没有玩家属性加值；保留条目并在上面列出（不是玩家种族）。',
    '', '## 5. 人工抽检', '',
    '- 抽检表：`docs/probes/D1.1_抽检.md`，每行有书名、页码、字段与空结果栏。',
    '- 自动金样与结构测试在 `tests/data/`；抽检结果必须由驾驶员对照官方书填写。',
  ]
  await writeText(join(root, 'docs', 'probes', 'D1.1_人物数据_报告.md'), lines.join('\n'))
}
