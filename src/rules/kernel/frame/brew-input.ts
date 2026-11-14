// 照 Plutonium 的 BrewUtil2._pGetBrewProcessed_ 先合文件、再展开；试算不安装包里的屏蔽清单。
import type { ExcludedBrew, PreparedBrew } from '../brews'
import { canProvide, requirementsOf } from '../../../library/brew-health'

export interface KernelBrewReport {
  loaded: string[]
  flattened: number
  excluded: ExcludedBrew[]
}

const errorText = (e: unknown) => e instanceof Error ? e.message : String(e)

export async function selectBrews(
  brews: PreparedBrew[],
  official: Set<string>,
  check: (group: PreparedBrew[]) => Promise<string | null>,
): Promise<{ accepted: PreparedBrew[]; errors: Map<string, string> }> {
  const idOf = (brew: PreparedBrew) => brew.pack.docIdLocal
  const errors = new Map<string, string>()
  const fullError = await check(brews)
  if (fullError === null) return { accepted: brews, errors }

  // 给候选包带上仍能提供实际类别/编号的依赖。先用已经通过的提供者，再试其他已装包。
  const collect = (root: PreparedBrew, accepted: ReadonlySet<PreparedBrew>, unavailable: ReadonlySet<PreparedBrew>) => {
    const group = new Set(accepted)
    const add = (brew: PreparedBrew): void => {
      if (group.has(brew)) return
      group.add(brew)
      for (const req of requirementsOf(brew.pack)) {
        if (canProvide(req, official, [...group].map((b) => b.pack))) continue
        const provider = brews.find((b) => !unavailable.has(b) && canProvide(req, official, [b.pack]))
        if (provider) add(provider)
      }
    }
    add(root)
    return brews.filter((brew) => group.has(brew))
  }

  // 先识别单独带齐依赖也不通过的包。逐个加回时可复用已经通过的替代提供者。
  const rejected = new Set<PreparedBrew>()
  for (const brew of brews) {
    const error = await check(collect(brew, new Set(), new Set()))
    if (error !== null) {
      rejected.add(brew)
      errors.set(idOf(brew), error)
    }
  }
  let accepted = new Set<PreparedBrew>()
  const tryAdd = async (brew: PreparedBrew): Promise<void> => {
    if (accepted.has(brew)) return
    const group = collect(brew, accepted, rejected)
    const error = await check(group)
    if (error !== null) {
      errors.set(idOf(brew), error)
      return
    }
    accepted = new Set(group)
    for (const added of group) errors.delete(idOf(added))
  }
  for (const brew of brews) if (!rejected.has(brew)) await tryAdd(brew)
  for (const brew of brews) if (rejected.has(brew)) await tryAdd(brew)
  return { accepted: brews.filter((brew) => accepted.has(brew)), errors }
}

