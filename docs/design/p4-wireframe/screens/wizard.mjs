// 开始新冒险：四步弹窗（Gate 2 §14.4 / F1）。样子参考 65.png：标题、步骤条、上一步 / 下一步、右上 ✕。
// 第二轮意见已并入：向导里没有下载进度 / 大圆圈；下载在战役创建完成后才开始；只有两个阻断点（核心 SRD 缺失、战役名为空）；没有"③被跳过"。
import { pin, btn, check, field, input, modal, modalHead, loading, hint } from '../lib/ui.mjs'

const BEHIND = (L) => `<div class="page-stack"><button class="trpg-hero" type="button"><span class="trpg-hero__title">开始一场新的冒险</span><span class="trpg-hero__sub">为「卡宾斯·哈林顿」建立一个战役：选规则、资料与冒险，再起个名字。</span><span class="trpg-hero__go">开始新冒险 →</span></button></div>`
const LABELS = ['规则', '资料', '冒险', '命名']

/** 步骤条：已完成的可点回，当前加粗；没有"跳过"态。 */
function steps(current, { pinAt = null } = {}) {
  const li = LABELS.map((l, i) => {
    const n = i + 1
    const st = n === current ? 'current' : n < current ? 'done' : 'todo'
    return `<li data-state="${st}"><span class="trpg-steps__n">${n}</span><span>${l}</span></li>`
  }).join('')
  return `${pinAt ? `<div style="margin-bottom:4px">${pin(pinAt)}步骤条：已完成的可点回；四步一直都在</div>` : ''}<ol class="trpg-steps" aria-label="步骤">${li}</ol><p class="trpg-steps__compact">${current}/4 · ${LABELS[current - 1]}</p>`
}

const foot = ({ prev = true, next = '下一步', nextDisabled = false, nextPin = null } = {}) =>
  `<footer class="trpg-wizard__foot">${prev ? btn('上一步') : ''}${btn(next, { primary: true, disabled: nextDisabled, n: nextPin })}</footer>`

const wiz = (step, body, f, opts) => modal('dialog', modalHead('开始新冒险'), `<div class="trpg-wizard">${steps(step, opts)}<div class="trpg-wizard__body">${body}</div>${foot(f)}</div>`)

const shelfGroup = (name, count, rows, open = false) => `<details class="trpg-shelf__group"${open ? ' open' : ''}><summary class="trpg-shelf__sum">${name}<small>${count}</small></summary>${rows.join('')}</details>`
// dl = 这本已经在【库】里下载好：灰色勾 +"已下载"（来自 shelf 行的 downloaded）；仍可点掉，只影响这场战役看得到哪些书
const dlTag = '<span class="trpg-dl">已下载</span>'
const bookRow = (name, date, on = true, dl = false) => `<div class="trpg-shelf__row">${check(name + (dl ? dlTag : ''), on, { dl })}<small>${date}</small></div>`
const advRow = (name, lvl, story, on = false, dl = false) => `<div class="trpg-shelf__row">${check(name + (dl ? dlTag : ''), on, { dl })}<small>等级 ${lvl} · ${story}</small></div>`

// ── 下载大小说明（浅灰、放在"资料"标题下面；不是进度，向导里不下载） ──
const SIZE_OK = '总下载约 150 MB'
const SIZE_WAIT = '正在计算下载文件大小…'
const dlHint = (size = SIZE_OK, n = null) => hint(`${size}${size === SIZE_WAIT ? '　下载' : '，'}将在你的战役创建完成后，在后台【库】里下载。为了自动化结算，会在下载的同时解析数据，可能需要一定时间。`, n)
const NO_BOOKS = '当前拉取不到书目，请之后再去库里添加'

const scopeBlock = (n) => `<div class="trpg-field"><span class="trpg-field__label">${n ? pin(n) : ''}范围</span><div style="display:flex;gap:18px;flex-wrap:wrap">${check('2014', true)}${check('2024', false)}</div><span class="trpg-field__hint">2014 战役默认只含 2014 版来源</span></div>`

