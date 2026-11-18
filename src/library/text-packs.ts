// 所有业务共用的语言文件读取：按现有包清单和生成语言清单读，不启动结算窗口。
import { CODE_SETS } from './sources'

type PackManifest = { languages?: Array<{ lang: string; path: string }> }
const flatten = (obj: Record<string, unknown>, prefix = '', out: Record<string, string> = {}) => {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out[path] = value
    else if (value && typeof value === 'object') flatten(value as Record<string, unknown>, path, out)
  }
  return out
}

export class TextPacks {
  private readonly dictionaries = new Map<string, Promise<Record<string, string>>>()
  constructor(private readonly root: URL, private readonly fetchImpl: typeof fetch = fetch) {}
  private async json<T>(path: string): Promise<T> {
    const response = await this.fetchImpl.call(globalThis, new URL(`vendor/foundry/${path}`, this.root))
    if (!response.ok) throw new Error(`读取显示语言文件失败（${response.status}）：${path}`)
    return response.json() as Promise<T>
  }
  private dictionary(lang: string): Promise<Record<string, string>> {
    const existing = this.dictionaries.get(lang)
    if (existing) return existing
    const loading = (async () => {
      const manifest = await this.json<{ system: string; modules: Record<string, string> }>('manifest.json')
      const folders = [`systems/${manifest.system.split(' ')[0]}`, ...Object.keys(manifest.modules).map(id => `modules/${id}`)]
      const files: string[] = []
      if (lang === 'en') {
        files.push('lang/en.json')
        const packages = await Promise.all(folders.map((folder, i) => this.json<PackManifest>(`${folder}/${i === 0 ? 'system' : 'module'}.json`)))
        packages.forEach((pkg, i) => { const en = pkg.languages?.find(l => l.lang === 'en'); if (en) files.push(`${folders[i]}/${en.path}`) })
      } else {
        const declared = await this.json<{ packs: Record<string, { files: Array<{ package: string; id: string; path: string }> }> }>('lang-packs.json')
        const allowed = new Set(folders)
        for (const file of declared.packs[lang]?.files ?? []) {
          const folder = `${file.package}s/${file.id}`
          if (allowed.has(folder)) files.push(`${folder}/${file.path}`)
        }
      }
      const rows = await Promise.all(files.map(file => this.json<Record<string, unknown>>(file)))
      return Object.assign({}, ...rows.map(row => flatten(row))) as Record<string, string>
    })()
    this.dictionaries.set(lang, loading)
    loading.catch(() => { if (this.dictionaries.get(lang) === loading) this.dictionaries.delete(lang) })
    return loading
  }
  async resolve(codeSet: string, keys: string[]): Promise<Array<string | null>> {
    const lang = CODE_SETS[codeSet]?.lang
    if (!lang) throw new Error(`未登记的资料语言：${codeSet}`)
    const texts = await this.dictionary(lang)
    return keys.map(key => texts[key] ?? null)
  }
}
