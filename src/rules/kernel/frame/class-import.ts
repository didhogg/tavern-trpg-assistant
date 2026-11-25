// 职业 / 子职业导入到人物：照作者自己的升级整段搬过来（Plutonium SheetLevelUpButtonManager._pHandleClick_levelUpLegacy 与 _addNew）。
//   作者的做法：等级由升级按钮定好（ImportOpts.levels，作者就不再问「选择职业等级」）；还没有子职业、目标等级到了子职业门槛
//   （职业特性里 gainSubclassFeature 那一项的等级）就让玩家选子职业，选了和职业在同一次导入里一起进（DataPrimer 把子职业并进职业）。
//   已有子职业的职业升级时，作者把现有的子职业一起带上（子职业在新等级的特性才会跟着来）。
//   兼职（人物已有别的职业、新加一个）：作者从 1 级加、熟练按兼职给（_foundryStartingProficiencyMode = MODE_MULTICLASS）。
//   给已有职业补选子职业：作者的子职业导入，等级 = 这个职业现在的各级（不改职业等级、不加生命）。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者运行时对象没有类型声明 */
import { plutoniumBuild } from './plutonium-build'
import { removeOfficially } from './commands-add'
import { revokeGrants } from './import-grants'

const g = globalThis as any
const range = (from: number, to: number): number[] => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)

/** 这次怎么导入（主线定好交进来）：levels = 导入到这个职业的哪几级；subclass = 一起带进的子职业（库条目）；不给 = 作者照常问。 */
/** fresh = 重新选第 1 级（只有这一个职业、只有 1 级时）：先按官方拿掉这个职业和它的子职业、收回作者导入记录里的，再按 1 级重新导入（子职业照旧带上）。 */
export interface ClassHow { levels?: number[]; subclass?: { prop: string; entry: any } | null; fresh?: boolean }

/** 库里的职业 / 子职业条目 → 作者的原始数据（作者升级也是先按编号读原始数据再整理）。 */
async function rawClass(entry: any): Promise<any> {
  const U = g.UrlUtil
  const out = await g.DataLoader.pCacheAndGet('raw_class', entry.source, U.URL_TO_HASH_BUILDER[U.PG_CLASSES]({ name: entry.name, source: entry.source }), { isCopy: true })
  if (!out) throw Error(`作者资料里找不到职业「${entry.name}」（${entry.source}）`)
  return out
}
async function rawSubclass(entry: any): Promise<any> {
  const out = await g.DataLoader.pCacheAndGet('raw_subclass', entry.source, g.UrlUtil.URL_TO_HASH_BUILDER.subclass({ name: entry.name, shortName: entry.shortName, source: entry.source, className: entry.className, classSource: entry.classSource }), { isCopy: true })
  if (!out) throw Error(`作者资料里找不到子职业「${entry.name}」（${entry.source}）`)
  return out
}
/** 作者算「几级能选子职业」的同一个式子（_pHandleClick_levelUpLegacy：职业特性里带 gainSubclassFeature 的最低等级）。 */
function subclassLevelOf(cls: any): number | null {
  const levels = (cls.classFeatures ?? []).filter((f: any) => f?.gainSubclassFeature && f.classFeature)
    .map((f: any) => Number(g.DataUtil.class.unpackUidClassFeature(f.classFeature).level))
  return levels.length ? Math.min(...levels) : null
}
/** 人物身上和这个职业对上的职业物品（作者自己的对法）。 */
const existingOf = (a: any, cls: any): any | null => plutoniumBuild!.Charactermancer_Class_Util.getExistingClassItems(a, cls)?.[0] ?? null
const subclassItemOf = (a: any, classItem: any): any | null => a.items.find((i: any) => i.type === 'subclass' && i.system?.classIdentifier === classItem.system?.identifier) ?? null
const totalLevel = (a: any): number => a.items.filter((i: any) => i.type === 'class').reduce((n: number, i: any) => n + Number(i.system?.levels ?? 0), 0)

