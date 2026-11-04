/**
 * 感官定义（黑暗视觉、盲视、震颤感知、真实视觉）：名称与说明一律来自库里的「感官」规则条目（`rule`，category = sense），不手写。
 * 键 = 条目英文名小写（darkvision……），与怪物数据里的感官编号一致。人物卡载入数据时设置（见 cardData.loadCardData）；
 * 没有安装对应的包就是空的——界面读不到就不显示，不回退到手写。
 */
export interface SenseDef { key: string; label: string; entryId: string; /** 库里的一句话说明（条目摘要去掉「名称｜」前缀）。 */ note: string }
interface RuleLike { id: string; name: string; nameEn?: string; summary?: string; data: Record<string, unknown> }

let defs: SenseDef[] = []
export function setSenseDefs(next: SenseDef[]): void { defs = next }
export const senseDefs = (): SenseDef[] => defs

export function senseDefsFrom(rules: RuleLike[]): SenseDef[] {
  const byKey = new Map<string, SenseDef>()
  for (const rule of rules) {
    if (rule.data.category !== 'sense' || !rule.nameEn) continue
    const key = rule.nameEn.toLowerCase()
    if (!byKey.has(key)) byKey.set(key, { key, label: rule.name, entryId: rule.id, note: (rule.summary ?? '').split('｜').slice(1).join('｜') })
  }
  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key))
}
