// 特征单元的读数（驾驶员 11-25：体型 / 生物类型 / 速度 / 感官 / 阵营，各自的来源与取回方式）。只读官方准备好的数据，不算规则：
//   来源 = 种族条目自己的数据（dnd5e prepareRace 从种族读速度、感官；体型来自种族的体型成长；玩家角色的类型就是种族上的类型）
//          或人物自己存的值（手改）。种族给的那一项可以取下：交回取下记录的写法（frame/off.ts 同一个入口认得的 ref / part / advancement）。
//   体型：库里的写法（作者 5etools 代号 T / S / M …）↔ 人物上的写法（dnd5e tiny / sm / med …）用作者 Plutonium 自己的换算表，
//          界面拿库里的体型选项、按这张表写进人物，不自己换。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
import { flagsKey, type OffRow } from './off'
import { plutoniumBuild } from './plutonium-build'

/** 一项速度 / 感官：现在的值、人物自己存的值（手改的）、种族条目给的值；种族给的那份可取下（off）。 */
export interface TraitRow { key: string; value: number; own: number; species: number; off: OffRow | null }

export interface SheetTraits {
  /** 种族条目（人物身上的编号与名字）；怪物 / 没有种族的人为 null。 */
  species: { id: string; name: string } | null
  size: { value: string; species: string | null; off: OffRow | null; codes: Record<string, string> }
  /** 类型改在哪：玩家角色改种族条目上的类型（itemId），怪物改自己的。 */
  type: { value: string; subtype: string; custom: string; target: { itemId?: string; path: string } | null }
  /** keys = 人物上这一类有哪些种类（dnd5e 的键；库里速度 / 感官的写法和它一致：作者 Plutonium 原话 these keys match those of dnd5e's）。 */
  movement: { units: string; hover: boolean; keys: string[]; rows: TraitRow[] }
  senses: { units: string; special: string; keys: string[]; rows: TraitRow[] }
  alignment: string
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0)
const typeName = (adv: any): string => adv.constructor?.typeName ?? adv.type

export function sheetTraits(a: any): SheetTraits {
  const sys = a.system
  const src = a._source?.system ?? {}
  const race = a.type === 'character' && sys.details?.race && typeof sys.details.race === 'object' ? sys.details.race : null
  const ref = race ? flagsKey(race) : null
  const sizeAdv = race ? (Object.values(race.advancement?.byId ?? {}) as any[]).find((adv) => typeName(adv) === 'Size') : null
  const rows = (now: Record<string, unknown> | undefined, own: Record<string, unknown> | undefined, species: Record<string, unknown> | undefined, part: string): TraitRow[] =>
    Object.keys(now ?? {}).map((key) => {
      const fromSpecies = num(species?.[key])
      return { key, value: num(now?.[key]), own: num(own?.[key]), species: fromSpecies, off: ref && fromSpecies ? { ref, part: `${part}.${key}` } : null }
    }).filter((r) => r.value || r.own || r.species)
  const type = race ? race.system?.type ?? {} : sys.details?.type ?? {}
  return {
    species: race ? { id: race.id, name: race.name } : null,
    size: {
      value: String(sys.traits?.size ?? ''),
      species: sizeAdv?.value?.size ?? null,
      off: ref && sizeAdv ? { ref, advancement: sizeAdv.id } : null,
      // 作者换算表：5etools 体型代号 → dnd5e 体型键（Plutonium VET_SIZE_TO_ABV，原样交出）
      codes: { ...(plutoniumBuild?.VET_SIZE_TO_ABV ?? {}) },
    },
    type: {
      value: String(type.value ?? ''), subtype: String(type.subtype ?? ''), custom: String(type.custom ?? ''),
      target: race ? { itemId: race.id, path: 'system.type' } : a.type === 'character' ? null : { path: 'system.details.type' },
    },
    movement: {
      units: String(sys.attributes?.movement?.units ?? ''), hover: !!sys.attributes?.movement?.hover, keys: Object.keys(sys.attributes?.movement?.speeds ?? {}),
      rows: rows(sys.attributes?.movement?.speeds, src.attributes?.movement?.speeds, race?.system?.movement?.speeds, 'system.movement.speeds'),
    },
    senses: {
      units: String(sys.attributes?.senses?.units ?? ''), special: String(src.attributes?.senses?.special ?? ''), keys: Object.keys(sys.attributes?.senses?.ranges ?? {}),
      rows: rows(sys.attributes?.senses?.ranges, src.attributes?.senses?.ranges, race?.system?.senses?.ranges, 'system.senses.ranges'),
    },
    alignment: String(src.details?.alignment ?? ''),
  }
}
