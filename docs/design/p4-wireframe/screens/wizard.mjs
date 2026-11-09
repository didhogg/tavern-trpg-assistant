// 开始新冒险：四步弹窗（Gate 2 §14.4 / F1）。样子参考 65.png：标题、步骤条、上一步 / 下一步、右上 ✕。
import { pin, btn, badge, check, ring, field, input, modal, modalHead } from '../lib/ui.mjs'

const BEHIND = (L) => `<div class="page-stack"><button class="trpg-hero" type="button"><span class="trpg-hero__title">开始一场新的冒险</span><span class="trpg-hero__sub">为「卡宾斯·哈林顿」建立一个战役：选规则、资料与冒险，再起个名字。</span><span class="trpg-hero__go">开始新冒险 →</span></button></div>`
const LABELS = ['规则', '资料', '冒险', '命名']

/** 步骤条。states：每步 current / done / todo / skipped；pins 给第几步加编号。 */
function steps(current, { skipped = [], pinAt = null } = {}) {
  const li = LABELS.map((l, i) => {
    const n = i + 1
    const st = skipped.includes(n) ? 'skipped' : n === current ? 'current' : n < current ? 'done' : 'todo'
    return `<li data-state="${st}"><span class="trpg-steps__n">${n}</span><span>${l}${st === 'skipped' ? '（跳过）' : ''}</span></li>`
  }).join('')
  return `${pinAt ? `<div style="margin-bottom:4px">${pin(pinAt)}步骤条：已完成的可点回，跳过的灰显</div>` : ''}<ol class="trpg-steps" aria-label="步骤">${li}</ol><p class="trpg-steps__compact">${current}/4 · ${LABELS[current - 1]}</p>`
}

const foot = ({ prev = true, next = '下一步', nextDisabled = false, nextPin = null } = {}) =>
  `<footer class="trpg-wizard__foot">${prev ? btn('上一步') : ''}${btn(next, { primary: true, disabled: nextDisabled, n: nextPin })}</footer>`

const wiz = (step, body, f, opts) => modal('dialog', modalHead('开始新冒险'), `<div class="trpg-wizard">${steps(step, opts)}<div class="trpg-wizard__body">${body}</div>${foot(f)}</div>`)

const shelfGroup = (name, count, rows, open = false) => `<details class="trpg-shelf__group"${open ? ' open' : ''}><summary class="trpg-shelf__sum">${name}<small>${count}</small></summary>${rows.join('')}</details>`
const bookRow = (name, date, on = true) => `<div class="trpg-shelf__row">${check(name, on)}<small>${date} · 未下载</small></div>`
const advRow = (name, lvl, story, on = false) => `<div class="trpg-shelf__row">${check(name, on)}<small>等级 ${lvl} · ${story}</small></div>`

const dataState = (kind, n) => {
  const box = (r, title, sub, extra = '') => `<div class="trpg-datastate">${r}<div style="display:grid;gap:2px"><b>${n ? pin(n) : ''}${title}</b><span class="trpg-field__hint">${sub}</span></div>${extra}</div>`
  if (kind === 'none') return box(emptyRing(), '未下载 · 约 150 MB', '开始后在后台下载，不影响你开始。为结算，会同时安装英文原件。')
  if (kind === 'running') return box(ring('running', { size: 56, pct: 0.55 }), '下载中 · 整理资料…', '可以直接开始，下载在后台继续。')
  if (kind === 'incomplete') return box(ring('warn', { size: 56 }), '上次没装完', '已下载的文件会保留，继续时自动跳过。', btn('继续', { small: true }))
  return box(ring('done', { size: 56 }), '已就绪', '资料已安装，可以直接开始。')
}
// "未下载"用空环：灰色轨道、没有填充
const emptyRing = () => ring('running', { size: 56, pct: 0 })

