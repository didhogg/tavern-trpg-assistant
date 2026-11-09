// 库标签与进度环、设置、提示条（Gate 2 §14.5、§14.10）。库页面本身 P4 不碰，只做进度环和"资料安装详情"浮层。
import { pin, btn, badge, ring, toast } from '../lib/ui.mjs'

const CAMP = { name: '失落矿坑', save: '存档 2' }
const home = (extra = '') => `<div class="page-stack"><button class="trpg-banner" type="button"><span class="trpg-banner__title">失落矿坑</span><span class="trpg-banner__line"><span>存档 2</span><span>D&amp;D 5e（2014）</span><span class="trpg-banner__state" data-dirty="false">存档已保存 14:02</span></span></button>${extra}</div>`

// 悬停小窗锚在"库"标签的小环 + 数字旁边：宽 = 侧栏右侧；中 = 图标栏右侧；窄 = 底部标签栏上方（点按）
const popPos = (L) => (L === 'wide' ? 'left:204px;bottom:66px' : L === 'mid' ? 'left:62px;bottom:66px' : '')
const popRow = (title, status, reason = '') => `<div class="trpg-pop__row"><b>${title}</b><small>${status}</small>${reason ? `<span class="trpg-field__hint">${reason}</span>` : ''}</div>`
const pop = (L, head, rows) => `<div class="trpg-pop" style="${popPos(L)}"><h3>${head}</h3>${rows}</div>`

const ringCell = (state, label, when, pct, count) => `<div style="display:grid;gap:6px;justify-items:center;width:200px;text-align:center"><div style="min-height:34px;display:flex;align-items:center">${state === 'none' ? '<span style="font-size:18px">▤</span>' : `<span class="trpg-libmark"><span style="position:relative;display:inline-grid;place-items:center;width:30px;height:30px">${ring(state, { size: 30, pct, glyph: false })}<span style="position:absolute;inset:0;display:grid;place-items:center;font-size:14px">▤</span></span>${count ? `<b class="trpg-count">${count}</b>` : ''}</span>`}</div><b>${label}</b><span class="trpg-field__hint">${when}</span></div>`

const settingsRow = (n, title, sub) => `<button class="trpg-menu__row" type="button"><b>${n ? pin(n) : ''}${title}</b><small>${sub}</small><span aria-hidden="true">▸</span></button>`

