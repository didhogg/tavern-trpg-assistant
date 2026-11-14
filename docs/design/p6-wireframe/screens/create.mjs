// 新建：模板面板（从库加入）、分步建卡与"建卡中"。依据 P6-3 D1–D5、D19 与 U6 视觉规格 §3。
import { card, listPage, btn, icon, seg, searchBox, badge, P, pill } from '../lib/parts.mjs'
import { modal as mdl, modalHead as mh } from '../../p5-wireframe/lib/ui.mjs'
import { by } from '../lib/frame.mjs'

const G = '新建（模板 · 分步建卡）'
const row = (name, en, meta, sel, extra = '') => `<div class="trpg-row" style="${sel ? 'background:var(--bg-side);box-shadow:inset 3px 0 0 var(--mark)' : ''};padding:6px 8px;border-radius:8px"><div class="trpg-row__main"><div class="trpg-row__title">${name} <small class="pc-2">${en}</small></div><div class="trpg-row__meta">${meta}</div></div>${extra}</div>`
const stepper = (n) => `<span class="trpg-stepper"><button class="trpg-stepper__btn" type="button" aria-label="减少">${icon('minus', 14)}</button><b class="trpg-stepper__val" style="min-width:48px">${n}</b><button class="trpg-stepper__btn" type="button" aria-label="增加">${icon('plus', 14)}</button></span>`

const templatePanel = (L, pins = {}) => {
  const narrow = L === 'narrow'
  const left = `<div class="pc-col"><div class="pd-row">${P(pins.recent)}<span class="pd-label">最近加入</span>${pill('地精 ×3')}${pill('狼 ×2')}</div>
${seg([{ label: '全部', on: true }, { label: '官方' }, { label: '下载' }, { label: '我的库' }])}
<div class="pd-row"><button class="trpg-btn trpg-btn--small" type="button">类别：怪物 ${icon('caret-down', 14)}</button><button class="trpg-btn trpg-btn--small" type="button">书 ${icon('caret-down', 14)}</button><button class="trpg-btn trpg-btn--small" type="button">挑战 0–2 ${icon('caret-down', 14)}</button></div>${searchBox('地精', pins.search)}
<div class="pc-2" style="font-size:var(--fs-sm)">共 4 条　<button class="trpg-link" type="button">清除</button></div>
${row('地精', 'Goblin', '怪物图鉴 · 挑战 1/4', true)}${row('地精首领', 'Goblin Boss', '怪物图鉴 · 挑战 1')}${row('精英地精', '', '我的库 · NPC')}${row('盖尔（模板）', '', `我的库 ${badge('人物')}`)}</div>`
  const right = `<div class="pc-col" style="border:0"><div class="pc-card-res"><div class="pd-row"><div class="pc-av" style="width:60px;height:75px;grid-area:auto"><div class="pc-av__img">${icon('skull', 24)}</div></div><div><div class="pc-name" style="font-size:var(--fs-2xl)">地精 <span>Goblin</span></div><div class="pc-2">小型类人（地精类）· 中立邪恶</div><div class="pd-row" style="margin-top:6px">${badge('挑战 1/4', 'warn')}${badge('经验 50', 'warn')}</div></div></div>
<div class="pd-combat"><div class="pd-cell"><small>AC</small><b>15</b></div><div class="pd-cell"><small>生命</small><b>7</b></div><div class="pd-cell"><small>速度</small><b>30</b></div></div><div class="pc-2">（下面接库里同一个资料卡组件：属性块、特性、动作……）</div></div></div>`
  const foot = `<div class="pc-foot" style="flex-wrap:wrap;flex-direction:row;align-items:center;justify-content:flex-start"><span class="pd-label">数量</span>${P(pins.qty)}${stepper(3)}<span class="pd-label">生命值</span><button class="trpg-btn trpg-btn--small" type="button">平均 ${icon('caret-down', 14)}</button><span class="pc-faint" style="font-size:var(--fs-xs)">（各自掷骰：后端待查）</span><span style="margin-left:auto;display:flex;gap:8px">${btn('编辑后加入')}${btn('加入 地精 ×3', { primary: true, n: pins.add })}</span><div class="pc-2" style="flex-basis:100%;font-size:var(--fs-sm)">${P(pins.tally)}本次已加入：地精 ×3 <button class="trpg-link" type="button">撤销</button>　放进：敌人（当前标签）</div></div>`
  return mdl('sheet', mh('从模板加入', { n: pins.head }), `<div class="pc-split2" style="height:100%">${left}${narrow ? '' : right}</div>${foot}`)
}
const underEnemies = (L) => listPage({ L, tab: 2, listOnly: true, cards: `${card({ name: '地精 1', cls: '地精', rest: '挑战 1/4', hp: [7, 7], ac: 15, kind: 'enemy' })}${card({ name: '地精 2', cls: '地精', rest: '挑战 1/4', hp: [7, 7], ac: 15, kind: 'enemy' })}` })

