// 生成"设计系统预览"区块（接在线框总览页后面）和 ds.css（令牌 + 组件，复制进插件用）。
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CANDIDATES, build } from './palettes.mjs'
import { icon, ICON_MAP, NEW_ICONS } from './icons.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const { resolved, report, neutrals } = build()
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

export function writeDsCss() {
  const parts = ['tokens.css', 'tokens.palettes.css', 'components.css', 'preview.css'].map((f) => readFileSync(join(here, f), 'utf8'))
  writeFileSync(join(here, 'ds.css'), parts.join('\n'))
}

const ROLES = [['surface', '卡片'], ['bg', '纸色底'], ['bgSide', '侧栏'], ['bgHover', '悬停'], ['line', '细线'], ['text', '正文'], ['text2', '次要文字'], ['primary', '主色（基）'], ['primaryHover', '悬停 +1'], ['primaryPressed', '按下 −1'], ['primaryTint', '选中底'], ['accent', '点缀琥珀'], ['heroBg', '首页横幅'], ['dangerText', '错误'], ['successText', '成功'], ['warnText', '提醒']]
const sw = (m) => ROLES.map(([k, n]) => `<div class="dsp-sw"><i style="background:${m[k]}"></i><b>${n}</b><code>${m[k]}</code></div>`).join('')

function candidate(id) {
  const c = CANDIDATES[id]
  const rep = (mode) => report[id][mode].filter((x) => !x.info)
  const pass = (mode) => `${rep(mode).filter((x) => x.ok).length}/${rep(mode).length}`
  const rows = ['light', 'dark'].map((mode) => `<details><summary>${mode === 'light' ? '浅色' : '深色'}对比度明细（${pass(mode)} 项达标）</summary><table class="dsp-table"><tr><th>配对</th><th>要求</th><th>实测</th><th></th></tr>${report[id][mode].map((x) => `<tr><td>${esc(x.note)}</td><td>${x.info ? '仅报告' : '≥ ' + x.min}</td><td>${x.ratio}</td><td class="${x.ok ? 'dsp-ok' : 'dsp-bad'}">${x.info ? '—' : x.ok ? '✓' : '✘'}</td></tr>`).join('')}</table></details>`).join('')
  return `<div class="dsp-cand" data-rec="${id === 'b'}"><h4>${esc(c.name)}${id === 'b' ? '　<small>★ 我的推荐</small>' : ''}</h4>
    <p>${esc(c.feel)}</p><p><small>风险：${esc(c.risk)}　出处：${esc(c.source)}</small></p>
    <div class="dsp-two"><div class="ds-root dsp-mode" data-palette="${id}" data-theme="light"><b>浅色（白天）</b><div class="dsp-sw-row">${sw(resolved[id].light)}</div></div>
    <div class="ds-root dsp-mode" data-palette="${id}" data-theme="dark"><b>深色（晚上，暖黑带棕，不是纯黑 / 蓝黑）</b><div class="dsp-sw-row">${sw(resolved[id].dark)}</div></div></div>
    <small>灰色 / 米色总数（浅 + 深）：${neutrals[id]} 个；浅 / 深交叉复用同一个灰做"控件边线"和"深色次要文字"。</small>${rows}</div>`
}

