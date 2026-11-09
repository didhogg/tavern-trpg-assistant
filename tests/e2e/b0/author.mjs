// This is test orchestration, not a replacement parser. Content is never mapped.
export async function collect(source, baseUrl) {
  const { DataLoaderConst } = await import('/author/js/utils-dataloader/utils-dataloader-const.js')
  Renderer.get().setBaseUrl(baseUrl)
  await PrereleaseUtil.pInit()
  await BrewUtil2.pInit()
  const result = { source, groups: {}, corpora: {}, coverage: [], errors: [] }
  for (const loader of DataLoader._DATA_TYPE_LOADER_LIST) {
    const props = loader.constructor.PROPS
    // Author's book/adventure loaders require one source, not SOURCE_SITE_ALL.
    if (props.some(p => p === 'bookData' || p === 'adventureData')) {
      const prop = props[0]
      try {
        const index = await DataUtil.loadJSON(`${baseUrl}data/${loader._filename}`)
        const match = index[prop].find(it => SourceUtil.getEntitySource(it).toLowerCase() === source.toLowerCase())
        if (match) {
          const hash = UrlUtil.URL_TO_HASH_BUILDER[loader.constructor.PAGE](match)
          result.corpora[prop] = await DataLoader.pCacheAndGet(loader.constructor.PAGE, source, hash, { isRequired: true })
        }
        result.coverage.push({ props, strategy: 'single-source-corpus', matched: Boolean(match) })
      } catch (error) { result.errors.push({ props, message: error.stack }) }
      continue
    }
    for (const prop of props) {
      if (DataLoaderConst.RE_PROP_RAW_PREFIX.test(prop)) {
        result.coverage.push({ prop, strategy: 'author-raw-stage-not-final-output' })
        continue
      }
      try {
        const all = await DataLoader.pCacheAndGetAllSite(prop)
        result.groups[prop] = (all ?? []).filter(it => SourceUtil.getEntitySource(it)?.toLowerCase() === source.toLowerCase())
        result.coverage.push({ prop, strategy: 'author-property-entry', all: all?.length ?? null, selected: result.groups[prop].length })
      } catch (error) { result.errors.push({ prop, message: error.stack }) }
    }
  }
  return result
}
