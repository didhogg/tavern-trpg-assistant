// 其余流程：添加效果弹窗、各类预览确认页（套用模板 / 等级管理 / 休息 / 升级结果）、存入我的库、来源与同步、状态与失败。
import { card, listPage, detail, btn, icon, seg, searchBox, badge, diff, P, pill } from '../lib/parts.mjs'
import { modal as mdl, modalHead as mh, toast, errorLine, infoLine } from '../../p5-wireframe/lib/ui.mjs'
import { dropdown } from '../../p5-wireframe/lib/parts.mjs'
import { by } from '../lib/frame.mjs'

const G = '弹窗与状态（人物）'
const page = (L, o = {}) => ({ content: detail({ L, ...o }) })
const chk = (t, on) => `<label class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span>${t}</label>`
const confirm = (msg, secs, actions) => `<div class="trpg-confirm"><p class="trpg-confirm__message">${msg}</p><div class="trpg-confirm__scroll">${secs}</div><div class="trpg-confirm__actions">${actions}</div></div>`
const sec = (h, body, tone) => `<div class="trpg-confirm__section"${tone ? ` data-tone="${tone}"` : ''}><h4 class="trpg-confirm__h">${h}</h4>${body}</div>`

const effectsModal = (L) => mdl('sheet', mh('添加状态或效果'), `<div class="pc-split2" style="height:100%"><div class="pc-col">${seg([{ label: '状态', on: true }, { label: '疾病' }, { label: '法术效果' }, { label: '其他' }])}${searchBox('搜 状态', 0)}
<div class="pc-2" style="font-size:var(--fs-sm)">点一下勾选 / 取消，可连续勾，面板不关</div>${chk('倒地', true)}${chk('中毒', false)}${chk('目盲', false)}${chk('魅惑', false)}${chk('恐慌', false)}${chk('力竭 · 等级 <b>1</b>', false)}<button class="trpg-btn trpg-btn--small" type="button" style="justify-self:start">${icon('plus', 14)}新建效果…</button></div>
${L === 'narrow' ? '' : `<div class="pc-col" style="border:0"><div class="pc-card-res"><div class="pc-name" style="font-size:var(--fs-2xl)">倒地 <span>Prone</span></div><dl class="pc-kv"><dt>类别</dt><dd>状态</dd><dt>获得方式</dt><dd>规则</dd><dt>来源</dt><dd>基础规则</dd></dl><div class="pc-2">（正文：和库里同一个资料卡；内核认识的状态会自动影响数值与掷骰，不认识的只提醒）</div></div></div>`}</div>`)

const applyTpl = () => mdl('confirm', mh('套用模板'), confirm('把「精英地精」套用到「盖尔」？', sec('会换掉', `${diff('种族', '人类', '地精')}${diff('职业', '法师 3', '（无）')}${diff('物品 · 法术 · 特性', '原有', '模板的')}`) + sec('会保留', '<p>名字 · 头像 · 标签 · 分类</p>') + sec('当前生命', `${diff('生命', '12 / 18', '尽量保持 12 / 18')}<label class="trpg-check" data-on="false"><span class="trpg-check__box"></span>把生命和资源重置为满</label>`), `${btn('取消')}${btn('套用（可撤销）', { primary: true })}`))
const levelUp = () => mdl('confirm', mh('等级管理 · 升到 4 级'), confirm('盖尔 法师 3 → 4：', sec('会得到', `<ul class="trpg-confirm__details"><li>生命上限 +6（平均 / 掷骰，内核给选项）</li><li>特性：属性值提升</li></ul>`) + sec('需要你选择（内核给出）', `<p>属性值提升：<button class="trpg-btn trpg-btn--small" type="button">智力 +2 ${icon('caret-down', 14)}</button></p>`, 'must'), `${btn('取消')}${btn('升级（可撤销）', { primary: true })}`))
const rest = () => mdl('confirm', mh('长休'), confirm('长休会恢复：', sec('将恢复', `${diff('生命', '12 / 18', '18 / 18')}${diff('法术位', '●○ / ○○', '全满')}${diff('生命骰', '2 / 3', '3 / 3')}`), `${btn('取消')}${btn('确认长休（可撤销）', { primary: true })}`))
const result = () => mdl('dialog', mh('盖尔 升到 4 级'), `<div style="display:grid;gap:var(--sp-3);justify-items:start"><div class="pc-name" style="font-size:var(--fs-2xl)">盖尔 · 法师 4 级</div><div class="pc-card-res" style="width:100%"><b>得到：</b>生命上限 +6 · 二环法术位 +1 · 属性提升 智力 +2</div>${btn('好的', { primary: true })}</div>`)
const saveLib = () => mdl('dialog', mh('存入我的库'), `<div style="display:grid;gap:var(--sp-3)"><dl class="pc-kv"><dt>要存的</dt><dd>盖尔 Gale（玩家角色）</dd><dt>存成</dt><dd>人物数据（引擎原生，保留职业与成长）</dd></dl><div class="trpg-field"><label class="trpg-field__label">放进哪个包</label>${chk('《我的人物模板》', true)}${chk('新建包…', false)}</div><p class="trpg-hint">这是把它做成可反复套用的模板，不会改动当前战役的数据和存档。</p><div class="trpg-confirm__actions">${btn('取消')}${btn('存入我的库', { primary: true })}</div></div>`)
const sync = () => mdl('dialog', mh('来源与同步'), `<div style="display:grid;gap:var(--sp-2)"><p>盖尔的 3 项和它们的来源不一样了：</p>${[['火球术（PHB）', '来源已更新'], ['精英地精模板', '你自己改过'], ['房规：火球术', '房规有变化']].map(([a, b]) => `<div class="trpg-row"><div class="trpg-row__main"><div class="trpg-row__title">${a}</div><div class="trpg-row__meta">${b}</div></div>${btn('看差异', { small: true })}${btn('同步', { small: true })}${btn('保留我的', { small: true })}</div>`).join('')}
<div class="pc-section"><h5>看差异：火球术</h5>${diff('环位', '3', '3')}${diff('伤害', '8d6', '9d6')}</div><div class="trpg-confirm__actions">${btn('全部同步')}${btn('关闭', { primary: true })}</div></div>`)

