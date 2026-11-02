import type { Fact } from './index'
import { ALIGNMENT, DAMAGE, RARITY, RULE_CATEGORY, SIZE, tr, trWords } from '../zh'

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown): string => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
const join = (v: string[], sep = '、'): string => v.filter(Boolean).join(sep)
const text = (v: unknown): string => arr(v).map(str).filter(Boolean).join('；')
const abbr: Record<string, string> = { str: '力量', dex: '敏捷', con: '体质', int: '智力', wis: '感知', cha: '魅力' }
const abilities = (d: Obj): string => join(['str', 'dex', 'con', 'int', 'wis', 'cha'].map((k) => d[k] !== undefined ? `${abbr[k]} ${d[k]}` : ''), ' · ')
const speedKeys: Record<string, string> = { walk: '步行', fly: '飞行', swim: '游泳', climb: '攀爬', burrow: '掘地', hover: '悬浮' }
function speed(v: unknown): string {
  if (typeof v === 'number') return `${v} 尺`
  if (!isObj(v)) return ''
  return join(Object.entries(v).map(([k, x]) => {
    if (k === 'canHover' || k === 'condition') return ''
    const n = isObj(x) ? x.number ?? x.amount : x
    return typeof n === 'number' || typeof n === 'string' ? `${speedKeys[k] ?? k} ${n} 尺` : ''
  }), '，')
}
function ac(v: unknown): string {
  if (typeof v === 'number') return String(v)
  if (Array.isArray(v)) return join(v.map((x) => isObj(x) ? str(x.ac ?? x.value) : str(x)), '/')
  if (isObj(v)) return str(v.value ?? v.ac ?? v.special)
  return str(v)
}
function hp(v: unknown): string {
  if (typeof v === 'number') return String(v)
  if (!isObj(v)) return str(v)
  if (v.special !== undefined) return str(v.special)
  return `${str(v.average ?? v.hp ?? v.value)}${v.formula ? `（${str(v.formula)}）` : ''}`
}
function effects(v: unknown): string {
  const items = arr(v).map((e) => isObj(e) ? join([str(e.name), str(e.text), str(e.description)]) : str(e)).filter(Boolean)
  return items.length ? join(items) : arr(v).length ? `${arr(v).length} 项` : ''
}
const domain: Record<string, string> = { Knowledge: '知识', Life: '生命', Light: '光明', Nature: '自然', Tempest: '风暴', Trickery: '诡术', War: '战争', Death: '死亡', Arcana: '奥秘', Forge: '锻造', Grave: '坟墓', Order: '秩序', Peace: '和平', Twilight: '暮光' }
const languageType: Record<string, string> = { standard: '标准', exotic: '异域', secret: '秘密' }
const rewardKind: Record<string, string> = { blessing: '祝福', boon: '史诗恩赐', charm: '咒符', pietyTrait: '虔诚特质', draconicGift: '龙之赠礼', curse: '诅咒', demonicBoon: '恶魔恩赐', other: '其他' }
const cultType: Record<string, string> = { Demonic: '恶魔崇拜', Diabolical: '魔鬼崇拜', 'Elder Evil': '上古邪物崇拜' }
const hazardKind: Record<string, string> = { trap: '陷阱', hazard: '危害' }
const threat: Record<string, string> = { setback: '挫折', moderate: '中等', dangerous: '危险', deadly: '致命' }
const vehicleType: Record<string, string> = { SHIP: '船只', SPELLJAMMER: '星界船', OBJECT: '物件' }
const partKind: Record<string, string> = { action: '动作', trait: '特性', feature: '特性' }
const diet: Record<string, string> = { C: '杂食', V: '素食', X: '特殊' }
const conditionKind: Record<string, string> = { condition: '状态', disease: '疾病', status: '状态' }