// ── 彩色示例（DOM 和线框一致，类名 trpg-*，可直接复制）──
const check = (label, on, dl = false) => `<span class="trpg-check" data-on="${on}"${dl ? ' data-dl="true"' : ''}><i class="trpg-check__box">${on ? icon('check', 12) : ''}</i>${label}${dl ? `<span class="trpg-dl">${icon('download-simple', 11)}已下载</span>` : ''}</span>`
const art = `<svg class="trpg-hero__art dsp-art" viewBox="0 0 960 168" preserveAspectRatio="xMaxYMax slice" aria-hidden="true"><path class="far" d="M0 120L90 70L170 110L260 60L350 105L430 75L520 112L610 68L700 108L790 62L880 100L960 78V168H0Z"/><circle class="moon" cx="590" cy="38" r="13"/><path class="mid" d="M0 140L110 100L200 128L300 96L400 130L500 104L600 134L720 100L820 128L960 104V168H0Z"/><g class="castle"><rect x="660" y="112" width="190" height="40"/><rect x="720" y="64" width="60" height="76"/><rect x="690" y="84" width="26" height="56"/><rect x="784" y="78" width="30" height="62"/><path d="M720 64L750 34L780 64Z"/><path d="M690 84L703 60L716 84Z"/><path d="M784 78L799 50L814 78Z"/></g><g class="lit"><rect x="746" y="86" width="8" height="12" rx="1"/><rect x="698" y="102" width="6" height="9" rx="1"/><rect x="796" y="96" width="6" height="9" rx="1"/></g><path class="near" d="M0 150L120 132L260 148L420 130L580 150L760 134L960 150V168H0Z"/></svg>`
const shell = (inner, { page = 'home', title = '首页', lib = '' } = {}) => `<section class="trpg-window"><div class="trpg-shell">
  <nav class="trpg-side"><div class="trpg-side__brand"><span class="trpg-brandmark">${icon('dice-five', 18)}</span>TRPG 跑团助手</div>
    <ul class="trpg-side__list"><li><button class="trpg-nav" type="button"${page === 'home' ? ' aria-current="page"' : ''}>${icon('house', 20)}<span>首页</span></button></li></ul>
    <ul class="trpg-side__list trpg-side__bottom"><li><button class="trpg-nav" type="button">${icon('books', 20)}<span>库</span>${lib}</button></li><li><button class="trpg-nav" type="button">${icon('gear', 20)}<span>设置</span></button></li></ul></nav>
  <div class="trpg-main"><header class="trpg-head"><h1 class="trpg-head__title">${title}</h1><button class="trpg-icon-btn" type="button" aria-label="收起助手">${icon('x', 18)}</button></header>
    <div class="trpg-body">${inner}<button class="trpg-dice-btn" type="button" aria-label="掷骰">${icon('dice-five', 28)}</button></div></div></div>`
const exHome = `${shell(`<main class="trpg-content"><div class="page-stack">
  <button class="trpg-hero" type="button">${art}<span class="trpg-hero__title">开始一场新的冒险</span><span class="trpg-hero__sub">为「卡宾斯·哈林顿」建立一个战役：选规则、资料与冒险，再起个名字。</span><span class="trpg-hero__go">开始新冒险 ${icon('caret-right', 14)}</span></button>
  <button class="trpg-linkcard" type="button"><span class="trpg-linkcard__icon">${icon('arrow-counter-clockwise', 20)}</span><span class="trpg-linkcard__text"><b>读取已有存档</b><small>接着玩以前的战役</small></span><span class="trpg-linkcard__go">3 个存档 ${icon('caret-right', 14)}</span></button>
  <div><h2 class="trpg-group">最近记录</h2><div class="trpg-empty"><span>还没有记录。点击右下角的骰子圆球，随时可以掷骰。</span><button class="trpg-link trpg-link--hl" type="button">${icon('dice-five', 16)}掷一次骰子试试</button></div></div>
  </div></main>`)}</section>`
