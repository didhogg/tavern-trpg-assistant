/**
 * 条目时长（U5R §12）：从 Foundry 来源（5etools 的 foundry-*.json、class/foundry.json；Foundry 开源数据）里**结构化读出**，
 * 形状与法术相同：`{ type, amount?, unit?, concentration }`。来源没有的不猜、不补。
 * 来源里时长有两处：活动（activities[].duration：`{units:'分钟', value:'1'}`）与特效（effects[].duration：秒／轮／回合数）。活动优先（它是面向玩家的写法）。
 */
type Rec = Record<string, unknown>
const isObj = (v: unknown): v is Rec => !!v && typeof v === 'object' && !Array.isArray(v)

export interface EntryDuration { type: 'timed' | 'permanent' | 'instant' | 'special'; amount?: number; unit?: 'round' | 'minute' | 'hour' | 'day'; concentration: boolean }

const UNIT: Record<string, EntryDuration['unit']> = {
  分钟: 'minute', minute: 'minute', 小时: 'hour', hour: 'hour', 轮: 'round', 回合: 'round', round: 'round', turn: 'round', 日: 'day', 天: 'day', day: 'day',
}
const SECONDS: Array<[number, NonNullable<EntryDuration['unit']>]> = [[86400, 'day'], [3600, 'hour'], [60, 'minute'], [6, 'round']]

function fromActivity(du: Rec): EntryDuration | undefined {
  const units = typeof du.units === 'string' ? du.units : ''
  const concentration = du.concentration === true
  if (units === '永续' || units === 'perm') return { type: 'permanent', concentration }
  if (units === 'inst') return { type: 'instant', concentration }
  const unit = UNIT[units]
  const raw = typeof du.value === 'number' ? du.value : typeof du.value === 'string' && /^\d+$/.test(du.value.trim()) ? Number(du.value) : undefined
  return unit && raw && raw > 0 ? { type: 'timed', amount: raw, unit, concentration } : undefined // 公式（如"等于等级的一半"）读不成固定数就不写
}

function fromEffect(du: Rec): EntryDuration | undefined {
  if (typeof du.seconds === 'number' && du.seconds > 0) {
    const hit = SECONDS.find(([s]) => du.seconds as number >= s && (du.seconds as number) % s === 0)
    return hit ? { type: 'timed', amount: (du.seconds as number) / hit[0], unit: hit[1], concentration: false } : undefined
  }
  if (typeof du.rounds === 'number' && du.rounds > 0) return { type: 'timed', amount: du.rounds, unit: 'round', concentration: false }
  if (typeof du.turns === 'number' && du.turns > 0) return { type: 'timed', amount: du.turns, unit: 'round', concentration: false }
  if (isObj(du) && typeof du.units === 'string' && du.value !== undefined) return fromActivity(du)
  return undefined
}

/** 5etools 的 foundry 记录（`activities`／`effects`）→ 条目时长；没有就返回 undefined。 */
export function durationOfFoundry(raw: Rec): EntryDuration | undefined {
  for (const a of Array.isArray(raw.activities) ? raw.activities : []) {
    if (isObj(a) && isObj(a.duration)) { const d = fromActivity(a.duration); if (d && d.type !== 'instant') return d }
  }
  for (const e of Array.isArray(raw.effects) ? raw.effects : []) {
    if (isObj(e) && isObj(e.duration)) { const d = fromEffect(e.duration); if (d) return d }
  }
  return undefined
}

/** Foundry 开源数据的物品／职业特性（`system.activities[*].duration`，units 为英文）。 */
export function durationOfOpen(system: Rec): EntryDuration | undefined {
  const acts = isObj(system.activities) ? Object.values(system.activities) : Array.isArray(system.activities) ? system.activities : []
  for (const a of acts) {
    if (!isObj(a) || !isObj(a.duration)) continue
    const d = fromActivity(a.duration)
    if (d && d.type !== 'instant') return d
  }
  return undefined
}