const BOOKS = (dl) => [
  shelfGroup('核心', 6, [bookRow('玩家手册', '2014-08-19', true, dl), bookRow('怪物图鉴', '2014-09-30', true, dl), bookRow('地下城主指南', '2014-12-09', true, dl)], true),
  shelfGroup('官方出版物', 11, [bookRow('瓦罗的怪物指南', '2016-11-15', true, dl), bookRow('姗娜莎的万事指南', '2017-11-21', true, dl), bookRow('塔莎的万象坩埚', '2020-11-17', true, dl), bookRow('（示例）书名 7', '2018-05-29', true, dl), bookRow('（示例）书名 8', '2019-03-19', true, dl)], true),
  shelfGroup('设定集', 15, []), shelfGroup('扩展包', 13, []),
].join('')
const shelfBlock = (n, mode, dl = false) => {
  const label = `<span class="trpg-field__label">${mode !== 'none' && n ? pin(n) : ''}书架</span>`
  if (mode === 'loading') return `<div class="trpg-field trpg-field--grow">${label}${loading('正在读取中…')}</div>`
  if (mode === 'none') return `<div class="trpg-field">${label}${hint(NO_BOOKS, n)}</div>`
  return `<div class="trpg-field trpg-field--grow">${label}<span class="trpg-field__hint">勾选的是这场战役里看得到哪些书；官方资料是整套下载的。灰色勾 = 已经在【库】里下载好。</span><div class="trpg-shelf">${BOOKS(dl)}</div></div>`
}

const blockBox = (text, sub, n) => `<div class="trpg-empty" style="border-style:double;border-width:3px;margin-bottom:12px">${n ? pin(n) : ''}<span><b>${text}</b></span><span class="trpg-field__hint">${sub}</span>${btn('重试', { small: true })}</div>`

const step2 = ({ size = SIZE_OK, shelf = 'ok', block = false, installed = false, pins = { hint: 1, scope: 2, shelf: 3 } } = {}) =>
  `<h3 class="trpg-wizard__title">选择资料</h3>${block ? blockBox('⚠ 开局失败：核心 SRD 规则（示例：玩家手册）没有装好。', '它随插件自带，可能被删除或损坏；请重新安装插件后重试。', pins.block) : ''}${installed ? hint('官方资料已经在【库】里装好，不需要再下载。', pins.hint) : dlHint(size, pins.hint)}${scopeBlock(pins.scope)}${shelfBlock(pins.shelf, shelf, installed)}`

// ── 摘要块（第④步，无论有没有冒险都显示，格式统一） ──
const summary = ({ name = 'D&amp;D 2014·11月9日', data = '约 150 MB 需下载', adv = '约 0.4 MB 需下载', current = '失落矿坑', n = null } = {}) =>
  `<div class="trpg-summary"><b>${n ? pin(n) : ''}将建立战役：${name}</b><span>D&amp;D 5e（2014） · 资料（${data}） · 冒险（${adv}）</span>${current ? `<span class="trpg-field__hint">当前战役「${current}」会先自动存档。</span>` : ''}</div>`

