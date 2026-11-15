// 人物列表 v4：照 Tidy5e 队伍表（彩色分组条带列名 + 成员行：头像 · 名字职业 · 生命条 · AC · 被动 · ⋯）。需求：P6-2 R08–R13。
import { mem, memSec, listPage, btn, icon, iconBtn } from '../lib/parts.mjs'
import { by } from '../lib/frame.mjs'

const G = '列表（人物）'
const party = (o = {}) => `${memSec('随行', 3, { check: o.check, drag: o.drag, n: o.nSec })}
${mem({ name: '盖尔', en: 'Gale', cls: '法师', lv: '3 级', race: '人类', tags: ['学者'], hp: [12, 18], temp: 3, ac: 12, pp: 11, check: o.check?.[0], n: o.nRow, nHp: o.nHp, nMore: o.nMore, drag: o.drag?.[0] })}
${mem({ name: '影心', en: 'Shadowheart', cls: '牧师', lv: '1 级', race: '半精灵', hp: [11, 11], ac: 13, pp: 13, check: o.check?.[1], drag: o.drag?.[1] })}
${mem({ name: '雅格拉', en: 'Yagra', cls: '野蛮人', lv: '1 级', race: '半兽人', warn: '2 项资料不可用', hp: [4, 15], ac: 14, pp: 10, check: o.check?.[2], drag: o.drag?.[2] })}
${memSec('留守', 2, { check: o.check, drag: o.drag })}
${mem({ name: '阿斯代伦', en: 'Astarion', cls: '游荡者', lv: '1 级', race: '高等精灵', hp: [9, 9], ac: 14, pp: 13, check: o.check?.[3], drag: o.drag && 'true' })}
${mem({ name: '伊娃', building: '4 / 10', check: o.check?.[4], drag: o.drag && 'true' })}`
const enemies = (o = {}) => `${memSec('在场', 3, { check: o.check })}${[1, 2, 3].map((i) => mem({ name: `地精 ${i}`, en: 'Goblin', cls: '小型类人', lv: '挑战 1/4', hp: [i === 2 ? 2 : 7, 7], ac: 15, pp: 9, enemy: true, check: o.check?.[i - 1] })).join('')}`
const newMenu = `<div class="trpg-dropdown" style="position:absolute;z-index:40;right:0;top:100%;margin-top:4px;width:200px">${['分步建卡', '从模板（库）…', '空白人物'].map((t) => `<div class="trpg-dropdown__item">${t}</div>`).join('')}</div>`