const step2 = ({ state = 'none', skel = false, error = false, pins = { scope: 1, state: 2, shelf: 3 } } = {}) => {
  const p = (k) => (pins[k] ? pin(pins[k]) : '')
  const scope = `<div class="trpg-field"><span class="trpg-field__label">${p('scope')}范围</span><div style="display:flex;gap:18px;flex-wrap:wrap">${check('2014', true)}${check('2024', false)}</div><span class="trpg-field__hint">2014 战役默认只含 2014 版来源</span></div>`
  const shelf = skel
    ? `<div class="trpg-field"><span class="trpg-field__label">${p('shelf')}书架</span><div class="trpg-skeleton"><i></i><i></i><i></i></div><span class="trpg-field__hint">正在读取书目…（超过 1 秒才显示）</span></div>`
    : error
      ? `<div class="trpg-field"><span class="trpg-field__label">${p('shelf')}书架</span><div class="trpg-empty"><span>⚠ 书目取不到：官方书目（cn）取不到：网络连接失败</span><span class="trpg-field__hint">不影响开局：先用默认范围，之后可以再改。</span>${btn('重试', { small: true })}</div></div>`
      : `<div class="trpg-field"><span class="trpg-field__label">${p('shelf')}书架（按作者分组，默认只展开"核心"；这一块自己滚动）</span><div class="trpg-shelf">
          ${shelfGroup('核心', 6, [bookRow('玩家手册', '2014-08-19'), bookRow('怪物图鉴', '2014-09-30'), bookRow('地下城主指南', '2014-12-09')], true)}
          ${shelfGroup('官方出版物', 11, [])}${shelfGroup('设定集', 15, [])}${shelfGroup('扩展包', 13, [])}</div></div>`
  // 资料状态放在书架前面：这是本步最重要的信息，不能被 40 本书挤到滚动区下面
  return `<h3 class="trpg-wizard__title">选择资料</h3>${scope}${dataState(state, pins.state)}<div style="margin-top:10px">${shelf}</div>`
}

