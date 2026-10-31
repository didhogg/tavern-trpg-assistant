import { isObj } from '../walk'
import type { Rule } from '../types'

const LABELS = ['技能熟练项', '工具熟练项', '工具熟练', '语言', '装备']
const LABEL = new RegExp(`^(?:${LABELS.join('|')})[：:]`)

/**
 * 规则 9：背景条目开头那个列表（技能熟练项、工具熟练、语言、装备…）只是把结构化字段复述了一遍；
 * 给这个列表块加 `restated: true`，不删内容。判定：前两个块里的 list，每一项都以上面的标签开头，且第一项是「技能熟练项」。
 */
export const restatedRule: Rule = {
  id: 'R9-restated',
  title: '正文复述结构化字段的列表标 restated',
  zhOnly: true,
  apply(entry, { record }) {
    if (entry.type !== 'background' || !Array.isArray(entry.data.text)) return 0
    let changes = 0
    ;(entry.data.text as unknown[]).slice(0, 2).forEach((block, i) => {
      if (!isObj(block) || !Array.isArray(block.list) || !block.list.length || block.restated === true) return
      const items = block.list as unknown[]
      if (items.every((item) => typeof item === 'string' && LABEL.test(item)) && String(items[0]).startsWith('技能熟练项')) {
        block.restated = true
        record(`text.${i}`, `list ${items.length} 项`, 'restated: true')
        changes++
      }
    })
    return changes
  },
}