export const screens = [
  {
    id: 'library-ring', group: '库标签与进度环', title: '库标签上的小环 + 数字：五种状态', flow: 'F2',
    goal: '只在有任务在下载 / 有失败时，让侧栏"库"标签多一个小环和数字；其余时候什么都不显示', primary: '（只读展示）',
    patterns: 'Progress Indicator', laws: 'Zeigarnik（环常驻到装完）· Doherty（状态变化立刻可见）· 不靠颜色（虚线 / ! / ✓ / 填充度 同时表达）',
    notes: [
      [1, '小环', '作者阶段归并为 3 段：下载文件 → 整理资料 → 准备结算；环 = 3 段 × 任务数，完成的段填满，当前段按 done/total 填；整理阶段没有总数，环转圈、不显示百分比。所以环表示"到了第几步"，不是精确百分比', '【有】tasks.list().progress.stage'],
      [2, '环旁边的数字', '还没完成的项数（官方资料算 1 项，每本冒险各 1 项）；失败的项也计入', '【有】tasks.list'],
      [3, '数据', '界面定时读 tasks.list()；刷新页面后任务清空；"上次没装完"的提示归 P5，P4 不显示', '【有】'],
      [4, '完成动画', '环闭合 → 打勾停 2 秒 → 小环消失 + 提示条"资料已就绪"', '【定】已批准'],
      [5, '向导里没有环', '向导只用浅灰文字说明；不显示任何下载进度', '决定'],
    ],
    board: () => `<div style="display:flex;gap:26px;flex-wrap:wrap;background:#fff;border:1.5px solid #999;border-radius:10px;padding:24px;max-width:1300px">
      ${ringCell('none', '没有任务 / 已就绪', '只有图标，什么都不显示', 0, 0)}
      ${ringCell('running', '下载中', '环按进度填充；旁边数字 = 还没完成的项数', 0.4, 2)}
      ${ringCell('spin', '整理资料中', '当前阶段没有总数：环转圈，不显示百分比', 0.4, 2)}
      ${ringCell('warn', '有失败', '虚线圈 + !，不只靠颜色；数字照常', 0, 1)}
      ${ringCell('done', '全部完成', '闭合 + ✓ 停 2 秒，然后恢复图标', 0, 0)}</div>`,
  },
  {
    id: 'library-pop-running', group: '库标签与进度环', title: '鼠标悬停 / 点按小环：正在下载', flow: 'F2',
    goal: '一眼看清现在在下什么', primary: '（只读）',
    patterns: 'Popover（悬停出现、移开即消失，非模态）· Progress Indicator', laws: 'Doherty · Jakob（悬停图标看详情）· Hick（只有信息，没有按钮）',
    diff: '宽 / 中：小窗出现在"库"标签右侧；窄屏：点按小环后出现在底部标签栏上方，点别处关闭。',
    notes: [
      [1, '小环 + 数字（虚线框 = 鼠标正悬停在这里）', '悬停（触屏点按）→ 紧凑小窗；移开立刻消失，不粘滞；点库标签本身见"提示条"屏', '【有】'],
      [2, '小窗只列"正在下载 / 下载失败"的项', '每项一行：名称 + 状态（下载文件 · 整理资料 · 等待下载）。不列：英文原件（结算内核要的，默认和资料一起装）、已完成的项、版本', '【有】tasks.list'],
      [3, '没有任何按钮', '取消 / 继续都归 P5 库页', '决定'],
    ],
    render: (L) => ({ header: { campaign: CAMP, dirty: false }, lib: { state: 'running', pct: 0.3, count: 2, hover: true }, pins: { lib: 1 }, content: home(),
      pop: pop(L, `${pin(2)}正在下载 · 2 项`, `${popRow('官方资料', '整理资料…')}${popRow('冒险《凡戴尔的失落矿坑》', '等待下载')}`) }),
  },
  {
    id: 'library-pop-failed', group: '库标签与进度环', title: '鼠标悬停 / 点按小环：有下载失败', flow: 'F2',
    goal: '失败了要知道原因和去哪处理', primary: '（只读）',
    patterns: 'Error Messages · Recoverable error', laws: 'Postel（说清原因）· Zeigarnik（失败的环一直在，直到处理）',
    diff: '同上。',
    notes: [
      [1, '警示小环（虚线 + !）+ 数字', '失败 / 被取消都是这个状态；常驻到处理完', '【有】tasks.list'],
      [2, '失败的一行', '⚠ 名称 + 原因（tasks 的 error）+ "请之后到库里重试"。P4 没有重试 / 继续按钮（库页后续开放）', '【有】；继续按钮是否提前到 P4 见待定项'],
    ],
    render: (L) => ({ header: { campaign: CAMP, dirty: false }, lib: { state: 'warn', count: 1, hover: true }, pins: { lib: 1 }, content: home(),
      pop: pop(L, `${pin(2)}下载情况 · 2 项`, `${popRow('⚠ 官方资料', '下载失败', '有 3 个文件没下载下来。请之后到库里重试。')}${popRow('冒险《凡戴尔的失落矿坑》', '等待下载')}`) }),
  },
  {
    id: 'settings', group: '设置', title: '设置页（三个栏目）', flow: 'F7',
    goal: '找到备份相关设置；进诊断；看关于', primary: '（进入栏目）',
    patterns: 'Settings Editor · 一级下钻（Drilldown）', laws: 'Hick（只有三个入口）· Chunking（备份的三项并成一个栏目）· Jakob（设置页的惯用下钻）',
    diff: '窄屏：栏目行整行 ≥64px 高；其余一样。',
    notes: [
      [1, '"备份与撤销 ▸"', '点进去看到三项（见下一屏）：备份提醒天数、备份提醒存档数、撤销记录上限', '【有】updateSettings / settingsSchema'],
      [2, '"诊断 ▸"', '→ 诊断页（运行检查 → 结果 / 错误 → [返回设置]），内容不改', '【有】'],
      [3, '"关于 ▸"', '→ 版本、许可、致谢', '【有】'],
      [4, '栏目名', '"撤销记录上限"其实是结算撤销，不是备份；和备份放一起只是为了设置页只有一个栏目，所以叫"备份与撤销"（待驾驶员确认名字）', '待定'],
    ],
    render: () => ({ page: 'settings', header: { campaign: CAMP, dirty: false }, content: `<div class="trpg-menu">
      ${settingsRow(1, '备份与撤销', '备份提醒、撤销记录上限')}
      ${settingsRow(2, '诊断', '检查插件和资料有没有问题')}
      ${settingsRow(3, '关于', '版本 0.6.0 · 许可 · 致谢')}</div>` }),
  },
  {
    id: 'settings-backup', group: '设置', title: '设置 · 备份与撤销（点进去后）', flow: 'F7',
    goal: '调三个数字', primary: '（改数字即保存）',
    patterns: 'Settings Editor · Forgiving Format · Input Hints', laws: 'Postel（越界就地提示、自动夹到范围）· Tesler（默认值系统给）',
    diff: '窄屏：数字控件放在说明下方整行。',
    notes: [
      [1, '"‹ 设置"', '返回设置首页', '【有】'],
      [2, '三个数字', '提醒天数（默认 7）· 提醒存档数（默认 10）· 撤销上限（默认 50，1–500）；改完立即保存，提示"已保存"（宿主层提示条）', '【有】updateSettings'],
      [3, '越界提示', '输入框下就近写范围；不允许保存非法值', '【有】schema'],
    ],
    render: () => ({ page: 'settings', title: '设置', header: { campaign: CAMP, dirty: false }, content: `<button class="trpg-back" type="button">${pin(1)}‹ 设置</button><h2 class="trpg-wizard__title">备份与撤销</h2><div class="trpg-settings">
      <div class="trpg-settings__row"><b>${pin(2)}备份提醒：多少天没导出</b><span class="trpg-stepper"><span>−</span><b>7 天</b><span>＋</span></span><span class="trpg-field__hint">距离上次完整备份超过这么多天，抽屉里会提醒你导出。</span></div>
      <div class="trpg-settings__row"><b>备份提醒：多少次保存</b><span class="trpg-stepper"><span>−</span><b>10 次</b><span>＋</span></span><span class="trpg-field__hint">上次备份之后保存这么多次，也会提醒。</span></div>
      <div class="trpg-settings__row"><b>撤销记录上限</b><span class="trpg-stepper"><span>−</span><b>50 条</b><span>＋</span></span><span class="trpg-field__hint">${pin(3)}结算撤销最多保留多少条（1–500）。<span class="trpg-field__err">⚠ 超出范围时在这里写原因</span></span></div></div>` }),
  },
  {
    id: 'toasts', group: '提示条与其他', title: '提示条：酒馆顶部栏下方（宿主层）', flow: 'F3 / F5',
    goal: '操作有反馈，不在插件窗口里挡东西；插件窗口收起时也看得到', primary: '（点击消失）',
    patterns: 'Toast（顶部，非模态）· Undo', laws: 'Doherty（<400ms 出现）· Postel（错误说清原因）· Peak–End（成功 / 撤销要有明确文字）',
    diff: '宽窄都画在酒馆自己的顶部栏下方，居中，盖在插件窗口之上（不是窗口的一部分）；多条时纵向堆叠，最新在上。窄屏全屏窗口是否盖住酒馆顶部栏：待真机核对，线框按"不盖"画。',
    notes: [
      [1, '成功 / 信息', '约 4 秒自动消失；点击立即消失', '【定】已批准'],
      [2, '可撤销（删除后）', '约 6 秒，带[撤销]（restoreSave）；鼠标悬停 / 焦点在内时暂停计时', '【有】'],
      [3, '失败', '约 8 秒，双线框 + ⚠，点击关闭；写原因', '【定】'],
      [4, '点库标签本身（P4 没有库页）', '提示条"资料库页面将在后续版本开放"，避免点了没反应', '【待定】'],
      [5, '位置', '酒馆页面顶部栏下方，宿主层；顶部栏高度在 ST / TauriTavern 里怎么取，真机核对。开发规范 §5.4 原写"在底部"，实现时同步改', '【待查】'],
    ],
    render: () => ({ header: { campaign: CAMP, dirty: false }, content: home(),
      toast: [
        toast(`${pin(1)}已保存存档`, { kind: 'ok' }),
        toast(`${pin(2)}已删除「存档 1」　<u>撤销</u>`, { hint: '6 秒内可撤销' }),
        toast(`${pin(3)}保存存档失败：（示例）磁盘空间不足`, { kind: 'error', hint: '点击关闭' }),
        toast(`${pin(4)}资料库页面将在后续版本开放`),
      ].join('') }),
  },
]
