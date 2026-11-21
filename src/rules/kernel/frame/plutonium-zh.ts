import { sha256Hex } from '../../../core/hash'

/** Optional local build. Validate both files before executing any of the generated JavaScript. */
export async function readPrivatePlutoniumZh(original: string, folder: URL, fetchImpl = fetch): Promise<string | null> {
  try {
    const response = await fetchImpl(new URL('fingerprints.json', folder), { cache: 'no-store' })
    if (response.status === 404) return null
    if (!response.ok) throw new Error(`读取中文构建指纹失败（${response.status}）`)
    const fingerprint = await response.json() as { original?: string; localized?: string }
    if (fingerprint.original !== sha256Hex(original)) throw new Error('私人完整版已变化')
    const localized = await fetchImpl(new URL('Bundle.js', folder), { cache: 'no-store' })
    if (!localized.ok) throw new Error(`读取中文构建失败（${localized.status}）`)
    const text = await localized.text()
    if (fingerprint.localized !== sha256Hex(text)) throw new Error('中文构建文件与指纹不匹配')
    return text
  } catch (error) {
    console.warn('建卡使用私人完整版原文。可运行 npm run gen:plutonium-zh 重生成中文构建。', error)
    return null
  }
}
