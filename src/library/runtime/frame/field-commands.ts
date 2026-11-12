// 小窗里：详情页摘要行里"需要作者函数翻译"的字段（P5 B-36）。成分、持续时间、职业的熟练与起始装备、熟练加值、神祇的阵营——
// 全部调用作者自己的 Parser / Renderer.class 函数，不在界面里手写翻译。哪个类别取哪几项是这里的登记表，加一类 = 加一行。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者程序是没有类型的 JS，这里只做转调 */
import { A, init } from './author'
import { collectAuthorLinks, type AuthorMarkup } from './author-markup'

export interface AuthorLine { label: string; value: string; markup?: AuthorMarkup }
export interface AuthorFields {
  lines: AuthorLine[]
  /** 职业：每一级的熟练加值（作者 Parser.levelToPb），下标 0 = 1 级。 */
  pb: string[] | null
}

const text = (s: unknown): string => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const listText = (x: unknown): string => (Array.isArray(x) ? x.map(text).filter(Boolean).join('、') : text(x))

type Rule = (item: any) => Array<[string, unknown]>
const RULES: Record<string, Rule> = {
  spell: (s) => [
    ['成分', s.components ? A.Parser.spComponentsToFull(s.components, s.level, { isPlainText: true }) : ''],
    ['持续时间', s.duration ? A.Parser.spDurationToFull(s.duration, { isPlainText: true }) : ''],
  ],
  class: (c) => {
    const p = c.startingProficiencies ?? {}
    const hint = { styleHint: c.edition ?? 'classic' }
    return [
      ['护甲受训', p.armor ? A.Renderer.class.getRenderedArmorProfs(p.armor, hint) : ''],
      ['武器熟练', p.weapons ? A.Renderer.class.getRenderedWeaponProfs(p.weapons, hint) : ''],
      ['工具熟练', p.tools ? A.Renderer.class.getRenderedToolProfs(p.tools, hint) : ''],
      ['技能熟练', p.skills ? A.Renderer.class.getRenderedSkillProfs(p.skills, hint) : ''],
      ['起始装备', Array.isArray(c.startingEquipment?.default) ? c.startingEquipment.default.join('；') : ''],
    ]
  },
  deity: (d) => [
    ['神系', d.pantheon], ['阵营', Array.isArray(d.alignment) ? A.Parser.alignmentListToFull(d.alignment) : ''], ['类别', d.category],
    ['领域', Array.isArray(d.domains) ? d.domains.join('、') : ''], ['权能', d.province], ['象征', d.symbol],
  ],
}

/** 这一条在摘要行里要作者翻译的字段；没有登记的类别返回空。 */
export async function authorFields(prop: string, item: any): Promise<AuthorFields> {
  await init()
  const rule = RULES[prop]
  const lines: AuthorLine[] = []
  if (rule) {
    try {
      const { value: fields, marker, links } = collectAuthorLinks(() => rule(item), { tables: false })
      for (const [label, value] of fields) {
        const v = Array.isArray(value) ? listText(value) : text(value)
        const markup = typeof value === 'string' && value.includes(marker) ? { html: value, marker, links } : undefined
        if (v || markup) lines.push({ label, value: v, ...(markup ? { markup } : {}) })
      }
    } catch (e) {
      lines.push({ label: '读取失败', value: e instanceof Error ? e.message : String(e) })
    }
  }
  let pb: string[] | null = null
  if (prop === 'class') {
    try { pb = Array.from({ length: 20 }, (_, i) => `+${A.Parser.levelToPb(i + 1)}`) } catch { pb = null }
  }
  return { lines, pb }
}
