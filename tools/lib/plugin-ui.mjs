// 底稿（作者建卡器界面字）的纯逻辑：校验、空位、把 final / approved 行并进语言表。
// 生成器 tools/build-kernel-lang.mjs 和单元测试共用这一处，不各写一份编号或覆盖规则。
import { upstreamKey } from './upstream-messages.mjs'

export const PLUGIN_UI = { lang: 'zh', package: 'plutonium' }

/** 模板句英文原文的编号：和 upstreamKey 同一个摘要，只换前缀。 */
export const upstreamSourceKey = (text) => upstreamKey(text).replace('.UpstreamText.', '.UpstreamSource.')

/** 译文和原文的 {} 个数必须一样；空位顺序可调。 */
export function checkPlaceholders(text, translation) {
  const a = (String(text).match(/\{\}/g) ?? []).length
  const b = (String(translation).match(/\{\}/g) ?? []).length
  if (a !== b) throw new Error(`空位个数不一致：${JSON.stringify(text)} 有 ${a} 个，译文有 ${b} 个`)
  return true
}

/** 只取本语言、本包的底稿行；字段不全直接报错，不静默丢。 */
export function pluginUiRows(draft) {
  if (!Array.isArray(draft)) throw new Error('界面字底稿必须是数组')
  const rows = draft.filter((row) => row && row.lang === PLUGIN_UI.lang && row.package === PLUGIN_UI.package)
  for (const row of rows) {
    if (typeof row.text !== 'string' || !row.text.trim()) throw new Error('界面字底稿有空的 text')
    if (typeof row.translation !== 'string') throw new Error(`界面字底稿缺 translation：${row.text}`)
    if (row.status !== 'final' && row.status !== 'review') throw new Error(`界面字底稿 status 只能是 final / review：${row.text}`)
    checkPlaceholders(row.text, row.translation)
  }
  return rows
}

export function pluginUiStats(rows) {
  const byFrom = {}
  for (const row of rows) byFrom[row.from] = (byFrom[row.from] ?? 0) + 1
  return {
    total: rows.length,
    final: rows.filter((row) => row.status === 'final').length,
    review: rows.filter((row) => row.status === 'review').length,
    byFrom,
  }
}

/**
 * review 行和现有键撞车（同编号、不同译文）：不覆盖，交给复核清单。已批的按批过的译文比。
 */
export function pluginUiKeyCollisions(flat, rows, approved = []) {
  return rows
    .filter((row) => row.status === 'review')
    .map((row) => {
      const override = approved.find((item) => item.lang === PLUGIN_UI.lang && item.package === PLUGIN_UI.package && item.text === row.text)
      return { key: upstreamKey(row.text), text: row.text, existing: flat[upstreamKey(row.text)], draft: override?.translation ?? row.translation, from: override ? 'approved-translations' : row.from }
    })
    .filter((row) => row.existing !== undefined && row.existing !== row.draft)
}

/**
 * 把底稿并进语言表。
 * - final 行进入；review 行不进入。
 * - approved-translations 对同原文优先，即使底稿还是 review。
 * - 同一个编号已经有值：译文一样共用；不一样绝不覆盖（记 conflict）。
 * 返回新的 flat（不原地改）、新增/共用/冲突计数、实际加入的条目。
 */
export function applyPluginUi(flat, rows, approved = []) {
  const out = { ...flat }
  const added = []
  const conflicts = []
  let shared = 0
  let approvedRows = 0
  for (const row of rows) {
    const override = approved.find((item) => item.lang === PLUGIN_UI.lang && item.package === PLUGIN_UI.package && item.text === row.text)
    const translation = override?.translation ?? row.translation
    const include = row.status === 'final' || !!override
    if (!include) continue
    if (!translation.trim()) throw new Error(`界面字底稿没有译文：${row.text}`)
    checkPlaceholders(row.text, translation)
    const key = upstreamKey(row.text)
    if (Object.prototype.hasOwnProperty.call(out, key)) {
      if (out[key] === translation) shared++
      else conflicts.push({ key, text: row.text, existing: out[key], draft: translation, from: override ? 'approved-translations' : row.from })
      continue
    }
    out[key] = translation
    // 模板句（含 {}）另放英文原文：运行时 system-text.ts uiText 用它匹配作者的实际句子、取出空位参数
    if (row.text.includes('{}')) out[upstreamSourceKey(row.text)] = row.text.trim()
    added.push({ key, text: row.text, translation, from: override ? 'approved-translations' : row.from })
    if (override) approvedRows++
  }
  return { flat: out, added, shared, conflicts, approvedRows }
}
