// U2 库总览：书架（官方 / 自制分开）、全库数据搜索、批量勾选、管理、卸载。流程见 P5-0 §13.6.2。2026-11-10 按 R23–R91 重画。
import { MARK_MOD, MIX_COLS, SPELLS, SPELL_COLS, badge, btn, check, count, dropdown, empty, entryHead, gray, icon, iconBtn, infoLine, input, libPage, libTop, mbody, mixRows, mlist, packHead, pills, pin, shelfBody, shelfPage, sheet, sw, table } from '../lib/parts.mjs'
import { errorLine, modal, modalHead, stateCard, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = 'U2 库总览（书架 · 全库数据搜索 · 管理）'
const P = (n) => (n ? pin(n) : '')
const page = (o = {}, extra = {}) => ({ page: 'library', flush: true, content: shelfPage(o), ...extra })

// 带复选框的行：☑ 名称 · 灰字来源；lock = 因缺依赖必须一起卸载，不可取消
const chk = (label, { on = true, sub = '', lock = false, n } = {}) => `<div class="lib-chk"${lock ? ' data-lock="true"' : ''}>${P(n)}<span class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span>${label}</span>${sub ? `<span class="lib-src">${sub}</span>` : ''}${lock ? `<span class="lib-end">${icon('lock', 14)}${badge('必须一起', 'warn')}</span>` : ''}</div>`
const tabs2 = (cur) => `<div class="lib-tabs2" role="tablist">${['条目', '停用项目', '被编辑 / 覆盖'].map((t) => `<button type="button" role="tab" aria-current="${t === cur}">${t}</button>`).join('')}</div>`

export const screens = [
  {
    id: 'u2-1-shelf', group: G, title: 'U2a 书架（官方 / 自制分开 · 无战役）', flow: '13.6.2 U2a',
    goal: '一眼看到装了哪些书和冒险，并决定本战役开哪些', primary: '开 / 关本战役的书；点行进书弹窗',
    patterns: 'Titled Sections（分组折叠）· Switch · More Menu', laws: 'Miller（分组折叠）· Fitts（开关在行尾，窄屏 ≥44）· Jakob（━● 为开）· Von Restorff（只有主操作有强调色）',
    captions: { '1440': '宽窗 · 官方 / 自制分开；核心规则一行"随插件自带 · 不可关闭"；搜索在列表下方', '900': '宽窗 · 点 ⋯：管理 / 存入我的库 / 卸载', '390': '窄屏 · 没有战役：所有书显示为关，开关置灰，不默认开核心书' },
    diff: '宽：书名 · 版本 · 出版日期 · 开关 · ⋯；窄：日期隐藏。',
    notes: [
      [1, '【全库数据搜索】按钮', '一个按钮，点后弹出模态弹窗（见 u2-4）〔R63〕', '前端'],
      [2, '官方 / 自制分开', '书架先分"官方"和"自制"两块；官方块内按作者的分组表；识别不了分类的统一进【其他】；所有已下载的书在战役里**默认开**（含【其他】）〔R35、R58〕', '【有】scoped.shelf(c)；viewOf（B-32）；shelf.ts fallbackGroup'],
      [3, '核心规则行', '随插件自带的核心 SRD 包，显示成一行"随插件自带 · 不可关闭"；只有战役选了核心规则之后才不可关〔R61〕', '【有】checkCorePacks（P4 向导）'],
      [4, '行：书名 · 版本徽章 · 开关 · ⋯', '点书名 → 书 / 包弹窗（u3）；点开关 → 立即生效 < 400 ms，**不出预览**；关掉的依赖包仍留在本地继续提供依赖〔R77〕', '【有】chooseSource + kernelSave.setLibrary（B-20）'],
      [5, '[批量勾选…]', '一次勾多本的目录（u2-7），下载了很多书时不逐本去选〔R79〕', '前端'],
      [6, '搜索在列表下方', '像下载页一样文字匹配不同分类下的书 / 包〔R59〕', '前端'],
      [7, '行尾 ⋯', '[管理]（进包弹窗的管理页，u2-6）· [存入我的库]（u6-5）· [卸载]（u2-3）〔R83〕', '【有】'],
      [9, '书架顶部 ⋯ 更多', '[拉取更新]（只有点它才去取更新信息，见 u4-5）· [刷新书目]〔R86〕', '【有】service.brewCheckUpdates / library.updates.check（B-28）'],
      [8, '无战役', '所有书显示为关、开关置灰，一句「先创建战役」；不默认开核心书；浏览、搜索、下载、我的库照常〔R60〕', '【有】defaultCampaignLibrary；〔待核 #6〕'],
    ],
    board: tri({
      '1440': () => page({ fold: true, pins: { off: 2, core: 3, row: 4, bulk: 5, search: 6, gs: 1, more: 9 } }),
      '900': () => page({ pins: { menu: 7, openMenu: true } }),
      '390': () => page({ nocampaign: true, pins: { off: 8 } }, { header: { campaign: null } }),
    }),
  },
  {
    id: 'u2-2-states', group: G, title: 'U2a 书架的异常：空 / 无战役 / 书架搜索无匹配 / 卸载被拒', flow: '13.6.2 U2a',
    goal: '没有东西、做不了、或出错时，一句话 + 一个出口', primary: '点出口按钮', patterns: 'Empty State · 横幅', laws: 'Hick · Postel',
    diff: '状态板，只画 1440 宽。书目 / 冒险目录不再有"取不到"一块：官方资料装好后本地已存索引，只有"从没装过 + 断网"才没有，那时书架本来就空（R62）。',
    notes: [
      [1, '什么都没装', '「还没有资料」+ [去下载]（一句话 + 一个主按钮）〔R62〕', '【有】scoped.shelf 为空'],
      [2, '无战役', '所有书显示关 + 开关置灰 + 横幅「先创建战役」[去首页]；资料是全局的，只有开关依赖战役', '〔待核 #6〕'],
      [3, '书架搜索无匹配', '「没有符合的」+ [清空]', '前端'],
      [4, '卸载被拒', '有下载 / 换算在跑：**顶部横幅**「现在不能卸载，等下载完成或先取消」；错误统一用横幅，不占页面〔R84〕', '【有】library.uninstallOfficial'],
      [5, '已取消的冒险目录失败块', '**删掉了**：冒险目录和书目分类索引装好后自动存到本地，不可能取不到〔R62〕', 'P4-0b prefetch.ts / directory.ts'],
    ],
    board: () => `<div class="ds-root wf-states">
${stateCard('什么都没装', empty('还没有资料。', btn('去下载', { primary: true })), 1)}
${stateCard('无战役', `${infoLine('先创建战役，开关才能用。', btn('去首页', { small: true }), 'lib-banner--info')}`, 2)}
${stateCard('书架搜索无匹配', `${input('xyz', { ic: 'magnifying-glass' })}${empty('没有符合的书或包。', btn('清空', { small: true }))}`, 3)}
${stateCard('卸载被拒（横幅）', `<div style="position:static">${toast('现在不能卸载：官方资料正在下载整理，等它完成或先取消下载。', { kind: 'error' })}</div>`, 4)}</div>`,
  },
  {
    id: 'u2-3-uninstall', group: G, title: 'U2a 卸载 → 影响页（含必须一起卸载的包）', flow: '13.6.2 U2a · 13.6.0 影响页',
    goal: '删东西之前，看到谁会受影响；缺依赖的附庸包一起卸，防止结算出错', primary: '[确认卸载] / [取消]', patterns: 'Confirm Dialog（窄屏底部弹出）', laws: 'Postel · Hick（只有两个按钮）· 不给"只卸一半"的选项',
    captions: { '1440': '宽窗 · 居中确认框', '900': '宽窗 · 同上（另一内容：卸官方资料）', '390': '窄屏 · 底部弹出，按钮纵向' },
    diff: '宽：居中确认框；窄：底部弹出。',
    notes: [
      [1, '因缺依赖必须一起卸载的包', '这个包是别的包的依赖包时，那些包一并列出，打勾且**不可取消**（锁图标 + "必须一起"）：没有依赖数据源它们结算会出错；依赖一路往下找（传递闭包）〔R76〕', '【有】backend.removalImpact().packs[].mustRemove / removeTogether（B-25）'],
      [2, '其它受影响的东西', '房规与选版本（覆盖按包编号保存，包重装回来会自动套用）· 战役与存档（含已删存档）；卸载是全局的，不分战役〔R55、R87〕', '【有】removalImpact'],
      [3, '"以后不再提示"', '勾上后写进偏好；设置 → 库 → 偏好 里可改回', '【有】settings.library'],
      [4, '开 / 关一个包不出预览', '只有"卸载 / 删除"才出这一页；关掉 / 开启包的开关立即生效，关掉的依赖包仍留在本地〔R77〕', '【有】'],
    ],
    board: tri({
      '1440': () => page({}, { overlay: modal('confirm', modalHead('卸载「某依赖包」？', { n: 1 }), `<div class="trpg-confirm"><p>它是下面这些包的依赖包，必须一起卸载，否则它们会算不出结果：</p><div style="border:var(--border) solid var(--line);border-radius:var(--r-md);overflow:hidden">${chk('某自制包 A', { lock: true, sub: '自制' })}${chk('某自制包 B', { lock: true, sub: '自制' })}</div><p>还会影响：</p><ul class="trpg-confirm__details"><li>3 条覆盖（按包编号保存，重装后自动套用）</li><li>战役「失落矿坑」（2 个存档，另有 1 个已删存档里也用到）</li></ul><div class="trpg-confirm__actions">${btn('取消')}${btn('确认卸载 3 个包', { danger: true })}</div></div>`) }),
      '900': () => page({}, { overlay: modal('confirm', modalHead('卸载官方资料？'), `<div class="trpg-confirm"><p>下面这些东西会受到影响：</p><ul class="trpg-confirm__details"><li>2 个自制包依赖它（必须一起卸载）</li><li>3 条房规和 2 处覆盖</li><li>战役「失落矿坑」（2 个存档）</li></ul><label class="trpg-check" data-on="false" style="color:var(--text2)"><span class="trpg-check__box"></span>以后不再提示（可在 设置 → 库 里改回来）</label><div class="trpg-confirm__actions">${btn('取消')}${btn('确认卸载', { danger: true })}</div></div>`) }),
      '390': () => page({}, { overlay: modal('confirm', modalHead('卸载「某依赖包」？'), `<div class="trpg-confirm"><p>必须一起卸载（不可取消）：</p><div style="border:var(--border) solid var(--line);border-radius:var(--r-md);overflow:hidden">${chk('某自制包 A', { lock: true })}${chk('某自制包 B', { lock: true })}</div><div class="trpg-confirm__actions">${btn('确认卸载 3 个包', { danger: true })}${btn('取消')}</div></div>`) }),
    }),
  },
  {
    id: 'u2-4-search', group: G, title: 'U2b 全库数据搜索（模态弹窗 + 书目勾选栏）', flow: '13.6.2 U2b',
    goal: '在已开启的书 / 包里按名字找东西，一步跳到它；可临时屏蔽几本', primary: '点结果', patterns: 'Modal Panel（和包弹窗同一种）· Search · Collapsible checklist', laws: 'Doherty · Hick（勾选栏默认折叠）· Von Restorff（同名标"同名"）',
    captions: { '1440': '宽窗 · 默认折叠的勾选栏（折叠状态持久记忆）', '900': '宽窗 · 展开勾选栏：按分类显示已开启的书，可一键全选 / 取消，也可逐个勾', '390': '窄屏 · 底部抽屉，同名结果并排并用灰字标来源' },
    diff: '宽：居中弹窗；窄：底部抽屉。',
    notes: [
      [1, '弹窗', '点【全库数据搜索】弹出的模态弹窗，和点进包的弹窗同一种效果；只比包弹窗**多一个书目勾选栏**〔R63、R64〕', '前端'],
      [2, '书目勾选栏（折叠）', '可折叠、**持久记忆折叠状态、默认折叠**；栏内按书目分类，只列书架里**已安装并已开启**的书 / 包（关着的不列）〔R65、R66〕', '【有】scoped.shelf；settings.library.collapsed（B-22）'],
      [3, '一键全选 / 取消', '按分类或"全部"一键全选 / 取消，也可逐个勾选；**默认全部勾选**〔R66、R67〕', '前端'],
      [4, '一行提示', '「取消勾选某些书 / 包，可以在这次搜索里临时屏蔽它们」；搜索只在勾选的书 / 包里出结果（按命中的来源过滤）〔R67〕', '【有】scoped.search 本来只给本战役看得见的；过滤在前端'],
      [5, '临时的勾选', '手动多勾一本已关的书只对这次搜索有效；**下次进来重新默认勾选所有已开启的书 / 包**，不持久记忆〔R68〕', '前端（不写设置）'],
      [6, '结果行', '名称 · 类别 · 来源灰字；同名不同来源是两行并带"同名"标记；点结果走 target：条目 → 弹窗内换成详情；书 / 冒险 → 阅读页；规则速查 → 阅读页〔R41、R44〕', '【有】scoped.search(c, term, {expand:true}) 的 target'],
      [7, '✕ / ‹', '返回后保留搜索词、勾选与结果', '前端'],
    ],
    board: tri({
      '1440': () => page({}, { overlay: sheet(packHead({ back: '', title: '全库数据搜索', on: null, more: false, n: { title: 1 } }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('火球', { ic: 'magnifying-glass' })}</div><details class="lib-fold" style="margin:0 var(--sp-4) var(--sp-2)"><summary>${P(2)}书目范围<small>已勾选 6 / 6</small><span class="lib-end">${icon('caret-down', 14)}</span></summary></details>${pills([['全部', null, true], ['法术', null], ['物品', null]])}<div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sresult"><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}<span class="lib-end">${gray('玩家手册（2014）')}</span></div><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}${badge('同名', 'primary')}<span class="lib-end">${gray('玩家手册（2024）')}</span></div><div class="lib-sresult__row"><b>火球之杖</b>${badge('物品')}<span class="lib-end">${gray('城主指南（2014）')}</span></div></div></div></div>`)) }),
      '900': () => page({}, { overlay: sheet(packHead({ back: '', title: '全库数据搜索', on: null, more: false }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('火球', { ic: 'magnifying-glass' })}</div><details class="lib-fold" open style="margin:0 var(--sp-4) var(--sp-2)"><summary>书目范围<small>已勾选 5 / 6</small><span class="lib-end">${icon('caret-down', 14)}</span></summary><div class="lib-fold__body"><p class="lib-muted" style="margin:0;font-size:var(--fs-sm)">${P(4)}取消勾选某些书 / 包，可以在这次搜索里临时屏蔽它们。下次进来重新全部勾选。</p><div style="display:flex;gap:8px">${P(3)}${btn('全选', { small: true })}${btn('全不选', { small: true })}</div><div class="lib-sec" style="padding:0">核心 ${btn('这一类全选', { small: true })}</div>${chk('玩家手册（2014）')}${chk('怪物手册（2014）')}<div class="lib-sec" style="padding:0">自制</div>${chk('突袭夸巴斯', { on: false })}${chk('（本战役关着的书）', { on: false, sub: '临时勾选，只对这次有效', n: 5 })}</div></details><div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sresult"><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}<span class="lib-end">${gray('玩家手册（2014）')}</span></div></div></div></div>`)) }),
      '390': () => page({}, { overlay: sheet(packHead({ back: '', title: '全库数据搜索', on: null, more: false }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('火球', { ic: 'magnifying-glass' })}</div><details class="lib-fold" style="margin:0 var(--sp-3) var(--sp-2)"><summary>书目范围<small>6 / 6</small><span class="lib-end">${icon('caret-down', 14)}</span></summary></details><div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sresult"><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}<span class="lib-end">${gray('玩家手册（2014）')}</span></div><div class="lib-sresult__row"><b>火球术</b>${badge('法术')}${badge('同名', 'primary')}<span class="lib-end">${gray('玩家手册（2024）')}</span></div></div><div class="lib-pager">${iconBtn('caret-left', '上一页')}<span>第 1 / 2 页</span>${iconBtn('caret-right', '下一页')}</div></div></div>`)) }),
    }),
  },
  {
    id: 'u2-5-search-states', group: G, title: 'U2b 全库搜索的状态', flow: '13.6.2 U2b',
    goal: '搜索时每个阶段用户都知道发生了什么', primary: '继续输入 / 清空', patterns: 'Empty State · Loading · 横幅', laws: 'Doherty · Zeigarnik',
    diff: '状态板。',
    notes: [
      [1, '还没输入', '一行浅灰字「输入名字，如 火球术」；不预先列东西', '全局规则'],
      [2, '加载（> 300 ms）', '圆圈 +「正在搜…」；结果区保持上一次结果直到新结果回来', '【有】'],
      [3, '没找到', '「没找到『xx』」+ [清空]；提示"可能被临时屏蔽了几本书"时给 [全部勾选]', '前端'],
      [4, '屏蔽提示', '取消勾选了某些书时，结果上方一行「已屏蔽 2 本」，点它展开勾选栏', '前端'],
      [5, '搜索失败', '顶部横幅 + 本窗 [重试]〔R84〕', '【有】'],
    ],
    board: () => `<div class="ds-root wf-states">${stateCard('还没输入', `${input('', { placeholder: '输入名字，如 火球术', ic: 'magnifying-glass' })}<p class="trpg-hint" style="margin:0">输入名字开始搜。</p>`, 1)}
${stateCard('加载中', `${input('魔法', { ic: 'magnifying-glass' })}<div class="trpg-loading"><span class="trpg-spinner"></span><span>正在搜…</span></div>`, 2)}
${stateCard('没找到（有屏蔽）', `${input('魔法球球', { ic: 'magnifying-glass' })}${infoLine('已屏蔽 2 本书，点这里展开勾选栏。', btn('全部勾选', { small: true }), 'lib-banner--info')}${empty('没找到「魔法球球」。', btn('清空', { small: true }))}`, 3)}
${stateCard('搜索失败（横幅）', `<div style="position:static">${toast('搜索出错了：数据库暂时打不开。', { kind: 'error' })}</div>${input('魔法', { ic: 'magnifying-glass' })}${btn('重试', { small: true })}`, 5)}</div>`,
  },
  {
    id: 'u2-6-manage', group: G, title: 'U2d 管理：停用项目 / 被编辑·覆盖（包弹窗里的另一页）', flow: '13.6.2 U2d',
    goal: '找到这个包里停用过、被编辑 / 覆盖过的条目，全部或部分复原', primary: '勾选 → [复原]', patterns: 'Modal Panel · Tabs · Bulk select', laws: 'Hick（三个标签）· Postel（复原前能看到是哪些条）',
    captions: { '1440': '宽窗 · 停用项目：全部 / 部分勾选复原', '900': '宽窗 · 被编辑 / 覆盖：多选复原；备选的覆盖也在这里管理', '390': '窄屏 · 抽屉里的管理页（空态）' },
    diff: '宽窄同一结构；窄屏行内次要信息折到第二行。',
    notes: [
      [1, '入口', '包弹窗头部 ⋯ →【管理】，或书架行 ⋯ →【管理】直接进这一页；是弹窗里的换页，不叠第二层；‹ 回包的条目列表〔R46、R48〕', '前端'],
      [2, '停用项目', '这个包里停用过的条目（战役设置里 `ent:` 开头的排除项）；全部 / 部分勾选 → [复原]；也可以在包里点进被停用条目的详情，直接再次启用〔R46、R47〕', '【有】scopes.disabledEntries · chooseEntry（B-19）'],
      [3, '被编辑 / 覆盖', '列出这个包里被改过 / 被备选覆盖的条目；多选 → [复原]；点行看详情；备选的覆盖在这里管理〔R48、R49〕', '【有】scoped.activeOverrides · scoped.choose(…, null)'],
      [4, '生效处', '每行标出生效处（本战役 / 规则 / 全局）；覆盖按包编号持久，卸载后重装自动套用，**下载回来后随时可在这里管理**〔R53–R56〕', '【有】manage.choices / allChoices；versions.packStableId'],
      [5, '空态', '「没有停用的条目」/「没有被编辑或覆盖的条目」', '全局规则'],
    ],
    board: tri({
      '1440': () => page({}, { overlay: sheet(packHead({ back: '玩家手册', title: '管理', on: null, more: false, n: { title: 1 } }), mbody(`${tabs2('停用项目')}<div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sbar" style="padding:0">${P(2)}${btn('全选', { small: true })}${btn('全不选', { small: true })}<span class="lib-btnend">${btn('复原所选（2）', { primary: true, small: true })}</span></div>${chk('火球术', { sub: '法术 · 玩家手册' })}${chk('魔法飞弹', { sub: '法术 · 玩家手册' })}${chk('板甲', { on: false, sub: '物品 · 玩家手册' })}</div></div>`)) }),
      '900': () => page({}, { overlay: sheet(packHead({ back: '玩家手册', title: '管理', on: null, more: false }), mbody(`${tabs2('被编辑 / 覆盖')}<div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sbar" style="padding:0">${P(3)}${btn('全选', { small: true })}<span class="lib-btnend">${btn('复原所选（1）', { primary: true, small: true })}</span></div>${chk('火球术', { sub: '被「我的房规」覆盖 · 本战役' })}${chk('板甲', { on: false, sub: '被编辑 · 当前规则（5e 2014）' })}${chk('战斗魔宠', { on: false, sub: '备选版本 · 全局' })}</div></div>`)) }),
      '390': () => page({}, { overlay: sheet(packHead({ back: '玩家手册', title: '管理', on: null, more: false }), mbody(`${tabs2('停用项目')}<div class="lib-mscroll"><div class="lib-mpad">${empty('没有停用的条目。')}</div></div>`)) }),
    }),
  },
  {
    id: 'u2-7-bulk', group: G, title: 'U2c 批量勾选目录（下载了很多书时一次选完）', flow: '13.6.2 U2c',
    goal: '下载了好多本书时，不逐本去开关，一次性勾选要开的书', primary: '[应用]', patterns: 'Modal Panel · Bulk select · 分类全选', laws: 'Hick（整类一键）· Miller（分类折叠）· Postel（应用前后看得到数量）',
    captions: { '1440': '宽窗 · 按分类的可勾选目录', '900': '宽窗 · 搜索过滤', '390': '窄屏 · 无战役时整个置灰' },
    diff: '宽：居中弹窗；窄：抽屉。',
    notes: [
      [1, '目录', '按分类列出所有已装的书 / 包，复选框 + 整类一键全选 / 取消 + 文字搜索；一次多选，不是逐本去选〔R79〕', '【有】scoped.shelf(c) / catalog(c) 的 CatalogRow'],
      [2, '[应用]', '一次性写进战役设置（chooseSource 循环 + kernelSave.setLibrary），横幅「已更新 n 本」；之后在书架看到的开关同步变化', '【有】scopes.chooseSource + kernelSave.setLibrary（B-20）'],
      [3, '无战役', '整个置灰，一句「先创建战役」', '〔待核 #6〕'],
      [4, '核心规则', '随插件自带的核心包显示成锁定的一行，不可取消', '【有】'],
    ],
    board: tri({
      '1440': () => page({}, { overlay: sheet(packHead({ back: '书架', title: '批量勾选', on: null, more: false, n: { title: 1 } }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('', { placeholder: '搜索书名或包名', ic: 'magnifying-glass' })}</div><div class="lib-mscroll"><div class="lib-mpad"><div class="lib-sec" style="padding:0">${P(1)}核心 <span class="lib-end">${btn('这一类全选', { small: true })}${btn('全不选', { small: true })}</span></div>${chk('核心规则（随插件自带）', { lock: true, sub: '不可关闭' })}${chk('玩家手册（2014）')}${chk('怪物手册（2014）')}${chk('城主指南（2014）', { on: false })}<div class="lib-sec" style="padding:0">设定 <span class="lib-end">${btn('这一类全选', { small: true })}</span></div>${chk('剑湾冒险者指南')}<div class="lib-sec" style="padding:0">自制 <span class="lib-end">${btn('这一类全选', { small: true })}</span></div>${chk('突袭夸巴斯', { on: false })}</div></div><div class="lib-foot">${btn('取消')}${btn('应用（将开启 4 本，关闭 2 本）', { primary: true, n: 2 })}</div>`)) }),
      '900': () => page({}, { overlay: sheet(packHead({ back: '书架', title: '批量勾选', on: null, more: false }), mbody(`<div class="lib-filter" style="padding-top:var(--sp-3)">${input('手册', { ic: 'magnifying-glass' })}</div><div class="lib-mscroll"><div class="lib-mpad">${chk('玩家手册（2014）')}${chk('怪物手册（2014）')}${chk('城主指南（2014）', { on: false })}</div></div><div class="lib-foot">${btn('取消')}${btn('应用', { primary: true })}</div>`)) }),
      '390': () => page({ nocampaign: true }, { header: { campaign: null }, overlay: sheet(packHead({ back: '书架', title: '批量勾选', on: null, more: false }), mbody(`<div class="lib-mpad">${infoLine(`${P(3)}先创建战役，开关才能用。`, btn('去首页', { small: true }), 'lib-banner--info')}<div class="lib-soft">${chk('玩家手册（2014）', { on: false })}${chk('怪物手册（2014）', { on: false })}</div></div>`)) }),
    }),
  },
]
