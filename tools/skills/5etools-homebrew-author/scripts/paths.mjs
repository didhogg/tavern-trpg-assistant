// 本 skill 三个脚本共用的位置。都能用环境变量改，默认指向本机现有的东西；这里不存任何条目数据。
//   TRPG_REPO      TRPG 助手仓库根（默认：本 skill 所在位置往上三层，即 tools/skills/<名字>/ → 仓库根）
//   BREW_VALIDATOR 作者结构定义预编译出来的校验器（默认：<仓库>/vendor/brew-schema/validator.js，插件自己也用它）
//   BREW_POOL      作者的自制仓库本地副本（样例、查来源名重名用）
//   BREW_WIKI      作者 wiki 的本地文本副本（Homebrew__*.txt）
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const skillDir = fileURLToPath(new URL('..', import.meta.url))
export const repoRoot = process.env.TRPG_REPO ?? join(skillDir, '../../..')
export const validatorPath = process.env.BREW_VALIDATOR ?? join(repoRoot, 'vendor/brew-schema/validator.js')
export const schemaDir = join(repoRoot, 'vendor/brew-schema/schema')
export const fieldsPath = join(repoRoot, 'vendor/brew-schema/fields.js')
export const brewPool = process.env.BREW_POOL ?? '/Users/xxx/DND- reference（DO NO DELETE！）/homebrew-master'
export const wikiDir = process.env.BREW_WIKI ?? '/Users/xxx/tavern-trpg-data-next/_upstream/author-docs/wiki.tercept.net'
export const indexJson = join(skillDir, 'references/类别索引.json')
//   TAVERN_TERMS_FILE 作者中文站「大译名表」（15 MB，不进仓库；P5.5 第 5 步同一个环境变量与默认路径，见 docs/handoff/P5.5_第5步_字段翻译交接.md §6）
//   CHECK_STRUCTURE   作者中文 fork 的 compare_json_structure.py（译文与英文结构一致检查）
export const termsPath = process.env.TAVERN_TERMS_FILE ?? '/Users/xxx/tavern-trpg-data-next/_upstream/cn/docs/terms-20261015-105551.json'
//   BREW_RENDER_JS    作者 5etools 站的 js/render.js（读出哪些 {@标签} 是“带名字的条目引用”，不手写名单）
export const renderJs = process.env.BREW_RENDER_JS ?? '/Users/xxx/tavern-trpg-data-next/_upstream/code/5etools-src/js/render.js'
export const compareScript = process.env.CHECK_STRUCTURE ?? '/Users/xxx/tavern-trpg-data-next/_upstream/cn/codex-skills/5etools-json-translate/scripts/compare_json_structure.py'
