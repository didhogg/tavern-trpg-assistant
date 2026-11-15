// 其余流程 v4：大操作先预览（休息 · 等级管理升 / 降 · 套用模板）· 存入我的库 · 来源与同步 · 异常状态。需求：P6-2 R02 R05–R07 R17 R19 R24 R27 R32 R33。
import { detail } from '../lib/sheet.mjs'
import { listPage, mem, memSec, btn, icon, mdl, mh, sec, tr, c, tbl, P } from '../lib/parts.mjs'
import { toast, errorLine } from '../../p5-wireframe/lib/ui.mjs'
import { by } from '../lib/frame.mjs'

const G = '单元 0 · 人物列表（主界面 + 子界面）'
const G1 = '单元 1 · 角色表外壳（主界面 + 子界面）'
const on = (overlay, o = {}) => () => ({ noFab: true, content: detail(o), overlay })
const diffT = (title, rows, n) => tbl('minmax(0,1fr) 90px 20px 130px', `${sec(title, rows.length, ['现在', '', '之后'], { n })}${rows.map(([k, a, b]) => tr([`<span style="text-align:left">${k}</span>`, c(a), `<span class="sh-2">${icon('arrow-right', 14)}</span>`, `<span style="font-weight:600">${b}</span>`])).join('')}`)
const box = (msg, body, actions) => `<div class="trpg-confirm"><p class="trpg-confirm__message">${msg}</p><div class="trpg-confirm__scroll" style="display:grid;gap:8px">${body}</div><div class="trpg-confirm__actions">${actions}</div></div>`

export const longRest = mdl('confirm', mh('长休'), box('长休会恢复下面这些（内核算好的结果）：', diffT('会恢复', [['生命', '12 / 18', '18 / 18'], ['临时生命', '3', '0'], ['1 环法术位', '2/4', '4/4'], ['2 环法术位', '1/2', '2/2'], ['生命骰', '1/3', '3/3'], ['奥术恢复', '0/1', '1/1'], ['力竭', '1', '0']], 1), `${btn('取消')}${btn('长休（可撤销）', { primary: true })}`))
export const shortRest = mdl('confirm', mh('短休'), `<div class="trpg-confirm"><p class="trpg-confirm__message">要花几颗生命骰？每颗 d6 + 体质 1。</p><div style="display:flex;align-items:center;gap:8px">${P(2)}<span class="sh-2">生命骰 1 / 3</span><span class="sh-step"><button type="button">${icon('minus', 12)}</button><b>1</b><button type="button">${icon('plus', 12)}</button></span>${btn('掷', { small: true })}<span>掷出 <b>4 + 1 = 5</b></span></div>${diffT('会恢复', [['生命', '12 / 18', '17 / 18'], ['生命骰', '1/3', '0/3']])}<div class="trpg-confirm__actions">${btn('取消')}${btn('短休（可撤销）', { primary: true })}</div></div>`)
export const levelUp = mdl('confirm', mh('等级管理'), `<div class="trpg-confirm"><div style="display:flex;gap:8px;align-items:center">${P(3)}<span class="sh-2">法师</span><span class="sh-step"><button type="button">${icon('minus', 12)}</button><b>3 → 4</b><button type="button">${icon('plus', 12)}</button></span><span class="sh-2">（减号 = 降级，同样先预览）</span></div>
${diffT('会得到', [['生命上限', '18', '22（平均 +4）'], ['2 环法术位', '2', '3'], ['已准备法术上限', '7', '8']])}
${tbl('minmax(0,1fr) 140px', `${sec('要你选的（内核给）', 1, ['', ''])}${tr([`<span style="text-align:left">属性值提升 或 专长</span>`, `<span>${btn('智力 +2', { small: true, ic: 'caret-down' })}</span>`])}`)}
<div class="trpg-confirm__actions">${btn('取消')}${btn('升到 4 级（可撤销）', { primary: true })}</div></div>`)
export const applyTpl = mdl('confirm', mh('套用模板'), box('把「精英法师（我的库）」套用到盖尔：', `${diffT('会换掉', [['职业', '法师 3', '法师 5'], ['物品 · 法术 · 特性', '现有', '模板的'], ['属性', '现有', '模板的']], 4)}${tbl('minmax(0,1fr)', `${sec('会保留', null, [])}${tr(['<span style="text-align:left">名字 · 头像 · 标签 · 分类 · 笔记</span>'])}`)}`, `${btn('取消')}${btn('套用（可撤销）', { primary: true })}`))
export const saveLib = mdl('dialog', mh('存入我的库'), `<div class="trpg-confirm"><p class="trpg-confirm__message">${P(1)}把盖尔做成一份可以反复套用的模板。<b>不会改动当前战役和存档</b>。</p>${tbl('100px minmax(0,1fr)', `${sec('要存的', null, [''])}${tr(['<span style="text-align:left" class="sh-2">人物</span>', '<span style="text-align:left">盖尔 Gale（玩家角色）</span>'])}${tr(['<span style="text-align:left" class="sh-2">存成</span>', '<span style="text-align:left">人物数据（带职业与成长）</span>'])}${tr(['<span style="text-align:left" class="sh-2">放进</span>', `<span style="text-align:left">${btn('《我的人物模板》', { small: true, ic: 'caret-down' })}</span>`])}`)}<div class="trpg-confirm__actions">${btn('取消')}${btn('存入我的库', { primary: true })}</div></div>`)
export const sync = mdl('sheet', mh('来源与同步'), `<div style="padding:var(--sp-4) var(--sp-5)"><p style="margin:0 0 8px">盖尔身上有 3 项和来源不一样了：</p>${tbl('minmax(0,1fr) 110px 200px', `${sec('有更新', 3, ['原因', ''], { n: 2 })}${[['火球术（PHB）', '来源更新了'], ['精英法师模板', '你改过'], ['房规：火球术', '房规变了']].map(([a, b]) => tr([`<span style="text-align:left">${a}</span>`, c(b), `<span style="display:flex;gap:4px;justify-content:flex-end">${btn('看差异', { small: true })}${btn('同步', { small: true })}${btn('保留我的', { small: true })}</span>`])).join('')}`)}${diffT('看差异：火球术', [['伤害', '8d6', '9d6'], ['射程', '150 尺', '150 尺']])}<div class="trpg-confirm__actions" style="margin-top:8px">${btn('全部同步')}${btn('关闭', { primary: true })}</div></div>`)

