// U3 包 / 书弹窗：概况、按类别入口、一个栏目。流程见 P5-0 §13.6.3。2026-11-10 按 R23–R91 重画。
import { MIX_COLS, badge, btn, count, entryHead, entryTools, gray, icon, infoLine, input, mbody, mixRows, mlist, packHead, pills, pin, shelfPage, sheet, spellBody, table } from '../lib/parts.mjs'
import { empty, errorLine, stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U3 包 / 书弹窗'
const P = (n) => (n ? pin(n) : '')
const page = (extra) => ({ page: 'library', flush: true, content: shelfPage({}), ...extra })
const kv = (k, v) => `<span>${k} <b>${v}</b></span>`
const overview = (inner) => `<div class="lib-sub" style="padding:var(--sp-2) var(--sp-4) 0;display:grid;gap:var(--sp-2)">${inner}</div>`

export const screens = [
  {
    id: 'u3-1-book', group: G, title: 'U3 官方书弹窗（全部平铺 · 书是一类条目）', flow: '13.6.3',
    goal: '知道这本书里有什么，按类别找到想看的条目', primary: '点类别药丸 → 点行看条目', patterns: 'Modal Panel · Module Tabs（类别药丸 = 按类别入口）· Sortable Table', laws: 'Hick（药丸一行）· Miller（药丸带条数）· Jakob（‹ 书架）· Zeigarnik（本战役开关在弹窗头）',
    captions: { '1440': '宽窗 · 选"全部"：直接平铺全部条目（名称 · 类别 · 来源），不细分', '900': '宽窗 · 选了"书"药丸：包里的书显示成数据条目，不放【阅读这本书】按钮', '390': '窄屏 · 底部抽屉 · 搜索与药丸始终显示' },
    diff: '宽：居中弹窗；窄：底部抽屉。弹窗里只有一个栏目（不分左右两栏）。',
    notes: [
      [1, '弹窗头', '‹ 书架 · 书名 · 版本徽章 · 本战役开关（无战役置灰）· ⋯（管理 / 存入我的库）· ✕；是浮在整个插件窗口上的弹窗，窄屏才是抽屉〔R23、R24〕', '前端；chooseSource（B-20）'],
      [2, '概况一行', '条数 · 类别数；来自类别统计，不手写', '【有】service.categories(sourceId)'],
      [3, '搜索 + 类别药丸（始终显示）', '没有"勾选书目来源"（进包就是只看这个来源）；选"全部"= 平铺全部条目；选类别药丸才出该类的列（后端给的列，能排序的才有箭头）〔R27、R28、R29–R32〕', '【有】categories；library.sorting（B-18）'],
      [4, '"书"类别', '包里的书放在【书】分类里，显示成数据条目，和别的条目一起出现在列表；点进去按书的格式阅读；**不在包的外壳上放【阅读这本书】**（一个包里可能有多本书）〔R85〕', '【有】scoped.catalog 的 CatalogRow(kind=book)；service.corpus'],
      [5, '每行灰字来源', '所有条目都标来源〔R44〕', '【有】'],
      [6, '点行', '弹窗内换成详情；‹ 回来时搜索字、药丸、排序与位置全保留〔R25、R26〕', '见 u1-2、u1-3'],
    ],
    board: tri({
      '1440': () => page({ overlay: sheet(packHead({ title: '玩家手册（2014）', ver: '2014', n: { title: 1, sw: 1 } }), mlist({ cols: MIX_COLS, rows: mixRows('火球术'), total: '共 2057 条（25 类）', note: `<div class="lib-count" style="padding-top:0">${P(2)}平铺全部条目</div>` })) }),
      '900': () => page({ overlay: sheet(packHead({ title: '玩家手册（2014）', ver: '2014' }), mlist({ cats: '书', cols: [{ label: '名称', sort: 'asc', can: 1 }, { label: '类别', can: 1 }, { label: '来源', can: 1 }], rows: [{ cells: ['玩家手册', badge('书'), gray('PHB')], marks: '' }], total: '共 1 条' })) }),
      '390': () => page({ overlay: sheet(packHead({ title: '玩家手册', ver: '2014' }), mlist({ cols: [{ label: '名称', sort: 'asc', can: 1 }, { label: '类别', can: 1 }, { label: '来源', can: 1 }], rows: mixRows('火球术'), total: '共 2057 条' })) }),
    }),
  },
  {
    id: 'u3-2-brew', group: G, title: 'U3 自制包弹窗（缺依赖 · 同编号分行 · 含自制书）', flow: '13.6.3',
    goal: '知道这个包是谁做的、依赖谁、有没有问题', primary: '看概况、处理依赖', patterns: 'Modal Panel · Banner · Key-Value', laws: 'Postel（缺依赖仍可用，只是提示）· Hick（每条提示只有一个出口）',
    captions: { '1440': '宽窗 · 缺依赖：一行提示 + [下载依赖包]；包里的书是"书"类别的一条条目', '900': '宽窗 · 点了 [下载依赖包]：后台静默下载，行内显示下载状况', '390': '窄屏 · 同编号条目分行，每行灰字标自己的包' },
    diff: '宽：居中弹窗；窄：抽屉。',
    notes: [
      [1, '概况字段', '作者 · 版本 · 日期 · 依赖 · 来源 · 条数——都是包自带的 _meta，缺的写「—」，不编造', '【有】brewPacks.list → BrewPack'],
      [2, '缺少依赖', '「缺少依赖：xxx」+ [下载依赖包]（以前写【去下载】）；点后加载中，后台静默开始下载，不再逐个让用户选；完成只用顶部横幅「刚刚下载完成了 n 个包，同时下载了 m 个额外依赖包」〔R36、R74、R75〕', '【有】service.brewInstallSources（B-24）'],
      [3, '同编号分行', '自制包里与已有条目同编号的条目，在列表里**拆成两行**，各自灰字标自己的包；不再合并成"备选 n"一条〔R41、R45〕', '【有】query {expand}（B-31）'],
      [4, '自制包里的书 / 冒险', '作为"书"类别的条目显示，点进去按书的格式阅读（5etools 格式的自制书都应能读）〔R85〕', '【有】service.brewCorpora / corpus（B-29）'],
      [5, '开关', '多来源的包：来源归成一组，组上一个全开 / 全关；开关不出预览〔R77〕', '【有】'],
      [6, '⋯', '管理 · 存入我的库（包原样存）· 更新 · 删除（影响页）〔R83〕', '【有】brewPull / brewDelete / custom.saveToMine'],
    ],
    board: tri({
      '1440': () => page({ overlay: sheet(packHead({ title: '突袭夸巴斯', ver: '自制', n: { sw: 5, more: 6 } }), mbody(`${overview(`<div class="lib-kv">${P(1)}${kv('作者', 'DMDave')}${kv('版本', '—')}${kv('日期', '—')}${kv('来源', 'AoQ')}${kv('条数', '—')}</div>${infoLine(`${P(2)}缺少依赖：（它依赖的某个资料包）`, btn('下载依赖包', { small: true, primary: true }), '')}`)}<div class="lib-filter" style="padding-top:var(--sp-2)">${input('', { placeholder: '搜索这个包里的条目', ic: 'magnifying-glass' })}</div>${pills([['全部', 3, true], ['怪物', 1], ['物品', 1], ['书', 1]])}${table(MIX_COLS, [{ cells: ['（包里的怪物）', badge('怪物'), gray('AoQ')] }, { cells: ['（包里的物品）', badge('物品'), gray('AoQ')] }, { cells: ['（包里的书）', badge('书'), gray('AoQ')], marks: '' }])}${count('共 3 条')}`)) }),
      '900': () => page({ overlay: sheet(packHead({ title: '突袭夸巴斯', ver: '自制' }), mbody(`${overview(`${infoLine('正在后台下载依赖包…（库里会显示下载状况）', `<span class="trpg-loading" style="padding:0"><span class="trpg-spinner"></span></span>`, '')}`)}<div class="lib-filter" style="padding-top:var(--sp-2)">${input('', { placeholder: '搜索这个包里的条目', ic: 'magnifying-glass' })}</div>${table(MIX_COLS, [{ cells: ['（包里的怪物）', badge('怪物'), gray('AoQ')] }, { cells: ['（包里的物品）', badge('物品'), gray('AoQ')] }])}`)) }),
      '390': () => page({ overlay: sheet(packHead({ title: '突袭夸巴斯', ver: '自制' }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('火球', { ic: 'magnifying-glass' })}</div>${table([{ label: '名称', can: 1 }, { label: '来源', can: 1 }], [{ cells: ['火球术', gray('玩家手册（2014）')] }, { cells: ['火球术', `${gray('突袭夸巴斯')}`], marks: badge('同名', 'primary') }])}${count('共 2 条（同编号分行）')}`)) }),
    }),
  },
  {
    id: 'u3-3-states', group: G, title: 'U3 的异常：0 条匹配 / 包是空的 / 读取失败 / 加载中', flow: '13.6.3',
    goal: '列表里没东西时，说清为什么并给出口', primary: '[清空筛选] / [重试]', patterns: 'Empty State · 横幅', laws: 'Postel · Doherty（> 300 ms 才出骨架）',
    diff: '状态板。',
    notes: [
      [1, '0 条匹配', '空态「没有符合的」+ [清空筛选]；搜索框与药丸保留', '全局规则'],
      [2, '包是空的', '「这个包里没有可显示的条目」', '【有】categories 为空'],
      [3, '读取失败', '顶部横幅 + 弹窗内一个 [重试]；弹窗头照常显示〔R84〕', '【有】'],
      [4, '加载中', '弹窗头先出来，列表区用骨架行', '全局规则'],
    ],
    board: () => `<div class="ds-root wf-states">${stateCard('0 条匹配', `${input('飞龙', { ic: 'magnifying-glass' })}${empty('没有符合的。', btn('清空筛选', { small: true }))}`, 1)}
${stateCard('这个包是空的', empty('这个包里没有可显示的条目。'), 2)}
${stateCard('读取失败（横幅 + 重试）', `<div style="position:static">${toast('读取这个包失败：数据库暂时打不开。', { kind: 'error' })}</div>${btn('重试', { small: true })}`, 3)}
${stateCard('加载中', `<div class="trpg-skeleton"></div><div class="trpg-skeleton" style="width:80%"></div><div class="trpg-skeleton" style="width:60%"></div>`, 4)}</div>`,
  },
]