export const screens = [
  {
    id: 'wizard-1-rule', group: '向导', title: '向导 ① 规则', flow: 'F1',
    goal: '确认这场战役用哪套规则', primary: '下一步',
    patterns: 'Wizard + Progress Indicator · Cancelability · Datatip（术语悬停说明）', laws: 'Hick（现只有一个规则，自动选中）· Jakob（步骤条 + 上一步 / 下一步）',
    diff: '宽屏居中弹窗 640 宽；窄屏铺满，步骤条换成一行"1/4 · 规则"，按钮纵向排列、主按钮在最上。',
    notes: [
      [1, '步骤条', '已完成的可点回；当前加粗；跳过的灰显 + 原因', '【有】向导状态（现只有两步，P4 扩为四步）'],
      [2, '规则卡', '现在只有一个规则，自动选中仍停在本步', '【有】RuleRegistry'],
      [3, '规则名术语（点划线）', '悬停 / 长按显示一句简介，不是链接（详情页是 P5）', '统一高亮'],
      [4, '[下一步]', '→ 第②步；第①步没有[上一步]（原图里的上一步是假按钮，隐藏）', '【有】'],
      [5, '右上 ✕ / Esc / 点遮罩', '没动过选择 → 直接关；动过 → 弹窗内换页"放弃这次新建？"', '【有】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(1, `<h3 class="trpg-wizard__title">选择这场战役用的规则</h3><div class="trpg-rulecard"><span class="trpg-radio"></span><div>${pin(2)}<span class="trpg-term">D&amp;D 5e（2014）</span>${pin(3)}<div class="trpg-field__hint">龙与地下城第五版（2014 规则），核心规则含玩家手册、地下城主指南与怪物图鉴</div></div></div>`, { prev: false, nextPin: 4 }, { pinAt: 1 }),
    }),
  },
  {
    id: 'wizard-2-data', group: '向导', title: '向导 ② 资料（还没下载）', flow: 'F1',
    goal: '选这场战役看得到哪些书；资料会在后台下，向导不卡', primary: '下一步',
    patterns: 'Titled Sections · Collapsible Panels · Checklist · Progress Indicator（环）', laws: 'Miller（书按作者分组，默认只展开一组）· Tesler（范围、语言系统给默认）· Doherty（进入前已预取书目）',
    diff: '宽屏书架在弹窗内滚动；窄屏铺满，书架行高 ≥44px。语言固定中文，不显示语言选择（中英切换留到 P5）。',
    notes: [
      [1, '范围勾选', '2014 / 2024 …（用户自建范围也在这里）', '【有】wizardOptions.scopes / defaultScopes'],
      [2, '资料状态 + 环（放在书架前面，始终可见）', '未下载时空环 + "约 N MB"（示例数字，N = 各套 downloadBytes 之和）+ "开始后在后台下载"。线框发现：放在书架后面会被挤出弹窗，所以提前', '【有】data[].status / downloadBytes（BE-8）'],
      [3, '书架（作者分组，自己滚动）', '☑ 来自 view.visible；改勾选 → include / exclude → 重新取（书目已缓存，毫秒级）。每行"出版日期 · 未下载"', '【有】wizardOptions.shelf（BE-7）'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ state: 'none' }), {}, {}) }),
  },
  {
    id: 'wizard-2-loading', group: '向导', title: '向导 ② 资料（读取书目中）', flow: 'F1',
    goal: '第一次读书目要 1~5 秒，不能让用户以为卡了', primary: '（等待）',
    patterns: 'Spinners and Loading Indicators（骨架 + 文案）', laws: 'Doherty（>1 秒必须有进度提示）· Zeigarnik',
    diff: '同左。范围块先显示（默认值现成的），只有书架在加载。',
    notes: [
      [1, '范围块', '不依赖书目，先可用', '【有】'],
      [2, '资料状态', '先显示 none 的空环', '【有】'],
      [3, '书架骨架', '超过 1 秒才出现"正在读取书目…"；[下一步]不禁用', '【有】首次空库联网 Chrome 约 2.1 秒、WebKit 约 1 秒（实测）'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ state: 'none', skel: true }), {}, {}) }),
  },
  {
    id: 'wizard-2-error', group: '向导', title: '向导 ② 资料（书目取不到）', flow: 'F1',
    goal: '联网失败时给原因和出路，不堵住开局', primary: '下一步（仍可继续）',
    patterns: 'Error Messages（说清原因 + 怎么办）· Escape Hatch', laws: 'Postel（说清原因）· Hick（重试 / 继续两条路）',
    diff: '同左。',
    notes: [
      [1, '范围块', '仍可改', '【有】'],
      [2, '资料状态', '不受书目影响，照常显示', '【有】'],
      [3, '错误块', '写原因（shelfError）+ [重试]；不写缓存，重试会重新联网', '【有】wizardOptions.shelfError'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ state: 'none', error: true }), {}, {}) }),
  },
  {
    id: 'wizard-2-incomplete', group: '向导', title: '向导 ② 资料（上次没装完）', flow: 'F1 / F2',
    goal: '刷新页面后，仍然提醒"资料装了一半"并能继续', primary: '继续（环旁按钮）或下一步',
    patterns: 'Progress Indicator · Recoverable error', laws: 'Zeigarnik（未完成的事保持可见）· Tesler（已下载的文件自动跳过，用户不用管）',
    diff: '同左；窄屏继续按钮 ≥44px 高。',
    notes: [
      [1, '资料状态：警示环（虚线 + !）+ "上次没装完"', '⚠ 不只靠颜色：虚线圈 + ! + 文字', '【有】data[].status = incomplete（BE-8）'],
      [2, '[继续]', 'tasks.startOfficial；成功后环变 running', '【有】'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ state: 'incomplete', pins: { state: 1 } }), {}, {}) }),
  },
  {
    id: 'wizard-3-adv', group: '向导', title: '向导 ③ 冒险', flow: 'F1',
    goal: '可选：挑一本冒险，开局后在后台下载正文', primary: '下一步（可什么都不选）',
    patterns: 'Collapsible Panels · Checklist', laws: 'Hick（默认一个不选）· Miller（按作者分组折叠）',
    diff: '同上。冒险下载在资料装好之后才开始，这里不等。',
    notes: [
      [1, '冒险列表（按作者分组）', '每行：名称 · 等级范围 · 故事线；默认全不选', '【有】shelf 里 kind = adventure'],
      [2, '说明一行', '"选中的冒险会在资料装好后自动下载正文"', '【有】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(3, `<h3 class="trpg-wizard__title">带上一本冒险？（可选）</h3><div class="trpg-shelf">${pin(1)}
        ${shelfGroup('官方出版物', 59, [advRow('凡戴尔的失落矿坑', '1–5', '新手包', true), advRow('龙与地下城：龙之女王的宝藏', '1–15', '龙之女王'), advRow('冰风谷：冰封之地', '1–12', '冰风谷')], true)}
        ${shelfGroup('扩展包', 43, [])}</div><p class="trpg-field__hint">${pin(2)}选中的冒险会在资料装好后自动下载正文，不影响你现在开始。</p>`, {}, {}),
    }),
  },
  {
    id: 'wizard-4-name', group: '向导', title: '向导 ④ 命名', flow: 'F1',
    goal: '给战役起个名字，看清将要建立什么，然后开始', primary: '开始冒险',
    patterns: 'Wizard · Prominent Done · Forgiving Format · Input Hints', laws: 'Hick（只剩名字和备注）· Tesler（默认名由系统给，打开时全选）· Peak–End（主按钮写"开始冒险"而不是"完成"）',
    diff: '窄屏主按钮在最上，上一步在下。回车 = 开始冒险。',
    notes: [
      [1, '战役名（必填 ≤40 字）', '默认"D&D 2014·11月9日"，打开时全选便于直接改；首尾空格由后端清理', '【有】cleanName'],
      [2, '备注（可空 ≤200 字）', '', '【有】'],
      [3, '摘要块', '规则 · 中文 · 资料约 N MB 需下载（N 没有时只写"需要下载"）· 不带冒险；已有当前战役时多一行"当前战役会先自动存档"', '【接】startCampaign 写"新存档前"自动存档'],
      [4, '[开始冒险]（主按钮）', '→ starter.startCampaign，立即返回；弹窗关闭，首页变有战役，提示"已开始「…」"', '【接】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(4, `<h3 class="trpg-wizard__title">给这场战役起个名字</h3>${field(`${pin(1)}战役名称`, input('D&D 2014·11月9日'), { hint: '1–40 字，之后可以在存档里改名' })}${field(`${pin(2)}备注（可空）`, input('', { placeholder: '比如：周五晚的跑团' }))}
        <div class="trpg-checks"><div>${pin(3)}<b>将建立</b><span>D&amp;D 5e（2014）· 中文资料（约 150 MB 需下载）· 不带冒险</span><span class="trpg-field__hint">当前战役「失落矿坑」会先自动存档。</span></div></div>`, { next: '开始冒险', nextPin: 4 }, {}),
    }),
  },
  {
    id: 'wizard-4-skipped', group: '向导', title: '向导 ④ 命名（③冒险被跳过）', flow: 'F1',
    goal: '没有冒险可选时整步越过，并写明原因', primary: '开始冒险',
    patterns: 'Progress Indicator（跳过态）· Datatip', laws: 'Zeigarnik（跳过的步骤可见，不是凭空消失）· Postel',
    diff: '窄屏步骤条是"4/4 · 命名"，跳过原因写进步骤旁的提示行。',
    notes: [
      [1, '③ 冒险：虚线灰显 +"（跳过）"', '悬停 / 长按显示原因："没有可选冒险（书目取不到）"', '【有】shelfError / shelf 无冒险'],
      [2, '"上一步"仍回到②', '越过的③不在回退路径上', '【有】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(4, `<p class="trpg-field__hint" style="margin:0 0 8px">${pin(1)}③ 冒险已跳过：没有可选冒险（书目取不到）。开局后到库里补。</p>${field('战役名称', input('D&D 2014·11月9日'))}${field('备注（可空）', input('', { placeholder: '比如：周五晚的跑团' }))}`, { next: '开始冒险' }, { skipped: [3] }),
    }),
  },
  {
    id: 'wizard-4-error', group: '向导', title: '向导 ④ 命名（出错）', flow: 'F1',
    goal: '名字不合法或开局失败时，原因就在眼前，已填内容不丢', primary: '修正后开始冒险',
    patterns: 'Error Messages · Input Hints · Disabled with explanation', laws: 'Postel · Doherty（输入框就近反馈）· 不靠颜色（⚠ + 双线边框）',
    diff: '同上。',
    notes: [
      [1, '名字为空 / 超过 40 字', '输入框下就近写原因；[开始冒险]不可点（原因可见，不是哑巴禁用）', '【有】cleanName 的规则'],
      [2, '开局失败（startCampaign 抛错）', '弹窗不关；按钮上方写原因；已填内容全保留；可改后重试', '【接】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(4, `<h3 class="trpg-wizard__title">给这场战役起个名字</h3>${field(`${pin(1)}战役名称`, input('', { invalid: true, placeholder: '' }), { err: '请输入战役名称（1–40 字）' })}${field('备注（可空）', input('周五晚的跑团'))}
        <div class="trpg-empty">${pin(2)}<span>⚠ 开局失败：（示例）这套规则没有装好</span><span class="trpg-field__hint">已填的内容都还在，改好后可以再试一次。</span></div>`, { next: '开始冒险', nextDisabled: true }, {}),
    }),
  },
  {
    id: 'wizard-discard', group: '向导', title: '向导 · 放弃确认', flow: 'F1',
    goal: '选过内容后关闭，防止误关丢掉已填的东西', primary: '继续填写（安全选项）',
    patterns: 'Modal Panel（弹窗内换页，不叠第二个弹窗）· Escape Hatch · Safe Exploration', laws: 'Hick（两个按钮）· Von Restorff（破坏性按钮用双线框，位置在次要侧）',
    diff: '窄屏两个按钮纵向排列，[继续填写]在上。',
    notes: [
      [1, '换页标题"放弃这次新建？"', '"‹ 开始新冒险"返回 = 继续填写', '【有】askConfirm'],
      [2, '[继续填写]（默认焦点） / [放弃]', '放弃 → 关闭向导，已填内容丢弃', '【有】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: modal('dialog', modalHead('放弃这次新建？', '开始新冒险'), `<p>已经选好的内容不会保存。</p><div class="trpg-wizard__foot" style="margin-top:auto">${btn('放弃', { danger: true, n: 2 })}${btn('继续填写', { primary: true })}</div>`),
    }),
  },
]
