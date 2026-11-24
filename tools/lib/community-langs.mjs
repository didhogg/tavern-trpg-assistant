// 社区翻译模块：按 Foundry 同一套语言编号逐条翻好的语言模块（例如 FVTT-CN 的 5e_chn，翻 dnd5e）。
// 结算小窗语言文件工具（build-kernel-lang.mjs）同一编号优先用它，大译名表只补它没有的编号。
// 模块放在仓库外（不进仓库，只把生成结果放进插件），一模块一个目录：<目录>/<模块>/module.json + 语言文件 + source.json（来源、提交、许可证状况）。
// 目录取命令行 --community=…、环境变量 TAVERN_FOUNDRY_LANG_DIR、默认位置，三者按这个顺序。
// 认法只看模块自己的声明，不写死模块名：relationships 写着翻译哪个系统 / 模块（coreTranslation = 翻 Foundry 核心）；languages 里语言码或语言名对上要生成的语言。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEFAULT_DIR = '/Users/xxx/tavern-trpg-data-next/_upstream/foundry-lang'

export const communityDir = process.argv.find((arg) => arg.startsWith('--community='))?.slice('--community='.length) || process.env.TAVERN_FOUNDRY_LANG_DIR || DEFAULT_DIR

/** 语言文件可能是嵌套写法或点号平铺写法，统一摊平成「编号 → 文字」。 */
export function flatten(obj, path = '', out = {}) {
  for (const [k, v] of Object.entries(obj ?? {})) {
    const key = path ? `${path}.${k}` : k
    if (v && typeof v === 'object') flatten(v, key, out)
    else if (typeof v === 'string') out[key] = v
  }
  return out
}

/**
 * 读全部社区模块，按「被翻译的包」归组：包编号 → [{ module, texts（编号 → 文字）, from（来源说明）}]。
 * 目录不存在 = 没有社区翻译（不是错误）；单个模块读不了照实报出来。
 */
export async function loadCommunity({ lang, name }, dir = communityDir) {
  const byPackage = new Map()
  const entries = await readdir(dir, { withFileTypes: true }).catch((e) => {
    if (e?.code === 'ENOENT') { console.warn(`社区翻译目录不存在：${dir}，只用大译名表。`); return [] }
    throw e
  })
  for (const entry of entries.filter((x) => x.isDirectory())) {
    const root = join(dir, entry.name)
    const manifest = JSON.parse(await readFile(join(root, 'module.json'), 'utf8'))
    const language = (manifest.languages ?? []).find((l) => l.lang === lang || l.name === name)
    if (!language) continue
    // 翻哪个包看模块自己的声明：relationships 里的系统 / 模块，或 coreTranslation（翻 Foundry 核心，包编号记作 core）
    const targets = [...(manifest.relationships?.systems ?? []), ...(manifest.relationships?.requires ?? [])].map((r) => r.id).filter(Boolean)
    if (manifest.coreTranslation === true) targets.push('core')
    if (!targets.length) continue
    const texts = flatten(JSON.parse(await readFile(join(root, language.path), 'utf8')))
    const source = await readFile(join(root, 'source.json'), 'utf8').then(JSON.parse).catch(() => ({}))
    const from = `${manifest.id}${source.commit ? `@${source.commit.slice(0, 7)}` : ''}`
    for (const id of targets) {
      const list = byPackage.get(id) ?? []
      list.push({ module: manifest.id, texts, from })
      byPackage.set(id, list)
    }
  }
  return byPackage
}
