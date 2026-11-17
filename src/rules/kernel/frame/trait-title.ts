// Trait 类熟练的标题按类别编号取（skills / tool / languages / dr …）：dnd5e 自己的 traits 配置 + 官方多语言（中文战役即中文）。
// 建卡步骤标题、「建卡里还选不了」的提示都用这一处，不用 Plutonium 写死的英文标题。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
const g = globalThis as any

/** 类别编号 → 标题；不认识的类别 → null。 */
export function traitTypeTitle(type: string | null | undefined): string | null {
  const key = type ? g.CONFIG?.DND5E?.traits?.[type]?.labels?.title : null
  return key ? g.game.i18n.localize(key) : null
}

/** Plutonium 熟练分组写在人物身上的位置 → dnd5e 的类别编号（两边各自的声明对上：Plutonium 的分组 _propPathActorExistingProficiencies、dnd5e 的 Trait.actorKeyPath）。 */
export function traitTypeOfActorPath(path: string[] | undefined): string | null {
  const trait = g.dnd5e?.documents?.Trait
  if (!path?.length || !trait) return null
  const want = path.join('.')
  return Object.keys(g.CONFIG?.DND5E?.traits ?? {}).find((type) => trait.actorKeyPath(type) === want) ?? null
}

/** 一组编号涉及的类别标题（按编号前缀，去重后用顿号连起来）；一个都认不出 → null。 */
export function titleOfKeys(keys: Iterable<unknown>): string | null {
  const titles = [...new Set([...keys].map((k) => String(k).split(':')[0]).filter(Boolean))].map(traitTypeTitle).filter((t): t is string => !!t)
  return titles.length ? [...new Set(titles)].join('、') : null
}

/** 进阶的标题：写了类别就用类别，否则按它授予内容的编号前缀取。 */
export function traitTitle(advancement: any): string | null {
  const c = advancement.configuration ?? {}
  if (c.type) return traitTypeTitle(c.type)
  return titleOfKeys([...(c.grants ?? []), ...[...(c.choices ?? [])].flatMap((x: any) => [...(x?.pool ?? [])])])
}
