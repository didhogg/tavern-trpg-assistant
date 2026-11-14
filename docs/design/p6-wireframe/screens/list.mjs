// 人物列表：并排 / 整页 / 窄屏；状态；选择模式与新建菜单。依据 P6-3（已定决定优先，见 P6-4 §9）、U6_视觉规格。
import { card, listPage, detail, btn, icon, dropdown, P } from '../lib/parts.mjs'
import { by } from '../lib/frame.mjs'

const G = '列表（人物）'
const team = (o = {}) => [
  card({ name: '盖尔', en: 'Gale', cls: '法师 3 级', rest: '人类', tags: ['冒险者', '深水'], hp: [12, 18], temp: 3, ac: 12, extra: [['被动察觉', 10], ['速度', 30]], pinned: true, sel: o.sel ?? false, check: o.check?.[0], drag: o.drag, n: o.pins?.card }),
  card({ name: '影心', en: 'Shadowheart', cls: '牧师 1 级', rest: '半精灵 · 诡术领域', tags: ['冒险者'], hp: [11, 11], ac: 13, extra: [['被动察觉', 13], ['速度', 30]], check: o.check?.[1] }),
  card({ name: '雅格拉', en: 'Yagra', cls: '野蛮人 1 级', rest: '半兽人', hp: [4, 15], ac: 14, extra: [['被动察觉', 11], ['速度', 30]], warn: o.warn ? '2 项资料不可用' : '', check: o.check?.[2] }),
  card({ name: '阿斯代伦', en: 'Astarion', cls: '游荡者 1 级', rest: '高等精灵', hp: [9, 9], ac: 14, extra: [['被动察觉', 12], ['速度', 30]], check: o.check?.[3] }),
].join('')