export const screens = [
  {
    id: 'wizard-1-rule', group: '向导', title: '向导 ① 规则', flow: 'F1',
    goal: '确认这场战役用哪套规则', primary: '下一步',
    patterns: 'Wizard + Progress Indicator · Cancelability · Datatip（术语悬停说明）', laws: 'Hick（现只有一个规则，自动选中）· Jakob（步骤条 + 上一步 / 下一步）',
    diff: '宽屏居中弹窗 640 宽；窄屏铺满，步骤条换成一行"1/4 · 规则"，按钮纵向排列、主按钮在最上。',
    notes: [
      [1, '步骤条', '已完成的可点回；当前加粗；四步一直都在，没有"跳过"态', '【有】向导状态（现只有两步，P4 扩为四步）'],
      [2, '规则卡', '现在只有一个规则，自动选中仍停在本步', '【有】RuleRegistry'],
      [3, '规则名术语（点划线）', '悬停 / 长按显示一句简介，不是链接（详情页是 P5）', '统一高亮'],
      [4, '[下一步]', '→ 第②步；第①步没有[上一步]（原图里的上一步是假按钮，隐藏）', '【有】'],
      [5, '右上 ✕ / Esc / 点遮罩', '直接关闭、回到首页，不弹"放弃确认"页（已选的内容不保存）', '决定（驾驶员 2026-11-09）'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(1, `<h3 class="trpg-wizard__title">选择这场战役用的规则</h3><div class="trpg-rulecard"><span class="trpg-radio"></span><div>${pin(2)}<span class="trpg-term">D&amp;D 5e（2014）</span>${pin(3)}<div class="trpg-field__hint">龙与地下城第五版（2014 规则），核心规则含玩家手册、地下城主指南与怪物图鉴</div></div></div>`, { prev: false, nextPin: 4 }, { pinAt: 1 }),
    }),
  },
  {
    id: 'wizard-2-data', group: '向导', title: '向导 ② 资料', flow: 'F1',
    goal: '选这场战役看得到哪些书；知道资料会在建好战役后、在后台装', primary: '下一步',
    patterns: 'Titled Sections · Collapsible Panels · Checklist', laws: 'Miller（书按作者分组，默认只展开一组）· Tesler（范围、语言系统给默认）· Doherty（进入前已在后台预取书目）· Hick（本步没有进度、没有环，只有一段说明）',
    diff: '宽屏书架在弹窗内滚动；窄屏铺满，书架行高 ≥44px。语言固定中文，不显示语言选择（中英切换留到 P5）。',
    notes: [
      [1, '资料标题下的浅灰说明', '"总下载约 xx MB，将在你的战役创建完成后，在后台【库】里下载……"。向导里不下载、不显示进度、没有环。xx 来自 starter.estimateDownload：官方资料是整套下载（作者的离线设计），勾选哪些书不改变它；冒险按所选相加（在第④步摘要里体现）。没算出来时写"正在计算下载文件大小…"', '【有】estimateDownload（B2）'],
      [2, '范围勾选', '2014 / 2024 …（用户自建范围也在这里）', '【有】wizardOptions.scopes / defaultScopes'],
      [3, '书架（作者分组，自己滚动）', '☑ 来自 view.visible；每行只有"书名 · 出版日期"，没有"未下载 / 下载中"；改勾选 → include / exclude → 重新取（书目已缓存，毫秒级）', '【有】wizardOptions.shelf（BE-7）'],
      [4, '"上次没装完"提示', '不在向导里显示，归 P5 库页', '决定'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2(), {}, {}) }),
  },
  {
    id: 'wizard-2-installed', group: '向导', title: '向导 ② 资料（官方资料已装好：灰色勾）', flow: 'F1',
    goal: '再开第二场战役时，一眼看出哪些已经在【库】里', primary: '下一步',
    patterns: 'Checklist · Status in place', laws: 'Zeigarnik（已完成的事用弱化的勾表达）· Consistency（不新增状态词，只用勾的深浅）',
    diff: '同左。',
    notes: [
      [1, '浅灰说明换一句', '"官方资料已经在【库】里装好，不需要再下载。"（不再写大小）', '【有】dataStatus.status = ready'],
      [2, '灰色勾 +"已下载"', '官方资料是整套下载的，装好后每本书的行都是 downloaded = true；仍可点掉勾，只影响这场战役看得到哪些书', '【有】CatalogRow.downloaded；是否允许点掉待驾驶员确认'],
      [3, '书架贴到底部', '列表撑满剩余高度，不留空白', '决定'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ installed: true, pins: { hint: 1, scope: null, shelf: 2 } }), {}, {}) }),
  },
  {
    id: 'wizard-2-loading', group: '向导', title: '向导 ② 资料（读取书目中）', flow: 'F1',
    goal: '第一次读书目要 1~5 秒，不能让用户以为卡了', primary: '（等待）',
    patterns: 'Spinners and Loading Indicators（圆圈 + 文字）', laws: 'Doherty（>1 秒必须有进度提示）· Zeigarnik',
    diff: '同左。范围块先显示（默认值现成的），只有书架在加载。',
    notes: [
      [1, '下载大小说明', '还没算出来时统一写"正在计算下载文件大小…"', '【有】estimateDownload.computing'],
      [2, '范围块', '不依赖书目，先可用', '【有】'],
      [3, '读取中：简约圆圈 + "正在读取中…"', '超过 1 秒才出现；[下一步]不禁用（书目取不到也不挡，见下一屏）', '【有】首次空库联网 Chrome 约 2.1 秒、WebKit 约 1 秒（实测）；启动后台预取后通常直接命中缓存，看不到这一屏'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ size: SIZE_WAIT, shelf: 'loading', pins: { hint: 1, scope: 2, shelf: 3 } }), {}, {}) }),
  },
  {
    id: 'wizard-2-nobooks', group: '向导', title: '向导 ② 资料（拉取不到书目）', flow: 'F1',
    goal: '联网失败时说一句话，不挡路', primary: '下一步（照常可点）',
    patterns: 'Error Messages（说清怎么办）· Escape Hatch', laws: 'Postel · Hick（没有重试按钮、没有警告色：不是错误，只是"现在没有"）',
    diff: '同左。',
    notes: [
      [1, '统一提示', '"当前拉取不到书目，请之后再去库里添加"——浅灰一行；书目和冒险目录取不到都用这一句；不挡[下一步]（catalogUnavailable）', '【有】wizardOptions.shelfError / catalogUnavailable（B3）'],
      [2, '[下一步]', '照常可点；之后开局不带书范围，之后到库里添加', '【有】'],
      [3, '待驾驶员定：离线时大小一直"正在计算"', '书目和文件清单都没缓存过（首次启动就断网）时，大小算不出来，摘要会一直写"正在计算下载文件大小…"。是否改成"大小暂时未知"？', '见交付说明'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ size: SIZE_WAIT, shelf: 'none', pins: { hint: 3, scope: null, shelf: 1 } }), { nextPin: 2 }, {}) }),
  },
  {
    id: 'wizard-2-blocked', group: '向导', title: '向导 ② 资料（核心 SRD 资料缺失：唯一的资料阻断）', flow: 'F1',
    goal: '随插件自带的核心规则资料坏了时，说清原因，不让用户建出一个不能用的战役', primary: '重试',
    patterns: 'Disabled with explanation', laws: 'Postel（说清原因和怎么办）· 不靠颜色（⚠ + 双线框）',
    diff: '同左；窄屏[重试]整行。',
    notes: [
      [1, '阻断提示（双线框 + ⚠）', '⚠ 开局失败：核心 SRD 规则（书名）没有装好。它随插件自带，只在用户删了 / 装坏了时才会出现', '【有】wizardOptions.blockingError（B3）'],
      [2, '[重试] / [下一步]', '[重试]重新检查；[下一步]不可点（虚线）；开局被后端同样拒绝（E_CORE_MISSING）', '【有】'],
      [3, '其他书下不下都能点[下一步]', '全向导只有两个阻断点：这里和第④步的"战役名为空"', '决定'],
    ],
    render: () => ({ content: BEHIND(), overlay: wiz(2, step2({ block: true, pins: { block: 1, hint: null, scope: null, shelf: 3 } }), { nextDisabled: true, nextPin: 2 }, {}) }),
  },
  {
    id: 'wizard-3-adv', group: '向导', title: '向导 ③ 冒险', flow: 'F1',
    goal: '可选：挑一本冒险，战役创建完成后在后台下载正文', primary: '下一步（可什么都不选）',
    patterns: 'Collapsible Panels · Checklist', laws: 'Hick（默认一个不选）· Miller（按作者分组折叠）· Common Region（列表贴到底部边框，不留空白）',
    diff: '同上。列表区撑满弹窗剩余高度，内容多就在框里滚动。',
    notes: [
      [1, '冒险列表（按作者分组，贴到底部边框）', '每行：名称 · 等级范围 · 故事线；默认全不选；选中的冒险大小会计入第④步摘要。列表撑满剩余高度，内容多在框里滚，不再露出一大段空白', '【有】shelf 里 kind = adventure；estimateDownload.adventures'],
      [2, '说明一行', '"选中的冒险会在战役创建完成后，和资料一起在后台下载。"', '【有】'],
      [3, '灰色勾 +"已下载"', '这个冒险已经在【库】里下载好了（行的 downloaded = true）：显示灰色勾，不会再下载，也不计入下载大小', '【有】CatalogRow.downloaded'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(3, `<h3 class="trpg-wizard__title">带上一本冒险？（可选）</h3>${hint('选中的冒险会在战役创建完成后，和资料一起在后台下载。', 2)}<div class="trpg-shelf">
        ${shelfGroup(pin(1) + '官方出版物', 59, [advRow(pin(3) + '凡戴尔的失落矿坑', '1–5', '新手包', true, true), advRow('龙与地下城：龙之女王的宝藏', '1–15', '龙之女王'), advRow('冰风谷：冰封之地', '1–12', '冰风谷'), advRow('（示例）冒险 4', '1–10', '（示例）'), advRow('（示例）冒险 5', '5–15', '（示例）'), advRow('（示例）冒险 6', '1–20', '（示例）'), advRow('（示例）冒险 7', '3–10', '（示例）'), advRow('（示例）冒险 8', '1–8', '（示例）')], true)}
        ${shelfGroup('扩展包', 43, [])}</div>`, {}, {}),
    }),
  },
  {
    id: 'wizard-3-loading', group: '向导', title: '向导 ③ 冒险（读取冒险目录中）', flow: 'F1',
    goal: '冒险目录读取慢时和资料一样有读取中提示', primary: '（等待）',
    patterns: 'Spinners and Loading Indicators（圆圈 + 文字）', laws: 'Doherty（>1 秒必须有进度提示）· Consistency（和资料步骤同一种读取中）',
    diff: '同上。',
    notes: [
      [1, '读取中：简约圆圈 + "正在读取中…"', '和第②步书架完全一样；超过 1 秒才出现；读不到时变成统一的一句"当前拉取不到书目…"（下一屏）', '【有】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(3, `<h3 class="trpg-wizard__title">带上一本冒险？（可选）</h3>${hint('选中的冒险会在战役创建完成后，和资料一起在后台下载。')}<div class="trpg-field trpg-field--grow">${pin(1)}${loading('正在读取中…')}</div>`, {}, {}),
    }),
  },
  {
    id: 'wizard-3-nobooks', group: '向导', title: '向导 ③ 冒险（拉取不到冒险目录）', flow: 'F1',
    goal: '冒险目录取不到时同样一句话，仍然走到命名', primary: '下一步（照常可点）',
    patterns: 'Error Messages · Escape Hatch', laws: 'Zeigarnik（本步照常显示，不凭空消失）· Postel',
    diff: '同上。',
    notes: [
      [1, '统一提示', '和第②步同一句："当前拉取不到书目，请之后再去库里添加"；步骤条不灰显、不写"跳过"', '【有】adventureError / catalogUnavailable'],
      [2, '[下一步]', '照常可点，走到④命名；④的摘要写"冒险（未选择）"', '【有】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(3, `<h3 class="trpg-wizard__title">带上一本冒险？（可选）</h3>${hint(NO_BOOKS, 1)}`, {}, {}),
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
      [3, '摘要块（统一格式，有没有冒险都显示）', '"将建立战役：{名称}" / "D&D 5e（2014） · 资料（约 xx MB 需下载） · 冒险（约 xx MB 需下载）" / 已有当前战役时多一行"当前战役「…」会先自动存档。"。大小只按已勾选的内容近似计算，各种写法见下一屏', '【接】estimateDownload；startCampaign 写"新存档前"自动存档'],
      [4, '[开始冒险]（主按钮）', '→ starter.startCampaign，立即返回；弹窗关闭，首页变有战役，提示"已开始「…」"；此时才开始后台下载', '【接】'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(4, `<h3 class="trpg-wizard__title">给这场战役起个名字</h3>${field(`${pin(1)}战役名称`, input('D&D 2014·11月9日'), { hint: '1–40 字，之后可以在存档里改名' })}${field(`${pin(2)}备注（可空）`, input('', { placeholder: '比如：周五晚的跑团' }))}${summary({ n: 3 })}`, { next: '开始冒险', nextPin: 4 }, {}),
    }),
  },
  {
    id: 'wizard-4-summary', group: '向导', title: '向导 ④ 摘要块的各种写法', flow: 'F1',
    goal: '把摘要块所有写法列在一起，确认格式统一、没有死状态', primary: '（只读对照）',
    patterns: 'Preview · Progressive Disclosure', laws: 'Consistency（同一格式）· Postel（算不出时说明在算，不留空）',
    notes: [
      [1, '大小的写法', '需要下载 → "约 xx MB 需下载"；官方资料已装好 → "已就绪"；没选冒险 → "未选择"；还没算出 → "正在计算下载文件大小…"', '【有】estimateDownload / dataStatus'],
      [2, '"自动存档"那一行', '只有已经有当前战役时才出现；写"当前战役「…」会先自动存档"', '【接】startCampaign'],
      [3, '不在摘要里出现的东西', '开局失败的红字、"跳过"字样、下载进度——都没有', '决定'],
    ],
    board: () => {
      const cell = (label, html) => `<div style="display:grid;gap:6px;width:560px"><b>${label}</b>${html}</div>`
      return `<div style="display:flex;gap:26px;flex-wrap:wrap;background:#fff;border:1.5px solid #999;border-radius:10px;padding:24px;max-width:1300px">
        ${cell('① 选了冒险 · 已有当前战役', summary({ n: 1 }))}
        ${cell('② 没选冒险 · 已有当前战役', summary({ adv: '未选择' }))}
        ${cell('③ 没选冒险 · 没有当前战役（首次使用）', summary({ adv: '未选择', current: '' }))}
        ${cell('④ 资料已装好（再开第二场战役）', summary({ data: '已就绪', adv: '未选择' }))}
        ${cell('⑤ 大小还没算出来', summary({ data: '正在计算下载文件大小…', adv: '正在计算下载文件大小…' }))}</div>`
    },
  },
  {
    id: 'wizard-4-error', group: '向导', title: '向导 ④ 命名（战役名为空：唯一的命名阻断）', flow: 'F1',
    goal: '名字被删空时，原因就在输入框下，已填内容不丢', primary: '填入名字后开始冒险',
    patterns: 'Error Messages · Input Hints · Disabled with explanation', laws: 'Postel · Doherty（输入框就近反馈）· 不靠颜色（⚠ + 双线边框）',
    diff: '同上。',
    notes: [
      [1, '名字为空 / 超过 40 字', '输入框下就近写"请输入战役名称"；[开始冒险]不可点（原因可见，不是哑巴禁用）。默认会预填一个名字，只有用户把它删空才出现', '【有】cleanName 的规则'],
      [2, '摘要块', '照常显示，名称处写"（未命名）"；不在这里放任何"开局失败"字样', '决定'],
      [3, '开局真的失败了（罕见：规则没装好等）', '不在摘要里放红字；弹窗不关，宿主层提示条写原因；已填内容全保留', '【接】startCampaign'],
    ],
    render: () => ({
      content: BEHIND(), overlay: wiz(4, `<h3 class="trpg-wizard__title">给这场战役起个名字</h3>${field(`${pin(1)}战役名称`, input('', { invalid: true, placeholder: '' }), { err: '请输入战役名称（1–40 字）' })}${field('备注（可空）', input('周五晚的跑团'))}${summary({ name: '（未命名）', n: 2 })}`, { next: '开始冒险', nextDisabled: true }, {}),
    }),
  },
]
