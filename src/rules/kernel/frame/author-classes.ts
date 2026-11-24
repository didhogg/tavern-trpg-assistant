// 作者（Plutonium）的类：小窗里第一次用到时执行一份作者原包源码取出（探路 p3-2），一个小窗只取一次。导入条目、基础物品换算共用。
/* eslint-disable @typescript-eslint/no-explicit-any -- 作者类没有类型声明。 */
// ⓪ 探路取用的作者类（tests/e2e/library/p3-2-effects.mjs 的 EXPORTS），另加探路里经作用域取到的 SourceUtil、MiscUtil。
const AUTHOR_CLASSES = ['Config', 'ConfigConsts', 'VetoolsLinks', 'Vetools', 'SideDataInterfaces', 'Dnd5eUtil', 'UtilDamageTypes', 'ImplementationRegistryImportList',
  'DataConverterClassSubclassFeature', 'DataConverterFeat', 'DataConverterOptionalfeature', 'DataConverterRaceFeature', 'DataConverterSpell', 'DataConverterItem',
  'DataConverterRace', 'DataConverterBackground', 'DataConverterCreature', 'DataConverterCreatureFeature', 'DataConverterClass', 'SourceUtil', 'MiscUtil']
let authorClasses: Promise<any> | undefined
/** 照探路：执行一份 Plutonium 原包源码取出作者类，再按探路的初始化顺序准备（p3-2-effects-browser.mjs）。 */
export function authorConverters(): Promise<any> {
  return authorClasses ??= (async () => {
    const src = await (await fetch(new URL('modules/plutonium/js/Bundle.js', document.baseURI))).text()
    const AsyncFn = Object.getPrototypeOf(async () => undefined).constructor
    const C = await new AsyncFn(`${src}\n;return { ${AUTHOR_CLASSES.join(', ')} };`)()
    C.Config._CONFIG_TEMP = { dataSources: { baseSiteUrl: new URL('.', document.baseURI).href }, misc: { rulesVersion: 'classic' } }
    C.ConfigConsts.prePreInit({ implRegistryImportList: C.ImplementationRegistryImportList.get() })
    C.Config._CONFIG = C.Config.api_getDefaults()
    C.Config._CONFIG_PLAYER = C.Config._getDefaultPlayerConfig()
    C.Vetools.prePreInit_preConfig()
    C.VetoolsLinks.prePreInit_postConfig()
    C.Vetools.prePreInit_postConfig()
    C.UtilDamageTypes.init()
    C.Dnd5eUtil.init()
    C.Vetools.init()
    C.SideDataInterfaces.init()
    return C
  })()
}


const g = globalThis as any
export interface AuthorId { propDroppable: string; source: string; hash: string }
let baseIds: Promise<Map<string, AuthorId>> | undefined
/**
 * dnd5e 基础物品键（武器 / 护甲 / 盾牌 / 工具，如 handaxe、lighthammer）→ 作者编号：照作者自己的换算反过来查——
 * 作者的基础物品清单（data/items-base.json，再加普通物品 data/items.json）逐件用作者的物品转换类（正在运行的作者模块里物品导入器带的 _DataConverter = DataConverterItem）
 * 的 _getWeaponIdKey / _getArmorShieldIdKey / _getToolIdKey 算出 dnd5e 键（作者模块已在运行，不能再执行一份源码）；
 * 只认作者认的来源（PHB / DMG / XPHB / XDMG），同一个键有两本书时跟战役规则走（2014 = PHB / DMG 在前，2024 = XPHB / XDMG 在前）。
 * 显示出口按作者编号取本战役语言的名字（和人物身上物品同一条路），不写对照表。
 */
export function baseItemIds(): Promise<Map<string, AuthorId>> {
  return baseIds ??= (async () => {
    const importer = await g.game.modules.get('plutonium')?.api?.importer?.pGetImporter?.({ prop: 'item' })
    const D = importer?.constructor?._DataConverter
    if (!D?._getWeaponIdKey) throw Error('作者物品转换类不可用（Plutonium 物品导入器）')
    const P = g.Parser
    const modern = g.game?.settings?.get?.('dnd5e', 'rulesVersion') === 'modern'
    const order = (modern ? [P.SRC_XPHB, P.SRC_XDMG, P.SRC_PHB, P.SRC_DMG] : [P.SRC_PHB, P.SRC_DMG, P.SRC_XPHB, P.SRC_XDMG]).map((x: string) => String(x).toLowerCase())
    // 作者的基础物品清单 + 普通物品清单（骰子组、扑克牌这类工具在作者数据里是普通物品）：同一个换算一起过，基础物品在前
    const base = g.Renderer.get().baseUrl
    const [data, items] = await Promise.all([g.DataUtil.loadJSON(`${base}data/items-base.json`), g.DataUtil.loadJSON(`${base}data/items.json`)])
    const rows = [...(data?.baseitem ?? []), ...(items?.item ?? [])].filter((it: any) => order.includes(String(it.source).toLowerCase()))
      .sort((a: any, b: any) => order.indexOf(String(a.source).toLowerCase()) - order.indexOf(String(b.source).toLowerCase()))
    const out = new Map<string, AuthorId>()
    for (const it of rows) {
      const nameLower = String(it.name).toLowerCase()
      const id: AuthorId = { propDroppable: 'item', source: String(it.source), hash: g.UrlUtil.URL_TO_HASH_BUILDER[g.UrlUtil.PG_ITEMS](it) }
      for (const key of new Set([D._getWeaponIdKey({ nameLower }), D._getArmorShieldIdKey({ nameLower }), D._getToolIdKey({ nameLower })])) if (key && !out.has(key)) out.set(key, id)
    }
    return out
  })()
}
