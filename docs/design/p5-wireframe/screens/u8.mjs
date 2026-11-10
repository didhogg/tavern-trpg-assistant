// 读档检查：在 P4 的"存档抽屉"里换页（不是居中弹窗）。取代 P4 读取确认页里"缺书 / 资料房规变了"两块（P4 线框 drawer-load-confirm 里的"恢复原样 / 采用现在的"块作废）。流程见 P5-0 §13.6.7a。
import { btn, icon, infoLine, pin } from '../lib/parts.mjs'
import { check, modal, modalHead } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = '读档检查（P4 存档抽屉内换页）'
const P = (n) => (n ? pin(n) : '')
const blk = (title, body, kind = '') => `<div${kind ? ` data-kind="${kind}"` : ''}><b>${title}</b>${body}</div>`
const row = (label, { on = true, sub = '' } = {}) => `<span style="display:flex;align-items:center;gap:var(--sp-2)">${check(label, on)}${sub ? `<span class="lib-src">${sub}</span>` : ''}</span>`
const drawer = (title, blocks, { go = '读取并下载所选', stack = false } = {}) => modal('drawer', modalHead(title, { back: '存档' }), `<div class="trpg-drawer"><div class="trpg-drawer__body"><div class="trpg-checks">${blocks.join('')}</div></div><footer class="trpg-drawer__bottom trpg-drawer__bottom--confirm">${stack ? '' : btn('取消')}${btn(go, { primary: true })}${stack ? '' : ''}</footer></div>`)
const home = '<div class="lib-mpad"><b>失落矿坑</b><p class="lib-muted">（P4 战役首页，存档抽屉从右侧滑出；这里不画）</p></div>'

const missing = blk(`${P(1)}缺少数据包 —— 为防止存档数据损坏，建议下载下面的包`, `${row('某自制包（含 2 个依赖包）', { sub: '自制' })}${row('冒险：（某冒险）', { sub: '官方' })}${row('官方资料（整套）', { sub: '官方' })}`)
const closed = blk(`${P(2)}包在，但本战役关着`, `<span class="trpg-field__hint">勾选后在本战役里开启；不勾就保持关着，存档里的引用照常能看。</span>${row('魔法物品补充包', { on: false })}${row('某自制包', { on: false })}`)
const ver = `<div>${infoLine(`${P(3)}有 2 处条目的资料版本变了，已使用新版（存档里的数量、等级等改动照常保留）。`, '', 'lib-banner--info')}</div>`

export const screens = [
  {
    id: 'u8-1-loadcheck', group: G, title: '读档检查：三张清单（P4 存档抽屉内换页）', flow: '13.6.7a',
    goal: '读取旧存档前，只在真有问题时提示；防止缺数据导致存档损坏；读档不改任何设置', primary: '[读取并下载所选]', patterns: 'Drawer 内换页（P4 已定：存档确认页 = 抽屉内换页，不开第二个弹窗）· Checklist · 默认值（缺的默认勾，关着的默认不勾）', laws: 'Hick（只有真有问题的块才出现）· Postel（建议下载而不是拦住）· Tesler（系统做检查，用户只做一次决定）· 不列差别',
    captions: { '1440': '宽屏 · 存档抽屉从右侧滑出，换到"读取确认"这一页（‹ 存档 回抽屉主页）· 三块都有', '900': '宽屏 · 只缺包 + 一行版本提示', '390': '窄屏 · 同一个抽屉改成底部抽屉 · 只有"包在但本战役关着"' },
    diff: '宽：右侧存档抽屉（440 宽）；窄：底部抽屉（88% 高，带小横条），按钮纵向。**什么都不缺时这页不出现，直接读档。**',
    notes: [
      ['·', '位置', '这一页是 P4 存档抽屉里的"读取确认页"（抽屉内换页，同一时间只有一个抽屉，不叠第二个弹窗）；样式沿用 P4 读取确认页的 `trpg-checks` 清单块；头部 `‹ 存档` 回抽屉主页', 'P4-0 §存档确认页'],
      [1, '缺少数据包', '之前的包被卸载、缺依赖包：提示「为防止存档数据损坏，建议下载下面的包」，列出所有可下载的包（官方整套 / 冒险按本 / 自制按来源），**默认勾选**〔R88〕', '【有】kernelSave.checkSave(id).plan.download（B-34）；下载走 tasks / brewInstallSources（B-24）'],
      [2, '包在、但本战役关着', '列出被关的包，**默认不勾**；用户勾了就在本战役开启；不勾则保持关着，引用照常能取（关着的包里的引用放行）〔R77、R88〕', '【有】plan.closed；kernelSave.openSources'],
      [3, '版本变了', '只是**一行提示**，没有勾选：用到的条目版本变了，默认用现在的；存档里存的引用和存档级改动不变，旧存档永远不被资料更新改写〔R88、R90、Q-D〕', '【有】plan.versionChanged'],
      [4, '去掉的东西', '**【恢复原样】和"列出差别 + 用现在的继续"都去掉了**（P4 线框里 drawer-load-confirm 的"资料 / 房规变了块"作废）；读取存档不会改任何设置（全局、战役都不改）〔R53、R88、R91〕', '【有】keepSaved / adoptCurrent 已删（B-20、B-34）'],
      [5, '其他块不变', 'P4 读取确认页里"未保存改动 / 其他规则 / 其他角色卡 / 规则没装"各块照旧，只是把"缺书"和"资料变了"换成本页的三块', 'P4 已有'],
      [6, '[读取并下载所选]', '下载走顶部横幅（完成合并提示）；读档继续；[取消] 不读', '前端'],
    ],
    board: tri({
      '1440': () => ({ page: 'home', content: home, overlay: drawer('读取「存档 1」', [missing, closed, ver]) }),
      '900': () => ({ page: 'home', content: home, overlay: drawer('读取「存档 1」', [missing, ver]) }),
      '390': () => ({ page: 'home', content: home, overlay: drawer('读取「存档 1」', [closed], { go: '读取' }) }),
    }),
  },
]