const row = (label, on, meta, dl) => `<div class="trpg-shelf__row">${check(label, on, dl)}<small>${meta}</small></div>`
const exWizard = `${shell('<main class="trpg-content"><div class="page-stack"></div></main>')}
  <div class="trpg-modal"><section class="trpg-modal__card" role="dialog" aria-modal="true"><header class="trpg-modal__head"><h2 class="trpg-modal__title">开始新冒险</h2><button class="trpg-icon-btn" type="button" aria-label="关闭">${icon('x', 18)}</button></header>
  <div class="trpg-modal__page"><div class="trpg-wizard">
    <ol class="trpg-steps"><li data-state="done"><span class="trpg-steps__n">${icon('check', 12)}</span>规则</li><li data-state="done"><span class="trpg-steps__n">${icon('check', 12)}</span>资料</li><li data-state="current"><span class="trpg-steps__n">3</span>冒险</li><li data-state="todo"><span class="trpg-steps__n">4</span>命名</li></ol>
    <div class="trpg-wizard__body"><h3 class="trpg-wizard__title">带上一本冒险？（可选）</h3><p class="trpg-hint">选中的冒险会在战役创建完成后，和资料一起在后台下载。</p>
      <div class="trpg-shelf"><details class="trpg-shelf__group" open><summary class="trpg-shelf__sum">${icon('caret-down', 14)}官方出版物<small>59</small></summary>
        ${row('<span class="trpg-term">凡戴尔的失落矿坑</span>', true, '等级 1–5 · 新手包', true)}${row('<span class="trpg-term">龙与地下城：龙之女王的宝藏</span>', true, '等级 1–15 · 龙之女王')}${row('<span class="trpg-term">冰风谷：冰封之地</span>', false, '等级 1–12 · 冰风谷')}${row('（示例）冒险 4', false, '等级 1–10')}${row('（示例）冒险 5', false, '等级 5–15')}${row('（示例）冒险 6', false, '等级 1–20')}</details>
        <details class="trpg-shelf__group"><summary class="trpg-shelf__sum">${icon('caret-right', 14)}扩展包<small>43</small></summary></details></div></div>
    <footer class="trpg-wizard__foot"><button class="trpg-btn" type="button">上一步</button><button class="trpg-btn trpg-btn--primary" type="button">下一步</button></footer></div></div></section></div></section>`

const tile = (w, h, r, extra = '') => `<div class="dsp-tile"><i style="width:${w}px;height:${h}px;border-radius:${r};${extra}"></i></div>`