const wizard = (L) => mdl('dialog', mh('分步建卡 · 步骤 3 / 7：选择职业'), `<div style="display:grid;gap:var(--sp-3);height:100%;align-content:start">
<div class="pc-step"><i data-on="true"></i><u></u><i data-on="true"></i><u></u><i data-on="true"></i><u></u><i></i><u></u><i></i><u></u><i></i><u></u><i></i></div>
<div class="pc-2" style="font-size:var(--fs-sm)">名字　种族　职业　背景　选项　装备　预览（步骤清单与每步选项由内核给出，界面不写死）</div>
<div class="trpg-field"><label class="trpg-field__label">名字</label><div class="trpg-input">盖尔</div></div>
<div class="pc-section"><h5>本步要选的（内核给出）</h5><div style="display:grid;gap:6px"><label class="trpg-check" data-on="false"><span class="trpg-check__box"></span>战士 <button class="trpg-link" type="button">看资料卡</button></label><label class="trpg-check" data-on="true"><span class="trpg-check__box">${icon('check', 12)}</span>法师 <button class="trpg-link" type="button">看资料卡</button></label><label class="trpg-check" data-on="false"><span class="trpg-check__box"></span>牧师 <button class="trpg-link" type="button">看资料卡</button></label></div></div>
<div class="pc-foot" style="margin:0 calc(-1 * var(--sp-5)) calc(-1 * var(--sp-5));">${btn('跳过此步', { quiet: true })}<span style="flex:1"></span>${btn('上一步', { ic: 'caret-left' })}${btn('下一步', { primary: true })}</div></div>`)

export const screens = [
  {
    id: 'p6-4-template', group: G, title: '从模板加入（模板面板）', flow: 'F1（最常用：新建 → 从模板 → 加入 → 做检定）',
    goal: '加怪要快：筛选、看清资料卡、数量、加入，面板不关，可连续加', primary: '[加入 地精 ×3]', patterns: 'Two-Panel Selector（居中大弹窗；窄屏底部抽屉）· Streamlined Repetition（最近加入）· Preview',
    laws: 'Hick（来源 4 项分段）· Doherty（加完面板内就地累计反馈）· Fitts（数量步进器 ≥44）· Postel（搜索宽进）',
    diff: '1440 / 900：左列表 + 右资料卡；390：只有列表一栏，选一行后换页看资料卡（弹窗内换页）。',
    notes: [
      [1, '最近加入', '点「地精 ×3」= 再加一份；记住上次的数量', 'R01 · G15'],
      [2, '来源 · 类别 · 书 · 挑战等级 · 搜索', '来源 = 官方 / 下载 / 自制导入 / 我的库（含「人物」类模板，带徽章）；筛选列由登记表给，不写死', 'R01–R04 · G16 · G17'],
      [3, '右侧资料卡', '和库里同一个资料卡组件；头像用类型图标', 'R03'],
      [4, '数量 · 生命值 · 编辑后加入 · 加入', '「编辑后加入」先进入这个模板副本的编辑，保存后才进列表；生命值「平均 / 各自掷骰」**后端待查**，不确定就先只有平均；当前标签决定加入后归哪一堆', 'R04 · G15 · G04'],
      [5, '本次已加入累计条', '面板不关；「撤销」撤的是这一次加入（一条记录）；加入后列表里的新行用 1.2 秒金色底提示', 'D4 · G22'],
    ],
    board: by({
      '1440': (L) => ({ content: underEnemies(L), overlay: templatePanel(L, { head: 0, recent: 1, search: 2, qty: 4, add: 4, tally: 5 }) }),
      '900': (L) => ({ content: underEnemies(L), overlay: templatePanel(L, {}) }),
      '390': (L) => ({ content: underEnemies(L), overlay: templatePanel(L, {}) }),
    }),
  },
  {
    id: 'p6-5-wizard', group: G, title: '分步建卡 · 「建卡中」人物', flow: 'F2',
    goal: '一步一个决定；中途离开不丢、不弹确认框', primary: '[下一步]', patterns: 'Wizard + Progress + Cancelability（✕ = 存成建卡中）',
    laws: 'Hick（每步只做一类决定）· Safe Exploration · Changes in Midstream（不丢）· Peak-End（完成直接进详情）',
    diff: '窄屏：弹窗铺满（底部抽屉），按钮纵向，[下一步] 在上；900：✕ 之后回到列表，看到「建卡中」卡片。',
    notes: [
      [1, '步骤条', '步骤清单、每步的选项都**由内核给出**（数据驱动），界面只渲染当前步骤的待选项', 'R01 · G04'],
      [2, '[跳过此步]', '每步可跳过；跳过的进「待填」清单（2026-10-29：空白新建只必填名称）', 'D19'],
      [3, '✕ 关闭', '**不弹"丢掉吗？"**：存成「建卡中」人物，列表里有徽章「建卡中 3 / 7」和 [继续]', 'D19 · 候选 G28（半成品能否存）'],
      [4, '最后一步「完成」', '直接进详情页（人物已就绪）', 'Peak-End'],
    ],
    board: by({
      '1440': (L) => ({ content: listPage({ L, tab: 0, listOnly: true, cards: card({ name: '盖尔', en: 'Gale', cls: '法师 3 级', rest: '人类', hp: [12, 18], ac: 12 }) }), overlay: wizard(L) }),
      '900': (L) => ({ content: listPage({ L, tab: 0, listOnly: true, cards: card({ name: '伊娃', building: [3, 7], n: 3 }) + card({ name: '盖尔', en: 'Gale', cls: '法师 3 级', rest: '人类', hp: [12, 18], ac: 12 }) }) }),
      '390': (L) => ({ content: listPage({ L, tab: 0, listOnly: true, cards: card({ name: '盖尔', en: 'Gale', cls: '法师 3 级', rest: '人类', hp: [12, 18], ac: 12 }) }), overlay: wizard(L) }),
    }, { '900': '点 ✕ 之后：列表里出现「建卡中」人物' }),
  },
]