export const screens = [
  {
    id: 'p6-15-previews', group: G1, title: '大操作先预览：长休 · 短休 · 等级管理（升 / 降）· 套用模板', flow: '休息 · 升降级 · 套用模板（R17 R19 R24 R02）',
    goal: '看清会变什么再确认；都能撤销', primary: '确认按钮（弹窗里唯一实心）', patterns: 'Preview（现在 → 之后 对照表）· Confirm',
    laws: 'Safe Exploration · Doherty（先预览后执行）· Tesler（结果由内核算）',
    notes: [[1, '长休', '对照表：生命 / 临时生命 / 各环法术位 / 生命骰 / 次数 / 力竭；「休息会恢复什么」内核能否直接给要查', 'R17 · 候选 G29'], [2, '短休', '先定花几颗生命骰，[掷] 出结果再确认', 'R15 · R17'], [3, '等级管理', '一个步进器：＋升级 / −降级，都先预览「会得到 / 会失去」；要选的（属性提升或专长）由内核给', 'R19 · C5 · G09'], [4, '套用模板', '会换掉 / 会保留；可撤销', 'R02 · C3']],
    board: by({ '1440': on(longRest), '390': on(shortRest), '900': on(levelUp), mid: on(applyTpl) }, { '1440': '长休预览', '390': '短休（窄屏）', '900': '等级管理 3 → 4', mid: '套用模板' }),
  },
  {
    id: 'p6-16-library-sync', group: G, title: '存入我的库（和存档分开）· 来源与同步', flow: '做成模板 · 来源有更新（R05–R07 R32）',
    goal: '存进库和保存存档分得清；来源更新逐项决定', primary: '[存入我的库] / 逐项 [同步]', patterns: 'Confirm · Row actions · Diff', laws: '严格区分（文案写明不改战役）· von Restorff（有更新才出现入口）',
    notes: [[1, '存入我的库', '⋯ ▸ 存入我的库…；写明不改战役和存档；选放进哪个包', 'R05 · R06 · R07 · C2'], [2, '来源与同步', '页头只在有更新时出现「3 项来源有更新」；逐项 [看差异][同步][保留我的]，同步可撤销', 'R32']],
    board: by({ '1440': on(saveLib), '900': on(sync, { sync: 1 }), '390': on(saveLib) }, { '1440': '存入我的库', '900': '来源与同步', '390': '存入我的库（窄屏）' }),
  },
  {
    id: 'p6-17-states', group: G, title: '异常状态：读档摘要 · 资料不可用 · 操作失败 · 只读', flow: '读档 / 失败 / 只读（R27 R33）',
    goal: '出了什么事就在出事的地方说清楚，不丢数据', primary: '—', patterns: 'Toast（宿主顶栏下）· Inline error', laws: 'Peak-End（读档后给摘要）· Postel（失败后保留输入）',
    notes: [[1, '读档摘要', '提示条：「已读《失落矿坑 · 存档 2》· 11 人 · 2 人有资料不可用 [查看]」；对应人物行有黄色标签', 'R27 · R33'], [2, '操作失败', '出事那一行下面：⚠ 原因 + [重试]；不弹窗', 'Postel'], [3, '只读窗口', '另一个窗口在写时，⋯ 里的写操作灰掉并写原因', '']],
    board: by({
      '1440': () => ({ content: listPage({ body: `${memSec('随行', 2)}${mem({ name: '雅格拉', en: 'Yagra', cls: '野蛮人', lv: '1 级', race: '半兽人', warn: '2 项资料不可用', hp: [4, 15], ac: 14, pp: 10, n: 1 })}${mem({ name: '影心', en: 'Shadowheart', cls: '牧师', lv: '1 级', race: '半精灵', hp: [11, 11], ac: 13, pp: 13 })}` }), toast: toast('已读《失落矿坑 · 存档 2》· 11 人 · 2 人有资料不可用', { hint: '点击查看' }) }),
      '900': () => ({ content: listPage({ body: `${memSec('随行', 1)}${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', hp: [12, 18], ac: 12, pp: 11 })}<div style="padding:6px 12px">${errorLine('删除失败：存档被另一个窗口占用。', btn('重试', { small: true, n: 2 }))}</div>` }) }),
      '390': () => ({ content: listPage({ body: `${memSec('随行', 1)}${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', hp: [12, 18], ac: 12, pp: 11 })}` }), pop: `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:12px;top:230px;width:220px">${['移到…', '复制一份', '存入我的库…'].map((t) => `<div class="trpg-dropdown__item" data-disabled>${t}<span class="trpg-dropdown__reason">只读窗口</span></div>`).join('')}<div class="trpg-dropdown__item trpg-dropdown__item--danger" data-disabled>删除</div></div>` }),
    }, { '1440': '读档摘要 + 行上标签', '900': '操作失败', '390': '只读窗口' }),
  },
]
