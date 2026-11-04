/**
 * 名称表（代码 → 中文名）输出进包（计划 D5）。
 *
 * 为什么：包里存的是代码（怪物 `alignment: "L E"`、`size: ["L"]`、`creatureType.type: "aberration"`、`resist: ["lightning"]`），
 * 界面一直靠 `ui/library/zh.ts`、`rules/.../enums.ts` 里**手写**的对照表翻成中文——数据里明明有，转换器只拿它做术语替换，没写进包。
 * 做法：转换器直接读 5etools 的 `js/parser.js`（中文版取中文名，英文原版取英文名；只读文本，不执行脚本），
 * 以及本次构建里已经转换好的「物品属性 / 物品类型」规则条目，生成 `category: glossary` 的规则条目放进 SRD 包。
 * 读不到的表直接报错（不静默、不手写补）。
 */
type Row = { code: string; name: string; nameEn?: string; abbr?: string }
export interface GlossaryEntry { id: string; type: 'rule'; name: string; nameEn: string; keywords: string[]; unique: false; summary: string; data: Record<string, unknown> }

/** `Parser.X = "字符串";` 形式的常量。 */
export function parserConsts(src: string): Map<string, string> {
  const out = new Map<string, string>()
  for (const m of src.matchAll(/^Parser\.([A-Za-z0-9_]+)\s*=\s*"((?:[^"\\]|\\.)*)"\s*;/gm)) out.set(m[1]!, m[2]!)
  return out
}

/** 从 `{` 之后的位置起，找到与之配对的 `}`（跳过字符串里的括号）；找不到就到文件末尾。 */
function matchingBrace(src: string, from: number): number {
  let depth = 1
  for (let i = from; i < src.length; i++) {
    const c = src[i]
    if (c === '"' || c === "'") { for (i++; i < src.length && src[i] !== c; i++) if (src[i] === '\\') i++; continue }
    if (c === '{') depth++
    else if (c === '}' && --depth === 0) return i
  }
  return src.length
}

const VALUE = '(?:"((?:[^"\\\\]|\\\\.)*)"|Parser\\.([A-Za-z0-9_]+))'

/**
 * 读 `Parser.<NAME>`：对象字面量（键可以是 "引号"、[Parser.常量]、裸标识符）或逐行赋值 `Parser.<NAME>[Parser.常量] = 值;`。
 * 值可以是字符串或 `Parser.常量`。返回 [键, 值]（按书写顺序）。找不到抛错。
 */
export function parserTable(src: string, name: string, consts: Map<string, string>): Array<[string, string]> {
  const resolve = (lit: string | undefined, ref: string | undefined, where: string): string => {
    if (lit !== undefined) return lit
    const v = consts.get(ref ?? '')
    if (v === undefined) throw new Error(`parser.js 的 ${where} 里引用了读不到的常量 Parser.${ref}`)
    return v
  }
  const rows: Array<[string, string]> = []
  const head = src.match(new RegExp(`^Parser\\.${name}\\s*=\\s*\\{`, 'm'))
  if (head?.index !== undefined) {
    const start = head.index + head[0].length
    const body = src.slice(start, matchingBrace(src, start))
    // 去掉整行注释和行尾注释后，按整段文本扫描键值对（同一行里有多对也能读到）
    const text = body.split('\n').map((l) => l.replace(/\s\/\/.*$/, '').replace(/^\s*\/\/.*$/, '')).join('\n')
    const pair = new RegExp(`(?:"((?:[^"\\\\]|\\\\.)*)"|\\[Parser\\.([A-Za-z0-9_]+)\\]|([A-Za-z_][A-Za-z0-9_]*))\\s*:\\s*${VALUE}`, 'g')
    for (const m of text.matchAll(pair)) rows.push([m[1] !== undefined ? m[1] : m[2] !== undefined ? resolve(undefined, m[2], `${name} 的键`) : m[3]!, resolve(m[4], m[5], name)])
  }
  for (const m of src.matchAll(new RegExp(`^Parser\\.${name}\\[Parser\\.([A-Za-z0-9_]+)\\]\\s*=\\s*${VALUE}\\s*;`, 'gm'))) rows.push([resolve(undefined, m[1], `${name} 的键`), resolve(m[2], m[3], name)])
  if (!rows.length) throw new Error(`parser.js 里没有读到名称表 Parser.${name}`)
  return rows
}

/** goblin's tools → Goblin's Tools（只用于没有英文原版表的名称）。 */
export const titleCase = (s: string): string => s.replace(/(^|[\s-])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase())

interface TableDef { kind: string; zh: string; en: string; cn: string; enTable?: string; build: (cn: Array<[string, string]>, en: Map<string, string>) => Row[] }
const byKey = (cn: Array<[string, string]>, en: Map<string, string>): Row[] => cn.map(([code, name]) => ({ code, name, nameEn: en.get(code) ?? titleCase(code) }))

