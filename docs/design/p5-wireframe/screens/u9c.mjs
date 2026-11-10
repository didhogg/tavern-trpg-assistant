// U9g 随机表（掷）· U9h 书籍类数据条目的阅读器。字段与流程取自 P5-0 §4.3 G/H、§4.5 table / book / adventure、§13.6.9 U9g / U9h；表内容与章节名为占位示例。
import { P, badge, bare, btn, detail, dice, gray, icon, imgLink, infoLine, pin, src, tblLink, term } from '../lib/u9.mjs'
import { errorLine, loading, stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U9 各类型详情（精做）'
const SAMPLE = '表内容、章节名是占位示例；字段与流程来自 P5-0 §4.3 G / H、§13.6.9 U9g / U9h。'

const rtable = ({ head = 'd8', headTag = true, rows, hit = -1, n } = {}) => `<table class="lib-rtable"><tr><th>${P(n)}${head}${headTag ? ` ${dice('掷')}` : ''}</th><th>结果</th></tr>${rows.map((r, i) => `<tr${i === hit ? ' data-hit="true"' : ''}><td>${i + 1}</td><td>${r}</td></tr>`).join('')}</table>`
const ROWS = ['（结果文字一）', '（结果文字二）', '（结果文字三）', '（结果文字四）', `（结果文字五，含 ${dice('2d6')} gp 的财宝）`]
const sidebar = (cur) => `<div class="lib-toc">${[['封面与简介'], ['第一章：（章名）', cur === 1], ['　1.1 （小节）', false, 1], ['第二章：（章名）'], ['附录']].map(([t, on, sub]) => `<button type="button" class="${sub ? 'lib-toc__sub' : ''}" aria-current="${!!on}">${t}</button>`).join('')}</div>`
const readBody = `<div class="lib-rbody"><h3>第一章：（章名）</h3><p>（正文：与条目共用同一套渲染器。）章内术语如 ${term('法师')}、怪物 ${term('哥布林')} 是链接，点了换到条目页，✕ 回到这里的原位置。</p><p>${tblLink('「（章内随机表）」点开显示')} ${dice('掷')}　${tblLink('「（章内参考表）」')}（参考表没有骰子标签）　${imgLink('「（章内地图）」点开才取图')}</p><h4>1.1 （小节）</h4><p>（正文……）</p></div>`
const rbar = (title, { toc = true } = {}) => `<div class="lib-rbar">${btn(`${toc ? '收起' : '目录'}`, { small: true, ic: 'list-bullets' })}<b class="lib-title--serif" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}</b>${btn('上一章', { small: true })}${btn('下一章', { small: true })}</div>`

export const screens = [
  {
    id: 'u9g-table', group: G, title: 'U9g 随机表：表格视图与掷', flow: '13.6.9 U9g',
    goal: '点表头的骰子标签掷一次，命中行高亮，结果可复制、可填进输入框', primary: '点骰子标签掷', patterns: 'Table + inline action · 变量骰就地输入', laws: 'Doherty（点了立刻高亮）· Postel（掷不了就当普通表，说原因）· Tesler（系统自动再掷行内骰子）',
    captions: { '1440': '宽窗 · 表内掷：点表头骰子标签 → 命中行高亮；下面出现结果框（不出横幅）：[复制文字] [填入酒馆输入框]', '900': '宽窗 · 表在正文里是术语链接：链接旁有骰子标签，不进表格直接掷 → 横幅（已复制 + [填入酒馆输入框]）', '390': '窄屏 · 掷不了的表：不显示骰子标签，当普通表（原因可展开）；{@table} 链接跳转' },
    diff: '宽表在窄屏横滚，首列固定。',
    notes: [
      [1, '表格视图', '书里的表 / 独立表 / 嵌入表同一个视图：标题（caption）+ 表 + 前后文字与脚注；表组是多张表依次排开，每张各自可掷（§4.3 G）', '【有】tableRoll（§13.6.9）'],
      [2, '点表头骰子标签', '命中行高亮；结果行里的骰子自动再掷并显示；复杂情况按下面分支', '【有】tableRoll：complete'],
      [3, '变量骰表（needs-input）', '表上就地出现数字框（标题 / 默认 / 范围），填好再掷（见 u9g-states）', '【有】tableRoll：needs-input'],
      [8, '表外掷（R96–R97）', '表在正文里是术语链接时，链接旁加一个骰子标签（只有可掷的表有；参考表不可掷，R95）；点骰子标签不进表格直接掷 → **横幅**「已复制到剪贴板，可直接粘贴到酒馆输入框」+ 横幅上 [填入酒馆输入框]', '【有】tableRoll · copyText · appendToInput；接线之后'],
      [7, '表外 vs 表内', '表外掷出横幅；表内掷不出横幅、在表下面出结果框', 'R97 / R98'],
      [4, '不可掷的表', '不显示骰子标签，当普通表；原因可展开（作者函数判定）', '【有】tableRoll：missing / error'],
      [5, '表内掷的结果框（R98）', '**表内掷不出横幅**：表格下面直接出现结果框，框里 [复制文字] [填入酒馆输入框]（也不出横幅提示）；注释格式沿用现有「&lt;!-- [掷骰] 说明：… --&gt;」', '【有】copyText · appendToInput；接线之后'],
      [6, '表链接', '结果里的 {@table} 链接 → 跳到那张表（入栈，不自动联动掷）', '【有】links.resolveTag'],
      [7, '名字生成器表', '12 张，第一版当普通表，不专门做', '—'],
      ['·', '示例值', SAMPLE, '—'],
    ],
    board: tri({
      '1440': () => detail({ title: '（随机表标题）', body: `${src('（来源书）· 第 xx 页')}<p class="lib-muted" style="margin:0">表前文字（说明）</p>${rtable({ head: 'd8', rows: ROWS, hit: 4, n: 1 })}<p class="lib-muted" style="margin:0;font-size:var(--fs-sm)">表后脚注</p><div class="lib-block">${P(2)}<b>掷出 5：（结果文字五，含 ${dice('2d6')} = 9 gp 的财宝）</b><div style="display:flex;gap:8px;flex-wrap:wrap">${btn('复制文字', { small: true, ic: 'copy', n: 5 })}${btn('填入酒馆输入框', { small: true })}</div></div>` }),
      '900': () => ({ ...detail({ back: '玩家手册', title: '（某条目：正文里提到一张表）', body: `${src('（来源书）')}<p>……遇到这种情况，请查 ${tblLink('「（随机表标题）」')} ${P(6)}${dice('掷')}（骰子标签在表外：不进表格就能掷）。</p><p>${tblLink('「（参考表）」')}（参考表没有骰式：只有链接，没有骰子标签，R95）</p>` }), toast: `<div class="trpg-toast" data-kind="success" role="status">${icon('check-circle', 16)}<span class="trpg-toast__text">${P(7)}已复制到剪贴板，可直接粘贴到酒馆输入框</span>${btn('填入酒馆输入框', { small: true })}</div>` }),
      '390': () => detail({ title: '（掷不了的表）', body: `${src('（来源书）')}${rtable({ head: '（无骰式）', headTag: false, rows: ['（结果一）', `（结果二：跳转 ${term('另一张表')}）`, '（结果三）'], n: 4 })}<details class="lib-fold"><summary>为什么掷不了</summary><div class="lib-fold__body"><span>作者函数没能读出这张表的骰式（原因文字）。</span></div></details><p class="lib-muted" style="margin:0">${P(6)}结果里的 {@table} 链接可点，跳到那张表，不自动掷。</p>` }),
    }),
  },
  {
    id: 'u9g-states', group: G, title: 'U9g 随机表的状态与异常', flow: '13.6.9 U9g',
    goal: '掷骰过程中每个分支用户都知道发生了什么', primary: '—', patterns: 'Inline error · 横幅', laws: 'Postel · Doherty',
    diff: '状态板。',
    notes: [
      [1, '骰式有几种写法（choose）', '先选一种，再掷', '【有】tableRoll：choose'],
      [2, '表外掷的横幅', '横幅「已复制到剪贴板，可直接粘贴到酒馆输入框」+ 横幅上 [填入酒馆输入框]（表内掷不出横幅）', '【有】copyText'],
      [3, '填不进酒馆输入框', '横幅「没能填进输入框，结果已在剪贴板里」；结果仍在剪贴板（返回值未验证，P5-0 §13.6.11 #7）', '〔待核 #7〕'],
      [4, '这张表掷不了（missing / error）', '一句原因：「这张表掷不了：xxx」', '【有】'],
      [5, '表组', '多张表依次排开，每张各自有骰子标签', '【有】tableGroup'],
      [6, '嵌入表', '正文里是下划线条目；点开才显示，收起回正文', '【有】'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('骰式有几种写法', `<div class="lib-block">${P(1)}<b>这张表有几种骰法，先选一种</b><div style="display:flex;gap:8px">${btn('1d6', { small: true })}${btn('2d4', { small: true })}</div></div>`, 1)}
${stateCard('变量骰表（needs-input）', `<div class="lib-block"><b>这张表的骰子需要你填一个数</b><span class="lib-numbox"><span>怪物数量 x =</span><b>3</b></span><div style="display:flex;gap:8px">${btn('掷 1d(x×2)', { small: true, primary: true })}</div></div>`, 3)}
${stateCard('表外掷的横幅（R97）', `<div class="trpg-toast" data-kind="success" role="status" style="position:static">${icon('check-circle', 16)}<span class="trpg-toast__text">已复制到剪贴板，可直接粘贴到酒馆输入框</span>${btn('填入酒馆输入框', { small: true })}</div>`, 2)}
${stateCard('填不进输入框（横幅）', `<div style="position:static">${toast('没能填进输入框，结果已在剪贴板里。', { kind: 'error' })}</div>`, 3)}
${stateCard('这张表掷不了', infoLine('这张表掷不了：（原因文字）', '', ''), 4)}
${stateCard('表组', `${rtable({ head: 'd6', rows: ['（一）', '（二）'] })}<div style="height:8px"></div>${rtable({ head: 'd6', rows: ['（一）', '（二）'] })}`, 5)}
${stateCard('嵌入表（点开）', `<p style="margin:0">……见 ${tblLink('「（嵌入的表）」')}</p>${rtable({ head: 'd4', rows: ['（一）', '（二）'] })}<div style="display:flex;justify-content:flex-end">${btn('收起', { small: true })}</div>`, 6)}</div>`,
  },
  {
    id: 'u9h-reader', group: G, title: 'U9h 书籍类条目的阅读器（书 · 冒险 · 规则速查）', flow: '13.6.9 U9h',
    goal: '在弹窗里读一本书 / 一个冒险：正文 + 侧拉目录，章内术语、表、图都能点', primary: '读正文 / 点目录跳章节', patterns: 'Reader + 侧拉目录（宽：弹窗内左侧；窄：目录是弹窗里的另一页）', laws: 'Miller（目录分章节）· Jakob（‹ 返回）· Zeigarnik（✕ 回原位置）',
    captions: { '1440': '宽窗 · 弹窗里：左侧拉出章节目录 + 右边正文', '900': '宽窗 · 目录收起，只读正文（[目录] 再拉出）', '390': '窄屏 · 目录是弹窗里的另一页（列表），点章节回到正文' },
    diff: '宽：目录与正文并排；窄：目录与正文分两页。',
    notes: [
      [1, '入口', '包里的"书"类别条目 · 书架 / 搜索命中 · 条目点进来就是阅读器；**没有包外壳上的【阅读这本书】按钮**（R85）；弹窗内换页，‹ 回上一页', '【有】service.corpus · documents.get'],
      [2, '章节目录（侧拉）', '宽：弹窗内左侧拉出；窄：弹窗里的另一页；点章节跳转；章节标题来自书目；规则速查（文档）与书同一个阅读页：章节 → 小节', '【有】§4.3 H'],
      [3, '正文', '与条目共用同一套渲染器', '【有】R13'],
      [4, '章内术语 / 怪物链接', '点 → 条目页（弹窗内换页，入栈）；✕ 或 ‹ 回阅读页原位置', '【有】links.resolveTag'],
      [5, '章内表格 / 图片', '下划线条目，点开才显示（U9g / U1e）', '【有】'],
      [6, '不记阅读位置', '第一版不做', '§13.6.9'],
      ['·', '示例值', SAMPLE, '—'],
    ],
    board: tri({
      '1440': () => bare({ title: '（书名）', inner: `<div style="display:flex;flex-direction:column;min-height:0;flex:1">${rbar('第一章：（章名）')}<div style="position:relative;flex:1;min-height:0"><div class="lib-read"><aside>${P(2)}${sidebar(1)}</aside><main>${readBody}</main></div></div></div>` }),
      '900': () => bare({ title: '（书名）', inner: `<div style="display:flex;flex-direction:column;min-height:0;flex:1">${rbar('第一章：（章名）', { toc: false })}<div style="position:relative;flex:1;min-height:0"><div class="lib-read" data-toc="false"><main>${readBody}</main></div></div></div>` }),
      '390': () => bare({ title: '目录', back: '（书名）', inner: `<div class="lib-mscroll">${sidebar(1)}</div>` }),
    }),
  },
  {
    id: 'u9h-states', group: G, title: 'U9h 阅读器的状态：冒险没下载 / 下载中 / 失败 / 加载 / 读取失败', flow: '13.6.9 U9h',
    goal: '冒险正文第一次打开才下载；任何一步出问题都有出口', primary: '[下载此冒险] / [重试]', patterns: 'Progress · Recoverable error · 横幅', laws: 'Doherty · Postel',
    diff: '状态板。',
    notes: [
      [1, '冒险没下载', '页顶「下载此冒险（xx MB）」→ 下载中（页顶进度）→ 完成自动打开〔§13.6.9〕', '【有】tasks.startAdventure'],
      [2, '下载失败', '统一警告样式 + [重试]', '【有】R73'],
      [3, '加载中', '骨架', '全局规则'],
      [4, '读取失败', '顶部横幅 + [重试]', 'R84'],
      [5, '规则速查（文档）', '与书同一个阅读页：章节 → 小节', '【有】documents.get'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('冒险没下载', `${infoLine(`${P(1)}这个冒险的正文还没下载（约 xx MB）。`, btn('下载此冒险', { small: true, primary: true }), 'lib-banner--info')}`, 1)}
${stateCard('下载中（页顶进度）', `<div class="lib-progress"><span class="trpg-spinner"></span><span>正在下载冒险正文…</span></div>`, 1)}
${stateCard('下载失败', errorLine('冒险正文没下载下来：网络中断。', btn('重试', { small: true, primary: true })), 2)}
${stateCard('加载中', `<div class="trpg-skeleton"></div><div class="trpg-skeleton" style="width:80%"></div><div class="trpg-skeleton" style="width:60%"></div>`, 3)}
${stateCard('读取失败（横幅）', `<div style="position:static">${toast('读取这本书失败：数据库暂时打不开。', { kind: 'error' })}</div>${btn('重试', { small: true })}`, 4)}
${stateCard('规则速查（章节 → 小节）', `<div class="lib-toc"><button type="button" aria-current="true">（速查）战斗</button><button type="button" class="lib-toc__sub">行动</button><button type="button" class="lib-toc__sub">攻击</button><button type="button">冒险</button></div>`, 5)}</div>`,
  },
]
