/** 收集数据里引用到的图片（{ $asset: 哈希 }），导出存档时把这些图片一起打包。 */
export function collectAssetHashes(value: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectAssetHashes(item, out)
  } else if (value && typeof value === 'object') {
    const obj = value as { $asset?: unknown }
    if (typeof obj.$asset === 'string') out.add(obj.$asset)
    for (const item of Object.values(obj)) collectAssetHashes(item, out)
  }
  return out
}
