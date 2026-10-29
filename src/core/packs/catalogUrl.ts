import type { Settings } from '../../schemas/campaign'

/** 数据仓库目录地址：设置里的地址；测试页可用 `__TRPG_M2_CATALOG_URL__` 指向本地模拟目录。 */
export function resolveCatalogUrl(settings: Pick<Settings, 'catalogUrl'>): string {
  const override = (globalThis as { __TRPG_M2_CATALOG_URL__?: string }).__TRPG_M2_CATALOG_URL__
  if (!override) return settings.catalogUrl
  return typeof location !== 'undefined' ? new URL(override, location.href).toString() : override
}