export const screens = [
  {
    id: 'p6-1-list', group: G, title: '人物列表：分组表（Tidy5e 队伍表的样子）', flow: '找人 · 看血 · 点进详情（P6-2 §5）',
    goal: '一眼看全队的生命、AC、被动察觉；点一行进整页详情', primary: '[＋ 新建]', patterns: '分组表（Tidy5e GroupMembersTab）· One-Window Drilldown',
    laws: 'Jakob（Foundry 用户熟悉的队伍表）· Miller（随行 / 留守两组）· von Restorff（AC 盾形、低血红条）· Fitts（行高 64）',
    diff: '宽：一行 = 头像 · 名字 + 职业等级 + 种族 + 标签 · 生命条 · AC · 被动察觉 · ⋯；窄 390：去掉被动察觉列和标签，分类分段占满一行。',
    notes: [
      [1, '分类分段（队伍 / NPC / 敌人 / 全部）', '带人数；新建 / 加入的人物放进当前分类，之后可换', 'R08 · R09'],
      [2, '搜索 · 排序 · 选择 · ＋新建', '搜索跨分类；排序默认「手动」；[选择] 进多选（p6-3）；[新建 ▾] 三项', 'R01 · R12 · R13'],
      [3, '分组条', '实底红条写组名和人数，同一条上写列名（生命 / AC / 被动察觉），下面每行按同样的列对齐', 'Tidy5e'],
      [4, '成员行', '点整行 = 进详情；生命条红 + 临时生命金；**数值全由内核给**；「2 项资料不可用」黄色标签；建卡中的人显示 [继续建卡]', 'R11 · R33'],
      [5, '⋯ 行菜单', '移到… / 复制一份 / 存入我的库… / 删除（可撤销）', 'R07 · R09 · R25'],
    ],
    board: by({
      '1440': (L) => ({ content: listPage({ body: party({ nSec: 3, nRow: 4, nMore: 5 }), pins: { cats: 1, search: 2 } }) }),
      mid: (L) => ({ content: listPage({ body: party() }) }),
      '390': (L) => ({ content: listPage({ body: party() }) }),
    }, { '1440': '960 窗口', mid: '600 窗口', '390': '手机窄屏' }),
  },
  {
    id: 'p6-2-list-states', group: G, title: '列表的其它状态：空 · 搜不到 · 加载 · 拖动排序', flow: '空态 / 失败 / 加载',
    goal: '每种情况一句话 + 下一步', primary: '各状态的按钮', patterns: 'Empty state · Skeleton · Drag handle',
    laws: 'Doherty（超过 0.3 秒才显示骨架）· Postel（搜索跨分类）',
    notes: [
      [1, '空', '「还没有人物」+ [从模板加入] [分步建卡]', 'R01'],
      [2, '搜不到', '「没找到红龙」；别的分类里有就直接说在哪 + [去 NPC 看]', 'R12'],
      [3, '加载', '行形状的骨架，不整页转圈', 'Doherty'],
      [4, '拖动排序', '排序是「手动」时每行左边出现拖动手柄；拖起来的行有阴影；改血不换位', 'R12'],
    ],
    board: by({
      '1440': (L) => ({ content: listPage({ tab: 3, body: `<div class="sh-empty"><b>还没有人物</b><span class="sh-2">从库里加一个，或者一步步建一张角色卡。</span><span style="display:flex;gap:8px">${btn('从模板加入', { primary: true })}${btn('分步建卡')}</span></div>` }) }),
      '900': (L) => ({ content: listPage({ search: '红龙', body: `<div class="sh-empty"><b>没找到「红龙」</b><span class="sh-2">NPC 里有 1 个：红龙幼龙。</span><span style="display:flex;gap:8px">${btn('去 NPC 看')}${btn('清除搜索')}</span></div>` }) }),
      '390': (L) => ({ content: listPage({ body: Array.from({ length: 4 }, () => '<div class="sh-skel"><i></i><i></i><i></i><i></i></div>').join('') }) }),
      mid: (L) => ({ content: listPage({ body: party({ drag: ['true', 'lift', 'true'] }) }) }),
    }, { '1440': '空', '900': '搜不到', '390': '加载中', mid: '手动排序：拖动中' }),
  },
  {
    id: 'p6-3-select-new', group: G, title: '多选（遭遇结束清怪）· 新建菜单', flow: '遭遇结束删怪 · 换分类（R10 · R09）',
    goal: '全选删除一步到位，删了能撤销；新建只有一个入口', primary: '底栏 [删除]（危险色，隔开）', patterns: 'Multi-select · Action bar · Undo（不弹确认）',
    laws: 'Fitts（危险按钮隔开）· Hick（新建 3 项）· Safe Exploration',
    notes: [
      [1, '选择模式顶条', '「已选 3 个」+ [全选这一分类] + [完成]；每行左边出现勾选框', 'R10'],
      [2, '底栏动作', '[移到 ▾] [复制] [存入我的库…] …… [删除]；删除后顶栏撤销按钮写「撤销：删除 3 个」，不弹确认框；**不做专用"清怪"入口**', 'R09 · R10 · R25 · C7'],
      [3, '＋新建 菜单', '分步建卡 / 从模板（库）… / 空白人物', 'R01'],
    ],
    board: by({
      '1440': (L) => ({ noFab: true, content: listPage({ tab: 2, selbar: `<div class="sh-selbar">已选 3 个　${btn('全选这一分类', { small: true })}${btn('完成', { small: true })}</div>`, body: enemies({ check: [true, true, true] }), foot: `<div class="sh-foot">${btn('移到', { ic: 'caret-down' })}${btn('复制')}${btn('存入我的库…')}<span class="sh-foot__sp"></span>${btn('删除', { danger: true, ic: 'trash' })}</div>` }) }),
      '900': (L) => ({ content: listPage({ body: party(), newMenu }) }),
      '390': (L) => ({ noFab: true, content: listPage({ tab: 2, selbar: `<div class="sh-selbar">已选 3 个${btn('完成', { small: true })}</div>`, body: enemies({ check: [true, true, true] }), foot: `<div class="sh-foot">${btn('移到', { small: true })}${btn('复制', { small: true })}${iconBtn('dots-three', '更多')}<span class="sh-foot__sp"></span>${btn('删除', { danger: true, small: true })}</div>` }) }),
    }, { '1440': '敌人分类：全选 3 只地精', '900': '新建菜单', '390': '窄屏多选' }),
  },
]
