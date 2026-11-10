// U1 条目表格列表 + 条目详情壳（正文渲染、术语跳转 + 返回栈、中英切换、图片、备选 / 覆盖）。流程见 P5-0 §13.6.1。
import { MARK_ALT, MARK_OVR, SPELLS, SPELL_COLS, PHB_CATS, detailHead, libPage, spellBody, splitView } from '../lib/parts.mjs'
import { badge, btn, check, count, icon, infoLine, input, pills, pin, stateCard, table, link } from '../lib/ui.mjs'

const G = 'U1 条目表格列表 + 详情壳'
const SPELL_PILLS = PHB_CATS.map(([l, c]) => [l, c, l === '法术'])
const DIM = { cells: ['吸收元素', '1 环', '1 反应', '防护', '', '自身', 'XGE'], dim: true }

/** 包页头（列表放在包页里的样子；U3 再细做）。 */
const packHead = (title, extra = '') => `<div class="lib-top"><button class="trpg-link" type="button" style="text-decoration:none;display:inline-flex;align-items:center">${icon('caret-left', 16)}书架</button><span class="lib-title lib-title--serif">${title}</span>${badge('2014')}${extra}</div>`
const filterBar = (n) => `<div class="lib-filter">${input('', { placeholder: '文字匹配（名称）', ic: 'magnifying-glass' })}<span>${n ? pin(n) : ''}来源：${check('玩家手册（2014）', true)}</span></div>`

