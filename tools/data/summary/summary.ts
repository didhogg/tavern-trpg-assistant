import type { TextBlock } from '../../../src/schemas/text'
import type { Dnd5e2014EntryType } from '../../../src/rules/dnd5e2014/data/entries'
import { DAMAGE_LABELS } from '../../../src/rules/dnd5e2014/data/enums'

const SCHOOL: Record<string, string> = {
  abjuration: '防护',
  conjuration: '咒法',
  divination: '预言',
  enchantment: '附魔',
  evocation: '塑能',
  illusion: '幻术',
  necromancy: '死灵',
  transmutation: '变化',
}

const DAMAGE_CN = (code: string): string => DAMAGE_LABELS[code] ?? code
const SIZE: Record<string, string> = { T: '微型', S: '小型', M: '中型', L: '大型', H: '巨型', G: '超巨型' }
const ITEM_CATEGORY: Record<string, string> = { weapon: '武器', armor: '护甲', shield: '盾牌', gear: '装备', tool: '工具', consumable: '消耗品', wondrous: '奇物', ammunition: '弹药', mount: '坐骑', vehicle: '载具', treasure: '宝藏' }
const RARITY: Record<string, string> = { none: '普通', common: '常见', uncommon: '罕见', rare: '稀有', 'very rare': '极稀有', legendary: '传奇', artifact: '神器', varies: '多变' }
const CREATURE_TYPE: Record<string, string> = { dragon: '龙类', humanoid: '类人', beast: '野兽', monstrosity: '怪物', undead: '亡灵', fiend: '邪魔', celestial: '天界生物', fey: '妖精', construct: '构装', elemental: '元素', giant: '巨人', ooze: '泥怪', plant: '植物', aberration: '异怪' }
const ABILITY: Record<string, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }

export function plainText(blocks: TextBlock[]): string {
  const walk = (list: TextBlock[]): string[] =>
    list.flatMap((block) => {
      if ('p' in block) return [block.p]
      if ('h' in block) return [block.h, ...walk(block.body)]
      if ('list' in block) return block.list
      if ('quote' in block) return [block.quote]
      if ('table' in block) return block.table.rows.map((row) => row.join(' '))
      return walk(block.read)
    })
  return walk(blocks)
    .join(' ')
    .replace(/\{\{([a-z]+):([^|}]*)\|([^}]*)\}\}/g, '$3')
    .replace(/\{\{([a-z]+):([^}]*)\}\}/g, '$2')
    .replace(/\s+/g, ' ')
    .trim()
}

export function clip(text: string, max = 80): string {
  const chars = Array.from(text)
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join('')}…`
}

function firstSentence(text: string): string {
  const match = /^[^。！？.!?]*[。！？.!?]?/.exec(text)
  return (match?.[0] ?? text).trim()
}

function damageText(parts: Array<{ dice: string; type: string }> | undefined): string {
  return (parts ?? []).map((p) => `${p.dice}${p.type ? ` ${DAMAGE_CN(p.type)}` : ''}`).join('+')
}

export function summaryOf(type: Dnd5e2014EntryType | string, name: string, data: Record<string, unknown>, text: string): string {
  const first = firstSentence(text)
  switch (type) {
    case 'spell': {
      const level = Number(data.level ?? 0)
      const school = SCHOOL[String(data.school ?? '')] ?? ''
      const cast = Array.isArray(data.castTime) && data.castTime[0] ? `${(data.castTime[0] as { n: number }).n}动作` : ''
      const range = (data.range as { amount?: number; unit?: string; type?: string } | undefined) ?? {}
      const rangeText = range.amount ? `${range.amount}${range.unit === 'feet' ? '尺' : range.unit ?? ''}` : range.type ?? ''
      const save = Array.isArray(data.save) && data.save.length ? `${(data.save as string[]).map((s) => ABILITY[s] ?? s).join('/')}豁免` : ''
      const damage = damageText(data.damage as never)
      return clip([name, `${level === 0 ? '戏法' : `${level}环`} ${school}`, cast, rangeText, [save, damage].filter(Boolean).join(' ')].filter(Boolean).join('｜'))
    }
    case 'monster': {
      const ct = data.creatureType as { type?: string; swarm?: boolean } | undefined
      const sizes = Array.isArray(data.size) ? data.size.map((s) => SIZE[String(s)] ?? s).join('') : ''
      const cr = typeof data.cr === 'object' && data.cr ? (data.cr as { value: number }).value : data.cr
      const ac = Array.isArray(data.ac) && data.ac[0] ? (data.ac[0] as { value: number }).value : ''
      const hp = (data.hp as { average?: number } | undefined)?.average ?? ''
      const actions = (Array.isArray(data.actions) ? data.actions : []) as Array<{ name: string; activities?: Array<{ kind: string; bonus?: number; damage?: Array<{ dice: string }> }> }>
      const attack = actions.find((a) => a.activities?.some((x) => x.kind === 'attack'))
      const attackAct = attack?.activities?.find((a) => a.kind === 'attack')
      const action = attack && attackAct ? `${attack.name}${attackAct.bonus !== undefined ? `+${attackAct.bonus}` : ''}${attackAct.damage?.length ? ` ${attackAct.damage.map((d) => d.dice).join('+')}` : ''}` : actions[0]?.name ?? ''
      return clip([name, `${sizes}${ct?.swarm ? '群体' : ''}${CREATURE_TYPE[String(ct?.type ?? '')] ?? ct?.type ?? ''}`, `CR${cr}`, `AC${ac} HP${hp}`, action].filter(Boolean).join('｜'))
    }
    case 'item': {
      const rarity = RARITY[String(data.rarity ?? '')] ?? String(data.rarity ?? '')
      const category = ITEM_CATEGORY[String(data.category ?? '')] ?? String(data.category ?? '')
      const weapon = data.weapon as { damage?: Array<{ dice: string; type: string }> } | undefined
      const armor = data.armor as { ac?: number } | undefined
      const detail = weapon ? damageText(weapon.damage) : armor ? `AC${armor.ac}` : ''
      return clip([name, `${category}${rarity && rarity !== 'none' ? `·${rarity}` : ''}`, detail].filter(Boolean).join('｜'))
    }
    case 'class':
      return clip([name, `${data.hitDie}生命骰`, data.subclassTitle].filter(Boolean).join('｜'))
    case 'subclass':
      return clip([name, '子职业', first].filter(Boolean).join('｜'))
    case 'feature':
      return clip([name, data.featureType, first].filter(Boolean).join('｜'))
    case 'race':
    case 'subrace': {
      const speed = data.speed as Record<string, number> | undefined
      return clip([name, data.parentRace ? '亚种族' : '种族', `速度${speed?.walk ?? '—'}尺`].join('｜'))
    }
    case 'background':
      return clip([name, '背景', first].filter(Boolean).join('｜'))
    case 'feat':
      return clip([name, '专长', first].filter(Boolean).join('｜'))
    case 'table': {
      const rows = Array.isArray(data.rows) ? data.rows.length : 0
      return clip([name, String(data.dice ?? ''), `${rows} 项`].join('｜'))
    }
    case 'condition':
    case 'disease':
    case 'status':
      return clip([name, type === 'condition' ? '状态' : type === 'disease' ? '疾病' : '状态', first].filter(Boolean).join('｜'))
    case 'rule':
      return clip([name, '规则', first].filter(Boolean).join('｜'))
    default:
      return clip([name, first].filter(Boolean).join('｜'))
  }
}
