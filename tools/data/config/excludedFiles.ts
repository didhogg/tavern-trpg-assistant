/** 整文件/整目录排除的唯一登记处。路径相对于 5etools data/。 */
export interface ExcludedSource {
  match: RegExp
  reason: string
}

export const EXCLUDED_SOURCES: ExcludedSource[] = [
  { match: /^changelog(?:-cn)?\.json$/, reason: '站点更新日志，不是游戏数据' },
  { match: /^renderdemo\.json$/, reason: 'A13 渲染示例，不是游戏数据' },
  { match: /^converter\.json$/, reason: 'A13 文本转换器示例，不是游戏数据' },
  { match: /^makecards\.json$/, reason: 'A12 卡片缩写表，不是游戏数据' },
  { match: /^encounterbuilder\.json$/, reason: 'A10 遭遇形状配置，不是游戏数据' },
  { match: /^foundry-psionics\.json$/, reason: '灵能试玩稿的 Foundry 数据' },
  { match: /^psionics\.json$/, reason: '灵能：Unearthed Arcana 试玩稿，未正式出版' },
  { match: /^bastions\.json$/, reason: '据点：来源全为 2024 版及之后（规格 §2）' },
  { match: /^fluff-bastions\.json$/, reason: '据点：来源全为 2024 版及之后（规格 §2）' },
  { match: /^homecrafts\.json$/, reason: '钩织图样：2026 年 CaBoMP，不是 2014 版规则' },
  { match: /^fluff-homecrafts\.json$/, reason: '钩织图样：2026 年 CaBoMP，不是 2014 版规则' },
  { match: /^books\.json$/, reason: '书目元数据，R0 用于出版日期判定而非条目来源' },
  { match: /^adventures\.json$/, reason: '冒险书目元数据，D1.2b 才使用' },
  { match: /^generated\/bookref-[^/]+-index\.json$/, reason: '快速参考索引/排版数据，不是条目' },
  { match: /^generated\/gendata-nav-/, reason: '导航索引，不是条目来源' },
  { match: /^adventure\//, reason: 'D1.2b 冒险内容，本次不扫描正文' },
  { match: /^bastions\//, reason: '据点：来源全为 2024 版及之后（规格 §2）' },
  { match: /^homecrafts\//, reason: '钩织图样：2026 年 CaBoMP，不是 2014 版规则' },
  { match: /^psionics\//, reason: '灵能：Unearthed Arcana 试玩稿，未正式出版' }
]

export function excludedReason(file: string): string | undefined {
  return EXCLUDED_SOURCES.find((x) => x.match.test(file))?.reason
}