export function designSystemSection() {
  writeDsCss()
  const ring = (pct) => { const r = 12, c = 2 * Math.PI * r; return `<span class="trpg-ring"><svg width="30" height="30" viewBox="0 0 30 30"><circle data-part="track" cx="15" cy="15" r="${r}" fill="none" stroke-width="3"/><circle data-part="arc" cx="15" cy="15" r="${r}" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${c * pct} ${c}" transform="rotate(-90 15 15)"/></svg></span>` }
  return `<link rel="stylesheet" href="../p4-design-system/ds.css">
<section class="dsp" id="design-system"><h2 class="dsp-h2">Gate 4 · 设计系统预览（局部）</h2>
<p class="dsp-lead">方向：<b>淡暖色浅黄米色底 + 暖红 / 深琥珀</b>，平整无纹理，圆角利落，外壳全部现代无衬线、术语用衬线。不用现有的"经典黄"点缀色；不做羊皮纸纹理、不做大块酒红、不做金色描边。配色按《如何在 UI 设计项目中组织与管理配色》分四类管理：品牌色 / 布局结构色（浅深交叉复用灰色）/ 指示色（品牌红不当错误色，禁用态独立）/ 交互色（一个基色 + 悬停 +1、按下 −1）。三套候选的每个色号都出自 Radix Colors 或 Tailwind 色阶，并核算过对比度。使用的 skill：ux-primer、interaction-patterns、laws-of-ux、oil-ui、ui-ux-pro-max、frontend-design。</p>
<h3 class="dsp-h3">1. 三套候选配色（选一套，色号锁定后不再改）</h3>${['a', 'b', 'c'].map(candidate).join('')}

<div class="dsp-bar"><b>下面的示例用哪套：</b>${['a', 'b', 'c'].map((id) => `<label><input type="radio" name="dsp-pal" value="${id}"${id === 'b' ? ' checked' : ''}>${CANDIDATES[id].name.split('·')[0].trim()} ${esc(CANDIDATES[id].name.split('·')[1].trim())}</label>`).join('')}<span>|</span>${['light', 'dark'].map((m) => `<label><input type="radio" name="dsp-mode" value="${m}"${m === 'light' ? ' checked' : ''}>${m === 'light' ? '浅色' : '深色'}</label>`).join('')}</div>
<div class="ds-root" id="dsp-root" data-palette="b" data-theme="light">
<h3 class="dsp-h3">2. 字体与字号</h3><div class="dsp-box"><div class="dsp-type">
  <div><code>28 / 700 · 首页大标题</code><span style="font-size:28px;font-weight:700;line-height:1.3">开始一场新的冒险</span></div>
  <div><code>18 / 600 · 窗口 / 弹窗标题</code><span style="font-size:18px;font-weight:600">开始新冒险</span></div>
  <div><code>16 / 600 · 卡片标题</code><span style="font-size:16px;font-weight:600">将建立战役：D&amp;D 2014·11月9日</span></div>
  <div><code>14 / 400 · 正文</code><span>选中的冒险会在战役创建完成后，和资料一起在后台下载。数字 0123456789 等宽对齐。</span></div>
  <div><code>13 / 400 · 浅灰说明</code><span style="font-size:13px;color:var(--text2)">总下载约 150 MB，将在你的战役创建完成后，在后台【库】里下载。</span></div>
  <div><code>12 · 辅助 / 标签</code><span style="font-size:12px;color:var(--text2)">2014-08-19 · 等级 1–5</span></div>
  <div><code>术语：衬线 + 虚下划线</code><span><span class="trpg-term">D&amp;D 5e（2014）</span>　<span class="trpg-term">凡戴尔的失落矿坑</span>（规则名、书名、专有名词）</span></div></div>
  <p class="trpg-hint" style="margin:10px 0 0">无衬线：PingFang SC → Noto Sans SC → 微软雅黑（系统字体栈，不打包 CJK 字体）。衬线术语：Noto Serif SC → 思源宋体 → 宋体。行高 1.6，行宽 ≤ 45 个汉字。ui-ux-pro-max 字体库建议 Noto Sans SC / Noto Serif SC，与此一致。</p></div>

<h3 class="dsp-h3">3. 间距 · 圆角 · 阴影 · 动效</h3><div class="dsp-box"><div class="dsp-tiles">
  <div class="dsp-tile"><div style="display:flex;gap:6px;align-items:flex-end">${[4, 8, 12, 16, 20, 24, 32, 40].map((n) => `<i style="display:block;width:${n}px;height:${n}px;background:var(--primary-tint-line);border-radius:2px"></i>`).join('')}</div>间距 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40（4pt 网格）</div>
  ${tile(56, 40, 'var(--r-xs)')}<span style="font-size:12px;color:var(--text2)">4 标签 / 勾选框</span>${tile(56, 40, 'var(--r-sm)')}<span style="font-size:12px;color:var(--text2)">6 按钮 / 输入框</span>${tile(56, 40, 'var(--r-md)')}<span style="font-size:12px;color:var(--text2)">8 卡片 / 书架</span>${tile(56, 40, 'var(--r-lg)')}<span style="font-size:12px;color:var(--text2)">12 窗口 / 弹窗</span>
  ${tile(72, 40, '8px', 'box-shadow:var(--shadow-1)')}<span style="font-size:12px;color:var(--text2)">阴影 1 卡片</span>${tile(72, 40, '8px', 'box-shadow:var(--shadow-2)')}<span style="font-size:12px;color:var(--text2)">阴影 2 小窗 / 提示条</span>${tile(72, 40, '8px', 'box-shadow:var(--shadow-3)')}<span style="font-size:12px;color:var(--text2)">阴影 3 窗口 / 弹窗</span></div>
  <p class="trpg-hint" style="margin:12px 0 0">阴影用暖墨色，不用纯黑灰。动效按"做什么"分档：按下 80ms · 悬停 / 开关 140ms · 小窗 / 提示条 200ms · 弹窗 / 抽屉 280ms（离场约 70%）· 进度环 420ms · 读取圆圈 0.9s 匀速；缓动用"快进慢出"。非用户触发的动效只有读取圆圈和进度环；系统设了"减少动效"就全部关掉。</p>
  <div style="display:flex;gap:18px;align-items:center;margin-top:8px"><span class="trpg-spinner"></span>${ring(0.3)}${ring(0.65)}${ring(1)}<span class="trpg-libmark">${ring(0.4)}<b class="trpg-count">2</b></span><span style="font-size:12px;color:var(--text2)">读取圆圈 · 库标签进度环（环旁数字 = 未完成项数）</span></div></div>

<h3 class="dsp-h3">4. 图标（沿用项目已有的 Phosphor Regular，单色纯色；只新增 1 个）</h3><div class="dsp-icons">${ICON_MAP.map(([n, u]) => `<div class="dsp-ic" style="color:var(--text)">${icon(n, 22)}<div><b>${n}</b>${NEW_ICONS.includes(n) ? ' <span class="trpg-badge" data-tone="primary">新增</span>' : ''}<br><span>${esc(u)}</span></div></div>`).join('')}</div>
  <p class="trpg-hint" style="margin:8px 0 0">尺寸 16 / 18 / 20 / 24；图标永远用 currentColor，不单独上色；只靠图标不说话的地方一律加文字或提示（图标按钮有 aria-label）。</p>

<h3 class="dsp-h3">5. 状态（同一个控件的所有状态）</h3><div class="dsp-box"><div class="dsp-states">
  <div><span>主按钮 默认</span><button class="trpg-btn trpg-btn--primary" type="button">开始冒险</button></div><div><span>悬停（+1）</span><button class="trpg-btn trpg-btn--primary is-hover" type="button">开始冒险</button></div><div><span>按下（−1）</span><button class="trpg-btn trpg-btn--primary is-pressed" type="button">开始冒险</button></div><div><span>键盘聚焦</span><button class="trpg-btn trpg-btn--primary is-focus" type="button">开始冒险</button></div><div><span>禁用</span><button class="trpg-btn trpg-btn--primary" type="button" disabled>开始冒险</button></div>
  <div><span>次要按钮</span><button class="trpg-btn" type="button">上一步</button></div><div><span>危险（带文字）</span><button class="trpg-btn trpg-btn--danger" type="button">${icon('trash', 16)}删除</button></div>
  <div><span>勾选：未选 / 选中 / 已下载（灰勾）</span><span style="display:grid;gap:6px">${check('未选', false)}${check('选中', true)}${check('冒险名', true, true)}</span></div>
  <div><span>开关：开 / 关</span><span style="display:flex;gap:10px"><i class="trpg-switch" data-on="true"></i><i class="trpg-switch" data-on="false"></i></span></div>
  <div><span>输入框：默认 / 出错</span><div class="trpg-input" style="width:190px">D&amp;D 2014·11月9日</div><div class="trpg-input" aria-invalid="true" style="width:190px"></div><span class="trpg-field__err">${icon('warning', 12)}请输入战役名称</span></div>
  <div><span>提示：成功 / 错误</span><span class="trpg-badge" data-tone="success">${icon('check-circle', 12)}已保存</span><span class="trpg-badge" data-tone="warn">● 有未保存的改动</span></div>
  <div><span>读取中</span><div class="trpg-loading" style="padding:0"><span class="trpg-spinner"></span>正在读取中…</div></div></div></div>

<h3 class="dsp-h3">6. 两个黑白线框换成彩色（DOM 和线框一致，类名 trpg-*，样式在 components.css）</h3>
<div class="dsp-example"><h4>首页 · 空态（上方的选择器可切换 三套配色 × 浅 / 深）</h4>${exHome}</div>
<div class="dsp-example"><h4>向导 ③ 冒险（灰勾 = 已在【库】里下载好；列表贴到底边）</h4>${exWizard}</div>
</div>
<script>(function(){var r=document.getElementById('dsp-root');if(!r)return;document.querySelectorAll('input[name=dsp-pal]').forEach(function(i){i.addEventListener('change',function(){r.setAttribute('data-palette',i.value)})});document.querySelectorAll('input[name=dsp-mode]').forEach(function(i){i.addEventListener('change',function(){r.setAttribute('data-theme',i.value)})})})()</script>
</section>`
}
