import type { Entry } from '../../../schemas/pack'
import {
  backgroundView, classView, featView, itemView, levelUpView, monsterView,
  optionalFeatureView, raceView, spellView, type BackgroundView, type ClassView,
  type FeatView, type ItemView, type LevelUpView, type MonsterView, type OptionalFeatureView,
  type RaceView, type SpellSourceRow, type SpellView,
} from './reader'

/** 一个已安装包的整体后端视图：按 raw 类型分组，类/特性/子职业一起算等级。 */
export interface PackViews {
  counts: Record<string, number>
  spells: SpellView[]
  monsters: MonsterView[]
  items: ItemView[]
  classes: ClassView[]
  levels: LevelUpView[]
  races: RaceView[]
  subraces: RaceView[]
  backgrounds: BackgroundView[]
  feats: FeatView[]
  optionalFeatures: OptionalFeatureView[]
}

export function buildPackViews(entries: Entry[], spellSources: Record<string, Record<string, SpellSourceRow>> = {}): PackViews {
  const counts: Record<string, number> = {}
  const byType = new Map<string, Entry[]>()
  for (const entry of entries) {
    counts[entry.type] = (counts[entry.type] ?? 0) + 1
    byType.set(entry.type, [...(byType.get(entry.type) ?? []), entry])
  }
  const classes = byType.get('class') ?? []
  const features = byType.get('feature') ?? []
  const subclasses = byType.get('subclass') ?? []
  return {
    counts,
    spells: (byType.get('spell') ?? []).map((e) => spellView(e, spellSources)),
    monsters: (byType.get('monster') ?? []).map(monsterView),
    items: (byType.get('item') ?? []).map(itemView),
    classes: classes.map((e) => classView(e, features, subclasses)),
    levels: classes.map((e) => levelUpView(e, features, subclasses)),
    races: (byType.get('race') ?? []).map(raceView),
    subraces: (byType.get('subrace') ?? []).map(raceView),
    backgrounds: (byType.get('background') ?? []).map(backgroundView),
    feats: (byType.get('feat') ?? []).map(featView),
    optionalFeatures: (byType.get('optionalfeature') ?? []).map(optionalFeatureView),
  }
}
