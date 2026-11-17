// Plutonium owns the opening levels, option counts, category filters and source identities.
// The adapter supplies campaign-visible rows and reads the author's result without opening its dialogs.
/* eslint-disable @typescript-eslint/no-explicit-any -- Plutonium and Foundry do not ship types for these internals. */
import type { ExtraKind, ExtraPoolRow, ExtraPools, FrameExtra, FrameExtras } from '../build-options'
import type { BuildRow } from './commands-level'
import { plutoniumBuild } from './plutonium-build'

const g = globalThis as any
type Api = Record<string, any>
type Identify = (entry: any) => string
const idOf = (kind: ExtraKind): Identify => (entry) => g.UrlUtil.URL_TO_HASH_BUILDER[kind](entry)
const rowsById = (rows: ExtraPoolRow[], identify: Identify) => new Map(rows.map(row => [identify(row.entry), row]))
const progressions = [
  { field: 'featProgression', kind: 'feat', primer: 'DataPrimerFauxFeatureClassSubclassFeat' },
  { field: 'optionalfeatureProgression', kind: 'optionalfeature', primer: 'DataPrimerFauxFeatureClassSubclassOptionalfeature' },
] as const

/** Candidate-only settings are scoped to the synchronous author call on an already filtered pool. */
function campaignCandidates<T>(api: Api, run: () => T): T {
  const group = 'dataSources'
  const name = 'isGmUseBlocklist'
  const previous = api.Config.get(group, name)
  api.Config.setTemp(group, name, false, { isSkipPermissionCheck: true })
  try { return run() }
  finally { api.Config.setTemp(group, name, previous, { isSkipPermissionCheck: true }) }
}

function classFeatureRows(entry: any, kind: 'classFeature' | 'subclassFeature'): any[] {
  const unpack = kind === 'classFeature' ? g.DataUtil.class.unpackUidClassFeature : g.DataUtil.class.unpackUidSubclassFeature
  return (entry[`${kind}s`] ?? []).flat(Infinity).map((feature: any) => {
    const uid = feature?.[kind] ?? feature
    if (typeof uid !== 'string') return feature
    return { ...unpack.call(g.DataUtil.class, uid), ...(typeof feature === 'object' ? feature : {}), [kind]: uid }
  })
}

function classOptions(api: Api, row: BuildRow, pools: ExtraPools, level: number, out: FrameExtras, local: any) {
  const cls = structuredClone(row.entry)
  cls.classFeatures = classFeatureRows(cls, 'classFeature')
  cls.subclasses = []
  const features = api.Charactermancer_Class_Util.getAllFeatures(cls)
  const subclass = features.find((feature: any) => feature.gainSubclassFeature)
  if (subclass?.level === level) {
    const ownerIds = new Set([cls, local].filter(Boolean).map(id => g.UrlUtil.URL_TO_HASH_BUILDER.class(id)))
    const candidates = (pools.subclass ?? []).filter(candidate => [candidate.entry, candidate.local].filter(Boolean).some(sc =>
      ownerIds.has(g.UrlUtil.URL_TO_HASH_BUILDER.class({ name: sc!.className, source: sc!.classSource }))))
    out.extras.push({ id: `${row.refKey}|subclass|${level}`, kind: 'subclass', title: cls.subclassTitle ?? g.game.i18n.localize('DND5E.ADVANCEMENT.Subclass.Title'), count: 1, candidates: candidates.map(({ key }) => ({ key })) })
  }
}

/** Author primer calculates a group even when the campaign has zero candidates. Keep its count at that boundary. */
function progressionOptions(api: Api, row: BuildRow, pools: ExtraPools, level: number, out: FrameExtras) {
  const entry = row.entry
  for (const { field, kind, primer } of progressions) {
    if (!entry[field]?.length) continue
    const instance = new api[primer]()
    const identify = idOf(kind)
    const candidates = rowsById(pools[kind] ?? [], identify)
    const makeGroup = instance._addFauxFeatureFeatures_getFauxFeature
    let ordinal = 0
    instance._addFauxFeatureFeatures_getFauxFeature = function (...args: any[]) {
      const feature = makeGroup.apply(this, args)
      if (feature.level === level && args[5] > 0) {
        const required = args[6] as unknown[]
        if (required.length) out.blocked.push(`${feature.name}：这组包含固定选项，暂时无法在这里应用`)
        else out.extras.push({
          id: `${row.refKey}|${field}|${level}|${ordinal++}`, kind, title: feature.name, count: args[5],
          candidates: feature.linkedEntityInfos.flatMap(({ entity }: any) => {
            const candidate = candidates.get(identify(entity))
            return candidate ? [{ key: candidate.key }] : []
          }),
        })
      }
      return feature
    }
    const owner = { ...structuredClone(entry), subclasses: [] }
    if (row.prop === 'class') owner.classFeatures = classFeatureRows(owner, 'classFeature')
    if (row.prop === 'subclass') {
      owner.subclassFeatures = classFeatureRows(owner, 'subclassFeature')
      const cls = { name: owner.className, source: owner.classSource, subclasses: [owner] }
      campaignCandidates(api, () => instance.addFauxFeatureFeatures([cls], [...candidates.values()].map(({ entry }) => entry)))
    } else if (row.prop === 'class') {
      campaignCandidates(api, () => instance.addFauxFeatureFeatures([owner], [...candidates.values()].map(({ entry }) => entry)))
    }
  }
}