export const screens = [
  {
    id: 'u1-1-list', group: G, title: 'U1a 表格列表（法术示例）', flow: '13.6.1 U1a',
    goal: '在一个包 / 一类条目里快速扫、筛、排序，点行看详情', primary: '点行打开详情',
    patterns: 'Pagination / Infinite List（虚拟滚动）· Sortable Table · Module Tabs（类别药丸）', laws: 'Miller（一屏 7±2 列以内）· Hick（筛选只给 类别 / 文字 / 来源）· Fitts（窄屏行高 ≥44）· Jakob（表头点击排序）',
    diff: '宽：整张表占满内容区；窄：表格在外框里横向滚动，第一列"名称"固定不动；药丸一行横滚。',
    notes: [
      [1, '类别药丸（带条数）', '点药丸=按类别筛；"全部"= 混合列表；药丸与条数来自包的类别统计', '【有】service.categories(sourceId)'],
      [2, '文字匹配 / 来源勾选', '实时筛，完成后"共 m 条"跟着变；0 条见"状态"屏；第一版筛选只做 类别 + 文字 + 来源（作者页的环阶 / 学派筛选维度 S3 未核，不画）', '【有】前端筛；PageFilter 待核（§4.6）'],
      [3, '表头', '列来自登记表（§4.5 法术：名称 · 环阶 · 时间 · 学派 · 专注 · 范围 · 来源）；点表头 升 / 降 / 取消排序；排序箭头只在被排序的列显示', '登记表声明，不手写列'],
      [4, '行上标记', '备选(n)＝此条有多个版本；房规＝被房规覆盖；灰行＝本战役没开这本书（仍可点开看原因）；来源 / 版本徽章在来源列', '【有】scoped.query 的 version.count / reason'],
      [5, '选中行', '宽：右栏换成这条详情；窄：整页进入详情，[✕] 回到这里且保留滚动位置', '见 u1-2'],
      [6, '"共 n 条"', '条目多时（怪物近五千）用虚拟滚动；搜索结果和下载页用分页', '界面只拼，不算'],
    ],
    render: () => ({ page: 'library', flush: true, content: libPage(`${packHead('玩家手册（2014）')}${pills(SPELL_PILLS)}${filterBar(2)}${table(SPELL_COLS.map((c) => c), [...SPELLS.map((c) => ({ cells: c, sel: c[0] === '火球术', marks: c[0] === '火球术' ? MARK_ALT(2) + MARK_OVR : c[0] === '魔法飞弹' ? MARK_ALT(1) : '' })), DIM])}${count('共 12 条（含 1 条本战役没开的书）')}`) }),
  },
  {
    id: 'u1-2-detail', group: G, title: 'U1b 条目详情壳（正常）', flow: '13.6.1 U1b',
    goal: '看一条的完整内容；术语点了直接换条目；随时回到刚才的位置', primary: '读正文 / 点术语',
    patterns: 'Two-Panel Selector（宽）· One-Window Drilldown（窄）· Titled Sections', laws: 'Zeigarnik（一个页签，不分页签，不丢上下文）· Jakob（← 返回上一条）· Von Restorff（术语：衬线 + 虚下划线）',
    diff: '宽：左列表 + 右详情（列表保持位置）；窄：详情整页，顶栏 ← 上一条 / ✕ 回列表。',
    notes: [
      [1, '← 上一个条目', '出栈；栈空（从列表直接点进来的第一条）时不显示', 'D-2'],
      [2, '标题 + 版本徽章', '版本徽章：2014 / 2024 / SRD / 重印；标题用衬线', '【有】scoped.detail 的 item + source'],
      [3, 'En | 中文', '全局语言；另一种语言没有这条时变灰（见 u1-5）', '【有】counterparts.counterpart'],
      [4, '✎ 编辑', '进入编辑（官方条目 = 建房规；自建条目 = 改 JSON）→ U7', 'U7'],
      [5, '✕ 关闭', '清空返回栈，回到进来的地方（列表位置 / 搜索结果都保留）', 'D-2'],
      [6, '摘要行 + 正文 + 升环', '摘要行字段由类别登记表声明（法术：环阶·学派、施法时间、范围、成分、持续时间、可学职业）；正文由渲染器按块类型→组件登记表显示；背景描述接在正文后', '【有】Vue 渲染器 + 登记表（U9a 细化）'],
      [7, '术语（衬线 + 虚下划线）', '只点击，不悬停（B3）；点后换成目标条目并入栈；点骰子标签进骰盘（P4 已有）', '【有】links.resolveTag'],
    ],
    render: (L) => {
      const head = detailHead({ title: '火球术', sub: 'Fireball · PHB', n: { lang: 3, edit: 4, close: 5 } })
      const body = `<div class="lib-dbody">${spellBody()}</div>`
      if (L === 'narrow') return { page: 'library', flush: true, content: libPage(`${detailHead({ title: '火球术', sub: 'Fireball', back: false, n: { lang: 3, edit: 4, close: 5 } })}<div class="lib-scroll" style="padding:0">${body}</div>`) }
      return { page: 'library', flush: true, content: libPage(`${packHead('玩家手册（2014）')}${splitView(`${table(SPELL_COLS, SPELLS.map((c) => ({ cells: c, sel: c[0] === '火球术' })))}`, `${head}${body}`)}`) }
    },
  },
  {
    id: 'u1-3-stack', group: G, title: 'U1c 术语跳转 + 返回栈', flow: '13.6.1 U1c',
    goal: '从火球术 → 点"法师" → 看职业 → 一步步回来，不迷路', primary: '点术语 / 点 ←',
    patterns: 'Breadcrumbs 的轻量版（上一条）· Escape Hatch（✕）', laws: 'Jakob · Tesler（栈由系统记，用户只管点）· Zeigarnik',
    diff: '三宽度相同结构：只是窄屏整页。',
    notes: [
      [1, '← 上一个条目', '回到"火球术"并出栈；再点 ← 到更早一条；到底后 ← 消失', 'D-2'],
      [2, '目标条目（职业·法师）', '术语找到了（located）才换页；入栈。跨包也可以（只要装了）', '【有】links.resolveTag(codeSet, tag, text)'],
      [3, '页内一行说明', '认识但库里没有（没装 / 本战役关了那本书）：不换页，页内一行 + [去下载] / [去书架]', '【有】Located 的状态'],
      [4, '作者不认识的标签', '只显示文字，不当链接（所以不是所有衬线字都能点）', '【有】'],
      [5, '✕', '清栈，一步回到进来的地方', 'D-2'],
    ],
    render: (L) => {
      const body = `<div class="lib-dbody"><div class="lib-sumline"><span><b>法师</b> · 玩家手册（2014）</span><span>生命骰 <b>d6</b></span></div><p>熟练与起始装备、职业表、按等级的特性……（U9d 职业页，这里只示意外壳）</p>${infoLine('《某扩展书》里的 3 个子职业所在的书没有开，所以没有列出。', btn('去书架', { small: true }), 'lib-banner--info')}<div class="lib-source">来源：玩家手册（2014）· PHB</div></div>`
      const inner = `${detailHead({ title: '法师', sub: '职业 · PHB', back: true, n: { back: 1, close: 5 } })}<div class="lib-scroll" style="padding:0">${body}</div>`
      if (L === 'narrow') return { page: 'library', flush: true, content: libPage(inner) }
      return { page: 'library', flush: true, content: libPage(splitView(table(SPELL_COLS, SPELLS.map((c) => ({ cells: c, sel: c[0] === '火球术' }))), `<div class="lib-detailcol-inner">${inner}</div>`)) }
    },
  },
  {
    id: 'u1-4-states', group: G, title: 'U1b 详情壳的异常：不可见 / 没有 / 读取失败', flow: '13.6.1 U1b',
    goal: '拿不到条目时，一句话说清原因，并给出口', primary: '点出口按钮', patterns: 'Error Messages · Escape Hatch', laws: 'Postel（说清原因）· Hick（每种原因只给一个出口）',
    diff: '这是状态板，只画 1440 宽。窄屏相同，铺满整页。',
    notes: [
      [1, '三种"不可见"', 'excluded（本战役把这本书关了）→ [去书架开启]；out-of-scope（不在本战役的范围里）→ [去设置·库]；unclassified（这本书还没归类）→ [去设置·库]', '【有】scoped.detail 返回 {hidden: 原因}'],
      [2, '库里没有这一条', 'null / not-found / not-installed：[返回]；没装的加 [去下载]', '【有】'],
      [3, '读取失败', '一句原因 + [重试]；原来的列表位置不丢', '【有】'],
      [4, '加载中', '超过 300 ms 才显示骨架（小于 300 ms 不闪）', '全局规则 13.6.0'],
    ],
    board: () => {
      const cell = (t, h, p, a, n) => stateCard(t, `<div class="lib-state"><h3>${h}</h3><p class="lib-muted">${p}</p>${a}</div>`, n)
      return `<div class="ds-root wf-states">${cell('不可见 · excluded', '本战役把这本书关了', '「火球术」在《玩家手册（2014）》里，这本书在当前战役里是关着的。', btn('去书架开启', { primary: true }), 1)}
${cell('不可见 · out-of-scope', '不在本战役的范围里', '这本书属于 2024 规则范围，当前战役选的是 2014。', btn('去 设置 · 库'), 1)}
${cell('不可见 · unclassified', '这本书还没归类', '作者判断不了它属于哪个版本，需要你在 设置 · 库 里归类后才会出现。', btn('去 设置 · 库'), 1)}
${cell('库里没有这一条', '库里没有这一条', '这条所在的书还没下载。', `<div style="display:flex;gap:8px">${btn('返回')}${btn('去下载', { primary: true })}</div>`, 2)}
${cell('读取失败', '读取失败', '读取这一条时出错了：数据库暂时打不开。', `<div style="display:flex;gap:8px">${btn('返回')}${btn('重试', { primary: true })}</div>`, 3)}
${cell('加载中（> 300 ms）', '', '', `<div class="lib-dbody" style="width:100%;padding:0"><div class="trpg-skeleton" style="width:55%;height:22px"></div><div class="trpg-skeleton"></div><div class="trpg-skeleton" style="width:90%"></div><div class="trpg-skeleton" style="width:70%"></div></div>`, 4)}</div>`
    },
  },
  {
    id: 'u1-5-lang', group: G, title: 'U1d 中英切换（对上了 / 灰掉 / 有多个）', flow: '13.6.1 U1d',
    goal: '一键在 中文 / 英文 版本之间换，不显示语言标签', primary: '点 En / 中文', patterns: 'Segmented Control · Popover（多个对应时选一个）', laws: 'Postel · Hick（小选单只在有歧义时才出现）· Jakob',
    diff: '宽：选单出现在 En|中文 下方；窄：同位置，宽度不超过屏幕。',
    notes: [
      [1, '当前语言亮、另一语言灰', '另一语言没有这条 / 这个包 / 没装时变灰，点灰的一侧只提示一句，不切换（D-5）', '【有】counterparts.counterpart(ref) → none'],
      [2, '多个对应（ambiguous）', '如子职业 124 条共享一个英文条目、自制重名：弹小选单选一个', '【有】status: ambiguous'],
      [3, '自制中文没写英文名', 'En 灰掉并提示「给这条写个英文名（ENG_name）就能对上」', '【有】reason: no-english-name'],
      [4, '条目上不显示语言标签', '库列表、搜索结果、行上都没有"中 / En"标记（D-5）', '决定 D-5'],
    ],
    render: (L) => {
      const head = detailHead({ title: '火球术', sub: 'Fireball · PHB', lang: ['En', '中文'], langOn: 1, langOff: 0, n: { lang: 1 } })
      const menu = `<div class="trpg-popover" style="position:absolute;z-index:40;right:56px;top:${L === 'narrow' ? 104 : 58}px;width:230px"><div style="font-size:var(--fs-xs);color:var(--text2);padding:2px 6px">英文里有 2 条对得上，选一个：</div><div class="trpg-dropdown__item">${pin(2)}Fireball (PHB)</div><div class="trpg-dropdown__item">Fireball (XPHB)</div></div>`
      const grey = `<div class="lib-banner lib-banner--info" style="margin:12px 20px 0">${icon('info', 16)}<span>${pin(1)}这一条另一语言里没有（En 灰了）。</span></div>`
      const body = `${grey}<div class="lib-dbody" style="padding-top:12px">${spellBody()}</div>`
      const inner = `${head}${menu}<div class="lib-scroll" style="padding:0;position:relative">${body}</div>`
      return { page: 'library', flush: true, content: libPage(L === 'narrow' ? inner : splitView(table(SPELL_COLS, SPELLS.map((c) => ({ cells: c, sel: c[0] === '火球术' }))), `<div style="position:relative">${inner}</div>`)) }
    },
  },
  {
    id: 'u1-6-image', group: G, title: 'U1e 图片：点开才取', flow: '13.6.1 U1e',
    goal: '正文里的图片不拖慢页面；点开时才拉取，取不到也不破页', primary: '点下划线条目', patterns: 'Progressive Disclosure · Recoverable error', laws: 'Doherty（先给占位，再给图）· Postel（失败可重试）',
    diff: '三宽度相同；窄屏图片占满宽度。',
    notes: [
      [1, '下划线条目', '图片在正文里是一个下划线条目（如"绿龙头像"）；点开 → 加载中 → 显示；缓存在浏览器', '【有】images.urls(sourceId, href)'],
      [2, '第一个地址失败', '自动换备用地址，用户看不到切换', '【有】images.urls 返回候选地址列表'],
      [3, '都失败', '「图片暂时取不到」+ [重试]；不影响正文其余部分', '【有】'],
      [4, '怪物头像', '详情里的 token 图同样点开才取', '【有】images.token'],
      [5, '[✕]', '回条目页，位置不变', ''],
    ],
    board: () => `<div class="ds-root wf-states wf-states--3">${stateCard('点开前', `<p>古代绿龙的栖息地在远离人烟之处。<br>${link('「绿龙头像」').replace('trpg-link', 'lib-embed')}</p>`, 1)}
${stateCard('加载中', `<div class="lib-image">${icon('circle-notch', 22)}<span>正在取图片…</span></div>`, 1)}
${stateCard('图片显示', `<div class="lib-image" style="min-height:160px;background:var(--bg-side)">（图片）</div><div style="display:flex;justify-content:flex-end">${btn('收起', { small: true })}</div>`, 5)}
${stateCard('取不到', `<div class="lib-image">${icon('warning', 22)}<span>图片暂时取不到</span>${btn('重试', { small: true })}</div>`, 3)}
${stateCard('怪物头像（点开才取）', `<div style="display:flex;gap:12px;align-items:center"><div class="lib-image" style="width:84px;min-height:84px;padding:0">头像</div><div><b class="lib-title--serif">成年红龙</b><br><span class="lib-muted">点头像放大，不会自动下载</span></div></div>`, 4)}</div>`,
  },
  {
    id: 'u1-7-alt', group: G, title: 'U1f 备选与覆盖（版本选择 / 解除）', flow: '13.6.1 U1f',
    goal: '同一条有多个版本时，选哪个生效；被房规盖住时能解除', primary: '选用 / 解除', patterns: 'Popover（选生效处）· Banner', laws: 'Hick（三个生效处，默认本战役）· Postel（两个说法分开：解除 / 固定用原件）· Peak–End',
    diff: '宽：选生效处小窗在按钮下；窄：底部弹出。',
    notes: [
      [1, '"此条有 n 个版本"', '备选来自：官方重印、自制同编号条目、房规；列出版本名与来源', '【有】scoped.detail 的 alternatives'],
      [2, '选生效处', '本战役（默认）/ 当前规则 / 全局；选后立即生效，提示条「已改用…」', '【有】scoped.choose'],
      [3, '"已被房规覆盖"条', '[解除]＝清掉这一层，回到更低一层或默认；[固定用原件]＝明确选回原件（我定：两个说法分开）', '【有】choose / 清除'],
      [4, '官方条目被房规覆盖', '显示 [复原]（选回原件）；纯自建的没有', '【有】'],
    ],
    render: () => {
      const pop = `<div class="trpg-popover" style="position:absolute;z-index:40;right:0;top:100%;width:240px;display:grid;gap:4px"><b style="padding:2px 6px">${pin(2)}选用这个版本，生效在：</b><div class="trpg-dropdown__item">本战役<small class="lib-muted">默认</small></div><div class="trpg-dropdown__item">当前规则（2014）</div><div class="trpg-dropdown__item">全局</div></div>`
      const body = `<div class="lib-dbody">${infoLine('已被房规覆盖（生效处：本战役）', `${btn('解除', { small: true, n: 3 })}${btn('固定用原件', { small: true })}`, 'lib-banner--info')}
<div class="lib-sumline"><span><b>3 环</b> 塑能</span><span>施法时间 <b>1 动作</b></span><span>范围 <b>150 尺</b></span></div><p>（生效版本的正文）</p>
<div class="lib-alt"><div class="lib-alt__row"><b>${pin(1)}此条有 2 个版本</b></div>
<div class="lib-alt__row">${check('玩家手册（2014）· 原件', false)}<span class="lib-end" style="position:relative">${btn('选用', { small: true })}${pop}</span></div>
<div class="lib-alt__row">${check('我的房规 · 火球术（范围 100 尺）', true)}<span class="lib-end">${badge('房规', 'warn')}${btn('复原', { small: true, n: 4 })}</span></div></div></div>`
      const inner = `${detailHead({ title: '火球术', sub: '房规 · 我的房规' })}<div class="lib-scroll" style="padding:0;position:relative">${body}</div>`
      return { page: 'library', flush: true, content: libPage(inner) }
    },
  },
]