export const screens = [
  {
    id: 'p6-10-effects', group: G, title: '添加状态或效果（可搜索资料弹窗）', flow: 'F1 / 状态',
    goal: '快速开关常见状态，也能搜任何效果、新建自定义效果', primary: '勾选状态（连续勾，面板不关）', patterns: 'Two-Panel Selector · Checklist · Module（状态｜疾病｜法术效果｜其他）',
    laws: 'Hick（分类 4 项，列表内可搜）· Doherty（勾一下立刻生效，外面药丸实时出现）· Jakob（官方表的状态勾选）',
    diff: '390：只有左列，点一项换页看资料。',
    notes: [
      [1, '分类 + 搜索 + 勾选列表', '状态 = 状态类条目；效果 = 状态以外全部，未分类归「其他」（11-04）；列表内容由库给，不写死；**勾一下即生效、可连续勾、面板不关**，每次一条改动记录；力竭带等级', 'R17 · R20 · G10'],
      [2, '[新建效果…]', '打开自制数据表单里已有的效果表单（字段按作者结构生成）；保存位置：只进这个人物 / 同时存入我的库…；内核能否落成人物身上的效果要查', 'R21 · G20'],
      [3, '右侧资料片', '类别 / 获得方式 / 来源 + 库的正文；药丸点文字也是打开这个资料', '11-04 已定'],
    ],
    board: by({ '1440': (L) => ({ ...page(L, { fxPin: 1 }), overlay: effectsModal(L) }), '900': (L) => ({ ...page(L, {}), overlay: effectsModal(L) }), '390': (L) => ({ ...page(L, {}), overlay: effectsModal(L) }) }),
  },
  {
    id: 'p6-11-previews', group: G, title: '预览确认页：套用模板 · 等级管理 · 休息 · 升级结果', flow: 'F8（长休）· 升降级 · 套用模板',
    goal: '大操作先看清会发生什么，再确认；都可撤销', primary: '确认按钮（弹窗里唯一实心）', patterns: 'Preview · Confirm page（现有 .trpg-confirm：说明固定、明细自己滚、按钮钉底）· Peak-End（结果卡）',
    laws: 'Safe Exploration · Doherty（先预览后执行）· Fitts（取消与确认隔开、窄屏纵向 [确认] 在上）· Tesler（选择项由内核给）',
    notes: [
      [1, '套用模板', '会换掉 / 会保留 / 当前生命；**默认尽量保持当前生命**（不超过新上限），要重置的自己勾；套用后一条记录，可撤销', 'R02–R05 · G16–G18'],
      [2, '等级管理（升 / 降）', '职业框旁「等级管理」按钮打开；两个方向都先预览「会得到 / 会失去」；升级多一块「需要你选择」（由内核给）；降级进这里，不放在主视图', 'R19 · G09'],
      [3, '休息', '长休 / 短休先预览「将恢复什么」；短休先选花几个生命骰；「休息将恢复什么」内核能否直接给要查', 'R17 · 候选 G29'],
      [4, '升级结果卡', '升级完成不只弹提示条，给一张「得到了什么」的结果卡（Peak–End）', 'D6'],
    ],
    board: by({
      '1440': (L) => ({ ...page(L, {}), overlay: applyTpl() }),
      '900': (L) => ({ ...page(L, {}), overlay: levelUp() }),
      '390': (L) => ({ ...page(L, {}), overlay: rest() }),
      mid: (L) => ({ ...page(L, {}), overlay: result() }),
    }, { '1440': '套用模板：预览', '900': '等级管理：升到 4 级预览', '390': '长休：预览（窄屏底部抽屉）', mid: '升级完成：结果卡' }),
  },
  {
    id: 'p6-12-save-library', group: G, title: '存入我的库（和保存存档分开）', flow: 'F2',
    goal: '把人物做成可反复套用的模板，不动战役', primary: '[存入我的库]', patterns: 'Confirm page（弹窗内一页小表单）',
    laws: 'Postel · 严格区分（存入库 ≠ 保存存档，文案写明）',
    notes: [[1, '存入我的库', '人物 ⋯ ▸ 存入我的库…；存成人物数据（引擎原生，C2 = ②）；放进哪个包（或新建包）；**不改战役数据和存档**；怪物 / NPC 同一入口，存成作者格式的 monster 条目', 'R05–R07 · G16 · G17']],
    board: by({ '1440': (L) => ({ ...page(L, {}), overlay: saveLib() }), '900': (L) => ({ ...page(L, {}), overlay: saveLib() }), '390': (L) => ({ ...page(L, {}), overlay: saveLib() }) }),
  },
  {
    id: 'p6-13-sync', group: G, title: '来源与同步（B′）', flow: 'F6',
    goal: '来源有更新时逐项决定同步还是保留自己的', primary: '[同步] / [保留我的]（逐项）', patterns: 'Preview · Row actions',
    laws: 'von Restorff（入口只在有更新时出现，不挂页头、不自动弹）· Tesler（差异由后端比，界面只显示）',
    notes: [
      [1, '身份卡上的一行入口', '「3 项来源有更新 ›」，有更新才出现，没有就不画；点开本面板', 'R32 · G23–G25'],
      [2, '逐项 [看差异] [同步] [保留我的]', '同步后一条改动记录，可撤销；[全部同步]；dnd5e 本体没有这个功能，是新做', 'R31 · R32 · G24'],
    ],
    board: by({ '1440': (L) => ({ ...page(L, { sync: 1 }), overlay: sync() }), '900': (L) => ({ ...page(L, { sync: 1 }), overlay: sync() }), '390': (L) => ({ ...page(L, { sync: 1 }), overlay: sync() }) }),
  },
  {
    id: 'p6-14-states', group: G, title: '状态：读档摘要 · 资料不可用 · 失败 · 只读窗口', flow: '读档 / 失败 / 只读',
    goal: '每种异常都在出事的地方说清楚，不弹窗不丢数据', primary: '—', patterns: 'Toast（顶部栏下方，宿主层）· Inline error · Disabled with reason',
    laws: 'Peak-End（读档后摘要，消除负峰值）· Postel（错误后保留输入）· Visibility of system status',
    notes: [
      [1, '读档后摘要', '提示条（6 秒，可点开）：「已读《存档名》· 11 人 · 2 人有资料不可用 [查看]」；人物行有小警示', 'R33 · G11'],
      [2, '资料不可用', '链接显示「资料不可用」，人物其余功能照常（B′ 自带数据）', 'R33 · G25'],
      [3, '操作失败', '出错的那一行：⚠ + 一句原因 + [重试]；不用弹窗；已输入的内容保留', 'Postel'],
      [4, '只读窗口', '另一个窗口在写时：⋯ 菜单里写操作灰掉并写原因，页头 `只读` 徽章', 'decisions 2026-10-29'],
    ],
    board: by({
      '1440': (L) => ({ content: listPage({ L, tab: 0, listOnly: true, cards: card({ name: '雅格拉', en: 'Yagra', cls: '野蛮人 1 级', rest: '半兽人', hp: [4, 15], ac: 14, warn: '2 项资料不可用', n: 2 }) + card({ name: '影心', en: 'Shadowheart', cls: '牧师 1 级', rest: '半精灵', hp: [11, 11], ac: 13 }) }), toast: toast('已读《失落矿坑 · 存档 2》· 11 人 · 2 人有资料不可用', { hint: '点击查看' }) }),
      '900': (L) => ({ content: listPage({ L, tab: 0, listOnly: true, cards: card({ name: '盖尔', en: 'Gale', cls: '法师 3 级', rest: '人类', hp: [12, 18], ac: 12 }) + `<div style="margin-top:-6px">${errorLine('撤销失败：这一条已经被后面的改动覆盖了。', btn('重试', { small: true }))}</div>` }) }),
      '390': (L) => ({ content: listPage({ L, tab: 0, listOnly: true, cards: card({ name: '盖尔', en: 'Gale', cls: '法师 3 级', rest: '人类', hp: [12, 18], ac: 12 }) }), pop: `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:12px;top:210px;width:220px">${['置顶', '移到…', '复制一份', '存入我的库…'].map((t) => `<div class="trpg-dropdown__item" data-disabled>${t}<span class="trpg-dropdown__reason">只读窗口</span></div>`).join('')}<div class="trpg-dropdown__item trpg-dropdown__item--danger" data-disabled>删除</div></div>` }),
    }, { '1440': '读档后摘要提示条（宿主层）+ 人物行小警示', '900': '失败：就近一行红框说明 + 重试', '390': '只读窗口：⋯ 里写操作灰掉并写原因' }),
  },
]