async function featOptions(api: Api, row: BuildRow, pool: ExtraPoolRow[], getModal: () => Promise<any>, out: FrameExtras) {
  const available = row.entry.feats
  if (api.StatGenUtilAdditionalFeats.isNoChoice(available)) return
  if (available.length !== 1) {
    out.blocked.push('专长有多套备选方案，建卡暂时无法在方案间切换')
    return
  }
  const modal = await getModal()
  const feats = rowsById(pool, idOf('feat'))
  const chooser = new api.Charactermancer_AdditionalFeatsSelect({
    available, modalFilterFeats: modal, modalFilterSpells: {}, availableProficiencyManager: {},
  })
  // Read the filter/count at the point the author passes it to the picker.
  chooser._render_renderPtStatic = () => undefined
  chooser._render_renderPtChooseFromFilter = ({ count, filterExpression, titleNote, featsAdditionType }: any) => {
    const results: Array<{ name: string; source: string; category?: string }> = modal.getEntitiesMatchingFilterExpression({ filterExpression })
    const category = titleNote ? [...new Set(results.map(entry => entry.category).filter((code): code is string => !!code))] : []
    const title = g.Parser.getPropDisplayName('feat')
    const labels = [
      { at: ['Parser', 'CAT_ID_TO_FULL', String(g.Parser.CAT_ID_FEAT)], text: title },
      ...category.map(code => ({ at: ['Parser', 'FEAT_CATEGORY_TO_FULL', code], text: g.Parser.featCategoryToFull(code) })),
    ]
    out.extras.push({
      id: `${row.refKey}|feats|${featsAdditionType}`, kind: 'feat', title, count, labels,
      candidates: results.flatMap(entry => {
        const candidate = feats.get(idOf('feat')(entry))
        return candidate ? [{ key: candidate.key }] : []
      }),
    })
  }
  const stage = api.veE(document.createElement('div'))
  chooser._hk_ixSet_renderPts({ stgGroupLeft: stage, stgGroupRight: stage, featSet: available[0] })
}

/** Evaluate the faithful native subset. Keep any remaining author conditions attached to their own option. */
function applyPrerequisites(api: Api, group: FrameExtra, actor: any, entries: Map<string, ExtraPoolRow>): void {
  group.candidates = group.candidates.filter(candidate => {
    const entry = entries.get(candidate.key)?.entry
    const prerequisites = entry?.prerequisite
    if (!Array.isArray(prerequisites) || !prerequisites.length) return true
    const [condition] = prerequisites
    if (prerequisites.length === 1 && typeof condition?.level === 'number' && Object.keys(condition).length === 1) {
      const level = api.UtilDataConverter.getPrerequisiteLevelNumber({ prereqs: prerequisites })
      const item = new g.CONFIG.Item.documentClass({ name: entry?.name, type: 'feat', system: { prerequisites: { level } } })
      return item.system.assertPrerequisites(actor) === true
    }
    candidate.requirement = g.Renderer.utils.prerequisite.getText(prerequisites, { isSkipPrefix: true }) || JSON.stringify(prerequisites)
    return true
  })
}

export async function describeBuildExtras(rows: BuildRow[], pools: ExtraPools, actor: any, local: Record<string, unknown>): Promise<Array<FrameExtras & { refKey: string }>> {
  if (!plutoniumBuild) throw Error('此版本 Plutonium 缺少建卡选择入口')
  const api = plutoniumBuild
  const feats = pools.feat ?? []
  const entries = new Map(Object.values(pools).flat().map(row => [row.key, row]))
  let modal: Promise<any> | undefined
  const getModal = () => modal ??= api.Charactermancer_AdditionalFeatsSelect._pGetUserInput_pGetModalFilterFeats({
    // This picker uses category only. Author prerequisites are checked separately on the complete original objects.
    allData: { feat: feats.map(({ entry: { prerequisite: _prerequisite, ...entry } }) => entry) },
  })
  const out: Array<FrameExtras & { refKey: string }> = []
  for (const row of rows) {
    const group: FrameExtras & { refKey: string } = { refKey: row.refKey, extras: [], blocked: [] }
    // This command previews a new character. Author progression can emit later levels; only this class's first level is due here.
    const level = 1
    if (row.prop === 'class') classOptions(api, row, pools, level, group, local[row.refKey])
    if (row.prop === 'class' || row.prop === 'subclass') progressionOptions(api, row, pools, level, group)
    if (row.entry.feats?.length) await featOptions(api, row, feats, getModal, group)
    for (const extra of group.extras) applyPrerequisites(api, extra, actor, entries)
    out.push(group)
  }
  return out
}
