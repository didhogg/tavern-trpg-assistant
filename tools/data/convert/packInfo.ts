import type { Entry, PackFeature } from '../../../src/schemas/pack'
import type { PlannedEntry } from './plan'
import { RULE_OPTIONS } from '../config/ruleOptions'
import { SRD_PACK_ID } from '../config/books'

export function licenseOf(entries: Entry[]): string {
  const licenses = new Set<string>()
  for (const entry of entries) {
    const credit = entry.data.credit as { license?: string; srd?: boolean } | undefined
    if (credit?.license) licenses.add(credit.license)
    if (credit?.srd) licenses.add('CC-BY-4.0')
  }
  return [...licenses].sort().join(' OR ')
}

export function attributionOf(entries: Entry[]): string {
  const sources = new Set<string>()
  for (const entry of entries) {
    const credit = entry.data.credit as { by?: string } | undefined
    if (credit?.by) sources.add(credit.by)
  }
  return [
    '中文数据来自 5etools 中文共库（DND 中文共库）：译者与来源见各条目 credit。',
    '英文原文与数据结构来自 5etools（MIT）。',
    sources.has('不全书') ? '标注「不全书」的译文按 GPL-3.0 使用。' : '',
    'SRD 5.1 内容 © Wizards of the Coast，按 CC BY 4.0 使用。',
    '非 SRD 的官方内容版权归 Wizards of the Coast；本项目非商用，权利方要求时下架。',
  ]
    .filter(Boolean)
    .join('\n')
}

export function makeClassIds(planned: PlannedEntry[]): Map<string, string> {
  const out = new Map<string, string>()
  for (const entry of planned) {
    if (entry.type !== 'class') continue
    out.set(`${entry.name}|${entry.source}`, entry.id)
  }
  return out
}

export function makeSubclassIds(planned: PlannedEntry[]): Map<string, string> {
  const out = new Map<string, string>()
  for (const entry of planned) {
    if (entry.type !== 'subclass') continue
    const short = typeof entry.raw.shortName === 'string' ? entry.raw.shortName : entry.name
    out.set(`${entry.raw.className}|${entry.raw.classSource}|${short}|${entry.source}`, entry.id)
    out.set(`${entry.raw.className}|${entry.raw.classSource}|${short}`, entry.id)
  }
  return out
}

export function ruleOptionsFor(packId: string, entries: Entry[], planned: PlannedEntry[]): PackFeature[] {
  const out: PackFeature[] = []
  for (const option of RULE_OPTIONS) {
    const source = planned.find((p) => p.type === 'rule' && option.rawNames.some((name) => p.name.includes(name)) && p.source === option.source)
    const targetPack = option.source === 'PHB' ? SRD_PACK_ID : source?.packId
    if (!source || targetPack !== packId) continue
    const entry = entries.find((e) => e.id === source.id)
    const text = entry ? JSON.stringify(entry.data.text) : '[]'
    out.push({
      id: `rule-option.${option.id}`,
      kind: 'ruleOptions',
      name: option.name,
      description: text.slice(0, 500),
      defaultEnabled: false,
      data: { id: option.id, name: option.name, summary: option.name, text, ...(option.engine ? { engine: option.engine } : {}), ...(option.group ? { group: option.group } : {}), source: option.source },
    })
  }
  return out
}
