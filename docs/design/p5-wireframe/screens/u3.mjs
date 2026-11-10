// U3 包 / 书内容页：概况、按类别入口（类别药丸）、混合列表。流程见 P5-0 §13.6.3。
import { PHB_CATS, detailHead, libPage, spellBody, splitView } from '../lib/parts.mjs'
import { badge, btn, count, empty, errorLine, icon, infoLine, input, pills, pin, stateCard, sw, table } from '../lib/ui.mjs'

const G = 'U3 包 / 书内容页'
const P = (n) => (n ? pin(n) : '')
const back = `<button class="trpg-link" type="button" style="text-decoration:none;display:inline-flex;align-items:center">${icon('caret-left', 16)}书架</button>`

// 混合列表（全部类别）：名称 · 类别 · 来源。类别取自真实 PHB 数据（法术 / 职业 / 种族 / 专长）
const MIX_COLS = [{ label: '名称', sort: 'asc' }, '类别', '来源']
const MIX = [['酸液飞溅', '法术'], ['警觉', '专长'], ['龙裔', '种族'], ['火球术', '法术'], ['吟游诗人', '职业'], ['演员', '专长'], ['野蛮人', '职业'], ['魔法飞弹', '法术']].map(([n, c]) => ({ cells: [n, badge(c), 'PHB'], sel: n === '火球术' }))

const overview = (n = {}) => `<div class="lib-top" style="padding-bottom:var(--sp-2)">${back}<span class="lib-title lib-title--serif">${P(n.title)}玩家手册（2014）</span>${badge('2014')}<span class="lib-end">${sw(true, '本战役')}</span></div>
<div class="lib-sub"><span>${P(n.count)}共 <b style="color:var(--text)">2057 条</b>（25 类）</span><span class="lib-end">${btn('阅读本书', { small: true, ic: 'book-open', n: n.read })}</span></div>`

