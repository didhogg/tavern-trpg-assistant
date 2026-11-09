// 库标签与进度环、设置、提示条（Gate 2 §14.5、§14.10）。库页面本身 P4 不碰，只做进度环和"资料安装详情"浮层。
import { pin, btn, badge, ring, toast } from '../lib/ui.mjs'

const CAMP = { name: '失落矿坑', save: '存档 2' }
const home = (extra = '') => `<div class="page-stack"><button class="trpg-banner" type="button"><span class="trpg-banner__title">失落矿坑</span><span class="trpg-banner__line"><span>存档 2</span><span>D&amp;D 5e（2014）</span><span class="trpg-banner__state" data-dirty="false">存档已保存 14:02</span></span></button>${extra}</div>`

const popPos = (L) => (L === 'wide' ? 'left:206px;bottom:70px' : L === 'mid' ? 'left:64px;bottom:70px' : '')
const popRow = (r, title, sub, action = '') => `<div class="trpg-pop__row">${r}<div style="display:grid"><b>${title}</b><span class="trpg-field__hint">${sub}</span></div>${action}</div>`
const pop = (L, head, rows, foot = '') => `<div class="trpg-pop" style="${popPos(L)}"><h3>${head}</h3>${rows}${foot ? `<span class="trpg-field__hint">${foot}</span>` : ''}</div>`

const ringCell = (state, label, when, pct) => `<div style="display:grid;gap:6px;justify-items:center;width:190px;text-align:center"><div style="display:flex;gap:14px;align-items:center"><span style="position:relative;display:inline-grid;place-items:center;width:30px;height:30px">${ring(state, { size: 30, pct, glyph: false })}<span style="position:absolute;inset:0;display:grid;place-items:center;font-size:14px">▤</span></span>${ring(state === 'none' ? 'running' : state, { size: 56, pct: state === 'none' ? 0 : pct })}</div><b>${label}</b><span class="trpg-field__hint">${when}</span></div>`

