// 生成 e2e 用的测试包：带「修改版」的扩展包（改一个 SRD 法术），依赖 SRD。
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildPackFile } from '../../src/core/packs/file'
import type { Entry } from '../../src/schemas/pack'

const out = process.argv[2]
const variant = {
  id: 'acid-house',
  type: 'spell',
  name: '酸液飞溅（本地版）',
  keywords: [],
  unique: false,
  summary: '本世界的酸液飞溅更强',
  data: { level: 1 },
  override: { target: { packId: 'dnd5e2014-srd', entryId: 'spell.acid-splash.phb' }, mode: 'patch', note: '本世界的酸液飞溅是 1 环', baseVersion: '1.0.1' },
} as unknown as Entry
const hidden: Entry = { id: 'lore.spell.acid-splash.phb', type: 'lore', name: '隐藏描述条目', keywords: [], unique: false, summary: '描述文字', data: { target: 'spell.acid-splash.phb', lore: [{ p: '不应出现在库列表或分类里。' }] } }
const other: Entry = { id: 'house-note', type: 'rule', name: '本世界的补充规则', keywords: [], unique: false, summary: '一条补充规则', data: { text: [{ p: '这里是补充规则的正文。' }] } }
const bytes = buildPackFile({
  manifest: { id: 'e2e-variants', ruleId: 'dnd5e2014', category: 'rules', name: '测试修改版包', version: '1.0.0', lineage: 'e2e-lineage-variants', relationships: { requires: [{ id: 'dnd5e2014-srd' }], recommends: [], conflicts: [] } },
  entries: [variant, hidden, other],
  features: [{ id: 'rule-option.e2e', kind: 'ruleOptions', name: '测试规则选项', description: '', defaultEnabled: true, data: { id: 'e2e', name: '测试规则选项', summary: '只用来测试', text: '这是一条用来测试的规则选项。' } }],
})
writeFileSync(join(out, 'variants.trpgpack'), bytes)