export const screens = [
  {
    id: 'u3-1-book', group: G, title: 'U3 官方书内容页', flow: '13.6.3',
    goal: '知道这本书里有什么，按类别找到想看的条目', primary: '点类别药丸 → 点行看条目', patterns: 'Module Tabs（类别药丸 = "按类别入口"）· Two-Panel Selector（宽）· One-Window Drilldown（窄）', laws: 'Hick（类别药丸一行，不分页签）· Miller（药丸带条数，一眼看到量）· Jakob（← 书架）· Zeigarnik（本战役开关在顶部，随时可见）',
    diff: '宽：概况 + 药丸 + 筛选在上，下面 左列表 | 右详情；窄：概况压成两行，药丸横滚，点行整页进条目（见 u1-2）。',
    notes: [
      [1, '书名 + 版本徽章 + 本战役开关', '开关同书架（无战役置灰）；开关就在顶部，不用回书架', '【有】chooseSource；无战役置灰'],
      [2, '条数 + 类别数', '概况来自类别统计，不手写', '【有】service.categories(sourceId)'],
      [3, '[阅读本书]', '书 / 冒险才有 → 阅读页（U9h）；规则书里没有正文的来源不显示这个按钮', '【有】corpus / documents'],
      [4, '类别药丸（带条数）', '这就是"按类别入口"：全部 = 混合列表；选一个类别 → 列换成该类别的登记列（见 u1-1）', '【有】categories；列登记表 §4.5'],
      [5, '混合列表', '"全部"时只显示 名称 · 类别 · 来源 三列（各类别的列不同，混在一起放不下）；类别只作筛选，不是页签', '【有】对每个类别各查一次再合并（S1-12），界面只拼'],
      [6, '右栏详情', '点行换右栏；术语跳转替换右栏；[←] 回上一条；[✕] 收起右栏（回到只有列表）', '见 u1-3'],
    ],
    render: (L) => {
      const list = `${table(MIX_COLS, MIX)}${count('共 2057 条')}`
      if (L === 'narrow') return { page: 'library', flush: true, content: libPage(`${overview({ title: 1, count: 2, read: 3 })}${pills(PHB_CATS.map(([l, c]) => [l, c, l === '全部']))}<div class="lib-filter">${input('', { placeholder: '文字匹配（名称）', ic: 'magnifying-glass' })}</div>${list}`) }
      return { page: 'library', flush: true, content: libPage(`${overview({ title: 1, count: 2, read: 3 })}${pills(PHB_CATS.map(([l, c]) => [l, c, l === '全部'])).replace('<div class="lib-pills">', `<div class="lib-pills">${pin(4)}`)}${splitView(`<div class="lib-filter" style="padding-top:0">${input('', { placeholder: '文字匹配（名称）', ic: 'magnifying-glass' })}</div>${list}`, `${detailHead({ title: '火球术', sub: 'Fireball · PHB', n: { close: 6 } })}<div class="lib-dbody">${spellBody()}</div>`)}`) }
    },
  },
  {
    id: 'u3-2-brew', group: G, title: 'U3 自制包内容页（依赖缺 / 有备选）', flow: '13.6.3',
    goal: '知道这个包是谁做的、依赖谁、有没有问题', primary: '看概况、处理依赖', patterns: 'Banner · Key-Value summary', laws: 'Postel（缺依赖仍可用，只是提示）· Hick（每条提示只有一个出口）',
    diff: '宽：概况两列；窄：概况单列。',
    notes: [
      [1, '概况字段', '名称 · 作者 · 版本 · 日期 · 依赖 · 来源 · 条数——都是包自带的 _meta，缺的写「—」，不编造', '【有】brewPacks.list → BrewPack（sourceInfo / dependencies / includes / props）'],
      [2, '缺少依赖', '一行「缺少依赖：xxx」+ [去下载]；仍可使用，只是依赖它的内容可能显示不全', '【有】dependencies 对已装包比对'],
      [3, '同编号备选', '「n 条与已有条目同编号，已挂成备选」；原件照常生效；点开可看是哪几条', '【有】alternatives'],
      [4, '本战役开关', '多来源的包：来源归成一组，组上一个"全开 / 全关"', '【有】G-1'],
      [5, '更新 / 删除', '从下载页装的包：行尾 [更新]；删除走 ⋯ → 影响页；本地导入的包在"我的库"（U6）', '【有】brewPull / brewDelete'],
    ],
    render: () => {
      const kv = (k, v) => `<span>${k} <b>${v}</b></span>`
      const head = `<div class="lib-top" style="padding-bottom:var(--sp-2)">${back}<span class="lib-title lib-title--serif">突袭夸巴斯</span>${badge('自制')}<span class="lib-end">${sw(true, '本战役')}</span></div>
<div class="lib-sub" style="display:grid;gap:var(--sp-2);padding-bottom:var(--sp-3)"><div class="lib-kv">${P(1)}${kv('作者', 'DMDave')}${kv('版本', '—')}${kv('日期', '—')}${kv('来源', 'AoQ')}${kv('条数', '—')}</div>
${infoLine(`${P(2)}缺少依赖：（它依赖的某个资料包）`, btn('去下载', { small: true }), '')}${infoLine(`${P(3)}2 条与已有条目同编号，已挂成备选，原件照常生效。`, btn('查看', { small: true }), 'lib-banner--info')}</div>`
      return { page: 'library', flush: true, content: libPage(`${head}${pills([['全部', null, true], ['怪物', null], ['物品', null], ['法术', null]])}${table(MIX_COLS, [['（包里的条目）', '怪物'], ['（包里的条目）', '物品']].map(([n, c]) => ({ cells: [n, badge(c), 'AoQ'] })))}`) }
    },
  },
  {
    id: 'u3-3-states', group: G, title: 'U3 的异常：0 条匹配 / 包是空的 / 读取失败 / 加载中', flow: '13.6.3',
    goal: '列表里没东西时，说清为什么并给出口', primary: '[清空筛选] / [重试]', patterns: 'Empty State · Error Messages', laws: 'Postel · Doherty（> 300 ms 才出骨架）',
    diff: '状态板。',
    notes: [
      [1, '0 条匹配', '空态「没有符合的」+ [清空筛选]；药丸与筛选条保留', '全局规则'],
      [2, '包是空的', '自制包里没有任何可显示的条目：「这个包里没有可显示的条目」（辅助数据类别不显示）', '【有】categories 为空'],
      [3, '读取失败', '一句原因 + [重试]；顶部概况照常显示', '【有】'],
      [4, '加载中', '概况先出来，列表区用骨架行', '全局规则'],
    ],
    board: () => `<div class="ds-root wf-states">${stateCard('0 条匹配', `${input('飞龙', { ic: 'magnifying-glass' })}${empty('没有符合的。', btn('清空筛选', { small: true }))}`, 1)}
${stateCard('这个包是空的', empty('这个包里没有可显示的条目。'), 2)}
${stateCard('读取失败', errorLine('读取这个包失败：数据库暂时打不开。', btn('重试', { small: true })), 3)}
${stateCard('加载中', `<div class="trpg-skeleton"></div><div class="trpg-skeleton" style="width:80%"></div><div class="trpg-skeleton" style="width:60%"></div>`, 4)}</div>`,
  },
]