export const screens = [
  {
    id: 'library-ring', group: '库标签与进度环', title: '进度环：五种状态', flow: 'F2',
    goal: '一个小组件讲清"资料装到哪了"，侧栏库标签（30px）和向导（56px）共用', primary: '（只读展示）',
    patterns: 'Progress Indicator', laws: 'Zeigarnik（环常驻到装完）· Doherty（状态变化立刻可见）· 不靠颜色（虚线 / ! / ✓ / 填充度 同时表达）',
    notes: [
      [1, '环的算法', '作者阶段归并为 3 段：下载文件 → 整理资料 → 准备结算；环 = 3 段 × 任务数，完成的段填满，当前段按 done/total 填；整理阶段没有总数，环转圈、不显示百分比。所以环表示"到了第几步"，不是精确百分比', '【有】tasks.list().progress.stage'],
      [2, '数据', '界面定时读 tasks.list()；刷新页面后任务清空，靠 dataStatus 的 incomplete 状态继续提示', '【有】BE-8'],
      [3, '完成动画', '环闭合 → 打勾停 2 秒 → 恢复普通图标 + 提示条"资料已就绪"', '【定】已批准'],
    ],
    board: () => `<div style="display:flex;gap:26px;flex-wrap:wrap;background:#fff;border:1.5px solid #999;border-radius:10px;padding:24px;max-width:1300px">
      ${ringCell('none', '已就绪 / 没有任务', '不显示环（左：只有图标；右：向导里"未下载"的空环）', 0)}
      ${ringCell('running', '下载中', '环按进度填充，图标不动', 0.4)}
      ${ringCell('spin', '整理资料中', '当前阶段没有总数：环转圈，不显示百分比', 0.4)}
      ${ringCell('warn', '失败 / 被取消 / 上次没装完', '虚线圈 + !，不只靠颜色；点开有[继续]', 0)}
      ${ringCell('done', '全部完成', '闭合 + ✓ 停 2 秒，然后恢复图标', 0)}</div>`,
  },
  {
    id: 'library-pop-running', group: '库标签与进度环', title: '点库标签：资料安装详情（下载中）', flow: 'F2',
    goal: '看清每一项在做什么，需要时取消', primary: '（查看）；取消',
    patterns: 'Popover（锚在标签上，非模态）· Progress Indicator · Cancelability', laws: 'Doherty · Jakob（点图标看详情）',
    diff: '宽 / 中：浮层锚在侧栏"库"右侧；窄屏：底部抽屉，贴在底部标签栏上方。',
    notes: [
      [1, '库标签 + 环', '点击 → 打开浮层；不是库页面（库页面 P5 做，P4 不碰）', '【有】'],
      [2, '每项一行：名称 / 阶段 / 进度', '阶段只有三种说法：下载文件 · 整理资料 · 准备结算；英文原件是结算内核要的，一并下载', '【有】tasks.list'],
      [3, '[取消]', '→ tasks.cancel；取消后这一行变"已暂停 [继续]"，已下载的文件保留', '【有】'],
    ],
    render: (L) => ({ header: { campaign: CAMP, dirty: false }, lib: { state: 'running', pct: 0.3 }, pins: { lib: 1 }, content: home(),
      pop: pop(L, '资料安装详情', `${popRow(ring('running', { size: 30, pct: 0.6 }), `${pin(2)}官方资料（中文）`, '下载文件 312 / 540', btn('取消', { small: true, n: 3 }))}${popRow(ring('running', { size: 30, pct: 0 }), '英文原件（结算用）', '等待中')}${popRow(ring('running', { size: 30, pct: 0 }), '冒险《凡戴尔的失落矿坑》', '等资料装好后下载')}`, '下载期间保存、分支、读取、设置、骰盘都能用。') }),
  },
  {
    id: 'library-pop-failed', group: '库标签与进度环', title: '点库标签：下载失败 / 上次没装完', flow: 'F2',
    goal: '出错时有出路：继续', primary: '继续',
    patterns: 'Error Messages · Recoverable error', laws: 'Postel（说清原因）· Zeigarnik（刷新后环仍是警示态）',
    diff: '同上。',
    notes: [
      [1, '警示环（虚线 + !）', '失败 / 被取消 / 刷新后装了一半，都是这个状态；常驻到处理完', '【有】dataStatus.status = incomplete'],
      [2, '失败原因', '写 tasks 的 error（例："有 3 个文件没下载下来"）', '【有】'],
      [3, '[继续]', 'tasks.startOfficial；已下载的文件自动跳过', '【有】'],
    ],
    render: (L) => ({ header: { campaign: CAMP, dirty: false }, lib: { state: 'warn' }, pins: { lib: 1 }, content: home(),
      pop: pop(L, '资料安装详情', `${popRow(ring('warn', { size: 30 }), `${pin(2)}官方资料（中文）`, '⚠ 下载失败：有 3 个文件没下载下来', btn('继续', { small: true, primary: true, n: 3 }))}${popRow(ring('running', { size: 30, pct: 0 }), '英文原件（结算用）', '等中文资料装好')}`, '已下载的文件会保留，继续时自动跳过。') }),
  },
  {
    id: 'library-pop-idle', group: '库标签与进度环', title: '点库标签：没有任务（资料已就绪）', flow: 'F2',
    goal: '没有任务时点库标签也有答案，不是死路', primary: '（无）',
    patterns: 'Empty State with explanation', laws: 'Jakob · Postel',
    diff: '同上。',
    notes: [
      [1, '"资料已就绪"+ 版本', '告诉用户当前资料状态', '【有】dataStatus'],
      [2, '尾注"资料库页面将在后续版本开放"', '说明库标签现在只给安装详情；P4 不碰库页面', '【定】'],
    ],
    render: (L) => ({ header: { campaign: CAMP, dirty: false }, lib: { state: 'none' }, pins: { lib: 1 }, content: home(),
      pop: pop(L, '资料安装详情', `${popRow(ring('done', { size: 30 }), `${pin(1)}官方资料（中文、英文）`, '已就绪')}`, `${'资料库页面将在后续版本开放。'}`) }),
  },
  {
    id: 'settings', group: '设置', title: '设置页', flow: 'F7',
    goal: '调三个提醒 / 上限数字；进诊断；看关于', primary: '（改数字即保存）',
    patterns: 'Settings Editor · Forgiving Format · Input Hints', laws: 'Hick（三项 + 两个入口）· Postel（越界就地提示、自动夹到范围）· Tesler（默认值系统给）',
    diff: '窄屏：数字控件放在说明下方整行；其余一样。',
    notes: [
      [1, '三个数字', '提醒天数（默认 7）· 提醒存档数（默认 10）· 撤销上限（默认 50，1–500）；改完立即保存，提示"已保存"', '【有】updateSettings / settingsSchema'],
      [2, '越界提示', '输入框下就近写范围；不允许保存非法值', '【有】schema'],
      [3, '[打开诊断]', '→ 诊断页（运行检查 → 结果 / 错误 → [返回设置]）', '【有】'],
      [4, '关于', '版本、许可、致谢', '【有】'],
      [5, '不放"官方修改默认应用"', '那是 P5 库里"选版本"时的生效范围', '决定'],
    ],
    render: () => ({ page: 'settings', header: { campaign: CAMP, dirty: false }, content: `<div class="trpg-settings">
      <div class="trpg-settings__row"><b>${pin(1)}备份提醒：多少天没导出</b><span class="trpg-stepper"><span>−</span><b>7 天</b><span>＋</span></span><span class="trpg-field__hint">距离上次完整备份超过这么多天，抽屉里会提醒你导出。</span></div>
      <div class="trpg-settings__row"><b>备份提醒：多少次保存</b><span class="trpg-stepper"><span>−</span><b>10 次</b><span>＋</span></span><span class="trpg-field__hint">上次备份之后保存这么多次，也会提醒。</span></div>
      <div class="trpg-settings__row"><b>撤销记录上限</b><span class="trpg-stepper"><span>−</span><b>50 条</b><span>＋</span></span><span class="trpg-field__hint">${pin(2)}结算撤销最多保留多少条（1–500）。<span class="trpg-field__err">⚠ 超出范围时在这里写原因</span></span></div>
      <div class="trpg-settings__row"><b>诊断</b>${btn('打开诊断', { n: 3 })}<span class="trpg-field__hint">检查插件和资料有没有问题。</span></div>
      <div class="trpg-settings__row"><b>${pin(4)}关于</b><span class="trpg-field__hint">版本 0.6.0 · 许可 · 致谢</span></div></div>` }),
  },
  {
    id: 'toasts', group: '提示条与其他', title: '提示条：位置与三种', flow: 'F3 / F5',
    goal: '操作有反馈，但不挡输入框、不要求用户手动关', primary: '（点击消失）',
    patterns: 'Toast（顶部，非模态）· Undo', laws: 'Doherty（<400ms 出现）· Postel（错误说清原因）· Peak–End（成功 / 撤销要有明确文字）',
    diff: '宽窄都在主窗顶部、页头下方；不压住宿主页面的输入框（在窗外底部）。多条时纵向堆叠，最新在上。',
    notes: [
      [1, '成功 / 信息', '约 4 秒自动消失；点击立即消失', '【定】已批准'],
      [2, '可撤销（删除后）', '约 6 秒，带[撤销]（restoreSave）；鼠标悬停 / 焦点在内时暂停计时', '【有】'],
      [3, '失败', '约 8 秒，双线框 + ⚠，点击关闭；写原因', '【定】'],
      [4, '规格变更', '开发规范 §5.4 原写"提示条不需手动关闭、在底部"，改为顶部 + 点击消失；实现时同步改规范', '待实现时改'],
    ],
    render: () => ({ header: { campaign: CAMP, dirty: false }, content: home(),
      toast: `<div style="position:absolute;left:0;right:0;top:0;z-index:20">${[
        ['', toast(`${pin(1)}已保存存档`, { kind: 'ok' })],
        ['top:48px', toast(`${pin(2)}已删除「存档 1」　<u>撤销</u>`, { hint: '6 秒内可撤销' })],
        ['top:96px', toast(`${pin(3)}保存存档失败：（示例）磁盘空间不足`, { kind: 'error', hint: '点击关闭' })],
      ].map(([st, t]) => `<div style="position:absolute;left:0;right:0;${st}">${t}</div>`).join('')}</div>` }),
  },
]
