// 作者中文站「大译名表」的读取和取舍规则。字段中文名工具（build-field-labels.mjs）和结算小窗语言文件工具
// （build-kernel-lang.mjs）共用这一处，不各写一份。译名表在仓库外（15 MB），不进仓库：
// 路径取命令行 --terms=…、环境变量 TAVERN_TERMS_FILE、默认位置，三者按这个顺序。
import { readFile } from 'node:fs/promises'

const DEFAULT_PATH = '/Users/xxx/tavern-trpg-data-next/_upstream/cn/docs/terms-20261015-105551.json'

export const termsPath = process.argv.find((arg) => arg.startsWith('--terms='))?.slice('--terms='.length) || process.env.TAVERN_TERMS_FILE || DEFAULT_PATH

/** 只用这些分类（常规词；排除地名、人名、法术名等专名类，实测不排除会出错：Fly → 飞行术）。 */
export const TERM_CATEGORIES = new Set(['', 'variantrule', 'normal', 'other', 'bestiary', 'creature', 'language', 'itemMastery'])
/** 同一个英文有几种中文时，分类靠前的优先。 */
export const CATEGORY_RANK = new Map(['', 'normal', 'variantrule', 'bestiary', 'creature', 'language', 'itemMastery', 'other'].map((x, i) => [x, i]))

/**
 * 读译名表：只收「已确定」的、分类在白名单里的。
 * 返回 candidates（小写英文 → [{ en, zh, category, source }]）和带文件名的版本号。读不到就给空表并警告，不中断。
 */
export async function loadTerms(path = termsPath) {
  const candidates = new Map()
  let version = '未加载'
  try {
    const raw = JSON.parse(await readFile(path, 'utf8'))
    const fileName = path.split('/').at(-1) ?? path
    version = raw.version ? `${fileName}@${raw.version}` : fileName
    for (const item of raw.items ?? []) {
      if (item.to_be_discussed || !TERM_CATEGORIES.has(item.category ?? '') || !item.en || !item.cn) continue
      const key = String(item.en).trim().toLowerCase()
      const list = candidates.get(key) ?? []
      list.push({ en: item.en, zh: item.cn, category: item.category ?? '', source: `大译名表 ${item.category || '常规'}` })
      candidates.set(key, list)
    }
  } catch (error) {
    console.warn(`没有读取作者大译名表 ${path}：${error instanceof Error ? error.message : String(error)}`)
  }
  return { candidates, version }
}

/** 一组候选里取分类最靠前的；那一档只剩一种中文就给 label，还有几种就 label 为 null（交给冲突清单，不替人挑）。 */
export const choose = (items) => {
  if (!items.length) return null
  const bestRank = Math.min(...items.map((x) => CATEGORY_RANK.get(x.category ?? '') ?? 99))
  const best = items.filter((x) => (CATEGORY_RANK.get(x.category ?? '') ?? 99) === bestRank)
  const values = [...new Set(best.map((x) => x.zh))]
  return { label: values.length === 1 ? values[0] : null, candidates: best }
}