export function extraFacts(type: string, d: Obj): Fact[] {
  const out: Fact[] = []
  const add = (label: string, value: string): void => { if (value) out.push({ label, parts: [value] }) }
  switch (type) {
    case 'deity':
      add('称号', str(d.title)); add('神系', str(d.pantheon)); add('阵营', arr(d.alignment).map((x) => tr(ALIGNMENT, x)).join('')); add('领域', arr(d.domains).map((x) => domain[str(x)] ?? str(x)).join('、')); add('掌管', str(d.province)); add('圣徽', str(d.symbol)); add('类别', str(d.category)); break
    case 'language':
      add('类型', languageType[str(d.type)] ?? str(d.type)); add('文字', str(d.script)); add('典型使用者', text(d.typicalSpeakers)); add('方言', text(d.dialects)); break
    case 'reward':
      add('种类', rewardKind[str(d.rewardKind)] ?? str(d.rewardKind)); add('稀有度', d.rarity ? tr(RARITY, d.rarity) : '')
      if (arr(d.spellGrants).length) out.push({ label: '授予法术', parts: arr(d.spellGrants).flatMap((g, i) => [i ? '、' : '', { ref: str(isObj(g) ? g.spell : g) }]) })
      add('标志法术', str(d.signatureSpells)); break
    case 'cult':
      add('类型', cultType[str(d.type)] ?? str(d.type)); add('目标', str(d.goal)); add('典型成员', str(d.typicalMembers)); add('标志法术', str(d.signatureSpells)); break
    case 'hazard':
      add('种类', hazardKind[str(d.hazardKind)] ?? str(d.hazardKind)); add('等级与威胁', arr(d.rating).map((r) => isObj(r) ? `${str(r.tier)} 级·${threat[str(r.threat)] ?? str(r.threat)}` : '').join('、')); add('先攻', d.initiative !== undefined ? `${str(d.initiative)}${d.initiativeNote ? `（${str(d.initiativeNote)}）` : ''}` : ''); break
    case 'object':
      add('体型', arr(d.size).map((x) => tr(SIZE, x)).join('或')); add('护甲等级', ac(d.ac)); add('生命值', hp(d.hp)); add('伤害免疫', arr(d.immune).map((x) => trWords(str(x))).join('、')); add('状态免疫', arr(d.conditionImmune).map((x) => trWords(str(x))).join('、')); add('速度', speed(d.speed)); add('属性', abilities(d)); break
    case 'vehicle':
      add('类型', vehicleType[str(d.vehicleType)] ?? str(d.vehicleType)); add('体型', arr(d.size).map((x) => tr(SIZE, x)).join('或')); add('船员', str(d.capCrew)); add('乘客', str(d.capPassenger)); add('货物', str(d.capCargo)); add('速度', speed(d.speed) || speed(d.pace)); add('护甲等级', ac(d.ac)); add('生命值', hp(d.hp)); add('伤害免疫', arr(d.immune).map((x) => trWords(str(x))).join('、')); add('状态免疫', arr(d.conditionImmune).map((x) => trWords(str(x))).join('、')); add('属性', abilities(d)); break
    case 'feat':
      add('前置条件', text(d.prerequisite)); add('属性提升', arr(d.abilityIncrease).map((x) => isObj(x) ? (x.ability ? `${abbr[str(x.ability)] ?? str(x.ability)} +${str(x.amount)}` : `从 ${arr(x.from).map((a) => abbr[str(a)] ?? str(a)).join('/')} 选 ${str(x.choose)} 项加 ${str(x.amount)}`) : '').join('；')); add('效果', effects(d.effects)); add('使用次数', isObj(d.uses) ? `${str(d.uses.max ?? d.uses.count)} 次` : ''); break
    case 'condition': case 'disease': case 'status':
      add('类型', conditionKind[str(d.kind)] ?? str(d.kind)); add('效果', effects(d.effects)); add('等级', arr(d.levels).map((x) => isObj(x) ? `${str(x.level)} 级：${effects(x.effects)}` : '').join('；')); break
    case 'monsterPart':
      add('部位类型', partKind[str(d.partKind)] ?? str(d.partKind)); add('示例', str(d.example)); add('效果', str(d.effect)); add('DPR', str(d.dpr)); add('护甲等级', str(d.ac)); add('生命值', str(d.hp)); add('攻击加值', str(d.attackBonus)); break
    case 'charoption': add('选项类型', text(d.optionType)); break
    case 'recipe':
      add('食谱类型', str(d.recipeType)); add('饮食', diet[str(d.diet)] ?? str(d.diet)); add('菜品类型', text(d.dishTypes)); add('过敏原', text(d.allergenGroups)); add('标签', text(d.tags)); add('份量', isObj(d.serves) ? join([str(d.serves.exact), d.serves.min !== undefined || d.serves.max !== undefined ? `${str(d.serves.min)}–${str(d.serves.max)}` : '', str(d.serves.note)]) : str(d.makes)); add('配料', `${arr(d.ingredients).length} 项`); add('器具', `${arr(d.equipment).length} 项`); break
    case 'rule':
      add('类别', tr(RULE_CATEGORY, d.category)); add('缩写', str(d.abbreviation)); add('属性', str(d.ability)); add('适用于', str(d.appliesTo)); add('模板', str(d.template)); add('效果', effects(d.effects)); add('引擎', str(d.engine)); add('分组', str(d.group)); add('选项', str(d.optionId)); add('发动', isObj(d.activation) ? `${str(d.activation.type)}${d.activation.cost ? ` ${str(d.activation.cost)}` : ''}` : ''); add('伤害', arr(d.damage).map((x) => isObj(x) ? `${str(x.dice)} ${tr(DAMAGE, x.type)}` : '').join('、')); break
    default: break
  }
  return out
}

export function factsToText(facts: Fact[]): string {
  return facts.map((f) => {
    const body = f.parts?.map((p) => typeof p === 'string' ? p : (p.label ?? p.ref)).join('') ?? ''
    const table = f.table ? f.table.rows.map((r) => r.join('／')).join('\n') : ''
    return `${f.label}：${[body, table].filter(Boolean).join('\n')}`
  }).join('\n')
}