const DEFS: TableDef[] = [
  // 伤害类型：parser 的表是「中文 → 英文代码」，包里用英文代码
  { kind: 'damage-type', zh: '伤害类型', en: 'Damage Types', cn: 'DMG_TYPE_TO_EN', build: (cn) => cn.map(([name, code]) => ({ code, name, nameEn: titleCase(code) })) },
  { kind: 'alignment', zh: '阵营', en: 'Alignments', cn: '_ALIGNMENT_ABV_TO_FULL', enTable: '_ALIGNMENT_ABV_TO_FULL', build: byKey },
  { kind: 'size', zh: '体型', en: 'Sizes', cn: 'SIZE_ABV_TO_FULL', enTable: 'SIZE_ABV_TO_FULL', build: byKey },
  // 生物类型：键是常量（aberration…）；英文用代码首字母大写
  { kind: 'creature-type', zh: '生物类型', en: 'Creature Types', cn: 'MON_TYPE_TO_PLURAL', build: byKey },
  { kind: 'ability', zh: '属性', en: 'Abilities', cn: 'ATB_ABV_TO_FULL', enTable: 'ATB_ABV_TO_FULL', build: byKey },
  { kind: 'weapon-category', zh: '武器类别', en: 'Weapon Categories', cn: 'WEAPON_CATEGORY_TO_FULL', build: byKey },
  { kind: 'rarity', zh: '稀有度', en: 'Rarities', cn: 'RARITIES_TO_CN', build: byKey },
  { kind: 'movement', zh: '移动方式', en: 'Movement Modes', cn: 'SPEED_TO_CN', build: byKey },
  { kind: 'tool', zh: '工具', en: 'Tools', cn: 'TOOLS_TO_CN', build: byKey },
  // 法术学派：键是缩写（A、V…），包里用英文全名小写；英文全名取英文原版同一张表
  { kind: 'spell-school', zh: '法术学派', en: 'Spell Schools', cn: 'SP_SCHOOL_ABV_TO_FULL', enTable: 'SP_SCHOOL_ABV_TO_FULL', build: (cn, en) => cn.map(([abbr, name]) => {
    const nameEn = en.get(abbr)
    if (!nameEn) throw new Error(`英文原版 parser.js 里没有学派缩写 ${abbr}`)
    return { code: nameEn.toLowerCase(), name, nameEn, abbr }
  }) },
]

export interface RuleLike { id: string; name: string; nameEn?: string; data: Record<string, unknown> }

/** 由已转换的规则条目整理出名称表：武器特性（PHB 优先）、护甲类别（轻 / 中 / 重 / 盾）。 */
export function termsFromRuleEntries(entries: RuleLike[]): { weaponProperty: Row[]; armorCategory: Row[] } {
  const prop = new Map<string, Row>()
  for (const e of [...entries].sort((a, b) => Number(b.id.endsWith('.phb')) - Number(a.id.endsWith('.phb')))) {
    if (e.data.category !== 'itemProperty' || typeof e.data.abbreviation !== 'string') continue
    const code = e.data.abbreviation.split('|')[0]!
    if (!prop.has(code)) prop.set(code, { code, name: e.name, ...(e.nameEn ? { nameEn: e.nameEn } : {}) })
  }
  const armor = new Map<string, Row>()
  for (const e of entries) {
    const m = e.id.match(/^rule\.item-type-(light-armor|medium-armor|heavy-armor|shield)\./)
    if (!m || e.data.category !== 'itemType') continue
    const code = m[1]!.replace('-armor', '')
    if (!armor.has(code)) armor.set(code, { code, name: e.name, ...(e.nameEn ? { nameEn: e.nameEn } : {}) })
  }
  return { weaponProperty: [...prop.values()], armorCategory: ['light', 'medium', 'heavy', 'shield'].filter((c) => armor.has(c)).map((c) => armor.get(c)!) }
}

function entryOf(kind: string, zh: string, en: string, rows: Row[]): GlossaryEntry {
  return {
    id: `rule.glossary-${kind}.phb`, type: 'rule', name: `名称表：${zh}`, nameEn: `Glossary: ${en}`,
    keywords: [`${zh}名称表`, `Glossary ${en}`], unique: false,
    summary: `名称表：${zh}｜${rows.slice(0, 6).map((r) => r.name).join('、')}${rows.length > 6 ? '…' : ''}（共 ${rows.length} 项）`,
    data: {
      category: 'glossary', glossary: kind, terms: rows,
      text: [{ p: `${zh}：代码与中文名对照（界面显示用，由转换器从数据源读出）。` }, { list: rows.map((r) => `${r.code}｜${r.name}${r.nameEn ? `｜${r.nameEn}` : ''}`) }],
      credit: { by: '共库', license: 'CC-BY-NC-SA-4.0', machine: false, missing: [], srd: true, structured: { by: '5etools', license: 'MIT' } },
      src: { book: 'PHB', page: 0 },
    },
  }
}

/** 生成全部名称表条目。cnParser / enParser 是两份 parser.js 的全文；rules 是本次构建已转换的规则条目。 */
export function buildGlossary(cnParser: string, enParser: string, rules: RuleLike[]): GlossaryEntry[] {
  const cnConsts = parserConsts(cnParser)
  const enConsts = parserConsts(enParser)
  const out: GlossaryEntry[] = []
  for (const def of DEFS) {
    const cn = parserTable(cnParser, def.cn, cnConsts)
    const en = new Map(def.enTable ? parserTable(enParser, def.enTable, enConsts) : [])
    out.push(entryOf(def.kind, def.zh, def.en, def.build(cn, en)))
  }
  const fromRules = termsFromRuleEntries(rules)
  if (fromRules.weaponProperty.length) out.push(entryOf('weapon-property', '武器特性', 'Weapon Properties', fromRules.weaponProperty))
  if (fromRules.armorCategory.length) out.push(entryOf('armor-category', '护甲类别', 'Armor Categories', fromRules.armorCategory))
  return out
}
