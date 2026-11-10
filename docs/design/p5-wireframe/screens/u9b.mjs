// U9d 职业体系 · U9e 种族与出身 · U9f 规则参考 + 世界杂项（标准条目）· 其他类别默认文字页。字段取自 P5-0 §4.3、§4.5、§13.6.9；具体数值为示例。
import { P, badge, block, btn, detail, gray, icon, infoLine, sel, src, stat, sum, term, tblLink, dice } from '../lib/u9.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U9 各类型详情（精做）'
const SAMPLE = '示例值（SRD 常见内容 / 占位）；字段名与结构来自 P5-0 §4.3 / §4.5 / §13.6.9，真实显示由作者函数与登记表生成。'
const fold = (t, open, inner) => `<details class="lib-fold"${open ? ' open' : ''}><summary>${t}<span class="lib-end">${icon('caret-down', 14)}</span></summary><div class="lib-fold__body">${inner}</div></details>`

export const screens = [
  {
    id: 'u9d-class', group: G, title: 'U9d 职业体系（职业页 · 子职业 · 特性）', flow: '13.6.9 U9d',
    goal: '看清一个职业的全貌：职业表、熟练与装备、按等级的特性；子职业同页切换', primary: '读职业表 / 切子职业', patterns: 'Titled Sections（折叠）· Dropdown（同页切换，不入栈）· Table', laws: 'Miller（特性按等级折叠，默认展开前几级）· Hick（子职业下拉）· Jakob（特性链接入栈）',
    captions: { '1440': '宽窗 · 职业页：职业表 → 熟练与起始装备 → 按等级的特性（折叠）；子职业下拉同页切换', '900': '宽窗 · 子职业条目：摘要行写所属职业与等级；附加法术链接', '390': '窄屏 · 职业特性条目 + 没装某些子职业所在的书的一行说明' },
    diff: '职业表在窄屏横滚，首列固定。',
    notes: [
      [1, '职业表', '作者的职业表（等级 · 熟练加值 · 特性 …）；列由作者数据决定，不手写', '【有】作者的 class 表（§4.3 D）'],
      [2, '熟练与起始装备', '生命骰、豁免熟练、技能、装备（职业数据里的块）', '【有】'],
      [3, '按等级的特性', '折叠，默认展开前几级；特性里的链接 → 入栈；特性、子职业各自是条目（classFeature / subclassFeature），摘要行写所属职业与等级', '【有】职业 / 子职业特性已按等级展开（§4.2）'],
      [4, '子职业下拉', '同页切换，不入栈（不算跳转）；子职业附加法术 → 法术条目（入栈）', '【有】'],
      [5, '没装的子职业', '下拉里不列没装的书里的子职业，页内一行「还有 n 个子职业所在的书没开」（我定）', '【有】scoped 过滤'],
      [6, '可选特性', 'optionalfeature（魔能祈唤、战技等）：摘要行（类型 · 先决条件 · 等级）+ 正文', '【有】§4.5 optionalfeature'],
      ['·', '示例值', SAMPLE, '—'],
    ],
    board: tri({
      '1440': () => detail({ title: '法师', body: `${src('玩家手册（2014）· 第 112 页 · PHB')}${sum([['生命骰', 'd6'], ['豁免熟练', '智力、感知']])}
${P(1)}<div class="lib-tablewrap" style="overflow:auto"><table class="lib-rtable"><tr><th>等级</th><th>熟练加值</th><th>特性</th></tr><tr><td>1</td><td>+2</td><td>${term('奥术回想')}、施法</td></tr><tr><td>2</td><td>+2</td><td>${term('奥术传承')}</td></tr><tr><td>3</td><td>+2</td><td>—</td></tr></table></div>
${block('熟练与起始装备', `<span>${P(2)}护甲：无 · 武器：匕首、飞镖、投石索、木棍、轻弩 · 技能：从 6 项中选 2</span>`)}
<div class="lib-subsel">${P(4)}<b>子职业</b>${sel('塑能学派', 200)}<span class="lib-muted" style="font-size:var(--fs-sm)">同页切换，不算跳转</span></div>
<h3>${P(3)}按等级的特性</h3>${fold('1 级', true, `<p>${term('奥术回想')}……</p>`)}${fold('2 级', true, `<p>${term('奥术传承')}……</p>`)}${fold('3 级', false, '')}` }),
      '900': () => detail({ title: '塑能学派', body: `${src('玩家手册（2014）· PHB')}${sum([['所属职业', '法师'], ['获得等级', '2 级']])}<div class="lib-sumline"><span>附加法术：${term('火球术')}、${term('魔法飞弹')}</span></div><h3>特性</h3>${fold('2 级', true, '<p>（子职业特性：摘要行写所属职业与等级）</p>')}${fold('6 级', false, '')}` }),
      '390': () => detail({ title: '（某职业特性）', body: `${src('玩家手册（2014）· PHB')}${sum([['所属职业', '法师'], ['等级', '2 级']])}<p>（特性正文……）</p>${infoLine(`${P(5)}还有 2 个子职业所在的书没开。`, btn('去书架', { small: true }), 'lib-banner--info')}` }),
    }),
  },
  {
    id: 'u9e-race', group: G, title: 'U9e 种族与出身（种族 · 背景 · 专长）', flow: '13.6.9 U9e',
    goal: '创建人物时看清种族、背景、专长各给什么', primary: '读摘要行 / 切亚种 / 点嵌入表', patterns: 'Titled Sections · Dropdown · Embedded link', laws: 'Miller · Hick（亚种下拉）· Von Restorff（嵌入表下划线）',
    captions: { '1440': '宽窗 · 种族页：摘要行 → 正文 → 亚种全部直接列出（不用下拉，R94）→ 种族特性接在后面', '900': '宽窗 · 背景：摘要行 + 正文（物品清单 + 嵌入表格：下划线条目，点开 → 随机表视图）', '390': '窄屏 · 专长：分类 · 属性值 · 先决条件' },
    diff: '宽窄同一结构。',
    notes: [
      [1, '种族页', '摘要行（属性值 · 体型 …）→ 正文；**亚种直接全部列出，每个亚种一节，不用下拉**（R94；361 条已含亚种）；种族特性（raceFeature，解析时作者生成）接在后面〔§4.3 E〕', '【有】§4.2、§4.5 race / raceFeature'],
      [2, '背景', '摘要行（属性值 · 技能熟练）→ 正文（含物品清单与嵌入表格：下划线条目，点开 → U9g 表格视图）', '【有】§4.5 background'],
      [3, '专长 / 角色创建选项 / 奖励', '摘要行 + 正文（专长：分类 · 属性值 · 先决条件）', '【有】§4.5 feat / charoption / reward'],
      [4, '嵌入的表格', '正文里的表显示成下划线条目，点开才显示完整表格；**可掷的表链接旁带一个骰子标签，不进表格就能掷**（R96）；表外掷出横幅（见 u9g）', '【有】U9g；接线之后'],
      [5, '背景描述（fluff）', '接在正文后面，不是独立页；图片点开才拉', '【有】§4.3 背景'],
      ['·', '示例值', SAMPLE, '—'],
    ],
    board: tri({
      '1440': () => detail({ title: '精灵', body: `${src('玩家手册（2014）· 第 21 页 · PHB')}${sum([['属性值', '敏捷 +2'], ['体型', '中型'], ['速度', '30 尺']], 1)}<p>（种族正文：精灵的外貌与社会……）</p><h3>${P(6)}亚种（全部直接列出，不用下拉）</h3>${block('高等精灵', `<span>属性值 <b>智力 +1</b></span><span>${term('精灵武器训练')}、${term('戏法')}、额外语言</span>`)}${block('木精灵', `<span>属性值 <b>感知 +1</b></span><span>${term('精灵武器训练')}、${term('迅捷')}、${term('林地隐匿')}</span>`)}${block('卓尔（黑暗精灵）', `<span>属性值 <b>魅力 +1</b></span><span>${term('优越的黑暗视觉')}、${term('日光敏感')}、${term('卓尔魔法')}</span>`)}<h3>种族特性</h3><p><b>${term('黑暗视觉')}。</b>……</p><p><b>${term('敏锐感官')}。</b>……</p><p><b>${term('妖精血统')}。</b>……</p>` }),
      '900': () => detail({ title: '侍僧', body: `${src('玩家手册（2014）· 第 127 页 · PHB')}${sum([['技能熟练', '洞悉、宗教'], ['语言', '任选两种']], 1)}<p>（背景正文……）</p><h3>起始装备</h3><p>一件圣徽、一本祈祷书、5 根熏香、法衣、一套普通衣服、一个腰包……</p><p>${tblLink('「（背景附带的表格）」点开显示表格')} ${dice('掷', { n: 4 })}</p>` }),
      '390': () => detail({ title: '警觉', body: `${src('玩家手册（2014）· PHB')}${sum([['分类', '一般'], ['属性值', '—'], ['先决条件', '无']])}<p>（专长正文……）</p>` }),
    }),
  },
  {
    id: 'u9f-rules', group: G, title: 'U9f 规则参考 + 世界杂项（标准条目）', flow: '13.6.9 U9f',
    goal: '规则、状态、神祇、食谱等字段很少的条目：摘要行 + 正文，一个标准样式', primary: '读正文 / 点嵌入表', patterns: 'Titled Sections（标准条目）', laws: 'Consistency（同一类外观）· Miller（摘要行极少）· Postel',
    captions: { '1440': '宽窗 · 状态（condition）：只有正文', '900': '宽窗 · 神祇（deity）：摘要行（神系 · 阵营 · 领域）+ 重印标记', '390': '窄屏 · 食谱（recipe）：食材与做法' },
    diff: '同一结构。',
    notes: [
      [1, '覆盖的类别', 'variantrule · action · condition · disease · status · skill · sense · language · deity · cult · boon · facility · psionic · trap · hazard · deck · card · recipe · crochetPattern（§4.3 F、I）', '【有】登记表声明摘要行字段，增加类别只加一行'],
      [2, '摘要行', '字段很少（动作：时间；神祇：神系 · 阵营 · 领域；据点：类型 · 等级 · 先决条件；…）', '【有】§4.5'],
      [3, '嵌入表格', '变体规则等正文里大量嵌入表，点开显示（可掷）', '【有】U9g'],
      [4, '食谱 / 手工艺品', '食谱显示食材与做法；手工艺品显示材料与步骤', '【有】§4.5 recipe / crochetPattern'],
      [5, '卡牌', '第一版当普通条目，牌面与抽牌以后做（P6 遗留）', '【有】'],
      [6, '语言 / 神祇', '语言页文字体名是链接（入栈）；神祇重印有标记', '【有】'],
      ['·', '示例值', SAMPLE, '—'],
    ],
    board: tri({
      '1440': () => detail({ title: '目盲', body: `${src('玩家手册（2014）· 附录 A · PHB')}<p>目盲的生物无法视物，自动在所有需要视觉的属性检定上失败。</p><p>针对目盲生物的攻击检定具有优势，该生物的攻击检定具有劣势。</p>` }),
      '900': () => detail({ title: '提尔', body: `${src('玩家手册（2014）· 附录 B · PHB')}${sum([['神系', '被遗忘的国度'], ['阵营', '守序善良'], ['领域', '战争']], 2)}<div style="display:flex;gap:6px">${badge('重印', 'primary')}</div><p>（神祇正文：神祇的象征与教义……）</p>` }),
      '390': () => detail({ title: '（某食谱）', body: `${src('（来源）')}${sum([['分类', '主菜'], ['份数', '4']])}<h3>食材</h3><p>（食材清单）</p><h3>做法</h3><p>（步骤）</p>` }),
    }),
  },
  {
    id: 'u9z-generic', group: G, title: 'U9 其他类别：默认文字页', flow: '13.6.9（其他）',
    goal: '没有专门设计的类别（以及作者新增的类别）也能读：摘要行（有就显示）+ 正文', primary: '读正文', patterns: 'Generic text page（登记表没声明的类别用它）', laws: 'Postel（读不懂的块折叠，不丢）· Consistency',
    captions: { '1440': '宽窗 · 默认文字页：摘要行（有的字段）+ 正文', '900': '宽窗 · 没登记的块 →「这段内容暂时无法显示」+ 折叠的原文 JSON', '390': '窄屏 · 读不到的值显示「未知」' },
    diff: '同一结构。',
    notes: [
      [1, '默认文字页', '登记表里没声明详情块的类别，一律用：摘要行（取得到的字段）+ 正文；增加类别不用改界面', '【有】登记表 / 渲染器（R13）'],
      [2, '没登记的块', '渲染器没认出的块类型 →「这段内容暂时无法显示」+ 折叠的原文 JSON（我定）；不整条消失', '【有】'],
      [3, '未知', '读不到的值显示「未知」', '界面规矩 §0 第 14 条'],
    ],
    board: tri({
      '1440': () => detail({ title: '（某类别的条目）', body: `${src('（来源）')}${sum([['字段一', '值'], ['字段二', '值']])}<p>（正文：由渲染器按块类型渲染）</p>` }),
      '900': () => detail({ title: '（某条目）', body: `${src('（来源）')}<p>（正文）</p>${infoLine('这段内容暂时无法显示。', '', '')}<details class="lib-fold"><summary>原文（JSON）</summary><div class="lib-fold__body"><code style="font-size:12px">{ "type": "（未登记的块）", … }</code></div></details>` }),
      '390': () => detail({ title: '（某条目）', body: `${src('（来源）')}${stat([['字段一', null], ['字段二', '值']])}<p>（正文）</p>` }),
    }),
  },
]
