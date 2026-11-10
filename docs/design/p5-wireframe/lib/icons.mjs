// 图标库：沿用项目已有的 Phosphor Regular（src/ui/kit/icons.ts，经 p4-design-system/icons.mjs 读取）；
// P5 新增的 3 个从官方包 @phosphor-icons/core@2.1.1（MIT）取，放在 sources/，做法同 P4 的 git-branch。进插件时要补进 src/ui/kit/icons.ts。
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ICONS, icon } from '../../p4-design-system/icons.mjs'

const here = dirname(fileURLToPath(import.meta.url))
export const P5_NEW_ICONS = ['image', 'list-bullets', 'table']
for (const n of P5_NEW_ICONS) ICONS[n] = readFileSync(join(here, `../sources/phosphor-${n}.svg`), 'utf8').match(/<svg[^>]*>(.*)<\/svg>/s)[1]
export { ICONS, icon }
