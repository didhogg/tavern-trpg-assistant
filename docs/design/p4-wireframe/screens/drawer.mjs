// 存档抽屉与它的内部换页（Gate 2 §14.7–14.9 / F4–F6）。抽屉在宽屏是右侧 440 宽，窄屏是底部抽屉（高 88%）。
import { pin, btn, badge, check, modal, modalHead, field, input } from '../lib/ui.mjs'

const CAMP = { name: '失落矿坑', save: '存档 2' }
const BEHIND = `<div class="page-stack"><button class="trpg-banner" type="button"><span class="trpg-banner__title">失落矿坑</span><span class="trpg-banner__line"><span>存档 2</span><span>D&amp;D 5e（2014）</span><span class="trpg-banner__state" data-dirty="true">● 有未保存到存档的改动</span></span></button></div>`
const HEADER = { campaign: CAMP, dirty: true }

const row = ({ name, meta, note = '', depth = 0, current = false, actions = true, tag = '' }) => `<li data-depth="${depth}" data-current="${current}">
  <div class="trpg-saves__top"><b>${name}</b>${current ? badge('当前') : ''}${tag ? badge(tag) : ''}${actions && !current ? `${btn('读取', { small: true })}<button class="trpg-icon-btn" type="button" aria-label="更多">⋯</button>` : ''}</div>
  <div class="trpg-saves__meta">${meta}</div>${note ? `<div class="trpg-saves__meta">备注：${note}</div>` : ''}</li>`
const fold = (title, count, inner = '', open = false) => `<details class="trpg-fold"${open ? ' open' : ''}><summary>${title}<small>${count}</small></summary>${inner}</details>`
const drawer = (title, body, back = null) => modal('drawer', modalHead(title, back), `<div class="trpg-drawer">${body}</div>`)

const main = () => `
  <section class="trpg-drawer__current">
    <div><span class="trpg-drawer__title">${pin(1)}失落矿坑</span><span class="trpg-drawer__sub">　当前存档：存档 2　<span class="trpg-badge" data-tone="warn">● 有未保存到存档的改动</span></span></div>
    <div class="trpg-drawer__buttons">${btn('保存存档', { primary: true, n: 2 })}${btn('分支存档')}${btn('导出…')}<span class="trpg-field__hint" style="align-self:center">上次备份 12 天前 · 建议导出</span></div>
  </section>
  <div class="trpg-drawer__body">
    <h3 class="trpg-group" style="margin:0">${pin(3)}这场战役的存档</h3>
    <ul class="trpg-saves">
      ${row({ name: '失落矿坑', meta: '11月2日 20:10 · D&amp;D 5e（2014）· 手动 · 战役起点', actions: true })}
      ${row({ name: '存档 1', meta: '11月5日 22:30 · 手动 · 来自「失落矿坑」', depth: 1 })}
      ${row({ name: '存档 2', meta: '11月9日 14:02 · 手动 · 来自「存档 1」', depth: 2, current: true })}
      ${row({ name: '先打地精', meta: '11月6日 21:05 · 手动 · 来自「失落矿坑」', depth: 1 })}
    </ul>
    ${fold(`${pin(4)}其他战役`, 2)}${fold('自动存档', 3)}${fold('最近删除', 1)}${fold('其他规则', 0)}
  </div>
  <footer class="trpg-drawer__bottom">${btn('＋ 新建战役', { n: 5 })}${btn('导入存档')}</footer>`

const checkBlock = (title, body, kind = '') => `<div${kind ? ` data-kind="${kind}"` : ''}><b>${title}</b>${body}</div>`

