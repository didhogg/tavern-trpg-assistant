// U1 条目表格列表 + 条目详情壳（都在包 / 书弹窗或搜索弹窗里）。流程见 P5-0 §13.6.1。2026-11-10 按 R23–R91 重画。
import { MARK_MOD, MARK_VAR, MARK_SAME, MIX_COLS, SPELLS, SPELL_COLS, badge, btn, count, entryHead, entryTools, gray, icon, infoLine, input, mbody, mdetail, mixRows, mlist, packHead, shelfPage, sheet, spellBody, table, term, pin, link } from '../lib/parts.mjs'
import { stateCard, toast, errorLine, loading } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U1 条目表格列表 + 详情壳'
const P = (n) => (n ? pin(n) : '')
const under = (extra = {}) => ({ page: 'library', flush: true, content: shelfPage({ pins: {} }), ...extra })
const spellRows = (sel, extra = {}) => SPELLS.map((c) => ({ cells: c, sel: c[0] === sel, ...(extra[c[0]] ?? {}) }))

export const screens = [
  {
    id: 'u1-1-list', group: G, title: 'U1a 包弹窗里的表格列表（法术 / 全部平铺）', flow: '13.6.1 U1a',
    goal: '在一个包里快速扫、筛、排序，点行看详情', primary: '点行打开详情',
    patterns: 'Modal Panel（宽：居中弹窗；窄：底部抽屉）· Sortable Table · Module Tabs（类别药丸）', laws: 'Miller（列少）· Hick（筛选只有 药丸 + 文字）· Fitts（窄屏行高 ≥44）· Jakob（表头点击排序）· Von Restorff（同名标"同名"）',
    captions: { '1440': '宽窗 · 居中弹窗 · 选了"法术"药丸（后端给的列，可排序的列有淡箭头）', '900': '宽窗 · 选"全部"：平铺全部条目，不细分（名称 · 类别 · 来源）', '390': '窄屏 · 底部抽屉 · 列按宽度收窄，只留名称 + 来源，其余横滑' },
    diff: '宽：居中浮在整个插件窗口上的弹窗；窄：从底部上拉的抽屉（顶部圆角 + 小横条）。弹窗内只有一个栏目。',
    notes: [
      [1, '弹窗头', '‹ 回书架 · 书名 · 版本 · 本战役开关 ━● · ⋯ · ✕（✕ 整个退出）。点包进来是弹窗，不跳页面；窄屏才是抽屉〔R23、R24〕', '前端；service.categories(sourceId)'],
      [2, '搜索 + 类别药丸（始终显示）', '进包就是只看这个来源，所以没有"来源勾选"；药丸带条数；选"全部"平铺全部条目，选某个类别药丸才出该类别的列〔R27、R28、R32〕', '【有】service.categories；前端文字匹配'],
      [3, '表头与排序', '列和"能不能排序"全部来自后端，界面不手写；有排序定义的列带淡箭头，点一下升 / 降 / 取消；职业、行动等后端没有排序定义的类别不显示箭头；首次排一类 0.2–3.5 秒（> 300 ms 显示"正在排序…"）〔R29–R31〕', '【有】library.sorting.columns / ranks / sort（B-18）'],
      [4, '来源灰字', '每一行都用浅灰字标出它属于的书 / 包；同名不同来源是两行，各标各的来源〔R41、R42、R44〕', '【有】QueryRow.source'],
      [5, '同名拆行', '同编号、不同包（自制重定义了同一条）也拆成两行，带"同名"标记，并标明包名与"生效中"〔R45〕', '【有】scoped.query(…, {expand:true})（B-31）'],
      [6, '行上标记', '已修改 / 覆盖 · 变体 n · 本战役已停用（灰）；"本战役关了这本书"的行仍然能点开看〔R33、R49、R50〕', '【有】ScopedRow.version / variantsOf'],
      [7, '点行', '弹窗内换成这条的详情（不叠加），‹ 回来时搜索字、药丸、排序和滚动位置全部保留〔R25、R26〕', '见 u1-2、u1-3'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(packHead({ title: '玩家手册（2014）', ver: '2014', n: { title: 1 } }), mlist({ cats: '法术', cols: SPELL_COLS, rows: spellRows('火球术', { 火球术: { marks: MARK_MOD + MARK_VAR(2) } }).concat([{ cells: ['火球术', '3 环', '1 动作', '塑能', '', '150 尺', gray('XPHB')], marks: MARK_SAME }]).concat([{ cells: ['吸收元素', '1 环', '1 反应', '防护', '', '自身', gray('XGE')], marks: '' }]), total: '共 363 条' })) }),
      '900': () => under({ overlay: sheet(packHead({ title: '玩家手册（2014）', ver: '2014' }), mlist({ cols: MIX_COLS, rows: mixRows('火球术', { 火球术: { marks: MARK_MOD } }), total: '共 2057 条（平铺全部）' })) }),
      '390': () => under({ overlay: sheet(packHead({ title: '玩家手册', ver: '2014' }), mlist({ cats: '法术', cols: [{ label: '名称', sort: 'asc', can: 1 }, { label: '来源', can: 1 }, { label: '环阶', can: 1 }, { label: '时间', can: 1 }, { label: '学派', can: 1 }], rows: SPELLS.slice(0, 8).map((c) => ({ cells: [c[0], c[6], c[1], c[2], c[3]] })), total: '共 361 条' })) }),
    }),
  },
  {
    id: 'u1-2-detail', group: G, title: 'U1b 条目详情壳（弹窗内换页）', flow: '13.6.1 U1b',
    goal: '看一条的完整内容；术语点了直接换条目；随时回到刚才的位置', primary: '读正文 / 点术语',
    patterns: 'Modal Panel · One-Window Drilldown（弹窗内换页，不叠加）· Titled Sections', laws: 'Zeigarnik（返回时状态保留）· Jakob（‹ 返回上一页）· Von Restorff（术语：衬线 + 虚下划线）',
    captions: { '1440': '宽窗 · 详情在同一个弹窗里换页（‹ 玩家手册 回列表）', '900': '宽窗 · 这本书在本战役里是关着的：不是异常，内容照常可看，只多一条提示', '390': '窄屏 · 底部抽屉里的详情' },
    diff: '三种宽度同一结构：头（‹ 标题 ✕）→ 工具行 → 来源灰字 → 正文。窄屏工具行自动换行。',
    notes: [
      [1, '‹ 上一页标题', '弹窗里的返回：回到上一页并保留它的全部状态；首条是"回列表"；✕ 一次整个退出〔R25、R26〕', '前端'],
      [2, 'En | 中文', '**只是同一个书 / 包来源的另一种语言版本**，不让用户在两条同名里选一个；另一种语言没有时变灰〔R40〕', '【有】counterparts.counterpart(ref, {docIdLocal})'],
      [3, '本战役启用开关 ━●', '只在详情外壳上（不在包列表里）；点击切换这一条的启用 / 停用，关掉后全局不再显示 / 查找到这一条〔R38、R39〕', '【有】scopes.chooseEntry + kernelSave.setLibrary（B-19）'],
      [4, '✎ 编辑（灰、点不了）', '条目编辑与新建是独立单元（P5.5）：现在 ✎ 画成灰色点不了；做了以后官方条目 = 建覆盖（原件不动，可复原），自建条目 = 改 JSON〔R48〕', 'P5.5'],
      [5, '⋯ 存入我的库', '本地原样副本（不跟源更新、不受卸载影响）→ u6-5；条目 / 书 / 包都有〔R83〕', '【有】custom.saveToMine（B-27）'],
      [6, '来源灰字', '所有条目都用浅灰字标来源（书 / 包名 · 页码）〔R44〕', '【有】'],
      [7, '"本战役里关着"的提示', '关着的书 / 不在范围的包：**仍然能看详情**，只在顶部多一行「这本书在本战役里是关着的」[开启]；全局搜索默认不勾选它们〔R33、R34〕', '【有】scoped.detail 返回 hidden 时改走 service.detail'],
      [8, '术语', '衬线 + 虚下划线；只点击；点后弹窗内换成目标条目（见 u1-3）', '【有】links.resolveTag'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '火球术', n: { back: 1 } }), mdetail(entryTools({ n: { lang: 2, sw: 3, edit: 4, more: 5 } }), spellBody({ n: { src: 6 } }))) }),
      '900': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '火球术' }), mdetail(entryTools({ on: false }), `${infoLine(`${P(7)}这本书在本战役里是关着的，内容照常可以看。`, btn('开启', { small: true }), 'lib-banner--info')}${spellBody()}`)) }),
      '390': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '火球术' }), mdetail(entryTools({}), spellBody())) }),
    }),
  },
  {
    id: 'u1-3-stack', group: G, title: 'U1c 术语跳转 + 返回栈（每一页的状态都保留）', flow: '13.6.1 U1c',
    goal: '从火球术 → 点"法师" → 看职业 → 一步步回来，不迷路，回来时一切原样', primary: '点术语 / 点 ‹',
    patterns: 'Modal Panel · Escape Hatch（✕）· Breadcrumbs 的轻量版', laws: 'Jakob · Tesler（栈由系统记）· Zeigarnik（返回后搜索字、列表、位置都在）',
    captions: { '1440': '点术语"法师"→ 弹窗内换成职业条目（‹ 火球术）', '900': '回到列表：搜索字 "火"、药丸、排序、选中行和滚动位置都和离开时一样', '390': '窄屏：库里没装的目标 → 页内一行说明 + [下载依赖包]；不换页' },
    diff: '三宽度同一结构。',
    notes: [
      [1, '‹ 上一页标题', '出栈；上一页的搜索字、列表条目、药丸、排序、详情停留位置原样回来；到栈底时 ‹ 回的是书架〔R25、R26〕', '前端（每层存自己的状态）'],
      [2, '目标条目', '术语找到了（located）→ 弹窗内换页、入栈（不弹第二层）；跨包也可以（只要装了）；本战役关着的包也能点开看〔R7、R25、R77〕', '【有】links.resolveTag(codeSet, tag, text)'],
      [3, '保留的状态', '列表停在"火"的搜索结果里，选中行仍高亮，药丸与排序不变', '前端'],
      [4, '认识但库里没有', '页内一行说明 + [下载依赖包]（点后加载中，后台自动下载，库里显示下载状况）〔R36〕', '【有】service.brewInstallSources / tasks.start*'],
      [5, '作者不认识的标签', '只显示文字，不当链接', '【有】'],
      [6, '✕', '清栈并整个退出弹窗，回到进来的地方（书架 / 搜索窗保留位置）', '前端'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(entryHead({ back: '火球术', title: '法师', n: { back: 1 } }), mdetail(entryTools({ n: { sw: 2 } }), `<div class="lib-srcline">玩家手册（2014）· 第 112 页 · PHB</div><div class="lib-sumline"><span>生命骰 <b>d6</b></span><span>豁免熟练 <b>智力、感知</b></span></div><p>熟练与起始装备、职业表、按等级的特性……（U9d 职业页，这里只示意外壳）</p><p>可用法术包括 ${term('火球术')}、${term('魔法飞弹')}。</p>`)) }),
      '900': () => under({ overlay: sheet(packHead({ title: '玩家手册（2014）', ver: '2014' }), mlist({ q: '火', cats: '法术', cols: SPELL_COLS, rows: spellRows('火球术').filter((r) => r.cells[0].includes('火') || r.cells[0] === '魔法飞弹'), total: '共 2 条（搜索 "火"）' })) }),
      '390': () => under({ overlay: sheet(entryHead({ back: '火球术', title: '战斗魔宠' }), mdetail(entryTools({}), `${infoLine(`${P(4)}《某扩展书》还没下载，这一条的细节暂时看不了。`, btn('下载依赖包', { small: true, primary: true }), 'lib-banner--info')}<div class="lib-srcline">（来源灰字）</div><p>……</p>`)) }),
    }),
  },
  {
    id: 'u1-4-states', group: G, title: 'U1b 详情的状态：只有三种不给看；其余都是正常', flow: '13.6.1 U1b',
    goal: '拿不到条目时，一句话说清原因，并给出口；能看的一律让看', primary: '点出口按钮', patterns: 'Error Messages（横幅）· Escape Hatch', laws: 'Hick（每种原因只给一个出口）· Postel（说清原因）',
    diff: '状态板，只画 1440 宽。窄屏同样在抽屉里整页显示。',
    notes: [
      [1, '三种不给看详情的情况', '① 本地没有这个数据包 → [下载依赖包]；② 读取失败 → 横幅 + [重试]；③ 加载中 → 骨架（> 300 ms 才显示）〔R37〕', '【有】scoped.detail（null / 抛错）'],
      [2, '[下载依赖包]', '点后这一块立刻显示"下载中…"（加载状态），后台自动把需要的包下好，库里相应显示下载状况；完成只用顶部横幅提示，页面里不再另外提示〔R36、R74、R75〕', '【有】service.brewInstallSources；官方 tasks.startOfficial / startAdventure'],
      [3, '读取失败', '顶部横幅（不占页面、不粘在页面上）+ 本页一个 [重试]〔R84〕', '【有】'],
      [4, '本战役关了这本书 / 不在范围', '**不是异常**：内容照常显示，只多一行提示 [开启]；全局搜索里默认不勾选〔R33〕', '【有】'],
      [5, '没归类', '**不是异常**：识别不了分类的书统一放进书架的【其他】分类，已下载的书默认在战役里开〔R35〕', '【有】shelf.ts fallbackGroup；viewOf（B-32）'],
    ],
    board: () => {
      const cell = (t, h, p, a, n) => stateCard(t, `<div class="lib-state"><h3>${h}</h3><p class="lib-muted">${p}</p>${a}</div>`, n)
      return `<div class="ds-root wf-states">${cell('没有本地数据包', '库里没有这一条', '这一条所在的《某扩展书》还没下载。', `<div style="display:flex;gap:8px">${btn('返回')}${btn('下载依赖包', { primary: true })}</div>`, 1)}
${stateCard('点了 [下载依赖包]（加载中）', `<div class="lib-state"><h3>正在下载依赖包…</h3>${loading('后台下载中，库里会显示下载状况')}<div style="display:flex;gap:8px">${btn('先返回')}</div></div>`, 2)}
${stateCard('读取失败（横幅 + 重试）', `<div style="position:static">${toast('读取这一条时出错了：数据库暂时打不开。', { kind: 'error' })}</div><div class="lib-state"><h3>这一条读不出来</h3>${btn('重试', { primary: true })}</div>`, 3)}
${stateCard('加载中（> 300 ms）', `<div class="lib-dbody" style="width:100%;padding:0"><div class="trpg-skeleton" style="width:55%;height:22px"></div><div class="trpg-skeleton"></div><div class="trpg-skeleton" style="width:90%"></div><div class="trpg-skeleton" style="width:70%"></div></div>`, 1)}
${stateCard('本战役关着的书（不是异常）', `${infoLine('这本书在本战役里是关着的，内容照常可以看。', btn('开启', { small: true }), 'lib-banner--info')}<p class="lib-muted" style="margin:0">（下面照常显示这一条的全部内容）</p>`, 4)}
${stateCard('没归类的书（不是异常）', `<p style="margin:0">《（识别不了分类的书）》${badge('其他')}</p><p class="lib-muted" style="margin:0">统一放在书架的【其他】分类里，已下载的默认开。</p>`, 5)}</div>`
    },
  },
  {
    id: 'u1-5-lang', group: G, title: 'U1d 中英切换（同一来源）· 同名条目并排', flow: '13.6.1 U1d',
    goal: '一键在 中文 / 英文 之间换，不让用户选"哪一条"；同名的不同来源直接在列表里并排', primary: '点 En / 中文', patterns: 'Segmented Control · List（同名并排 + 灰字来源）', laws: 'Postel · Hick（没有选单）· Von Restorff（同名标记）',
    captions: { '1440': '宽窗 · En | 中文 只是语言切换（同一个来源），没有"选一条"的小选单', '900': '宽窗 · 另一语言没有这一条 → En 变灰，点它只提示一句', '390': '窄屏 · 全库搜索里同名的不同来源直接并排，每行用灰字标来源；某个书里没有的不显示' },
    diff: '三宽度同一结构。',
    notes: [
      [1, 'En | 中文', '切到的是**同一个书 / 包来源**的另一种语言；官方靠配对表，自制按"同一个包"对；禁止在详情里让用户从两条里选一个〔R40〕', '【有】counterparts.counterpart(ref, {docIdLocal})'],
      [2, '另一语言没有', '该侧变灰，点灰的一侧只提示一句「另一语言没有这一条」，不切换；自制中文没写英文名 → 提示「给这条写个英文名（ENG_name）就能对上」', '【有】reason: none / no-english-name'],
      [3, '同名条目', '英文 / 中文里有 2 条对得上（数据同名）时，在列表 / 全库搜索里直接显示成两行，每行用灰字标自己的书 / 包；某个书里没有这条就不显示〔R41、R42〕', '【有】不同来源 = 不同编号'],
      [4, '没有"版本偏好"标签', '设置 → 库里不再有版本偏好 / 版本选择；同名数据已在列表里分开〔R43〕', '前端'],
      [5, '条目与行上不显示语言标签', '列表、搜索结果里没有"中 / En"标记（D-5）', '决定 D-5'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '火球术' }), mdetail(entryTools({ langOn: 1, n: { lang: 1 } }), spellBody())) }),
      '900': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '（某自制条目）' }), mdetail(entryTools({ langOn: 1, langOff: 0, n: { lang: 2 } }), `${infoLine('另一种语言里没有这一条。给这条写个英文名（ENG_name）就能对上。', '', 'lib-banner--info')}<p>（正文）</p>`)) }),
      '390': () => under({ overlay: sheet(packHead({ back: '', title: '全库数据搜索', on: null, more: false }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('火球术', { ic: 'magnifying-glass' })}</div><div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sresult"><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}<span class="lib-end">${gray('玩家手册（2014）')}</span></div><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}${MARK_SAME}<span class="lib-end">${gray('玩家手册（2024）')}</span></div><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}${MARK_SAME}<span class="lib-end">${gray('我的库')}</span></div></div></div></div>`)) }),
    }),
  },
  {
    id: 'u1-6-image', group: G, title: 'U1e 图片：点开才取', flow: '13.6.1 U1e',
    goal: '正文里的图片不拖慢页面；点开时才拉取，取不到也不破页', primary: '点下划线条目', patterns: 'Progressive Disclosure · Recoverable error', laws: 'Doherty（先给占位，再给图）· Postel（失败可重试）',
    diff: '三宽度相同；窄屏图片占满宽度。',
    notes: [
      [1, '下划线条目', '图片在正文里是一个下划线条目（如"绿龙头像"）；点开 → 加载中 → 显示；缓存在浏览器，不随数据下载〔R6、R14〕', '【有】images.urls(sourceId, href)'],
      [2, '第一个地址失败', '自动换备用地址，用户看不到切换', '【有】images.urls 返回候选地址列表'],
      [3, '都失败', '「图片暂时取不到」+ [重试]；错误横幅；不影响正文其余部分', '【有】'],
      [4, '怪物头像', '详情里的 token 图同样点开才取', '【有】images.token'],
      [5, '[✕]', '回条目页，位置不变', ''],
    ],
    board: () => `<div class="ds-root wf-states wf-states--3">${stateCard('点开前', `<p>古代绿龙的栖息地在远离人烟之处。<br>${link('「绿龙头像」').replace('trpg-link', 'lib-embed')}</p>`, 1)}
${stateCard('加载中', `<div class="lib-image">${icon('circle-notch', 22)}<span>正在取图片…</span></div>`, 1)}
${stateCard('图片显示', `<div class="lib-image" style="min-height:160px;background:var(--bg-side)">（图片）</div><div style="display:flex;justify-content:flex-end">${btn('收起', { small: true })}</div>`, 5)}
${stateCard('取不到', `<div style="position:static">${toast('图片暂时取不到。', { kind: 'error' })}</div><div class="lib-image">${icon('warning', 22)}<span>没有取到图片</span>${btn('重试', { small: true })}</div>`, 3)}
${stateCard('怪物头像（点开才取）', `<div style="display:flex;gap:12px;align-items:center"><div class="lib-image" style="width:84px;min-height:84px;padding:0">头像</div><div><b class="lib-title--serif">成年红龙</b><br><span class="lib-muted">点头像放大，不会自动下载</span></div></div>`, 4)}</div>`,
  },
  {
    id: 'u1-7-alt', group: G, title: 'U1f 变体 · 备选 · 覆盖 · 复原', flow: '13.6.1 U1f',
    goal: '变体 / 备选显示在条目的具体细节旁边；想用哪个版本就覆盖它，覆盖后看到覆盖后的内容，随时复原', primary: '看变体 / 点【覆盖】图标 / 复原', patterns: 'Inline variants · Preview before commit · Banner', laws: 'Von Restorff（变体小标志）· Postel（先预览再确认）· Hick（生效处三选一，默认本战役）',
    captions: { '1440': '宽窗 · 变体紧挨着条目的具体细节显示（板甲 → 魔法变体；职业特性变体在原特性后面）', '900': '宽窗 · 点备选上的【覆盖】图标 → 覆盖预览与确认', '390': '窄屏 · 覆盖后：显示覆盖后的内容，顶部"已修改 / 覆盖" + [复原]' },
    diff: '宽：预览两栏并排；窄：上下排。',
    notes: [
      [1, '变体显示在细节旁边', '只做"变体在那个具体条目旁边正确显示"，带小标志；**这一版不做"用变体覆盖原条目的某个细节"**（人物升级页接线属 P6）〔R50〕', '【有】scoped.variantsOf(c, ref)（B-33）：版本、亚种、魔法变体（板甲 → 19 个）；职业 / 子职特性变体数据里已排在原特性后面'],
      [2, '同编号备选', '不同包重定义了同一条时，每个版本单独成一行（带包名与"生效中"），详情的备选区列出各版本〔R41、R45〕', '【有】alternatives；scoped.query {expand}（B-31）'],
      [3, '【覆盖】小图标', '备选行上有 ⟲ 小图标，悬停说明"覆盖这个项目" → 覆盖预览（生效版本 vs 这个版本对比）→ 确认后立即生效〔R51〕', '【有】scoped.choose(c, target, altId, level)'],
      [4, '生效处', '本战役（默认，作用于本战役的所有存档和分支）/ 当前规则 / 全局；设置 → 库 → 偏好 里可改默认层级〔R53、R54〕', '【有】settings.library.overrideLevel（B-22）'],
      [5, '已修改 / 覆盖 + 复原', '被覆盖后条目上自动显示"已修改 / 覆盖"标志，旁边 [复原]；覆盖后显示覆盖后的完整条目，不是一片空白〔R49、R52〕', '【有】scoped.detail 的 item（生效版本）/ base（原件）'],
      [6, '按包编号持久', '覆盖按数据包的稳定编号保存：包卸载后再下载回来，自动套用；可在【管理】里整理〔R55、R56〕', '【有】versions.packStableId（B-21）'],
      [7, '纯自建条目', '没有 [复原]，有 [删除]（影响页）', '【有】'],
    ],
    board: tri({
      '1440': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '板甲' }), mdetail(entryTools({ langOn: 1 }), `<div class="lib-srcline">玩家手册（2014）· 第 145 页</div><div class="lib-sumline"><span>价格 <b>1500 gp</b></span><span>AC <b>18</b></span><span>力量要求 <b>15</b></span></div><p>（正文）</p>
<div class="lib-var">${P(1)}<b>变体 · 板甲的魔法版本（19）</b><div class="lib-var__row">${badge('变体', 'primary')}<span>板甲 +1</span>${gray('DMG')}</div><div class="lib-var__row">${badge('变体', 'primary')}<span>板甲 +2</span>${gray('DMG')}</div><div class="lib-var__row">${badge('变体', 'primary')}<span>板甲 +3</span>${gray('DMG')}</div><div class="lib-muted" style="font-size:var(--fs-sm)">另有 16 个……</div></div>
<div class="lib-var"><b>变体特性（紧挨着原特性）</b><div class="lib-var__row">${badge('变体', 'primary')}<span>（变体特性名）</span>${gray('（来源）')}</div></div>`)) }),
      '900': () => under({ overlay: sheet(entryHead({ back: '火球术', title: '覆盖预览' }), mbody(`<div class="lib-mscroll"><div class="lib-mpad"><b>用这个版本覆盖「火球术」？</b><div class="lib-cmp"><div><b>现在生效</b><span>玩家手册（2014）</span><span>范围 150 尺</span></div><div data-new="true"><b>覆盖后</b><span>我的房规 · 火球术</span><span>范围 100 尺</span></div></div><div style="display:grid;gap:6px"><b>生效处</b><div class="lib-chk">${P(4)}<span class="trpg-check" data-on="true"><span class="trpg-check__box">${icon('check', 12)}</span>本战役（所有存档和分支）</span><span class="lib-muted">默认</span></div><div class="lib-chk"><span class="trpg-check" data-on="false"><span class="trpg-check__box"></span>当前规则（5e 2014）</span></div><div class="lib-chk"><span class="trpg-check" data-on="false"><span class="trpg-check__box"></span>全局</span></div></div></div></div><div class="lib-foot">${btn('取消')}${btn('确认覆盖', { primary: true, n: 3 })}</div>`)) }),
      '390': () => under({ overlay: sheet(entryHead({ back: '玩家手册', title: '火球术' }), mdetail(entryTools({ mod: true, n: { restore: 5 } }), `${infoLine('已被覆盖（生效处：本战役）。下面是覆盖后的内容。', '', 'lib-banner--info')}${spellBody()}<div class="lib-alt"><div class="lib-alt__row"><b>${P(2)}此条有 2 个版本</b></div><div class="lib-alt__row"><span>玩家手册（2014）· 原件</span><span class="lib-end">${btn('覆盖', { small: true, ic: 'arrow-counter-clockwise' })}</span></div><div class="lib-alt__row"><span>我的房规 · 火球术</span>${badge('生效中', 'success')}</div></div>`)) }),
    }),
  },
]
