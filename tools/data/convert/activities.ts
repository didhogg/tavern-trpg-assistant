import type { Activity } from '../../../src/rules/dnd5e2014/data/activities'
import { abilityFromText, DAMAGE_FROM_CN, str } from './common'
import type { DamageType } from '../../../src/rules/dnd5e2014/data/enums'

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) strings(item, out)
  else if (value && typeof value === 'object') for (const item of Object.values(value)) strings(item, out)
  return out
}

function damageOf(text: string): Array<{ dice: string; type: DamageType }> {
  const match = /@damage ([0-9]{0,2}d[0-9]{1,3}(?:\s*[+-]\s*\d+)?)/.exec(text)
  if (!match) return []
  const typeMatch = /点([\u4e00-\u9fa5]{1,4})伤害/.exec(text) ?? /([\u4e00-\u9fa5]{1,4})伤害/.exec(text)
  const typeCn = typeMatch?.[1]?.replace(/^[点的]/, '') || ''
  return [{ dice: match[1].replace(/\s+/g, ''), type: (DAMAGE_FROM_CN[typeCn] ?? 'force') as DamageType }]
}

export function damageFromText(value: unknown): Array<{ dice: string; type: DamageType }> {
  return damageOf(strings(value).join(' '))
}

/** 从正文里能可靠识别的攻击/豁免行动；识别不出时返回空数组，由调用方计入报告。 */
export function activitiesFromText(value: unknown, name: string, idPrefix: string): Activity[] {
  const text = strings(value).join(' ')
  const out: Activity[] = []
  const attack = /@atk ([a-z,]+)/.exec(text)
  const hit = /@hit ([+-]?\d+)/.exec(text)
  if (attack) {
    const kind = (attack[1].split(',')[0] || 'mw') as 'mw' | 'rw' | 'ms' | 'rs'
    out.push({
      id: `${idPrefix}.attack`,
      name: `${name}${process.env.TRPG_DATA_LANG === 'en' ? ' (Attack)' : '（攻击）'}`,
      kind: 'attack',
      attackKind: kind,
      ...(hit ? { bonus: Number(hit[1]) } : {}),
      damage: damageOf(text),
      activation: { type: 'action' },
    })
  }
  const dc = /@dc (\d+)/.exec(text)
  const ability = abilityFromText(text)
  if (dc && ability && /豁免/.test(text)) {
    out.push({
      id: `${idPrefix}.save`,
      name: `${name}${process.env.TRPG_DATA_LANG === 'en' ? ' (Save)' : '（豁免）'}`,
      kind: 'save',
      ability,
      dc: Number(dc[1]),
      onSave: /半伤|一半/.test(text) ? 'half' : 'none',
      damage: damageOf(text),
      activation: { type: 'action' },
    })
  }
  return out
}

export function actionName(value: unknown, fallback: string): string {
  return str(value) || fallback
}
