// Trait 类熟练的标题按编号取（类别 skills / tool / languages / dr …，进阶模式 expertise / mastery …）：dnd5e 自己的 traits、traitModes 登记 + 官方多语言（中文战役即中文）。
// 建卡步骤标题、「建卡里还选不了」的提示、属性名都用这一处（不用 Plutonium 写死的英文标题；界面不查表）。作者代码产出的文字（币种、分组说明）走 library/texts.ts。
/* eslint-disable @typescript-eslint/no-explicit-any -- 官方文档对象没有类型声明。 */
const g = globalThis as any
const localize = (key: string | undefined): string | null => (key ? g.game.i18n.localize(key) : null)
const joined = (titles: Array<string | null>): string | null => {
  const out = [...new Set(titles.filter((t): t is string => !!t))]
  return out.length ? out.join('、') : null
}

/** 编号 → 名字：dnd5e 某张登记表（abilities、currencies …）里每项的 label，已按当前语言本地化。 */
export function registryLabels(registry: string): Record<string, string> {
  const table = g.CONFIG?.DND5E?.[registry] ?? {}
  const text = (v: any): string => localize(typeof v === 'string' ? v : v?.label) ?? ''
  return Object.fromEntries(Object.entries(table).map(([k, v]) => [k, text(v) || k]))
}

/** 类别编号 → 标题；不认识的类别 → null。 */
export function traitTypeTitle(type: string | null | undefined): string | null {
  return localize(type ? g.CONFIG?.DND5E?.traits?.[type]?.labels?.title : undefined)
}

/** 进阶模式编号（dnd5e traitModes：expertise、mastery …）→ 标题；默认模式和不认识的 → null。 */
export function traitModeTitle(mode: string | null | undefined): string | null {
  return mode && mode !== 'default' ? localize(g.CONFIG?.DND5E?.traitModes?.[mode]?.label) : null
}

/** Plutonium 熟练分组写在人物身上的位置 → dnd5e 的类别编号（两边各自的声明对上：Plutonium 的分组 _propPathActorExistingProficiencies、dnd5e 的 Trait.actorKeyPath）。 */
export function traitTypeOfActorPath(path: string[] | undefined): string | null {
  const trait = g.dnd5e?.documents?.Trait
  if (!path?.length || !trait) return null
  const want = path.join('.')
  return Object.keys(g.CONFIG?.DND5E?.traits ?? {}).find((type) => trait.actorKeyPath(type) === want) ?? null
}

/** 人物位置 → 标题：正好是某类别的位置 → 类别名；是「类别位置.模式」且该类别登记支持这个模式（如 weapon 的 mastery: true）→ 模式名。 */
function titleOfActorPath(path: string[] | undefined): string | null {
  const type = traitTypeOfActorPath(path)
  if (type) return traitTypeTitle(type)
  const mode = path?.at(-1)
  const base = traitTypeOfActorPath(path?.slice(0, -1))
  return base && mode && g.CONFIG.DND5E.traits[base][mode] === true ? traitModeTitle(mode) : null
}

/** 一组编号涉及的类别标题（按编号前缀，去重后用顿号连起来）；一个都认不出 → null。 */
export function titleOfKeys(keys: Iterable<unknown>): string | null {
  return joined([...new Set([...keys].map((k) => String(k).split(':')[0]).filter(Boolean))].map(traitTypeTitle))
}

/**
 * Plutonium 熟练分组的标题，全按编号认：①分组写的人物位置；②分组编号是 dnd5e 登记的进阶模式（专精）；
 * ③混合分组：作者自己列出的涉及分组（_getAllPossibleProps）→ 同一批里同编号的单类分组 → 按 ① 认；④这组候选的类别编号。都认不出 → null。
 */
export function groupTitle(group: any, siblings: any[] = [], keys: Iterable<unknown> = []): string | null {
  const props: string[] = group._subComps?.[0]?._getAllPossibleProps?.() ?? []
  return titleOfActorPath(group._propPathActorExistingProficiencies)
    || traitModeTitle(group._prop)
    || joined(props.map((prop) => titleOfActorPath(siblings.find((s) => s !== group && s._prop === prop)?._propPathActorExistingProficiencies)))
    || titleOfKeys(keys)
}

/** 进阶的标题：非默认模式用模式名（专精、精通…）；写了类别就用类别；否则按它授予内容的编号前缀取。 */
export function traitTitle(advancement: any): string | null {
  const c = advancement.configuration ?? {}
  const mode = traitModeTitle(c.mode)
  if (mode) return mode
  if (c.type) return traitTypeTitle(c.type)
  return titleOfKeys([...(c.grants ?? []), ...[...(c.choices ?? [])].flatMap((x: any) => [...(x?.pool ?? [])])])
}
