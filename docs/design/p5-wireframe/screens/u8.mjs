// 读档检查（取代 P4 读取确认页里"缺书 / 资料房规变了"两块；P4 的"恢复原样 / 采用现在的"已去掉）。流程见 P5-0 §13.6.7a。2026-11-10。
import { btn, icon, infoLine, pin } from '../lib/parts.mjs'
import { modal, modalHead, toast } from '../lib/ui.mjs'
import { tri } from '../lib/boards.mjs'

const G = '读档检查（P4 读取确认页改版）'
const P = (n) => (n ? pin(n) : '')
const chk = (label, { on = true, sub = '', n } = {}) => `<div class="lib-chk">${P(n)}<span class="trpg-check" data-on="${on}"><span class="trpg-check__box">${on ? icon('check', 12) : ''}</span>${label}</span>${sub ? `<span class="lib-src">${sub}</span>` : ''}</div>`
const sec = (title, hint, body, n) => `<div><div class="lib-sec" style="padding-top:0">${P(n)}${title}</div>${hint ? `<p class="lib-muted" style="margin:0 0 var(--sp-1);font-size:var(--fs-sm)">${hint}</p>` : ''}<div style="border:var(--border) solid var(--line);border-radius:var(--r-md);overflow:hidden">${body}</div></div>`
const home = '<div class="lib-mpad"><p class="lib-muted">（P4 的存档列表，这里不画）</p></div>'
const check = (parts, { go = '读取并下载所选', stack = false } = {}) => modal('dialog', modalHead('读取「第 3 章 · 深渊门前」'), `<div class="lib-stack" style="overflow:auto">${parts.join('')}</div><div class="trpg-confirm__actions" style="margin-top:auto;padding-top:var(--sp-3)">${stack ? `${btn(go, { primary: true })}${btn('取消')}` : `${btn('取消')}${btn(go, { primary: true })}`}</div>`)

const missing = sec('缺少数据包 —— 为防止存档数据损坏，建议下载下面的包', '', `${chk('某自制包（含 2 个依赖包）', { sub: '自制', n: 1 })}${chk('冒险：（某冒险）', { sub: '官方' })}${chk('官方资料（整套）', { sub: '官方' })}`, 0)
const closed = sec('包在，但本战役关着', '勾选后在本战役里开启；不勾就保持关着，存档里的引用照常能看。', `${chk('魔法物品补充包', { on: false, n: 2 })}${chk('某自制包', { on: false })}`, 0)
const ver = infoLine(`${P(3)}有 2 处条目的资料版本变了，已使用新版（存档里的数量、等级等改动照常保留）。`, '', 'lib-banner--info')

export const screens = [
  {
    id: 'u8-1-loadcheck', group: G, title: '读档检查：三张清单（缺的包 · 关着的包 · 版本变了）', flow: '13.6.7a',
    goal: '读取旧存档前，只在真有问题时提示；防止缺数据导致存档损坏；读档不改任何设置', primary: '[读取并下载所选]', patterns: 'Dialog · Checklist · 默认值（缺的默认勾，关着的默认不勾）', laws: 'Hick（只有真有问题的块才出现）· Postel（建议下载而不是拦住）· Zeigarnik · 不列差别',
    captions: { '1440': '宽窗 · 三块都有', '900': '宽窗 · 只缺包 + 一行版本提示', '390': '窄屏 · 只有"包在但本战役关着"' },
    diff: '宽：居中弹窗；窄：整屏，按钮纵向。**什么都不缺时这页不出现，直接读档。**',
    notes: [
      [1, '缺少数据包', '之前的包被卸载、缺依赖包：提示「为防止存档数据损坏，建议下载下面的包」，列出所有可下载的包（官方整套 / 冒险按本 / 自制按来源），**默认勾选**〔R88〕', '【有】kernelSave.checkSave(id).plan.download（B-34）；下载走 tasks / brewInstallSources（B-24）'],
      [2, '包在、但本战役关着', '列出被关的包，**默认不勾**；用户勾了就在本战役开启；不勾则保持关着，引用照常能取（关着的包里的引用放行）〔R77、R88〕', '【有】plan.closed；kernelSave.openSources'],
      [3, '版本变了', '只是**一行提示**，没有勾选：用到的条目版本变了，默认用现在的；存档里存的引用和存档级改动不变，旧存档永远不被资料更新改写〔R88、R90、Q-D〕', '【有】plan.versionChanged'],
      [4, '去掉的东西', '**【恢复原样】和"列出差别 + 用现在的继续"都去掉了**；读取存档不会改任何设置（全局、战役都不改）〔R53、R88、R91〕', '【有】keepSaved / adoptCurrent 已删（B-20、B-34）'],
      [5, '装着但条目没了', '一行说明，随第一块一起显示', '【有】plan.gone'],
      [6, '[读取并下载所选]', '下载走顶部横幅（完成合并提示）；读档继续；[取消] 不读', '前端'],
    ],
    board: tri({
      '1440': () => ({ page: 'home', content: home, overlay: check([missing, closed, ver]) }),
      '900': () => ({ page: 'home', content: home, overlay: check([missing, ver]) }),
      '390': () => ({ page: 'home', content: home, overlay: check([closed], { go: '读取', stack: true }) }),
    }),
  },
]