/** 加 / 升这个职业之前要知道的（主线据此决定问不问目标等级、问不问子职业；只读）。 */
export async function classPlan(a: any, row: { prop: string; entry: any }) {
  if (row.prop === 'subclass') {
    const cls = await rawClass({ name: row.entry.className, source: row.entry.classSource })
    const item = existingOf(a, cls)
    return { kind: 'subclass' as const, classId: item?.id ?? null, classLevel: Number(item?.system?.levels ?? 0), total: totalLevel(a), className: cls.name, classSource: cls.source }
  }
  const cls = await rawClass(row.entry)
  const item = existingOf(a, cls)
  const sub = item ? subclassItemOf(a, item) : null
  return {
    kind: 'class' as const, classId: item?.id ?? null, classLevel: Number(item?.system?.levels ?? 0), hasSubclass: !!sub, total: totalLevel(a),
    subclassLevel: subclassLevelOf(cls), className: cls.name, classSource: cls.source,
  }
}

/**
 * 按定好的等级 / 子职业跑作者的职业导入（交给问答桥的那一段）。how 都没给 = 返回 null，照旧走作者的条目导入（作者自己问等级）。
 * importer = 作者的职业导入器（pGetImporter({ prop: 'class' })）。
 */
export async function classImportRun(a: any, row: { prop: string; entry: any }, how: ClassHow, importer: any, ImportOpts: any): Promise<(() => Promise<any>) | null> {
  if (!how.levels?.length && !how.subclass) return null
  const B = plutoniumBuild!
  // 给已有职业补选子职业：作者的子职业导入（照作者 ImporterClass._pImportEntry：读原始子职业和职业、整理、交 _pImportEntrySubclass），
  // 等级 = 这个职业现在的各级。子职业不加生命（作者 _pImportEntry_pDoUpdateCharacterHp 对子职业直接返回），作者却仍会问加生命的方式：
  // 照它本来的结果定成「不增加」（作者自己的外部指定入口 _foundryHpIncreaseMode），不让玩家答一道不起作用的题
  if (row.prop === 'subclass') {
    const scRaw = await rawSubclass(row.entry)
    const clsRaw = await rawClass({ name: scRaw.className, source: scRaw.classSource })
    delete clsRaw.subclasses
    const primed = await B.DataPrimer.pGetPrimedJson({ class: [clsRaw], subclass: [scRaw] })
    const cls = primed.class[0]
    const sc = cls.subclasses[0]
    cls.subclasses = []
    cls._foundryHpIncreaseMode = B.ConfigConsts.C_IMPORT_CLASS_HP_INCREASE_MODE__DO_NOT_INCREASE
    return () => importer._pImportEntrySubclass(cls, sc, new ImportOpts({ actor: a, levels: how.levels }))
  }
  let cls = await rawClass(row.entry)
  let item = existingOf(a, cls)
  let sc: any = null
  let filterValues: any
  if (item) {
    // 已有的职业：作者升级按钮读现有职业 / 子职业的同一个读法（连现有子职业一起带上）
    const tuple = B.Charactermancer_Class_Util.getClassSubclassItemTuples({ classItems: [item], subclassItems: a.items.filter((i: any) => i.type === 'subclass') })[0]
    const meta = await B.SheetLevelUpButtonManager._pGetAvailableClassSubclass(tuple)
    if (meta.errors?.length) throw Error(meta.errors.join('；'))
    cls = meta.cls; sc = meta.sc ?? null; filterValues = meta.filterValues
    if (how.fresh) {
      const sub = subclassItemOf(a, item)
      await revokeGrants(a, String(item.system?.identifier ?? ''), 0)
      for (const id of [item.id, sub?.id].filter(Boolean)) {
        if (!a.items.get(id)) continue
        const left = await removeOfficially(a, id)
        if (left) throw Error('官方拿掉这个职业的步骤没走完，不能重选第 1 级')
      }
      item = null
    }
  } else filterValues = await importer.constructor.pGetDefaultFilterValues()
  if (!sc && how.subclass) sc = await rawSubclass(how.subclass.entry)
  cls = structuredClone(cls)
  delete cls.subclasses // 作者同样先删掉：只带这一个子职业
  const primed = await B.DataPrimer.pGetPrimedJson({ class: [cls], subclass: [sc].filter(Boolean) })
  const out = primed.class[0]
  const isMulticlass = !item && totalLevel(a) > 0
  if (isMulticlass) out._foundryStartingProficiencyMode = B.Charactermancer_Class_ProficiencyImportModeSelect.MODE_MULTICLASS
  const levels = how.levels ?? (item ? range(Number(item.system.levels) + 1, Number(item.system.levels) + 1) : [1])
  return () => importer.pImportEntryClass(out, new ImportOpts({ actor: a, levels, filterValues }))
}