/** 只在结算小窗自己的内存里放作者包对象。pSetBrew 也让跨包依赖走作者自己的取数入口。 */
export async function loadBrews(brews: PreparedBrew[], itemMasteries: unknown[]): Promise<KernelBrewReport> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Plutonium 的 JS 全局对象
  const { BrewUtil2: manager, DataUtil: data, Parser: parser, Renderer: renderer } = globalThis as any
  // 作者读取包时会先初始化迁移器，合并入口依赖这个顺序。
  await manager.pGetBrew()
  // 结算只读这次快照。作者若找不到已安装的包，返回本地空目录，不去远端补包。
  data.brew.pLoadSourceIndex = async () => ({})
  data.prerelease.pLoadSourceIndex = async () => ({})
  const item = renderer.item
  await item.pPopulatePropertyAndTypeReference()
  const siteVariants = await item._pGetCacheSiteGenericVariants()
  const referenceKeys = ['_propertyMap', '_typeMap', 'entryMap', '_additionalTypeEntriesMap', '_masteryMap'] as const
  const references = referenceKeys.map((key) => item[key])
  const copyLoaders = new Set(Object.values(data).filter(
    (loader): loader is { pMergeCopy: (...args: never[]) => unknown; _mergeCache?: unknown } =>
      typeof (loader as { pMergeCopy?: unknown } | null)?.pMergeCopy === 'function',
  ))
  const check = async (group: PreparedBrew[]): Promise<string | null> => {
    const docs = structuredClone(group.map((brew) => brew.doc))
    const ident = 'trpg-kernel-brew-check'
    // 作者按类别缓存父条目。试过的包被排除后，它的父条目也必须从下一次试算里消失。
    const copyCache = [...copyLoaders].map((loader) => [loader, loader._mergeCache] as const)
    const pending = new Set<Promise<unknown>>()
    const loaders = ['pLoadByMeta', '_pDoMetaMerge_handleCopyProp'] as const
    const originals = loaders.map((key) => [key, data[key]] as const)
    try {
      for (const [loader] of copyCache) loader._mergeCache = {}
      for (const [key, original] of originals) {
        data[key] = (...args: unknown[]) => {
          const result = original.apply(data, args)
          if (result instanceof Promise) {
            pending.add(result)
            const settled = () => { pending.delete(result) }
            void result.then(settled, settled)
          }
          return result
        }
      }
      await manager.pSetBrew(docs)
      const merged = manager._pGetBrewProcessed_getMergedOutput({ cpyBrews: docs })
      data._mutAddProps(merged)
      await data._pDoMetaMerge(ident, merged)
      // 作者的 _verifyMerged 会在 setTimeout 里报错。此处在发布给导入器前把同样的检查交给调用者。
      for (const [prop, entries] of Object.entries(merged)) {
        if (!Array.isArray(entries)) continue
        const unresolved = entries.find((entry) => entry?._copy)
        if (unresolved) return `${prop}：${unresolved.name ?? ''} 的 _copy 没有展开（${unresolved._copy.source ?? ''}）`
      }
      // 转职等导入器会预读自制物品。用作者自己的读取步骤提前检查，避免出错后卡住全类别。
      referenceKeys.forEach((key, index) => { item[key] = structuredClone(references[index]) })
      const previousVariants = item._pGettingSiteGenericVariants
      item._pGettingSiteGenericVariants = Promise.resolve(structuredClone(siteVariants))
      item.addPrereleaseBrewPropertiesAndTypesFrom({ data: { itemMastery: itemMasteries } })
      try {
        await item.pGetSiteUnresolvedRefItemsFromPrereleaseBrew({ brew: merged })
      } finally {
        item._pGettingSiteGenericVariants = previousVariants
      }
      return null
    } catch (e) {
      return errorText(e)
    } finally {
      // 作者并行合并多个类别。一处先失败时，等其他取数与复制停稳才换下一组包。
      while (pending.size) await Promise.allSettled(pending)
      for (const [key, original] of originals) data[key] = original
      delete data._merged[ident]
      referenceKeys.forEach((key, index) => { item[key] = references[index] })
      for (const [loader, cache] of copyCache) {
        if (cache === undefined) delete loader._mergeCache
        else loader._mergeCache = cache
      }
    }
  }

  const official = new Set(Object.keys(parser.SOURCE_JSON_TO_FULL).map((source) => source.toLowerCase()))
  const { accepted, errors } = await selectBrews(brews, official, check)
  const docs = accepted.map((brew) => brew.doc)
  await manager.pSetBrew(docs)
  if (docs.length) item.addPrereleaseBrewPropertiesAndTypesFrom({ data: { itemMastery: itemMasteries } })
  const lockToken = await manager._LOCK.pLock()
  try {
    await manager._pGetBrewProcessed_({ lockToken })
  } finally {
    manager._LOCK.unlock()
  }
  return {
    loaded: docs.map((doc) => doc.head.docIdLocal),
    flattened: accepted.reduce((total, brew) => total + brew.flattened, 0),
    excluded: brews.flatMap(({ pack, failures }) => {
      const error = errors.get(pack.docIdLocal)
      if (error === undefined) return []
      const details = failures.map(({ name, reason }) => `${name}：${reason}`)
      return [{ docIdLocal: pack.docIdLocal, filename: pack.filename, sources: pack.sources, reason: [error, ...details].join('\n') }]
    }),
  }
}
