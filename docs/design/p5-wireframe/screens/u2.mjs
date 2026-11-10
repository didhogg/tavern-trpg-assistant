// U2 库总览：书架、全库搜索、按书开关、空态、卸载。流程见 P5-0 §13.6.2。
import { libPage, libTop } from '../lib/parts.mjs'
import { badge, btn, empty, errorLine, icon, iconBtn, impact, infoLine, input, loading, modal, modalHead, pills, pin, stateCard, sw } from '../lib/ui.mjs'

const G = 'U2 库总览（书架 · 全库搜索）'
const P = (n) => (n ? pin(n) : '')

const row = ({ name, badgeText, meta, on, off, action, n, menu, openMenu }) =>
  `<div class="trpg-shelf__row" data-off="${!!off}"><span class="lib-name">${P(n)}${name}</span>${badgeText ? badge(badgeText) : ''}<span class="lib-rowmeta">${meta ?? ''}</span>${action ?? sw(on)}<span style="position:relative">${iconBtn('dots-three', '更多', menu)}${openMenu ? `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:0;top:100%;width:168px"><div class="trpg-dropdown__item">管理</div><div class="trpg-dropdown__item trpg-dropdown__item--danger">卸载…</div></div>` : ''}</span></div>`
const group = (title, count, rows, { open = true } = {}) =>
  `<details class="trpg-shelf__group"${open ? ' open' : ''}><summary class="trpg-shelf__sum"><span class="trpg-shelf__chev-closed">${icon('caret-right', 16)}</span><span class="trpg-shelf__chev-open">${icon('caret-down', 16)}</span>${title}<small>${count}</small></summary>${rows}</details>`

export const shelfBody = ({ nocampaign = false, pins = {} } = {}) => `<div class="lib-scroll"><div class="trpg-shelf lib-shelf" data-nocampaign="${nocampaign}" style="min-height:0;overflow:visible">
${group('核心', '3 本', row({ name: '玩家手册（2014）', badgeText: '2014', meta: '2014-08-19', on: true, n: pins.row }) + row({ name: '怪物手册（2014）', badgeText: '2014', meta: '2014-09-30', on: true }) + row({ name: '城主指南（2014）', badgeText: '2014', meta: '2014-12-09', on: false, off: true, menu: pins.menu, openMenu: !!pins.menu }))}
${group('设定', '1 本 · 2 冒险', row({ name: '剑湾冒险者指南', badgeText: '2014', meta: '2015-11-03', on: true }) + row({ name: '凡戴尔的失落矿坑（冒险）', meta: '1–5 级 · 新手包', on: true, n: pins.adv }) + row({ name: '龙后的宝山（冒险）', meta: '1–7 级', action: btn('下载', { small: true, n: pins.dl }) }))}
${group('Homebrew', '自制 · 2 个包', row({ name: '突袭夸巴斯（DMDave）', badgeText: '自制', meta: '', on: true }) + row({ name: '某自制包（含 3 个来源）', badgeText: '自制', meta: '全开 / 全关', on: true, n: pins.brew }))}
</div></div>`

