// 随插件自带的核心 SRD 资料包检查（P4 向导的唯一资料阻断点）。
// 这些包是构建时由 dnd5e 作者 YAML 原样转成、放在 vendor/foundry/packs/ 的（tools/vendor-kernel-data.mjs），结算内核直接读；
// 不需要联网下载。正常情况下一定在；用户删了 / 装坏了才会缺，缺了结算内核起不来，所以要挡住开局。
// 清单不写死：用结算内核自己读的 vendor/foundry/manifest.json 和系统自己声明的 packs（systems/<系统>/system.json），每个包对应 packs/<系统>.<包名>.json。
export interface CorePackStatus {
  ok: boolean
  /** 例：dnd5e。 */
  system: string
  total: number
  /** 缺的文件（相对 vendor/foundry/）。 */
  missing: string[]
}

export interface CorePackOptions { pluginRoot: URL; fetchImpl?: typeof fetch }

async function readJson<T>(root: URL, path: string, fetchImpl: typeof fetch): Promise<T | null> {
  try {
    const response = await fetchImpl(new URL(`vendor/foundry/${path}`, root))
    return response.ok ? ((await response.json()) as T) : null
  } catch {
    return null
  }
}

/** 文件在不在：先 HEAD（不下载 38MB）；酒馆不支持 HEAD 时用只取 1 字节的范围请求；404 = 没有；读不到 = 也算没有。 */
async function exists(root: URL, path: string, fetchImpl: typeof fetch): Promise<boolean> {
  const url = new URL(`vendor/foundry/${path}`, root)
  try {
    const head = await fetchImpl(url, { method: 'HEAD' })
    if (head.ok) return true
    if (head.status === 404 || head.status === 410) return false
    const part = await fetchImpl(url, { headers: { Range: 'bytes=0-0' } })
    return part.ok
  } catch {
    return false
  }
}

export async function checkCorePacks({ pluginRoot, fetchImpl = fetch }: CorePackOptions): Promise<CorePackStatus> {
  const manifest = await readJson<{ system: string }>(pluginRoot, 'manifest.json', fetchImpl)
  if (!manifest) return { ok: false, system: '', total: 0, missing: ['manifest.json'] }
  const system = manifest.system.split(' ')[0]
  const info = await readJson<{ packs?: Array<{ name: string }> }>(pluginRoot, `systems/${system}/system.json`, fetchImpl)
  if (!info?.packs) return { ok: false, system, total: 0, missing: [`systems/${system}/system.json`] }
  const files = info.packs.map((p) => `packs/${system}.${p.name}.json`)
  const present = await Promise.all(files.map((f) => exists(pluginRoot, f, fetchImpl)))
  const missing = files.filter((_, i) => !present[i])
  return { ok: missing.length === 0, system, total: files.length, missing }
}
