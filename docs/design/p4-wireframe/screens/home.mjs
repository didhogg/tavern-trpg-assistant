// 外壳与首页（Gate 2 §14.3 / F0）。首页·空态保持现有样子（驾驶员 2026-11-09 定）。
import { pin, btn, badge, toast } from '../lib/ui.mjs'

const CAMP = { name: '失落矿坑', save: '存档 2' }
const OWNER = '卡宾斯·哈林顿'

const recent = (n) => `
  <h2 class="trpg-group">${pin(n)}最近记录</h2>
  <div class="trpg-empty" style="position:relative">
    <span>还没有记录。点击右下角的骰子圆球，随时可以掷骰。</span>
    <button class="trpg-link trpg-link--hl" type="button">⚄ 掷一次骰子试试</button>
  </div>`

const bannerBtn = (n, dirtyText, dirty) => `
  <button class="trpg-banner" type="button">
    <span class="trpg-banner__title">${pin(n)}${CAMP.name}</span>
    <span class="trpg-banner__line"><span>${CAMP.save}</span><span>D&amp;D 5e（2014）</span><span class="trpg-banner__state" data-dirty="${dirty}">${dirtyText}</span></span>
  </button>`

export const screens = [
  {
    id: 'home-nochat', group: '外壳与首页', title: '首页 · 没有打开聊天', flow: 'F0',
    goal: '告诉用户为什么现在什么都做不了，以及怎么解决', primary: '（无主动作：这一状态只有一句指引）',
    patterns: 'Clear Entry Points · Escape Hatch（侧栏设置、库、关闭始终可用）', laws: 'Hick（零选项）· Zeigarnik（聊天一打开自动变成横幅）',
    diff: '宽 / 窄只差侧栏与底部标签栏；内容一样。',
    notes: [
      [1, '空态提示块', '不可点；写原因 + 下一步（现有只有标题，这里补一行说明）', '【有】campaign.owner 为空'],
      [2, '侧栏 / 底部标签', '设置、库、关闭不受影响', '【有】'],
      [3, '聊天打开后', '提示块自动换成"开始一场新的冒险"横幅', '【待查】owner 是否实时更新'],
    ],
    render: () => ({ content: `<div class="page-stack"><div class="trpg-hero trpg-hero--idle"><span class="trpg-hero__title">${pin(1)}请先在酒馆中打开一个聊天</span><span class="trpg-hero__sub">打开任意聊天后，这里会出现「开始一场新的冒险」。</span></div></div>`, pins: { lib: 2 } }),
  },
  {
    id: 'home-empty', group: '外壳与首页', title: '首页 · 空态（保持现有样子）', flow: 'F0 → F1 入口',
    goal: '开始一场新冒险（有存档时也能读取旧的）', primary: '开始新冒险（整块横幅）',
    patterns: 'Center Stage + 单一主动作（Prominent CTA）', laws: 'Hick（一屏一个主动作）· Von Restorff（只有横幅是深色实块）· Fitts（整块可点）',
    diff: '窄屏横幅内边距和标题字号缩小，其余不变；"读取已有存档"卡片行在两种宽度都在横幅下方，窄屏整行 ≥44px 高。',
    notes: [
      [1, '"开始一场新的冒险"横幅（整块是一个按钮）', '点击 → 打开四步向导（F1）；只读时灰显', '【有】campaign.owner / readOnly'],
      [2, '"读取已有存档"次要卡片行（描边、图标 + 文字 + "N 个存档 ▸"，整行可点）', 'N>0 才出现；点击 → 存档抽屉（F4）。N = saves.count()。比深色横幅弱一级：描边、不填色，只做次要入口', '【有】'],
      [3, '没有设置入口、没有规则选择、没有快捷卡', '按驾驶员要求：首页保持现状，不塞东西', '锁定'],
    ],
    render: () => ({
      content: `<div class="page-stack"><button class="trpg-hero" type="button"><span class="trpg-hero__title">${pin(1)}开始一场新的冒险</span><span class="trpg-hero__sub">为「${OWNER}」建立一个战役：选规则、资料与冒险，再起个名字。</span><span class="trpg-hero__go">开始新冒险 →</span></button>
      <button class="trpg-linkcard" type="button"><span class="trpg-linkcard__icon" aria-hidden="true">↺</span><span class="trpg-linkcard__text"><b>${pin(2)}读取已有存档</b><small>接着玩以前的战役</small></span><span class="trpg-linkcard__go">3 个存档 ▸</span></button></div>`,
    }),
  },
  {
    id: 'home-readonly', group: '外壳与首页', title: '首页 · 只读（另一窗口占用）', flow: 'F0',
    goal: '让用户明白为什么不能开始，而不是一个哑巴灰按钮', primary: '（无；写操作都不可用）',
    patterns: 'Disabled with explanation', laws: 'Postel（说清原因）· Jakob（徽章位置同保存状态）',
    diff: '窄屏徽章在页头右侧，⋯ 菜单旁。',
    notes: [
      [1, '页头"只读"徽章', '点击 → 提示条"另一个窗口正在使用这份数据，这里只能查看"', '【有】campaign.readOnly'],
      [2, '横幅灰显 + 一行原因', '不可点；原因直接写在横幅下（现在只是变灰，没解释）', '本次补'],
    ],
    render: () => ({
      header: { readonly: true, pins: { ro: 1 } },
      content: `<div class="page-stack"><button class="trpg-hero trpg-hero--off" type="button" disabled><span class="trpg-hero__title">开始一场新的冒险</span><span class="trpg-hero__sub">为「${OWNER}」建立一个战役：选规则、资料与冒险，再起个名字。</span><span class="trpg-hero__go">开始新冒险 →</span></button>
      <p class="trpg-field__hint">${pin(2)}另一个窗口正在使用这份数据，这里只能查看。</p></div>`,
    }),
  },
  {
    id: 'home-campaign', group: '外壳与首页', title: '首页 · 有战役（有未保存改动）', flow: 'F0 / F3',
    goal: '看清现在在哪场战役、哪个存档、有没有存；一键保存或打开存档', primary: '保存（页头，有改动时）；打开存档（横幅整块）',
    patterns: 'Visual Framework · Center Stage · Prominent Done（保存）', laws: 'Proximity（战役名、存档名、保存状态靠在一起）· Serial Position（战役名在最上）· Zeigarnik（● 常驻到保存）',
    diff: '窄屏：页头芯片收进 ⋯ 菜单（菜单里"存档"）；横幅是主要入口；侧栏换成底部标签栏。页头的[保存]宽窄都保留。',
    notes: [
      [1, '页头存档芯片"战役名 / 存档名 ▾"', '点击 → 存档抽屉；过长名字省略号截断', '【接】战役名取 getCampaignView.name'],
      [2, '页头[保存]（仅有改动时出现）', '→ 保存；成功提示"已保存存档"', '【接】战绑内核后调 kernelSave.save'],
      [3, '战役横幅（整块一个点击区）', '→ 存档抽屉；现在"存档名""保存状态"是两个按钮，合并', '【有】'],
      [4, '"最近记录"空态：文字说明 + 高亮的可点击"掷一次骰子试试"', '用户看文字就懂，不画箭头；点击 → 弹出骰子悬浮窗，首页不跳转；有记录后换成记录列表', '【占位】记录数据后端没有'],
      [5, '右下骰子圆球（悬浮）', '点击 → 骰子悬浮窗', '【有】ui.diceOpen'],
    ],
    render: () => ({
      header: { campaign: CAMP, dirty: true, pins: { chip: 1, save: 2 } },
      content: `<div class="page-stack">${bannerBtn(3, '● 有未保存到存档的改动', true)}${recent(4)}</div>`,
      pins: { dice: 5 },
    }),
  },
  {
    id: 'home-started', group: '外壳与首页', title: '首页 · 刚开局（资料在后台下载）', flow: 'F1 完成 → F2',
    goal: '开局后立刻能用，同时看得见资料在后台装', primary: '继续玩（保存 / 骰盘 / 存档）',
    patterns: 'Progress Indicator（库标签小环）· Non-blocking feedback（宿主层提示条）', laws: 'Doherty（开局不等下载）· Peak–End（开局有明确结尾提示）· Zeigarnik（环常驻到装完）',
    diff: '窄屏环在底部标签栏的"库"上；宽屏在侧栏"库"图标外圈；提示条都在酒馆顶部栏下方。',
    notes: [
      [1, '提示条"已开始「失落矿坑」"', '显示在酒馆页面顶部栏下方（宿主层，不在插件窗口里），点击消失，约 4 秒自动消失', '【定】已批准；顶部栏高度待真机核对'],
      [2, '侧栏 / 标签栏"库"图标外圈的小环 + 旁边的数字（还没完成的项数）', '鼠标悬停（触屏点按）→ 紧凑小窗，移开即消失（见"库标签与进度环"）；向导里没有任何下载进度', '【有】tasks.list'],
      [3, '没有"有改动"标记，横幅写"存档已保存 14:02"', '刚建好的存档不是脏的', '【有】'],
    ],
    render: () => ({
  header: { campaign: CAMP, dirty: false },
  lib: { state: 'running', pct: 0.3, count: 2 }, pins: { lib: 2 },
  toast: toast(`${pin(1)}已开始「失落矿坑」`, { kind: 'ok' }),
  content: `<div class="page-stack"><button class="trpg-banner" type="button"><span class="trpg-banner__title">${CAMP.name}</span><span class="trpg-banner__line"><span>${CAMP.save}</span><span>D&amp;D 5e（2014）</span><span class="trpg-banner__state" data-dirty="false">${pin(3)}存档已保存 14:02</span></span></button>
  <h2 class="trpg-group">最近记录</h2><div class="trpg-empty"><span>还没有记录。点击右下角的骰子圆球，随时可以掷骰。</span><button class="trpg-link trpg-link--hl" type="button">⚄ 掷一次骰子试试</button></div></div>`,
}),
  },
]
