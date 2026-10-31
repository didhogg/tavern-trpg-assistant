import { NAME_OVERRIDES } from '../../config/nameOverrides'
import { clip } from '../../summary/summary'
import type { Rule } from '../types'

/** 规则 1：名称覆盖（B2b、气、D6）。只改 name，并同步 summary 开头的名称、keywords 里的旧名称与 credit.missing 的 name。 */
export const namesRule: Rule = {
  id: 'R1-names',
  title: '名称覆盖（nameOverrides）',
  zhOnly: true,
  apply(entry, { record }) {
    const override = NAME_OVERRIDES[entry.id]
    if (!override || entry.name === override.name) return 0
    const old = entry.name
    entry.name = override.name
    if (entry.summary.startsWith(old)) entry.summary = clip(`${override.name}${entry.summary.slice(old.length)}`)
    entry.keywords = entry.keywords.map((word) => (word === old ? override.name : word))
    const credit = entry.data.credit as { missing?: string[] } | undefined
    if (credit?.missing?.includes('name')) credit.missing = credit.missing.filter((item) => item !== 'name')
    record('name', old, override.name)
    return 1
  },
}
