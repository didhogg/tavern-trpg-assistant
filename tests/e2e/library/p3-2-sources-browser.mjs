// 候选来源匹配：使用 Plutonium 原匹配器与原编号生成器，不等于安装或执行效果。
export async function probeSourceCandidates({ packs, paa, cpr = [] }) {
  const C = globalThis.__probeClasses; const corpus = globalThis.__probeCorpus
  const originalPacks = game.packs
  game.packs = new OfficialFoundry.utils.Collection(packs.map(pack => [pack.collection, pack]))
  const rows = []; const errors = []
  const providers = {
    classFeature: () => C.UtilEntityClassSubclassFeature.getCompendiumCacheKeyProvider(),
    subclassFeature: () => C.UtilEntityClassSubclassFeature.getCompendiumCacheKeyProvider(),
    optionalfeature: () => C.UtilEntityOptionalfeature.getCompendiumCacheKeyProvider(),
    race: () => C.UtilEntityRace.getCompendiumCacheKeyProvider(),
    raceFeature: () => C.UtilEntityRaceFeature.getCompendiumCacheKeyProvider(),
    background: () => C.UtilEntityBackground.getCompendiumCacheKeyProvider(),
    monsterFeature: () => C.UtilEntityCreatureFeature.getCompendiumCacheKeyProvider(),
    item: () => new C.CompendiumCacheKeyProviderItem(),
  }
  const converters = {
    class: C.DataConverterClass, subclass: C.DataConverterClass,
    classFeature: C.DataConverterClassSubclassFeature, subclassFeature: C.DataConverterClassSubclassFeature,
    feat: C.DataConverterFeat, optionalfeature: C.DataConverterOptionalfeature, spell: C.DataConverterSpell,
    item: C.DataConverterItem, race: C.DataConverterRace, raceFeature: C.DataConverterRaceFeature,
    background: C.DataConverterBackground, monster: C.DataConverterCreature, monsterFeature: C.DataConverterCreatureFeature,
  }
  try {
    for (const [kind, entries] of Object.entries(corpus)) {
      const provider = providers[kind]?.() ?? new C.CompendiumCacheKeyProviderGeneric()
      let selected
      try { selected = C.CompendiumCacheUtil.getAdditionalDataCompendiums({ entityType: kind === 'subclassFeature' ? 'classFeature' : kind === 'monsterFeature' ? 'monster' : kind }) }
      catch (e) { errors.push({ kind, stage: 'select-packs', error: String(e.message) }); selected = [] }
      const index = new Map()
      for (const pack of selected) for (const doc of pack.docs) {
        try {
          const key = provider.getDocCacheId({ doc, rulesVersion: '2014' })
          const list = index.get(key) ?? []; list.push({ pack: pack.collection, id: doc._id, name: doc.name, type: doc.type, effects: doc.effects?.length ?? 0, activities: Object.keys(doc.system?.activities ?? {}).length, uses: doc.system?.uses?.max ?? null }); index.set(key, list)
        } catch (e) { errors.push({ kind, stage: 'pack-key', name: doc.name, error: String(e.message) }) }
      }
      // CPR：按条目类别取对应文档类型，用同一个作者编号生成器建索引
      const cprTypes = kind === 'spell' ? ['spell'] : kind === 'item' ? ['weapon', 'equipment', 'consumable', 'container', 'loot', 'tool'] : ['classFeature', 'subclassFeature', 'feat', 'optionalfeature', 'raceFeature', 'monsterFeature'].includes(kind) ? ['feat'] : []
      const cprIndex = new Map()
      for (const pack of cpr) for (const doc of pack.docs) {
        if (!cprTypes.includes(doc.type)) continue
        try {
          const key = provider.getDocCacheId({ doc, rulesVersion: '2014' })
          const changes = (doc.effects ?? []).flatMap(e => e.system?.changes ?? e.changes ?? [])
          const midi = doc.flags?.['midi-qol'] ?? {}
          const list = cprIndex.get(key) ?? []
          list.push({ pack: pack.collection, id: doc._id, name: doc.name, type: doc.type, effects: doc.effects?.length ?? 0, effectChanges: changes.length, changeKeys: [...new Set(changes.map(c => c.key))], activities: Object.keys(doc.system?.activities ?? {}).length, macros: Object.values(doc.flags?.cat?.macros ?? {}).flat().map(m => m.identifier ?? m), midiConditions: Object.entries(midi).filter(([k, v]) => /Condition$/.test(k) && typeof v === 'string' && v.trim()).map(([k, v]) => [k, v]) })
          cprIndex.set(key, list)
        } catch (e) { errors.push({ kind, stage: 'cpr-key', name: doc.name, error: String(e.message) }) }
      }
      for (const ent of entries) {
        const row = { kind, name: ent.name, source: ent.source, hash: UrlUtil.URL_TO_HASH_BUILDER[ent.__prop ?? kind]?.(ent), srdEligible: !!(ent.srd || ent.srd52), srd: [], paa: [] }
        try {
          if (row.srdEligible) {
            const unique = new Map()
            for (const lookupMeta of provider.getLookupMetas(ent)) {
              const key = provider.getLookupMetaCacheId({ lookupMeta, entity: ent })
              for (const hit of index.get(key) ?? []) unique.set(`${hit.pack}.${hit.id}`, hit)
            }
            row.srd = [...unique.values()]
          }
          if (cprTypes.length) {
            const unique = new Map()
            for (const lookupMeta of provider.getLookupMetas(ent)) {
              const key = provider.getLookupMetaCacheId({ lookupMeta, entity: ent })
              for (const hit of cprIndex.get(key) ?? []) unique.set(`${hit.pack}.${hit.id}`, hit)
            }
            row.cpr = [...unique.values()]
          }
          const S = converters[kind]?._SideDataInterface
          if (S) {
            const opts = S._getResolvedOpts({ ent })
            for (const source of paa) for (const candidate of source.json[opts.propJson] ?? []) {
              if (C.SideDataSourceBase._pGetSideLoadedMatch_fnMatch(opts.propsMatch, ent, candidate)) row.paa.push({ file: source.path, data: candidate })
            }
          }
        } catch (e) { row.error = String(e.message) }
        rows.push(row)
      }
    }
  } finally { game.packs = originalPacks }
  return { rows, errors, note: '仅候选匹配；未执行 PAA 依赖过滤、SRD 活动或 DDB 提示，不能据此累计完整自动化覆盖率' }
}