export const screens = [
  {
    id: 'drawer-main', group: '存档抽屉', title: '存档抽屉（有战役）', flow: 'F3 / F4',
    goal: '一处看清当前战役、它的存档树、别的战役和被删的存档；保存、分支、读取、导出、导入', primary: '保存存档 / 读取某个存档',
    patterns: 'Titled Sections · Collapsible Panels · Two-level tree（缩进 + 连线）· Prominent Done', laws: 'Common Region（分区用框）· Uniform Connectedness（父子用缩进和左线）· Miller（六区默认只展开两区）· Fitts（底部抽屉按钮 ≥44px）',
    frames: ['1440', '900', '390', 'mid'],
    diff: '宽 / 中：右侧抽屉 440 宽（中布局最大 100%）；窄屏：底部抽屉，高 88%，顶部有拖拽条，按钮 ≥44px；抽屉内部内容一样，只是更长，纵向滚动。',
    notes: [
      [1, '当前战役块', '战役名（根存档名）+ 当前存档名 + 保存状态', '【接】getCampaignView.name / current'],
      [2, '[保存存档]（主）[分支存档][导出…]', '有改动才可点；无改动显示"已是最新"；分支 → 小弹层改名；导出 → 抽屉内换页', '【有】campaign.branch；【接】kernelSave.save'],
      [3, '这场战役的存档（树）', '分支缩进挂在父存档下；每行：名称 · 更新时间 · 规则 · 手动/自动 · 父存档 · 备注；[读取]→ 读取确认页；⋯ → 改名 / 备注 / 导出 / 删除', '【接】getCampaignView.branches / parentId'],
      [4, '其他战役（折叠）', '同卡的另一场、别的卡的战役，按战役根分组；读取别的卡的存档会复制成本卡新存档', '【接】getCampaignView.otherCampaigns'],
      [5, '[新建战役]（仅有战役时出现）', '→ 开局向导；没战役时首页横幅才是入口，不重复放', '【有】'],
      [6, '折叠区：自动存档 / 最近删除 / 其他规则', '自动存档只有[读取][存为手动存档]，不能单独删；最近删除有[恢复][彻底删除]', '【有】listAuto / listDeleted / listOtherRules'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('存档', main()) }),
  },
  {
    id: 'drawer-nocampaign', group: '存档抽屉', title: '存档抽屉（还没有战役：读取已有存档）', flow: 'F4',
    goal: '没有当前战役时，找到旧存档并读取', primary: '读取',
    patterns: 'Titled Sections · Grouped list', laws: 'Hick（没有"新建战役"：首页横幅就在背后）· Jakob',
    diff: '同上。',
    notes: [
      [1, '没有"当前战役"块', '没战役，所以没有保存 / 分支', '【有】'],
      [2, '其他战役默认展开', '按战役根分组；每组：战役名 · 存档数 · 最近更新；展开看树', '【接】getCampaignView.otherCampaigns'],
      [3, '底部只有[导入存档]', '不放[新建战役]（首页横幅是唯一入口）', 'Gate 2 §14.2'],
      [4, '为什么没有"空抽屉"', '没有存档时首页不显示"读取已有存档"，也没有页头芯片，所以进不到空抽屉；之前 Gate 2 写的"空抽屉"状态不会出现', '更正 §14.7'],
    ],
    render: () => ({ content: `<div class="page-stack"><button class="trpg-hero" type="button"><span class="trpg-hero__title">开始一场新的冒险</span><span class="trpg-hero__sub">为「卡宾斯·哈林顿」建立一个战役：选规则、资料与冒险，再起个名字。</span><span class="trpg-hero__go">开始新冒险 →</span></button><div><button class="trpg-link" type="button">读取已有存档（3）</button></div></div>`,
      overlay: drawer('存档', `<div class="trpg-drawer__body"><h3 class="trpg-group" style="margin:0">${pin(2)}其他战役 · D&amp;D 5e（2014）</h3>
        <ul class="trpg-saves">${row({ name: '龙金劫', meta: '3 个存档 · 最近 10月28日 · 来自「卡宾斯·哈林顿」' })}${row({ name: '失落矿坑', meta: '2 个存档 · 最近 11月5日' })}</ul>
        ${fold('自动存档', 3)}${fold('最近删除', 0)}</div><footer class="trpg-drawer__bottom">${btn('导入存档', { n: 3 })}</footer>`) }),
  },
  {
    id: 'drawer-load-confirm', group: '存档抽屉', title: '读取确认（合并成一页，示意所有块）', flow: 'F4',
    goal: '读取前一次说清所有会发生的事，用户只做一次决定', primary: '读取',
    patterns: 'Wizard 的"确认页"· Modal Panel 内换页 · Safe Exploration（读取前自动存档）', laws: 'Tesler（系统做检查，用户只做一次决定）· Hick（只出现适用的块）· Postel（说清原因）· Peak–End',
    diff: '窄屏：按钮纵向，[读取]在上。实际只出现适用的块，这里为了展示把它们都画出来。',
    notes: [
      [1, '未保存改动块', '○ 先保存再读取 ○ 不保存直接读取（无论选哪个，当前内容都先写一份自动存档）', '【有】campaign.loadSave 写"读档前"自动存档'],
      [2, '其他规则 / 其他角色卡块', '切规则要确认；跨卡读取会复制成本卡新存档"名（来自 Y）"，成为独立战役', '【有】allowRuleSwitch；跨卡复制'],
      [3, '缺书块', '列"哪个人物 · 哪件东西 · 哪本书"；"能看能导出，用到它的结算暂停，数据不丢"', '【接】kernelSave.checkSave（设计 §4.4）'],
      [4, '资料 / 房规变了块', '○ 恢复原样 ○ 采用现在的（存成新分支）', '【接】keepSaved / adoptCurrent'],
      [5, '[读取] / [取消]', '读取成功 → 回首页 + 提示"已读取「…」"；失败 → 提示条写原因，当前战役不动', '【有】'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('读取「存档 1」', `<div class="trpg-drawer__body"><div class="trpg-checks">
      ${checkBlock(`${pin(1)}当前有未保存的改动`, `<span>${check('先保存「存档 2」再读取')}</span><span>${check('不保存，直接读取', false)}</span><span class="trpg-field__hint">无论选哪个，当前内容都会先自动存一份。</span>`)}
      ${checkBlock(`${pin(2)}这个存档属于其他角色卡「龙金劫」`, '<span>读取时会复制成这张卡的新存档「存档 1（来自 龙金劫）」，成为一个独立战役。</span>')}
      ${checkBlock(`${pin(3)}缺少 3 项资料`, '<span>盖尔 · 火球术 · 玩家手册（未安装）</span><span>盖尔 · 长剑 · 地下城主指南（范围里没有）</span><span class="trpg-field__hint">仍可读取和导出；用到它们的结算会暂停，数据不会丢。</span>', 'block')}
      ${checkBlock(`${pin(4)}资料有变化`, `<span>官方资料版本变了 · 1 条房规被修改</span><span>${check('恢复原样（按存档当时的资料）')}</span><span>${check('采用现在的（读取后存成新分支）', false)}</span>`)}
    </div></div><footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">${btn('取消')}${btn('读取', { primary: true, n: 5 })}</footer>`, '存档') }),
  },
  {
    id: 'drawer-load-blocked', group: '存档抽屉', title: '读取确认（不能读取：规则没装）', flow: 'F4',
    goal: '少数真正不能读取的情况：说清原因，当前战役不动', primary: '取消',
    patterns: 'Disabled with explanation', laws: 'Postel · 不靠颜色（⚠ + 双线虚框）',
    diff: '同上。',
    notes: [
      [1, '阻断块（⚠ 双线虚框）', '规则没装 / 存档结构太新 → 只写原因；[读取]不可点；当前战役、原文件都不动', '【接】checkSave.ruleMissing；设计 §4.4'],
      [2, '注意：缺书 ≠ 阻断', '缺书只提示，仍可读取（见上一屏）；调研文档里写的"阻止读取"是错的，已按设计改正', '设计 §4.4'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('读取「幽灵之夜」', `<div class="trpg-drawer__body"><div class="trpg-checks">${checkBlock(`${pin(1)}⚠ 暂时不能读取`, '<span>这个存档属于「克苏鲁的呼唤 7 版」，这台设备还没有这套规则。</span><span class="trpg-field__hint">存档原文件保持不动，装好这套规则后再来读取。你仍然可以导出它。</span>', 'block')}</div></div><footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">${btn('取消')}${btn('读取', { primary: true, disabled: true })}</footer>`, '存档') }),
  },
  {
    id: 'drawer-delete', group: '存档抽屉', title: '删除确认（有子分支）', flow: 'F5',
    goal: '删除前说清后果；删错能撤销', primary: '取消（安全选项）',
    patterns: 'Modal Panel 内换页 · Undo（提示条 6 秒内可撤销）· Safe Exploration', laws: 'Von Restorff（删除按钮用双线框并放次要侧）· Hick（两个按钮）',
    diff: '窄屏按钮纵向，[取消]在上。',
    notes: [
      [1, '后果说明', '"分支「存档 2」「先打地精」会变成独立战役"（界面从树里读出，只显示）', '【有】父存档被删后孤儿当根（getCampaignView）'],
      [2, '[删除]（双线框）', '→ 进"最近删除" + 提示条 6 秒内可点"撤销"（restoreSave）；彻底删除在最近删除里，另有二次确认', '【有】deleteSave / restoreSave / purgeSaves'],
      [3, '当前正在用的存档', '行上没有[删除]，旁边写"请先读取别的存档"（后端会拒绝）', '【有】E_SAVE_IN_USE'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('删除「存档 1」？', `<div class="trpg-drawer__body"><div class="trpg-checks">${checkBlock(`${pin(1)}删除后会发生什么`, '<span>「存档 1」会进入"最近删除"，可以随时恢复。</span><span>它下面的分支「存档 2」「先打地精」会变成独立战役，内容不会丢。</span>')}</div></div><footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">${btn('取消', { primary: true })}${btn('删除', { danger: true, n: 2 })}</footer>`, '存档') }),
  },
  {
    id: 'drawer-trash', group: '存档抽屉', title: '最近删除与彻底删除', flow: 'F5',
    goal: '误删能找回；彻底删除要想清楚', primary: '恢复',
    patterns: 'Collapsible Panels · Undo · Escape Hatch', laws: 'Hick · Postel · Peak–End（恢复后分支树自动接回）',
    diff: '同上。',
    notes: [
      [1, '最近删除（展开）', '每行[恢复][彻底删除]；恢复后回原位，分支树自动接回', '【有】restoreSave'],
      [2, '[彻底删除]', '二次确认（写明"无法恢复"）→ purgeSaves', '【有】'],
      [3, '自动存档', '没有[删除]；有[读取][存为手动存档]；只滚动保留最近 3 份', '【有】saveAutoAsManual'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('存档', `<div class="trpg-drawer__body">
      ${fold('自动存档', 3, `<ul class="trpg-saves">${row({ name: '自动存档 · 读档前', meta: '11月9日 13:58 · 自动', actions: false })}</ul><div style="padding:6px 10px">${pin(3)}${btn('读取', { small: true })} ${btn('存为手动存档', { small: true })}</div>`, true)}
      ${fold(`${pin(1)}最近删除`, 1, `<ul class="trpg-saves">${row({ name: '存档 1', meta: '删除于 11月9日 14:20 · 手动 · 来自「失落矿坑」', actions: false })}</ul><div style="padding:6px 10px;display:flex;gap:8px">${btn('恢复', { small: true, primary: true })}${btn('彻底删除', { small: true, danger: true, n: 2 })}</div>`, true)}
      ${fold('其他战役', 2)}</div>`) }),
  },
  {
    id: 'drawer-export', group: '存档抽屉', title: '导出', flow: 'F6',
    goal: '把存档带走，或做完整备份', primary: '导出',
    patterns: 'Modal Panel 内换页 · Preview（显示体积）', laws: 'Hick（两个范围）· Postel · Peak–End（导出完成有提示）',
    diff: '同上。',
    notes: [
      [1, '范围', '○ 当前存档 ○ 完整备份（含自制 / 范围 / 房规；官方数据不进备份，导入时按依赖清单报缺）', '【有】ExportScope'],
      [2, '体积预估', '"约 180 KB"', '【有】estimateExport'],
      [3, '[导出]', '→ 下载 .trpgsave；成功提示"已导出"，并重置备份提醒', '【有】'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('导出', `<div class="trpg-drawer__body"><div class="trpg-checks">${checkBlock(`${pin(1)}导出什么`, `<span>${check('当前存档「存档 2」')}</span><span>${check('完整备份（所有存档、自制、范围、房规）', false)}</span><span class="trpg-field__hint">官方数据不进备份，换设备后需要重新下载。</span>`)}</div><span class="trpg-field__hint">${pin(2)}预计大小：约 180 KB</span></div><footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">${btn('取消')}${btn('导出', { primary: true, n: 3 })}</footer>`, '存档') }),
  },
  {
    id: 'drawer-import', group: '存档抽屉', title: '导入预览与结果', flow: 'F6',
    goal: '导入前看清会加什么；导入后看清结果和缺的东西', primary: '导入',
    patterns: 'Preview → Confirm → Result（三步，在抽屉内换页）', laws: 'Postel（文件识别宽容，结果说清）· Hick · Zeigarnik（缺书清单留在结果页）',
    diff: '同上。',
    notes: [
      [1, '预览列表', '规则没装的存档灰显 +"规则未安装"，不可选', '【有】describeSaveFile'],
      [2, '完整备份：○ 合并（只加没有的）○ 覆盖', '覆盖前先写"恢复备份前"自动存档，并明确写出', '【有】importSaves'],
      [3, '结果页', '导入 N / 跳过 M / 缺书清单 / 自制·范围·房规恢复数 / 错误；没传 checkRefs 时写"依赖未核对"', '【待查】界面现在是否传了 checkRefs'],
    ],
    render: () => ({ header: HEADER, content: BEHIND, overlay: drawer('导入存档', `<div class="trpg-drawer__body"><div class="trpg-checks">
      ${checkBlock(`${pin(1)}备份文件里的存档`, `<span>${check('失落矿坑 · 存档 1')}</span><span>${check('龙金劫 · 存档 3')}</span><span style="color:#9a9a9a">${check('幽灵之夜（克苏鲁 7 版）', false)} ⚠ 规则未安装</span>`)}
      ${checkBlock(`${pin(2)}完整备份的导入方式`, `<span>${check('合并（只添加还没有的存档）')}</span><span>${check('覆盖（用备份替换现有存档；覆盖前先自动存档）', false)}</span>`)}
      ${checkBlock(`${pin(3)}结果（导入后）`, '<span>导入 2 · 跳过 1 · 缺少 3 项资料（盖尔 · 火球术 …）· 恢复自制 2 · 房规 1</span>')}
    </div></div><footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">${btn('取消')}${btn('导入 2 个存档', { primary: true })}</footer>`, '存档') }),
  },
]
