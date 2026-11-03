import { shallowRef } from 'vue'
import type { RowLabels } from './rows'

/** 职业、种族、条目名称（id → 中文名）：人物页读库后放在这里，从人物页打开的弹窗里的迷你人物卡直接用，不再各读一遍库。 */
export const sharedLabels = shallowRef<RowLabels>({})

export function buildLabels(entries: Array<{ entryId: string; type: string; name: string }>): RowLabels {
  const classes: Record<string, string> = {}
  const races: Record<string, string> = {}
  const sourceNames: Record<string, string> = {}
  for (const entry of entries) {
    if (entry.type === 'class' || entry.type === 'subclass') classes[entry.entryId] = entry.name
    if (entry.type === 'race' || entry.type === 'subrace') races[entry.entryId] = entry.name
    sourceNames[entry.entryId] = entry.name
  }
  return { classes, races, sourceNames }
}
