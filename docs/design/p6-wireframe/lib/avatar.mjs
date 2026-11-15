// 头像：可以填图片链接，也可以直接上传图片（驾驶员 2026-11-15）。头像一律显示成方框。流程见 P6-5 流程 G。
import { btn, icon, seg, P, mdl, mh } from './parts.mjs'

const prev = (filled) => `<div class="av-prev">${filled ? `<span class="av-prev__img">${icon('user', 40)}</span>` : icon('image', 28)}</div>`
const linkTab = (o) => `<div class="trpg-field"><label class="trpg-field__label">图片链接</label>${P(o.nUrl)}<div class="trpg-input" style="${o.url ? '' : 'color:var(--text3)'}">${o.url ?? 'https://…（图片网址）'}</div><p class="trpg-hint">贴一个能直接打开的图片地址；填好后右边预览，加载不出来会提示。</p></div>
<div class="av-row">${prev(o.url)}<div class="av-side"><span class="sh-2">${o.url ? '预览（方框，居中裁切）' : '填好链接后在这里预览'}</span>${o.url ? '' : ''}</div></div>`
const upTab = (o) => `<div class="av-drop">${P(o.nDrop)}${icon('upload-simple', 28)}<b>把图片拖到这里</b><span class="sh-2">或</span>${btn('选择文件…', { ic: 'image' })}<small class="sh-2">png · jpg · webp；上传后存进当前战役数据（大小限制与存放位置待查后端）</small></div>
${o.file ? `<div class="av-row">${prev(true)}<div class="av-side"><b>gale-portrait.png</b><span class="sh-2">已选好 · 340 KB</span><div>${btn('重新选择', { small: true })}</div></div></div>` : ''}`
/** tab：0 链接 / 1 上传 */
export const avatarModal = (tab = 0, o = {}) => `<div class="wz-modal">${mdl('dialog', mh('人物头像', { n: o.nTitle }), `<div class="av-pop">
<div class="av-seg">${P(o.nTabs)}${seg([{ label: '图片链接', on: tab === 0 }, { label: '上传图片', on: tab === 1 }])}</div>
${tab === 0 ? linkTab(o) : upTab(o)}
<div class="av-act">${btn('移除头像', { quiet: true })}<span style="flex:1"></span>${btn('取消')}${btn('使用这张', { primary: true, n: o.nUse })}</div></div>`)}</div>`
/** 建卡「名字」步里的头像一行：方框 + 两个入口 */
export const avatarField = (n) => `<div class="trpg-field"><label class="trpg-field__label">头像（可不填）</label>${P(n)}<div class="av-row">${prev(false)}<div class="av-side"><div style="display:flex;gap:6px;flex-wrap:wrap">${btn('填图片链接', { ic: 'link-simple' })}${btn('上传图片', { ic: 'upload-simple' })}</div><span class="sh-2">点任一个打开「人物头像」，随时能换</span></div></div></div>`
