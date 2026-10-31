import type { Entry } from '../../../src/schemas/pack'
import type { CleanReport, Lang, Rule } from './types'

/** 规则按这里的顺序依次运行；新增规则只在这里登记。 */
export const RULES: Rule[] = []

const SAMPLE_LIMIT = 60
let last: CleanReport | undefined

export function langFromEnv(): Lang {
  return process.env.TRPG_DATA_LANG === 'en' ? 'en' : 'zh'
}

/** 对转换后的条目做一遍文字清理（R14）。就地修改；英文那一遍只运行与语言无关的规则。 */
export function cleanEntries(entries: Iterable<Entry>, lang: Lang = langFromEnv(), rules: Rule[] = RULES): CleanReport {
  const report: CleanReport = { lang, rules: {} }
  const active = rules.filter((rule) => !(lang === 'en' && rule.zhOnly))
  for (const rule of active) report.rules[rule.id] = { title: rule.title, entriesChanged: 0, changes: 0, samples: [] }
  for (const entry of entries) {
    for (const rule of active) {
      const result = report.rules[rule.id]
      const count = rule.apply(entry, (path, before, after) => { if (result.samples.length < SAMPLE_LIMIT) result.samples.push({ id: entry.id, path, before, after }) })
      if (count > 0) { result.entriesChanged += 1; result.changes += count }
    }
  }
  last = report
  return report
}

export function lastCleanReport(): CleanReport | undefined {
  return last
}
