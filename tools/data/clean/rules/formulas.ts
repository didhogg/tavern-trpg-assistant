import { mapStrings } from '../walk'
import type { Rule } from '../types'

/** 规则 3：`{{spellcasting_mod}}` 不是合法标记，换成可读文字。 */
export const formulasRule: Rule = {
  id: 'R3-formulas',
  title: '公式记号 {{spellcasting_mod}}',
  zhOnly: false,
  apply(entry, { lang, record }) {
    const word = lang === 'en' ? 'spellcasting modifier' : '施法属性调整值'
    return mapStrings(entry.data, (value, path) => {
      if (!value.includes('{{spellcasting_mod}}')) return undefined
      const next = value.split('{{spellcasting_mod}}').join(word)
      record(path, value, next)
      return next
    })
  },
}