export const screens = [
  {
    id: 'u2-1-shelf', group: G, title: 'U2a 书架（正常）', flow: '13.6.2 U2a',
    goal: '一眼看到装了哪些书和冒险，并决定本战役开哪些', primary: '开 / 关本战役的书；点行进书内容页',
    patterns: 'Titled Sections（分组折叠）· Switch · More Menu', laws: 'Miller（分组折叠，按作者分组）· Fitts（开关在行尾，窄屏 ≥44）· Jakob（开关 ━● 为开）· Von Restorff（只有主操作有强调色）',
    diff: '宽：书名 · 版本徽章 · 出版日期 · 开关 · ⋯；窄：出版日期隐藏，只剩 书名 · 版本徽章 · 开关 · ⋯。',
    notes: [
      [1, '顶部 [书架 | 我的库 | 下载] + 🔍', '默认进"书架"；🔍 开全库搜索悬浮窗（任意库页都有）', '【定】B1'],
      [2, '分组（折叠）', '分组来自作者的分组表 + 自制「Homebrew」组；分类方式可在 设置 → 库 里改（作者分组 / 规则版本 / 范围 / 书或冒险）；同组排序：已装且开着 → 已装但关着', '【有】scoped.shelf(c)；分类设置 settings.library'],
      [3, '行：书名 · 版本徽章 · 开关 · ⋯', '点书名 → 包 / 书内容页（U3）；点开关 → 立即生效，行内变化 < 400 ms；关着的书名变淡', '【有】chooseSource + kernelSave.setLibrary'],
      [4, '冒险行', '已下载：点进阅读页（U9h）；未下载：行尾 [下载] → 跳"下载 · 官方"（U4）', '【有】CatalogRow.downloaded'],
      [5, '自制行', '只放从下载页装的包（来历 = download）；本地导入和自己写的归"我的库"；多来源的包归成一组，组上一个"全开 / 全关"', '【有】brewPacks.list(…).origin；G-1 排布问题，不是缺口'],
      [6, '⋯ 更多', '[管理]（进包页）/ [卸载]（见 u2-3）', '【有】'],
    ],
    render: () => ({ page: 'library', flush: true, content: libPage(`${libTop('shelf', { n: 1 })}${shelfBody({ pins: { row: 3, adv: 4, dl: 4, brew: 5, menu: 6 } })}`) }),
  },
  {
    id: 'u2-2-states', group: G, title: 'U2a 书架的异常：空 / 无战役 / 书目失败 / 卸载被拒', flow: '13.6.2 U2a',
    goal: '没有东西、做不了、或出错时，一句话 + 一个出口', primary: '点出口按钮', patterns: 'Empty State（一句话 + 一个主按钮）· Error Messages', laws: 'Hick（出口只有一个主按钮）· Postel（说清原因）',
    diff: '状态板，只画 1440 宽；窄屏同样是整页。',
    notes: [
      [1, '什么都没装', '「还没有资料」+ [去下载]（C2：一句话 + 一个主按钮）', '【有】scoped.shelf 为空'],
      [2, '无战役', '开关置灰 + 横幅「先创建战役」[去首页]；浏览、搜索、下载、我的库照常（资料是全局的，只有开关依赖战役）', '〔待核 #6〕P4 的"没聊天 / 只读"态是否可用，我按可用写'],
      [3, '书目取不到', '哪一块失败，只在它自己那一块写原因 + [重试]，另一块照常（书目文件、冒险目录各自可能失败）', '【有】directory.refresh'],
      [4, '卸载被拒', '有下载 / 换算正在跑：拒绝 + 原因 + [知道了]', '【有】library.uninstallOfficial'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('什么都没装', empty('还没有资料。', btn('去下载', { primary: true })), 1)}
${stateCard('无战役（开关置灰）', `${infoLine('先创建战役，开关才能用。', btn('去首页', { small: true }), 'lib-banner--info')}<div class="trpg-shelf lib-shelf" data-nocampaign="true" style="min-height:0;overflow:visible">${row({ name: '玩家手册（2014）', badgeText: '2014', meta: '2014-08-19', on: true })}${row({ name: '怪物手册（2014）', badgeText: '2014', meta: '2014-09-30', on: false, off: true })}</div>`, 2)}
${stateCard('冒险目录取不到（书照常）', `<div class="trpg-shelf lib-shelf" style="min-height:0;overflow:visible">${row({ name: '玩家手册（2014）', badgeText: '2014', meta: '', on: true })}</div>${errorLine('冒险目录读取失败：网络不通。', btn('重试', { small: true }))}`, 3)}
${stateCard('卸载被拒', `<div class="trpg-confirm"><p><b>现在不能卸载</b></p><p class="lib-muted">官方资料正在下载整理，等它完成或先取消下载再卸载。</p><div class="trpg-confirm__actions">${btn('知道了', { primary: true })}</div></div>`, 4)}</div>`,
  },
  {
    id: 'u2-3-uninstall', group: G, title: 'U2a 卸载 → 影响页', flow: '13.6.2 U2a · 13.6.0 影响页',
    goal: '删东西之前，看到谁会受影响', primary: '[确认卸载] / [取消]', patterns: 'Confirm Dialog（confirm 变体：窄屏底部弹出）', laws: 'Postel · Zeigarnik（"以后不再提示"在设置里可改回）· Hick（只有两个按钮）',
    diff: '宽：居中确认框；窄：底部弹出，按钮纵向（[确认]在上）。',
    notes: [
      [1, '影响页（共用，卸载官方资料 / 删自制包 / 删条目 / 删房规都走它）', '列出：依赖它的自制包 · 房规与选版本 · 战役与存档（含已删存档）', '【有】backend.removalImpact'],
      [2, '"以后不再提示"', '勾上后写进偏好；设置 → 库 里可改回（偏好里"删除总是不提示"）', '【有】settings.library'],
      [3, '[确认卸载]', '完成 → 提示条「释放 xx MB，可重新下载」→ 书架变空态；自制包走 service.brewDelete', '【有】library.uninstallOfficial · service.brewDelete'],
    ],
    render: () => ({ page: 'library', flush: true, content: libPage(`${libTop('shelf')}${shelfBody()}`),
      overlay: impact('卸载官方资料？', ['2 个自制包依赖它（其中 1 个会无法显示）', '3 条房规和 2 处版本选择', '战役「失落矿坑」（2 个存档，另有 1 个已删存档里也用到）'], { confirm: '确认卸载', n: 1 }) }),
  },
  {
    id: 'u2-4-search', group: G, title: 'U2b 全库搜索悬浮窗', flow: '13.6.2 U2b',
    goal: '在整个库里按名字找东西，一步跳到它', primary: '点结果', patterns: 'Search with Autocomplete（去抖）· Module Tabs（类别药丸）· Pagination', laws: 'Doherty（输入后 < 400 ms 反馈）· Hick（只有 文字 + 类别药丸）· Miller（分页）',
    diff: '宽：窗口内的居中弹窗；窄：整屏。',
    notes: [
      [1, '输入框 + 类别药丸', '药丸取自"结果自带的类别"，不写死；输入去抖后搜，> 300 ms 显示加载', '【有】scoped.search(c, term)'],
      [2, '结果行', '名称 · 类别 · 来源；点结果走 target：条目 → 条目页；书 / 冒险 → 阅读页；规则速查（文档）→ 阅读页', '【有】ScopedSearchHit.target'],
      [3, '本战役关掉的书不出现', '搜索按战役过滤（无战役时全部出现）', '【有】'],
      [4, '分页', '后端没有数量上限，界面分页（每页固定条数，由界面定）', '界面拼，不算'],
      [5, '✕ 关窗', '从结果进条目后再 ✕，回到这个窗并保留搜索词与结果', 'D-2'],
    ],
    render: () => {
      const results = [['魔法飞弹', '法术', 'PHB'], ['侦测魔法', '法术', 'PHB'], ['反魔法场', '法术', 'PHB']]
      const body = `${input('魔法', { ic: 'magnifying-glass' })}${pills([['全部', null, true], ['法术', null]]).replace('class="lib-pills"', 'class="lib-pills" style="padding:var(--sp-3) 0 var(--sp-2)"')}<div class="lib-sresult">${results.map(([n, c, s]) => `<div class="lib-sresult__row"><b>${n}</b>${badge(c)}<span class="lib-muted lib-end" style="font-size:var(--fs-xs)">${s}</span></div>`).join('')}</div><div class="lib-pager">${iconBtn('caret-left', '上一页')}<span>第 1 / 4 页</span>${iconBtn('caret-right', '下一页')}</div>`
      return { page: 'library', flush: true, content: libPage(`${libTop('shelf')}${shelfBody()}`), overlay: modal('dialog', modalHead('全库搜索', { n: 1 }), body) }
    },
  },
  {
    id: 'u2-5-search-states', group: G, title: 'U2b 搜索的状态：加载 / 无结果 / 还没输入', flow: '13.6.2 U2b',
    goal: '搜索时每个阶段用户都知道发生了什么', primary: '继续输入 / 清空', patterns: 'Empty State · Loading', laws: 'Doherty · Zeigarnik（还没输入时给出口径提示）',
    diff: '状态板。',
    notes: [
      [1, '还没输入', '一行浅灰字「输入名字，如 火球术」；不预先列东西', '全局规则'],
      [2, '加载（> 300 ms）', '小圆圈 + 「正在搜…」；结果区保持上一次结果直到新结果回来（不闪）', '【有】'],
      [3, '没找到', '「没找到『xx』」+ [清空]；不给"你是不是想找"（作者搜索器没有该功能，不画）', '【有】'],
      [4, '搜索失败', '一句原因 + [重试]', '【有】'],
    ],
    board: () => `<div class="ds-root wf-states">${stateCard('还没输入', `${input('', { placeholder: '输入名字，如 火球术', ic: 'magnifying-glass' })}<p class="trpg-hint" style="margin:0">输入名字开始搜。</p>`, 1)}
${stateCard('加载中', `${input('魔法', { ic: 'magnifying-glass' })}${loading('正在搜…')}`, 2)}
${stateCard('没找到', `${input('魔法球球', { ic: 'magnifying-glass' })}${empty('没找到「魔法球球」。', btn('清空', { small: true }))}`, 3)}
${stateCard('搜索失败', `${input('魔法', { ic: 'magnifying-glass' })}${errorLine('搜索出错了：数据库暂时打不开。', btn('重试', { small: true }))}`, 4)}</div>`,
  },
]
