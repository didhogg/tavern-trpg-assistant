export const TYPE_LABEL: Record<string, string> = {
  spell: '法术', monster: '怪物', item: '物品', class: '职业', subclass: '子职业', race: '种族', subrace: '亚种族',
  background: '背景', feat: '专长', feature: '特性', rule: '规则', table: '随机表', disease: '疾病', condition: '状态',
  status: '状态', skill: '技能', language: '语言', deity: '神祇', vehicle: '载具', trap: '陷阱', hazard: '危险', reward: '奖励', cult: '邪教', object: '物件',
}

export const typeLabel = (type: string): string => TYPE_LABEL[type] ?? type

/** 来源说明：出自《书》第 N 页 · 中文：译者（许可）。 */
export function sourceLine(data: Record<string, unknown>): string {
  const src = data.src as { book?: string; page?: number } | undefined
  const credit = data.credit as { by?: string; license?: string } | undefined
  const parts = [src?.book ? `出自 ${src.book}${src.page ? ` 第 ${src.page} 页` : ''}` : '', credit?.by ? `中文：${credit.by}${credit.license ? `（${credit.license}）` : ''}` : '']
  return parts.filter(Boolean).join(' · ')
}
