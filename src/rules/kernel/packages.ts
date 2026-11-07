// 包清单 → 服务器下发给客户端时的形状：清单里相对包目录的路径前面加上 systems/<id>/ 或 modules/<id>/。
// 官方客户端直接 fetch 这些路径；不加前缀时 lang/en.json 会取到核心语言文件，系统翻译整份缺失。
type Manifest = Record<string, unknown> & { id: string }
type PackageType = 'system' | 'module'

const PATH_LISTS = ['esmodules', 'scripts', 'styles'] as const

export function serverPackageData<T extends Manifest>(manifest: T, type: PackageType): T {
  const base = `${type}s/${manifest.id}/`
  const prefix = (path: string): string => /^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith(base) ? path : base + path.replace(/^\.?\//, '')
  const data: Record<string, unknown> = structuredClone(manifest)
  for (const key of PATH_LISTS) {
    const list = data[key]
    if (Array.isArray(list)) data[key] = list.map(entry => typeof entry === 'string' ? prefix(entry) : { ...entry, src: prefix(String(entry.src)) })
  }
  if (Array.isArray(data.languages)) data.languages = data.languages.map((l: { path: string }) => ({ ...l, path: prefix(l.path) }))
  return data as T
}
