// 结算小窗的语言包：官方客户端按「系统 / 模块清单 languages 里登记的文件」加载界面文字，缺哪个键自动回退英文。
// 声明文件 vendor/foundry/lang-packs.json 由 tools/build-kernel-lang.mjs 从作者译名表生成（有哪些语言、每包哪些文件、内容摘要）。
// 这里只按声明登记：语言码来自战役的资料集登记（library/sources.ts 的 lang），不写死「中文」。
// 没有对应语言包（英文战役、或没生成）就仍是 en.core，行为和以前完全一样。
/* eslint-disable @typescript-eslint/no-explicit-any -- 包清单是官方原始结构。 */

export interface LangPackFile { package: 'system' | 'module'; id: string; path: string; sha256: string }
export interface LangPack { name: string; hash: string; files: LangPackFile[] }
export interface LangPacks { packs: Record<string, LangPack> }

/** 读声明；文件不存在 = 没有任何语言包（不是错误）。其他读取失败照实抛出。 */
export async function readLangPacks(pluginRoot: URL, fetchImpl: typeof fetch): Promise<LangPacks> {
  const response = await fetchImpl(new URL('vendor/foundry/lang-packs.json', pluginRoot))
  if (response.status === 404) return { packs: {} }
  if (!response.ok) throw new Error(`读取结算内核语言包声明失败（${response.status}）`)
  const parsed = await response.json() as Partial<LangPacks>
  return { packs: parsed.packs ?? {} }
}

/**
 * 按语言把语言包登记进系统 / 模块清单（原地改刚读出来的清单），返回小窗的语言设置和语言包摘要（进内核指纹）。
 * 没有这个语言的包：不动清单，回 en.core、没有摘要。
 */
export function applyLangPack(lang: string, packs: LangPacks, system: any, modules: any[]): { language: string; packHash?: string } {
  const pack = packs.packs[lang]
  if (!pack) return { language: 'en.core' }
  for (const file of pack.files) {
    const target = file.package === 'system' ? (system.id === file.id ? system : null) : modules.find((m) => m.id === file.id)
    if (!target) continue
    const languages: any[] = target.languages ??= []
    if (!languages.some((l) => l.lang === lang)) languages.push({ lang, name: pack.name, path: file.path, flags: {} })
  }
  return { language: `${lang}.core`, packHash: pack.hash }
}