export const screens = [
  {
    id: 'p6-1-list', group: G, title: '人物列表（队伍）：宽屏并排 · 中屏整页 · 窄屏', flow: 'F1 / F7（P6-3 §5.1）',
    goal: '一眼找到人、看清生命和 AC；4–6 个玩家来回切换不用返回', primary: '[＋ 新建]（页面唯一实心主按钮）', patterns: 'Two-Panel Selector（面板 ≥720）· One-Window Drilldown · Segmented · Cards',
    laws: 'Hick（新建 3 项）· Fitts（卡片行高 ≥114、按钮 ≥44）· Jakob（分类按钮组、名册卡片）· 位置稳定（默认手动顺序，改血不换位）',
    diff: '1440 窗口（内容区约 760）→ 面板 ≥720，左列表 280 + 右详情；900 窗口（约 668）→ 面板 <720，整页列表，宽卡片；390 → 窄卡片，生命条与 AC 在名字下面一行。',
    notes: [
      [1, '分类按钮组（队伍 / NPC / 敌人 / 全部）', '大号分段（高 44，图标 + 名称 + 计数）；顺序固定；选中 = 主色底；换分类不重置搜索与滚动', 'R08 · G02'],
      [2, '[模板] [＋ 新建 ▾] [⋯]', '新建菜单 3 项：分步建卡 / 从模板（库）/ 空白人物；选了人才多出「复制所选人物」；新建归入当前标签', 'R01 · G04–G06 · G15–G17'],
      [3, '搜索（跨标签）· 标签 · 排序 · 选择 · 显示 4 / 共 4', '搜索默认搜全部分类，结果带分类；排序默认**手动顺序**，可选 名字 / 等级 / 修改时间；列表 ≤8 人时仍显示搜索框（人物页要找人，规范 §5.3 的 ≤8 不适用，**待你确认**）', 'R12 · G02（手动顺序要存，候选 G31）'],
      [4, '人物卡片', '点卡片 = 并排时右边换人 / 整页时进详情；层级：头像 → 名字 → 职业等级·种族 → 生命与血条 → AC → 标签；🛈 被动察觉与速度只在「队伍」标签的宽卡片里出现', 'K2 · G01 · G07'],
      [5, '选中行', '并排时左侧 3px 红竖条 + 嵌套底色；键盘 ↑↓ 切人', 'D24'],
      [6, '右半详情', '见 p6-6；面板 <720 时这一栏不出现', 'D24'],
    ],
    render: (L) => ({ content: listPage({ L, tab: 0, cards: team({ sel: true, pins: { card: 4 } }), detail: detail({ split: true, L }), pins: { cats: 1, add: 2, tpl: 2, search: 3, sort: 3 } }) }),
  },
  {
    id: 'p6-2-list-states', group: G, title: '人物列表状态：空 · 搜索无结果 · 加载 · 手动排序拖动', flow: '空态 / 失败 / 加载',
    goal: '每种状态都有一句话 + 一个下一步', primary: '各状态的主按钮（从模板加入 / 清除搜索）', patterns: 'Empty / Skeleton / Preview', laws: 'Doherty（>300ms 才显示骨架）· Postel（搜索跨标签）· von Restorff（一屏一个主按钮）',
    notes: [
      [1, '整体为空', '一句话「还没有人物」+ 两个按钮「从模板加入」「分步建卡」', 'R01'],
      [2, '搜索无结果', '「没有找到「xx」」+ [清除搜索]；别的标签里有就写「在 NPC 找到 1 个 →」', 'R12'],
      [3, '加载中', '行形状骨架，不整页转圈；超过 300ms 才显示', 'Doherty'],
      [4, '手动排序拖动', '拖动手柄 ⠿ 只在排序为「手动」时出现；拖动中阴影加深；窄屏用行尾 ⋯ ▸ 上移 / 下移；**改血、加状态不会让行换位**', 'D22 · 候选 G31'],
    ],
    board: by({
      '1440': (L) => ({ content: listPage({ L, tab: 3, cards: `<div class="pc-empty"><b>还没有人物</b><span>先从库里加一个，或者一步步建一张人物卡。</span><span style="display:flex;gap:8px">${btn('从模板加入', { primary: true })}${btn('分步建卡')}</span></div>`, listOnly: true, tools: { count: false } }) }),
      '900': (L) => ({ content: listPage({ L, tab: 0, cards: `<div class="pc-empty"><b>没有找到「红龙」</b><span>NPC 里有 1 个匹配。</span><span style="display:flex;gap:8px">${btn('在 NPC 查看')}${btn('清除搜索')}</span></div>`, listOnly: true, tools: { search: '红龙', count: '显示 0 / 共 4' } }) }),
      '390': (L) => ({ content: listPage({ L, tab: 0, cards: Array.from({ length: 3 }, () => '<div class="pc-skel"><i></i><div style="display:grid;gap:10px"><i></i><i style="width:60%"></i><i style="width:80%"></i></div></div>').join(''), listOnly: true }) }),
      mid: (L) => ({ content: listPage({ L, tab: 0, cards: team({ drag: true }), listOnly: true, tools: { sort: '手动' } }) }),
    }, { '1440': '整体为空（两个按钮）', '900': '搜索无结果', '390': '加载中（骨架）', mid: '手动排序：拖动手柄与拖动中的卡片' }),
  },
  {
    id: 'p6-3-select-new', group: G, title: '选择模式 · 新建菜单', flow: 'F3 / F4（遭遇结束清怪、移分类）',
    goal: '批量移动 / 复制 / 存入库 / 删除，没有专用清怪入口', primary: '底栏动作（移到… 等）；删除单独放最右', patterns: 'Multi-select · Action bar · Dropdown menu · Undo（不弹确认）',
    laws: 'Fitts（危险动作隔开、不挨着别的按钮）· Hick（新建 3 项）· Safe Exploration（删除可撤销，不弹确认框）',
    notes: [
      [1, '选择模式顶栏', '「已选 3 人」+ [全选当前标签] + [退出]；每行左侧出现勾选框；选中卡片 = 淡红底 + 左竖条', 'R09 · R10'],
      [2, '底栏动作', '[移到 ▾ 队伍 / NPC / 敌人] [复制] [存入我的库…]；**[删除] 在最右、隔开、危险色**；删除后页头「撤销：删除 3 人」，不弹确认框（撤销记录随存档存，默认 50 条）', 'R09 · G02 · G06 · G13 · G22'],
      [3, '＋ 新建菜单', '分步建卡 / 从模板（库）… / 空白人物；「复制所选人物」只在选了人时出现（不灰着摆）', 'R01 · G04–G06'],
      [4, '登记式', '底栏动作做成登记式：以后 P9（群体伤害）、P10（全队休息）往里加，不改骨架', 'X03 · X04'],
    ],
    board: by({
      '1440': (L) => ({ content: listPage({ L, tab: 0, cards: team({ check: [true, true, false, false] }), listOnly: true, selectBar: `<div class="pc-sel-bar">已选 2 人${btn('全选当前标签', { small: true })}${btn('退出', { small: true })}</div>`, actbar: `<div class="pc-actbar">${P(2)}${btn('移到', { ic: 'caret-down' })}${btn('复制')}${btn('存入我的库…')}<span class="pc-actbar__sep"></span>${btn('删除', { danger: true, ic: 'trash' })}</div>` }) }),
      '900': (L) => ({ content: listPage({ L, tab: 0, cards: team({}), listOnly: true, newMenu: `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:0;top:100%;width:200px">${['分步建卡', '从模板（库）…', '空白人物'].map((t) => `<div class="trpg-dropdown__item">${t}</div>`).join('')}</div>`, pins: { add: 3 } }) }),
      '390': (L) => ({ content: listPage({ L, tab: 0, cards: team({ check: [true, false, false, false] }), listOnly: true, selectBar: `<div class="pc-sel-bar">已选 1 人<span style="margin-left:auto">${btn('退出', { small: true })}</span></div>`, actbar: `<div class="pc-actbar">${btn('移到', { small: true })}${btn('复制', { small: true })}${iconBtn2()}<span class="pc-actbar__sep"></span>${btn('删除', { danger: true, small: true })}</div>` }) }),
    }, { '1440': '选择模式（宽）', '900': '新建菜单（选了人时多一项「复制所选人物」）', '390': '选择模式（窄）' }),
  },
]
function iconBtn2() { return `<button class="trpg-icon-btn" type="button" aria-label="更多">${icon('dots-three', 18)}</button>` }
