// 小铅笔页面（手改页）：自动值在这里覆盖、复原。流程见 docs/handoff/P6-5_自动值与手动覆盖_流程图.md。
// 一行一项：项目名（下面小字写自动值与来源）· 现在显示 · 手改为 · [回到自动]。[应用] 写进当前战役数据，算一条改动记录。示例数值是占位，真实值由内核给。
import { btn, icon, P, sec, tr, tbl, mdl, mh } from './parts.mjs'

const COLS = 'minmax(0,1fr) 54px 84px 96px'
const orow = ({ name, src, hint, now, man, val, n }) => tr([
  `<span class="ov-itm"><b>${P(n)}${name}</b><small>自动 ${src}${hint ? `　<button class="trpg-link" type="button">${hint} ${icon('caret-down', 12)}</button>` : ''}</small></span>`,
  `<span${man ? ' class="sh-man"' : ''}>${now}</span>`,
  `<span class="ov-in" data-on="${!!man}">${man ? val : '不改'}</span>`,
  `<span>${btn('回到自动', { small: true, disabled: !man })}</span>`])
const table = (title, rows, n) => tbl(COLS, `${sec(title, null, ['现在', '手改为', ''], { n })}${rows.map(orow).join('')}`)
const TABS = ['等级', '生命', '属性', '战斗', '技能']
const tabsRow = (on, n) => `<div class="ov-tabs" role="tablist">${P(n)}${TABS.map((t, i) => `<button class="pk-tab" role="tab" type="button" aria-selected="${i === on}">${t}</button>`).join('')}</div>`
const foot = (n) => `<div class="ov-foot">${btn('全部回到自动（本页）')}<span style="flex:1"></span>${btn('取消')}${btn('应用', { primary: true, n })}</div>`

const pages = {
  0: (o) => `${table('等级与经验', [
    { name: '等级', src: '3（法师 3）', now: 3, n: o.nRow },
    { name: '升级所需经验', src: '2,700', now: '2,700' }])}
<p class="ov-note">要升级 / 降级，用角色表上的 [等级管理]（会先预览会得到 / 失去什么）；这里是直接把显示的等级盖成别的数，随时可回到自动。</p>`,
  1: (o) => `${table('生命', [
    { name: '最大生命', src: '18', hint: '来源', now: 20, man: true, val: 20, n: o.nRow },
    { name: '生命骰数量', src: '3', now: 3 },
    { name: '生命骰面数', src: 'd6', now: 'd6' }], o.nSec)}
<p class="ov-note"><b>来源</b>（点开）：生命骰 + 体质调整值 × 3 级 + 加成 1 = 18。当前生命、临时生命不在这里改——在角色表上点数字就地改。</p>`,
  2: (o) => `${table('属性（点一行展开：初始值 · 加成 · 最终值 · 调整值 · 豁免）', [
    { name: '力量', src: '8', hint: '展开', now: 8 }, { name: '敏捷', src: '14', hint: '展开', now: 14 }, { name: '体质', src: '12', hint: '展开', now: 12 }], o.nSec)}
${tbl(COLS, `${sec('智力（展开）', null, ['现在', '手改为', ''])}${[
    { name: '初始值（设定）', src: '16', now: 16, n: o.nRow },
    { name: '加成', src: '+2（人类 +1、专长 +1）', now: '+2' },
    { name: '最终值', src: '18', now: 20, man: true, val: 20 },
    { name: '调整值', src: '+4', hint: '随最终值', now: '+5' },
    { name: '豁免加值', src: '+6（调整值 +4、熟练 +2）', now: '+7' }].map(orow).join('')}`)}
${table('', [{ name: '感知', src: '12', hint: '展开', now: 12 }, { name: '魅力', src: '10', hint: '展开', now: 10 }])}`,
  3: (o) => `${table('战斗', [
    { name: 'AC', src: '12', hint: '来源', now: 14, man: true, val: 14, n: o.nRow },
    { name: '先攻', src: '+2', now: '+2' }, { name: '速度', src: '30 尺', now: '30 尺' }, { name: '熟练加值', src: '+2', now: '+2' },
    { name: '被动察觉', src: '11', now: 11 }, { name: '被动洞悉', src: '13', now: 13 }, { name: '被动调查', src: '16', now: 16 },
    { name: '法术豁免 DC', src: '14', now: 14 }, { name: '法术攻击加值', src: '+6', now: '+6' }], o.nSec)}`,
  4: (o) => `${table('技能', [
    { name: '奥秘', src: '+6（智力 +4、熟练 +2）', now: '+8', man: true, val: '+8', n: o.nRow },
    { name: '历史', src: '+6', now: '+6' }, { name: '调查', src: '+6', now: '+6' }, { name: '洞悉', src: '+3', now: '+3' }, { name: '察觉', src: '+1', now: '+1' },
    { name: '运动', src: '−1', now: '−1' }, { name: '杂技', src: '+2', now: '+2' }, { name: '隐匿', src: '+2', now: '+2' }, { name: '欺瞒', src: '+0', now: '+0' }], o.nSec)}
<p class="ov-note">熟练级别（无 / 半熟练 / 熟练 / 专精）也在这一页改，同样可回到自动。</p>`,
}
export const ovModal = (tab, o = {}) => `<div class="wz-modal">${mdl('sheet', mh('手改数值', { n: o.nTitle }), `<div class="ov">${tabsRow(tab, o.nTabs)}<div class="ov-scroll">${pages[tab](o)}</div>${foot(o.nApply)}</div>`)}</div>`
