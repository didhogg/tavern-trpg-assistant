import type { SpellGrant } from '../../../src/rules/dnd5e2014/data/effects'
import type { ConvertContext } from './context'

type Raw = Record<string, unknown>

function isObj(value: unknown): value is Raw {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function grantOf(ctx: ConvertContext, rewardName: string, rawSpell: string, mode: SpellGrant['mode'], ability: string | undefined, uses?: SpellGrant['uses']): SpellGrant {
  const match = /^(.*?)#([0-9]+|c)$/.exec(rawSpell)
  const name = (match?.[1] ?? rawSpell).trim()
  const id = ctx.resolveEntryId('spell', name)
  if (!id) throw new Error(`奖励「${rewardName}」的法术「${name}」解析不到`)
  return {
    spell: id,
    mode,
    ...(ability ? { ability: ability as SpellGrant['ability'] } : {}),
    ...(uses ? { uses } : {}),
    ...(match?.[2] === 'c' ? { asCantrip: true } : match?.[2] ? { castLevel: Number(match[2]) } : {}),
  }
}

function usesFor(key: string, recharge: 'special' | 'shortOrLong' | 'long'): SpellGrant['uses'] {
  const each = key.endsWith('e')
  const max = Number(key.replace(/e$/, ''))
  if (!Number.isFinite(max)) throw new Error(`未登记的法术授予次数：${key}`)
  return { max, recharge, ...(each ? { per: 'each' } : {}) }
}

function spellsOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function innateGrants(ctx: ConvertContext, rewardName: string, innate: unknown, ability: string | undefined): SpellGrant[] {
  if (Array.isArray(innate)) return innate.flatMap((spell) => typeof spell === 'string' ? [grantOf(ctx, rewardName, spell, 'innate', ability)] : [])
  if (!isObj(innate)) return []
  const out: SpellGrant[] = []
  for (const [key, value] of Object.entries(innate)) {
    if (key === '_') {
      if (Array.isArray(value)) out.push(...spellsOf(value).map((spell) => grantOf(ctx, rewardName, spell, 'innate', ability)))
      else if (isObj(value)) {
        for (const [freq, list] of Object.entries(value)) {
          if (!isObj(list)) continue
          if (freq === 'limited') {
            for (const [count, names] of Object.entries(list)) {
              for (const spell of spellsOf(names)) out.push(grantOf(ctx, rewardName, spell, 'innate', ability, usesFor(count, 'special')))
            }
          } else if (freq === 'rest') {
            for (const [count, names] of Object.entries(list)) {
              for (const spell of spellsOf(names)) out.push(grantOf(ctx, rewardName, spell, 'innate', ability, usesFor(count, 'shortOrLong')))
            }
          } else if (freq === 'daily') {
            for (const [count, names] of Object.entries(list)) {
              for (const spell of spellsOf(names)) out.push(grantOf(ctx, rewardName, spell, 'innate', ability, usesFor(count, 'long')))
            }
          } else if (freq === 'ritual') {
            throw new Error(`未登记的法术授予形状：${JSON.stringify({ innate })}`)
          } else if (Array.isArray(list)) {
            throw new Error(`未登记的法术授予形状：${JSON.stringify({ innate })}`)
          }
        }
      }
    } else if (key !== '_' && isObj(value)) {
      throw new Error(`未登记的法术授予形状：${JSON.stringify({ innate })}`)
    }
  }
  return out
}

export function rewardSpellGrants(raw: Raw, ctx: ConvertContext, rewardName: string): SpellGrant[] {
  const list = raw.additionalSpells
  if (!Array.isArray(list)) return []
  const out: SpellGrant[] = []
  for (const block of list) {
    if (!isObj(block)) continue
    const ability = str(block.ability) || undefined
    const known = block.known
    if (isObj(known)) {
      for (const list of Object.values(known)) out.push(...spellsOf(list).map((spell) => grantOf(ctx, rewardName, spell, 'known', ability)))
    }
    out.push(...innateGrants(ctx, rewardName, block.innate, ability))
  }
  return out
}
