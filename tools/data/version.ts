import { compareVersions } from '../../src/core/semver'

export interface PublishedPack {
  version: string
  sha256: string
}

export interface Published {
  formatVersion: 1
  packs: Record<string, PublishedPack>
}

export interface VersionCheck {
  errors: string[]
  warnings: string[]
}

/** D1 §6 第 10 步：内容变了而版本没变 → 失败；版本变了而内容没变 → 警告。 */
export function checkPublished(current: Array<{ id: string; version: string; sha256: string }>, published: Published): VersionCheck {
  const errors: string[] = []
  const warnings: string[] = []
  for (const pack of current) {
    const old = published.packs[pack.id]
    if (!old) continue
    const cmp = compareVersions(pack.version, old.version)
    if (cmp === 0 && old.sha256 !== pack.sha256) errors.push(`${pack.id} 内容变了但版本仍是 ${pack.version}；请提升版本号`)
    if (cmp < 0) errors.push(`${pack.id} 的版本 ${pack.version} 低于已发布的 ${old.version}`)
    if (cmp > 0 && old.sha256 === pack.sha256) warnings.push(`${pack.id} 版本升到 ${pack.version}，但内容与 ${old.version} 相同`)
  }
  return { errors, warnings }
}
